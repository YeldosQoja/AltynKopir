import Axios from 'axios';
import React, { Component } from 'react';
import { View, Text, ScrollView, Platform, PermissionsAndroid, Alert } from 'react-native';
import FastImage from 'react-native-fast-image';
import { ButtonApp } from '../components/ButtonApp';
import Loading from '../components/Loading';
import { constants } from '../constants/Constants';
import { strings } from '../localization/Localization';
import { ColorApp } from '../theme/color/ColorApp';
import { setFont } from '../theme/font/FontApp';
import RNFetchBlob from 'rn-fetch-blob';
import { StateContext } from '../provider/ProviderApp';
import NetConnection from '../components/NetConnection';

export default class EndCourse extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: {},
            isLoading: true,
            isLoadingFile: false,
            disabled: false,
            progress: 0,
            isNet: true
        };

        this.courseId = props.route.params.finishCourseId;
    }

    static contextType = StateContext;

    componentDidMount() {
        this.props.navigation.setOptions({ title: strings.Сертификат, headerStyle: { backgroundColor: this.globalState.bottomBar ? this.globalState.bottomBar.color_app : ColorApp.main, } })
        // this.getFinishCourse();
        this.checkConnection();
    }

    checkConnection = () => {
        constants.NetCheck({ send: this.getFinishCourse, error: () => this.setState({ isNet: false }) });
    }

    getFinishCourse = () => {

        this.setState({ isNet: true });

        Axios.get(`course/${this.courseId}/finish`)
            .then(res => {
                console.log("getFinishCourse", res);

                if (res.data.data.user_certificate) {
                    this.setState({
                        dataSource: res.data.data,
                        isLoading: false
                    });
                } else {
                    this.props.navigation.replace("WriteReview", { finishCourseId: this.courseId });
                }
            })
            .catch(e => {
                console.log(e);
                console.log(e.response);
                constants.onHandlerError(e.response.data, e.response.status);
            });
    }

    downloadFile = () => {

        this.setState({ isLoadingFile: true });
        console.log('donwloadPdfFile item: ', this.state.dataSource);
        const { config, fs, ios, android } = RNFetchBlob;
        const { DocumentDir, DownloadDir } = fs.dirs;

        let fileName = this.state.dataSource.user_certificate.file.split('/');
        fileName = fileName[fileName.length - 1];

        const isIOS = Platform.OS === 'ios';
        const path = Platform.select({ ios: DocumentDir, android: DownloadDir });
        const ext = fileName.split(".")[fileName.split(".").length - 1];
        const fPath = `${path}/educenter/${fileName}`;
        const configOptions = Platform.select({
            ios: {
                fileCache: true,
                path: fPath,
                appendExt: ext
            },

            android: {
                fileCache: false,
                appendExt: ext,
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

            this.task = config(configOptions).fetch('GET', encodeURI(this.state.dataSource.user_certificate.file), { 'lang': Axios.defaults.headers.lang, 'Content-Type': 'application/*' });

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
                    this.task = config(configOptions).fetch('GET', encodeURI(this.state.dataSource.user_certificate.file), { 'lang': this.lang, 'Content-Type': 'application/*' });

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
                    this.setState({ progress: 0, isLoadingFile: false });
                }
            });

        }

    }

    render() {

        const { isNet, dataSource, isLoading, isLoadingFile, disabled } = this.state;

        this.globalState = this.context;

        return (
            <NetConnection isNet={isNet}>
                <View style={{ flex: 1, backgroundColor: ColorApp.bg }}>
                    {
                        isLoading ?
                            <Loading />
                            :
                            <ScrollView
                                style={{ backgroundColor: ColorApp.main, padding: 16 }}
                                contentContainerStyle={{ flex: 1, justifyContent: "center", alignItems: "center" }}
                                showsVerticalScrollIndicator={false}
                            >
                                <FastImage
                                    source={{ uri: dataSource.user_certificate.file, priority: FastImage.priority.high }}
                                    style={{ width: "100%", height: 212 }}
                                />
                                <Text style={[setFont(40, "bold", "#fff", 48), { textAlign: "center", marginTop: 24, marginBottom: 16 }]}>{strings['Поздравляем!']}</Text>
                                <Text style={[setFont(17, "600", "#fff"), { textAlign: "center", marginBottom: 24 }]}>{strings['Вы завершили курс и получили сертификат']}</Text>
                                <ButtonApp
                                    onPress={this.downloadFile}
                                    isLoading={isLoadingFile}
                                    disabled={disabled}
                                    text={strings['Скачать сертификат']}
                                    style={{ borderWidth: 2, borderColor: ColorApp.sectionBG }}
                                />
                                <ButtonApp
                                    onPress={() => this.props.navigation.navigate("WriteReview", { finishCourseId: this.courseId })}
                                    text={strings['Оставить отзыв']}
                                    style={{ borderWidth: 2, borderColor: ColorApp.sectionBG, marginTop: 10 }}
                                />
                            </ScrollView>
                    }
                </View>
            </NetConnection>
        );
    }
}
