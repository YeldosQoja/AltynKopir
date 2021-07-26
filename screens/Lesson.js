import Axios from 'axios';
import React, { Component } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, PermissionsAndroid, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import Loading from '../components/Loading';
import { constants } from '../constants/Constants';
import { ColorApp } from '../theme/color/ColorApp';
import HTMLRENDER from 'react-native-render-html';
import { Dimensions } from 'react-native';
import { setFont } from '../theme/font/FontApp';
import FastImage from 'react-native-fast-image';
import { ButtonApp } from '../components/ButtonApp';
import { strings } from '../localization/Localization';
import RowContainer from '../components/RowContainer';
import { Linking } from 'react-native';
import IconFile from 'react-native-vector-icons/MaterialCommunityIcons';
import ProgressBar from '../components/ProgressBar';
import IconPlay from 'react-native-vector-icons/Ionicons';
import IconPause from 'react-native-vector-icons/Ionicons';
import TrackPlayer from 'react-native-track-player';
import RNFetchBlob from 'rn-fetch-blob';
import IconCancel from 'react-native-vector-icons/Ionicons';
import * as Progress from 'react-native-progress';
import { Alert } from 'react-native';
import { StateContext } from '../provider/ProviderApp';
import NetConnection from '../components/NetConnection';
import { WebView } from 'react-native-webview';

const { width } = Dimensions.get("screen");

export default class Lesson extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: [],
            isLoading: true,
            isRefreshing: false,
            isPause: true,
            isNextLesson: false,
            progress: 0,
            isLoadingFile: false,
            isNet: true,
            countRequest: 0
        };

        this.itemLesson = props.route.params.itemLesson;
        this.title = props.route.params.title
    }

    static contextType = StateContext;

    componentDidMount() {
        this.props.navigation.setOptions({ title: this.title, headerStyle: { backgroundColor: this.globalState.bottomBar ? this.globalState.bottomBar.color_app : ColorApp.main, } });
        this._onFocus = this.props.navigation.addListener("focus", this.reload);
    }

    checkConnection = () => {
        constants.NetCheck({ send: this.getLesson, error: () => this.setState({ isNet: false }) });
    }


    reload = () => {
        this.setState({ isLoading: true });
        // this.getLesson();
        this.checkConnection();
    }

    componentWillUnmount() {
        this._onFocus();
        if (this.state.isNextLesson != true) {
            TrackPlayer.getQueue()
                .then(res => {
                    if (res.length > 0) {
                        console.log("TrackPlayer.stop();");
                        TrackPlayer.stop();
                    }
                })
                .catch(() => TrackPlayer.stop());
        }

        if (this.state.dataSource.hasOwnProperty("file")) {
            if (this.state.dataSource.file) {
                if (this.state.isLoadingFile) {
                    this.cancelDownloadFile();
                }
            }
        }
    }



    getLesson = () => {

        this.setState({ isNet: true });

        Axios.get(`lesson/${this.itemLesson.id}`)
            .then(res => {
                console.log("getLesson: ", res);

                if (res.data.data.audio) {

                    let track = {
                        id: '0',
                        url: encodeURI(res.data.data.audio),
                        title: res.data.data.title,
                        artist: 'Educenter'
                    }

                    TrackPlayer.add(track);
                }


                this.setState({
                    dataSource: res.data.data,
                    isLoading: false,
                    isRefreshing: false
                });
            })
            .catch(e => {
                console.log(e);
                console.log(e.response);
                this.setState({ isRefreshing: false });
                constants.onHandlerError(e.response.data, e.response.status, () => this.props.navigation.goBack(), () => this.props.navigation.goBack());
            });
    }

    onRefresh = () => {

        TrackPlayer.getQueue()
            .then(res => {
                if (res.length > 0) {
                    TrackPlayer.pause();
                    this.setState({ isPause: true });
                }
            })
            .catch(() => {
                TrackPlayer.pause();
                this.setState({ isPause: true });
            });

        this.setState({ isRefreshing: true, isPause: true });
        this.getLesson();
    }

    onNavigation = (index) => {

        TrackPlayer.pause();
        this.setState({ isPause: true });
        if (index == 1) {
            if (this.state.dataSource.show_type == "test") {
                this.props.navigation.navigate("PreviewTest", { lesson: this.state.dataSource, title: this.title });
            } else {
                this.props.navigation.navigate("TestResult", { title: this.title, lessonId: { id: this.state.dataSource.show_id, data: this.state.dataSource } });
            }
        } else {
            this.props.navigation.navigate("Task", { lesson: this.state.dataSource, title: this.title });
        }
    }

    playAudio = () => {
        this.setState({ isPause: !this.state.isPause }, () => {
            if (this.state.isPause) {
                TrackPlayer.pause();
            } else {
                TrackPlayer.play();
            }
        });
    }

    nextLesson = () => {

        this.setState({ isNextLesson: true });
        TrackPlayer.getQueue()
            .then(res => {
                if (res.length > 0) {
                    TrackPlayer.stop();
                    if (this.state.dataSource.isLast) {
                        this.props.navigation.replace("EndCourse", { finishCourseId: this.state.dataSource.chapter.course.id });
                    } else {
                        this.props.navigation.replace("Lesson", { itemLesson: { id: this.state.dataSource.next_lesson_id }, title: this.title });
                    }
                } else {
                    if (this.state.dataSource.isLast) {
                        this.props.navigation.replace("EndCourse", { finishCourseId: this.state.dataSource.chapter.course.id });
                    } else {
                        this.props.navigation.replace("Lesson", { itemLesson: { id: this.state.dataSource.next_lesson_id }, title: this.title });
                    }
                }
            })
            .catch();
    }

    downloadFile = () => {

        let isPdf = this.state.dataSource.file.split(".")[this.state.dataSource.file.split(".").length - 1] == "pdf" ? true : false;

        if (isPdf) {

            this.props.navigation.navigate("PdfView", { pdfFile: this.state.dataSource });

        } else {

            this.setState({ isLoadingFile: true });
            console.log('donwloadPdfFile item: ', this.state.dataSource);
            const { config, fs, ios, android } = RNFetchBlob;
            const { DocumentDir, DownloadDir } = fs.dirs;

            let fileName = this.state.dataSource.file.split('/');
            fileName = fileName[fileName.length - 1];

            const isIOS = Platform.OS === 'ios';
            const path = Platform.select({ ios: DocumentDir, android: DownloadDir });
            // const ext = 'pdf';
            const fPath = `${path}/educenter/${fileName}`;
            const configOptions = Platform.select({
                ios: {
                    fileCache: true,
                    path: fPath,
                    // appendExt: ext
                },

                android: {
                    fileCache: false,
                    // appendExt: ext,
                    addAndroidDownloads: {
                        useDownloadManager: true,
                        notification: true,
                        mediaScannable: true,
                        path: fPath,
                        mime: 'application/*',
                        title: fileName,
                        description: fileName
                    }
                }

            });

            if (isIOS) {

                this.task = config(configOptions).fetch('GET', encodeURI(this.state.dataSource.file), { 'lang': Axios.defaults.headers.lang, 'Content-Type': 'application/*' });

                this.task.progress((received, total) => {
                    this.setState({ progress: (received / total) }, () => console.log("this.state.progress", this.state.progress));
                });

                this.task.then(res => {
                    console.log('file ios: ', res);

                    if (res.info().status == 200) {
                        this.setState({ progress: 0, isLoadingFile: false });
                        ios.previewDocument('file://' + res.path());
                    } else {
                        this.setState({ progress: 0, isLoadingFile: false });
                        Alert.alert("Ошибка!", `Код: ${res.info().status}`);
                    }

                })
                    .catch((e, s) => {
                        if (s == 500 || s == 404) {
                            Alert.alert("Ошибка!", `Код: ${s}`);
                        }
                        this.setState({ progress: 0, isLoadingFile: false });
                    });
            } else {
                const granted = PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
                granted.then(res => {
                    if (res == PermissionsAndroid.RESULTS.GRANTED) {
                        this.task = config(configOptions).fetch('GET', encodeURI(this.state.dataSource.file), { 'lang': this.lang, 'Content-Type': 'application/*' });

                        this.task.progress((received, total) => {
                            this.setState({ progress: (received / total) });
                        });

                        this.task.then(res => {
                            console.log('file android: ', res);
                            if (res.info().status == 200) {
                                this.setState({ progress: 0, isLoadingFile: false });
                                android.actionViewIntent(res.path(), 'application/*');
                            } else {
                                this.setState({ progress: 0, isLoadingFile: false });
                                if (!res.info().hasOwnProperty('rnfbEncode')) {
                                    Alert.alert("Ошибка!", `Код: ${res.info().status}`);
                                }
                            }

                        })
                            .catch((e, s) => {
                                if (s == 500 || s == 404) {
                                    Alert.alert("Ошибка!", `Код: ${s}`);
                                }
                                this.setState({ progress: 0, isLoadingFile: false });
                            });
                    } else {
                        this.setState({ progress: 0, isLoadingFile: false });
                    }
                });
            }
        }
    }

    cancelDownloadFile = () => {
        this.task.cancel((e, d) => {
            this.setState({ isLoadingFile: false, progress: 0 });
        });
    }


    playVideo = () => {
        TrackPlayer.getQueue().then(res => {
            if (res.length > 0) {
                console.log("playVideo");
                TrackPlayer.pause();
                this.setState({ isPause: true });
            }
        }).catch(() => { TrackPlayer.pause(); this.setState({ isPause: true }); });
    }


    render() {

        const { isNet, dataSource, isLoading, isRefreshing, isPause, isLoadingFile, progress } = this.state;

        this.globalState = this.context;

        return (
            <NetConnection isNet={isNet} onPress={this.checkConnection}>
                <View style={{ flex: 1, backgroundColor: ColorApp.bg }}>
                    {
                        isLoading ?
                            <Loading />
                            :
                            <View style={{ flex: 1 }}>
                                <ScrollView
                                    refreshControl={<RefreshControl
                                        refreshing={isRefreshing}
                                        onRefresh={this.onRefresh}
                                    />}
                                    contentInset={{ bottom: 32 }}
                                    style={{ padding: 16 }}>
                                    {
                                        dataSource.video ?
                                            <TouchableOpacity
                                                activeOpacity={1}
                                                onPress={this.playVideo}
                                                style={{ height: 200, backgroundColor: "#000", borderRadius: 10 }}
                                            >
                                                {/* <ActivityIndicator color="#fff" style={[StyleSheet.absoluteFillObject, { zIndex: 0 }]} size="large" /> */}
                                                {
                                                    Platform.OS == 'android' ?
                                                        <WebView
                                                            source={{ html: dataSource.video }}
                                                            allowsFullscreenVideo
                                                            style={{ backgroundColor: '#000' }}
                                                            showsVerticalScrollIndicator={false}
                                                            showsHorizontalScrollIndicator={false}
                                                            scrollEnabled={false}
                                                            scalesPageToFit={false}
                                                            onShouldStartLoadWithRequest={() => false}
                                                            mediaPlaybackRequiresUserAction={false}
                                                        />
                                                        :
                                                        <WebView
                                                            source={{ html: dataSource.video }}
                                                            allowsFullscreenVideo
                                                            showsVerticalScrollIndicator={false}
                                                            showsHorizontalScrollIndicator={false}
                                                            scrollEnabled={false}
                                                            scalesPageToFit={false}
                                                            onShouldStartLoadWithRequest={(e) => { this.setState({ countRequest: this.state.countRequest + 1 }); return this.state.countRequest < 5 ? true : false }}
                                                        />
                                                }
                                            </TouchableOpacity>
                                            :
                                            null
                                    }

                                    <Text style={[setFont(20, "bold"), { marginVertical: 16 }]}>{dataSource.title}</Text>

                                    {
                                        dataSource.test_enabled && dataSource.has_test ?
                                            <ButtonApp
                                                onPress={() => this.onNavigation(1)}
                                                style={{ backgroundColor: '#fff', borderWidth: 2, borderColor: ColorApp.border, marginBottom: 8, }}
                                                text={strings["Начать тестирование"]}
                                                textStyle={{ color: ColorApp.action }}
                                            />
                                            :
                                            null
                                    }

                                    {
                                        dataSource.task_enabled && dataSource.has_task ?
                                            <ButtonApp
                                                onPress={() => this.onNavigation(2)}
                                                style={{ backgroundColor: '#fff', borderWidth: 2, borderColor: ColorApp.border, marginBottom: 8, }}
                                                text={strings["Выполнить задание"]}
                                                textStyle={{ color: ColorApp.action }}
                                            />
                                            :
                                            null
                                    }

                                    {
                                        dataSource.audio ?
                                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                                                <TouchableOpacity
                                                    onPress={this.playAudio}
                                                    style={{ width: 45, height: 45, borderRadius: 22 }}
                                                    activeOpacity={0.8}
                                                >
                                                    {
                                                        isPause ?
                                                            <IconPause name='ios-play-circle' color={ColorApp.main} size={45} />
                                                            :
                                                            <IconPlay name='ios-pause-circle' color={ColorApp.main} size={45} />

                                                    }
                                                </TouchableOpacity>
                                                <ProgressBar />
                                            </View>
                                            :
                                            null
                                    }

                                    {
                                        dataSource.file ?
                                            <TouchableOpacity
                                                onPress={this.downloadFile}
                                                activeOpacity={0.8}
                                                style={{ flexDirection: "row", alignItems: "center", paddingVertical: 12 }}
                                            >
                                                {
                                                    isLoadingFile ?
                                                        <Progress.Circle
                                                            animated
                                                            style={{ justifyContent: "center", alignItems: "center" }}
                                                            size={32}
                                                            progress={progress}
                                                            borderColor={ColorApp.main}
                                                            color={ColorApp.main}
                                                        >

                                                            <TouchableOpacity
                                                                onPress={this.cancelDownloadFile}
                                                                activeOpacity={0.8}
                                                                style={{ position: "absolute", width: 20, height: 20, borderRadius: 10, backgroundColor: "red", justifyContent: "center", alignItems: "center" }}
                                                            >

                                                                <IconCancel name="ios-close" color="#fff" size={18} />

                                                            </TouchableOpacity>

                                                        </Progress.Circle>
                                                        :
                                                        <View style={{ width: 32, height: 32, borderRadius: 4, borderWidth: 1, borderColor: "rgba(172,180,190,0.08)", justifyContent: "center", alignItems: "center" }}>
                                                            <IconFile name="file" color={ColorApp.main} size={24} />
                                                        </View>
                                                }

                                                <Text style={[setFont(17), { marginLeft: 8, flex: 1 }]}>{dataSource.file.split("/")[dataSource.file.split("/").length - 1]}</Text>
                                            </TouchableOpacity>
                                            :
                                            null
                                    }

                                    {/* <Text style={[setFont(15)]}>{dataSource.description}</Text> */}

                                    {
                                        dataSource.description ?
                                            <HTMLRENDER
                                                html={dataSource.description}
                                                baseFontStyle={{ fontSize: 17 }}
                                                imagesMaxWidth={width - 32}
                                                tagsStyles={{ img: { marginVertical: 5 }, iframe: { height: 200, borderRadius: 10, backgroundColor: ColorApp.transparent } }}
                                                staticContentMaxWidth={width - 32}
                                                ignoredStyles={['display', 'font-family', 'font-weight', 'padding', 'margin', 'text-align']}
                                                alterChildren={node => {
                                                    if (node.name === "iframe" || node.name === "img") {
                                                        delete node.attribs.width;
                                                        delete node.attribs.height;
                                                    }
                                                    return node.children;
                                                }}
                                                onLinkPress={(ev, href, htmlAttribs) => { Linking.openURL(href); console.log(ev) }}
                                                containerStyle={{ zIndex: 1 }}
                                            />
                                            :
                                            null
                                    }

                                </ScrollView>

                                {
                                    !dataSource.isLast ?
                                        <RowContainer
                                            rightOnPress={this.nextLesson}
                                            showRight
                                            rightText={strings["Следующий урок"]}
                                            style={{ justifyContent: "flex-end" }}
                                        />
                                        :
                                        null
                                }


                                {
                                    dataSource.isLast ?
                                        <RowContainer
                                            rightOnPress={this.nextLesson}
                                            showRight
                                            rightText={strings['Завершить курс']}
                                            style={{ justifyContent: "flex-end" }}
                                        />
                                        :
                                        null
                                }

                            </View>
                    }
                </View>
            </NetConnection>
        );
    }
}
