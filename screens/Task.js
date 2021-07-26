import Axios from 'axios';
import React, { Component, Fragment } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, ActionSheetIOS, Platform, KeyboardAvoidingView, Keyboard, Linking, Dimensions, Alert, PermissionsAndroid, } from 'react-native';
import FastImage from 'react-native-fast-image';
import Loading from '../components/Loading';
import { constants } from '../constants/Constants';
import { strings } from '../localization/Localization';
import { ColorApp } from '../theme/color/ColorApp';
import { setFont } from '../theme/font/FontApp';
import ImagePicker from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import HTMLRENDER from 'react-native-render-html';
import * as Progress from 'react-native-progress';
import IconCancel from 'react-native-vector-icons/Ionicons';
import IconFile from 'react-native-vector-icons/MaterialCommunityIcons';
import RNFetchBlob from 'rn-fetch-blob'
import { StateContext } from '../provider/ProviderApp';
import NetConnection from '../components/NetConnection';

const { width } = Dimensions.get("screen");

export default class Task extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: {},
            passing_answers: [],
            isLoading: true,
            isRefreshing: false,
            text: "",
            fileSelect: false,
            file: '',
            isLoadingBtn: false,
            progress: 0,
            isSend: false,
            isLoadingFile: false,
            isNet: true
        };
        this.lesson = props.route.params.lesson;
        this.title = props.route.params.title;
    }

    static contextType = StateContext;

    componentDidMount() {
        this.props.navigation.setOptions({ title: this.title, headerStyle: { backgroundColor: this.globalState.bottomBar ? this.globalState.bottomBar.color_app : ColorApp.main, } });
        // this.getTask();
        this.checkConnection();
    }

    componentWillUnmount() {
        if (this.CancelToken) {
            this.CancelToken.cancel();
        }

        if (this.task) {
            this.cancelDownloadFile();
        }
    }

    checkConnection = () => {
        constants.NetCheck({ send: this.getTask, error: () => this.setState({ isNet: false }) });
    }

    getTask = () => {

        this.setState({ isNet: true });

        Axios.get(`lesson/${this.lesson.id}/task`)
            .then(res => {
                console.log("getTask", res);

                res.data.data.entity.task.file = "https://demo.educenter.kz/storage/file/26030480855f90215c12c983.66139348_FG_Uchebnik_10-11kl_SE_.pdf"

                res.data.data.passing_answers.forEach(item => {
                    item.isDownloadFile = false;
                });

                this.setState({
                    dataSource: res.data.data,
                    passing_answers: res.data.data.passing_answers,
                    isLoading: false,
                    isRefreshing: false,
                });
            })
            .catch(e => {
                console.log(e);
                console.log(e.response);
                this.setState({ isRefreshing: false });
                constants.onHandlerError(e.response.data, e.response.status);
            });
    }

    onRefresh = () => {
        this.setState({ isRefreshing: true });
        if (this.CancelToken) {
            this.CancelToken.cancel();
        }
        this.getTask();
    }


    sendTask = () => {

        if (this.state.text.trim().length > 0) {

            Keyboard.dismiss();

            this.setState({ isLoadingBtn: true });

            this.CancelToken = Axios.CancelToken.source();

            const formData = new FormData();

            formData.append("answer", this.state.text);

            if (this.state.fileSelect) {
                formData.append('file', {
                    uri: this.state.file.uri,
                    name: this.state.file.name,
                    type: this.state.file.type
                });
            }

            Axios.post(`task/${this.state.dataSource.id}/send`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                cancelToken: this.CancelToken.token,
                onUploadProgress: e => {
                    this.setState({ progress: (e.loaded / e.total) });
                }
            })
                .then(res => {
                    console.log("sendTask", res);

                    this.setState({
                        text: "",
                        isSend: true,
                        isLoadingBtn: false,
                        fileSelect: false,
                        progress: 0,
                    });

                    this.getTask();
                })
                .catch(e => {

                    if (Axios.isCancel(e)) {
                        this.setState({ isLoadingBtn: false, isSend: false, progress: 0 });
                    } else {
                        console.log(e)
                        console.log(e.response);
                        this.setState({ isLoadingBtn: false, isSend: false, progress: 0 });
                        constants.noInternet(e);
                        constants.onHandlerError(e.response.data, e.response.status);
                    }

                });
        }

    }

    selectAvatar = () => {

        const options = {
            title: null,
            cancelButtonTitle: null,
            takePhotoButtonTitle: null,
            chooseFromLibraryButtonTitle: null,
            chooseWhichLibraryTitle: null,
            storageOptions: {
                skipBackup: true,
                quality: 0.2,
                path: 'images',
                mediaType: 'photo'
            },
        };

        ImagePicker.launchImageLibrary(options, (response) => {
            console.log('Response = ', response);

            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            } else {
                let name = response.uri.split('/');
                name = name[name.length - 1];
                const source = {
                    uri: response.uri,
                    type: response.type,
                    name: name
                };

                // You can also display the image using data:
                // const source = { uri: 'data:image/jpeg;base64,' + response.data };

                this.setState({
                    file: source,
                    fileSelect: true
                });
            }
        });
    }


    platformSelectFile = () => {
        if (Platform.OS == "ios") {
            ActionSheetIOS.showActionSheetWithOptions({
                options: [strings.Отмена, strings.Файл, strings.Фото],
                cancelButtonIndex: 0
            }, buttonIndex => {
                if (buttonIndex == 1) {
                    this.selectFile();
                } else if (buttonIndex == 2) {
                    this.selectAvatar();
                }
            });
        } else {
            this.selectFile();
        }
    }

    selectFile = async () => {
        Keyboard.dismiss();
        try {
            const res = await DocumentPicker.pick({
                type: [
                    DocumentPicker.types.images,
                    DocumentPicker.types.doc,
                    DocumentPicker.types.docx,
                    DocumentPicker.types.pdf,
                    DocumentPicker.types.plainText
                ],
                copyTo: 'documentDirectory'
            });

            this.setState({ fileSelect: true, file: res });

            console.log('selectFile: ', res);
        } catch (e) {
            if (DocumentPicker.isCancel(e)) {
                Keyboard.dismiss();
            } else {
                throw e;
            }
        }
    }


    downloadFile = (itemFile, title, isItem = false, item) => {
        console.log("itemFile", itemFile);
        let isPdf = itemFile.split(".")[itemFile.split(".").length - 1] == "pdf" ? true : false;

        if (isPdf) {
            console.log("pdf");
            this.props.navigation.navigate("PdfView", { pdfFile: { file: itemFile, title: title } });

        } else {
            if (!isItem) {
                this.setState({ isLoadingFile: true });
            } else {
                this.itemDownload(item);
                if (this.task) {
                    this.cancelDownloadFile();
                }
            }
            console.log('donwloadPdfFile item: ', item);
            const { config, fs, ios, android } = RNFetchBlob;
            const { DocumentDir, DownloadDir } = fs.dirs;

            let fileName = itemFile.split('/');
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

                this.task = config(configOptions).fetch('GET', encodeURI(itemFile), { 'lang': Axios.defaults.headers.lang, 'Content-Type': 'application/*' });

                this.task.progress((received, total) => {
                    this.setState({ progress: (received / total) });
                });

                this.task.then(res => {
                    console.log('file ios: ', res);

                    if (res.info().status == 200) {
                        if (isItem) {
                            this.state.passing_answers.forEach(i => {
                                i.isDownloadFile = false;
                            });
                        }
                        this.setState({ progress: 0, isLoadingFile: false });
                        ios.previewDocument('file://' + res.path());
                    } else {
                        if (isItem) {
                            this.state.passing_answers.forEach(i => {
                                i.isDownloadFile = false;
                            });
                        }
                        this.setState({ progress: 0, isLoadingFile: false });
                        Alert.alert("Ошибка!", `Код: ${res.info().status}`);
                    }

                })
                    .catch((e, s) => {
                        if (s == 500 || s == 404) {
                            Alert.alert("Ошибка!", `Код: ${s}`);
                        }
                        if (isItem) {
                            this.state.passing_answers.forEach(i => {
                                i.isDownloadFile = false;
                            });
                        }
                        this.setState({ progress: 0, isLoadingFile: false });
                    });
            } else {
                const granted = PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
                granted.then(res => {
                    if (res == PermissionsAndroid.RESULTS.GRANTED) {
                        this.task = config(configOptions).fetch('GET', encodeURI(itemFile), { 'lang': this.lang, 'Content-Type': 'application/*' });

                        this.task.progress((received, total) => {
                            this.setState({ progress: (received / total) });
                        });

                        this.task.then(res => {
                            console.log('file android: ', res);
                            if (res.info().status == 200) {
                                if (isItem) {
                                    this.state.passing_answers.forEach(i => {
                                        i.isDownloadFile = false;
                                    });
                                }
                                this.setState({ progress: 0, isLoadingFile: false });
                                android.actionViewIntent(res.path(), 'application/*');
                            } else {
                                if (isItem) {
                                    this.state.passing_answers.forEach(i => {
                                        i.isDownloadFile = false;
                                    });
                                }
                                this.setState({ progress: 0, isLoadingFile: false });
                                Alert.alert("Ошибка!", `Код: ${res.info().status}`);
                            }

                        })
                            .catch((e, s) => {
                                if (s == 500 || s == 404) {
                                    Alert.alert("Ошибка!", `Код: ${s}`);
                                }
                                if (isItem) {
                                    this.state.passing_answers.forEach(i => {
                                        i.isDownloadFile = false;
                                    });
                                }
                                this.setState({ progress: 0, isLoadingFile: false });
                            });
                    } else {
                        if (isItem) {
                            this.state.passing_answers.forEach(i => {
                                i.isDownloadFile = false;
                            });
                        }
                        this.setState({ progress: 0, isLoadingFile: false });
                    }
                });

            }
        }

    }

    itemDownload = (item) => {
        console.log("itemTask", item);

        let copyPassing_answers = [];

        this.state.passing_answers.forEach(i => {
            copyPassing_answers.push(Object.assign({}, i));
        });

        copyPassing_answers.forEach(i => {
            if (i.id == item.id) {
                i.isDownloadFile = true;
            } else {
                i.isDownloadFile = false;
            }
        });

        console.log("copyPA", copyPassing_answers);

        this.setState({ passing_answers: copyPassing_answers });
    }

    cancelDownloadFile = () => {
        console.log("cancelDownloadFile");
        this.state.passing_answers.forEach(i => {
            i.isDownloadFile = false;
        });
        if (this.CancelToken) {
            this.CancelToken.cancel();
        }
        this.task.cancel((e, d) => {
            this.setState({ isLoadingFile: false, progress: 0 });
        });
    }

    ListHeaderComponent = () => (
        <View>
            <View style={{ marginBottom: 24 }}>
                <View style={{ padding: 16 }}>
                    <Text style={[setFont(20, "bold")]}>{strings["Онлайн задание"]}</Text>
                    <Text style={[setFont(15), { marginTop: 4 }]}>{strings["Выполните онлайн задание, чтобы закрепить материалы курса и получить сертификат."]}</Text>
                    <HTMLRENDER
                        html={this.state.dataSource.entity.task.question}
                        baseFontStyle={{ fontSize: 17 }}
                        imagesMaxWidth={width - 32}
                        tagsStyles={{ img: { marginVertical: 5 }, iframe: { height: 200, borderRadius: 10, } }}
                        staticContentMaxWidth={width - 32}
                        ignoredStyles={['display', 'font-family', 'font-weight', 'padding', 'margin', 'text-align']}
                        alterChildren={node => {
                            if (node.name === "iframe" || node.name === "img") {
                                delete node.attribs.width;
                                delete node.attribs.height;
                            }
                            return node.children;
                        }}
                        onLinkPress={(ev, href, htmlAttribs) => Linking.openURL(href)}
                    />
                </View>
                {
                    this.state.dataSource.entity.task.file ?
                        <TouchableOpacity
                            style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16 }}
                            onPress={() => this.downloadFile(this.state.dataSource.entity.task.file, this.state.dataSource.entity.title)}
                            activeOpacity={0.8}
                        >

                            {
                                this.state.isLoadingFile ?
                                    <Progress.Circle
                                        animated
                                        style={{ justifyContent: "center", alignItems: "center" }}
                                        size={32}
                                        progress={this.state.progress}
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
                            <Text style={[setFont(17), { marginLeft: 8, flex: 1, marginBottom: 12 }]}>{this.state.dataSource.entity.task.file.split("/")[this.state.dataSource.entity.task.file.split("/").length - 1]}</Text>

                        </TouchableOpacity>
                        :
                        null
                }

                <View style={{ position: "absolute", left: 56, right: 0, bottom: 0, height: 0.5, backgroundColor: ColorApp.border }} />
            </View>

            <View style={{ paddingHorizontal: 16 }}>
                <Text style={[setFont(20, "bold"), { marginBottom: 8 }]}>{strings.Преподаватель}</Text>

                <View style={{ flexDirection: "row", alignItems: "center", paddingBottom: 8 }}>
                    <FastImage
                        source={{ uri: this.state.dataSource.entity.task.lesson.chapter.course.author.avatar, priority: FastImage.priority.high }}
                        style={{ width: 56, height: 56, borderRadius: 28, alignSelf: "flex-start" }}
                    />
                    <View style={{ flex: 1, marginLeft: 16 }}>
                        <Text style={[setFont(17, "600"), { marginBottom: 2 }]}>{this.state.dataSource.entity.task.lesson.chapter.course.author.name}</Text>
                        <Text style={[setFont(13)]}>{this.state.dataSource.entity.task.lesson.chapter.course.author.description}</Text>
                    </View>
                </View>
                <View style={{ position: "absolute", bottom: 0, left: 88, right: 0, height: 0.5, backgroundColor: ColorApp.border }} />
            </View>

        </View>
    );

    renderItem = ({ item, index }) => (
        <View
            style={{ marginBottom: index == this.state.passing_answers.length - 1 ? 80 : 16 }}>
            {
                index == 0 ?
                    <Text style={[setFont(20, "bold"), { marginHorizontal: 16, marginBottom: 8 }]}>{strings["Результаты задания"]}</Text>
                    :
                    null
            }

            <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 8 }}>
                <FastImage
                    source={{ uri: item.user.avatar, priority: FastImage.priority.high }}
                    style={{ width: 40, height: 40, borderRadius: 20, alignSelf: "flex-start" }}
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[setFont(15, "600")]}>{item.user.name}</Text>

                    {
                        item.answer ?
                            <HTMLRENDER
                                html={item.answer}
                                baseFontStyle={{ fontSize: 17 }}
                                imagesMaxWidth={width - 32}
                                tagsStyles={{ img: { marginVertical: 5 }, iframe: { height: 200, borderRadius: 10, }, p: { padding: 2 } }}
                                staticContentMaxWidth={width - 32}
                                ignoredStyles={['display', 'font-family', 'font-weight', 'padding', 'margin', 'text-align']}
                                alterChildren={node => {
                                    if (node.name === "iframe" || node.name === "img") {
                                        delete node.attribs.width;
                                        delete node.attribs.height;
                                    }
                                    return node.children;
                                }}
                                onLinkPress={(ev, href, htmlAttribs) => Linking.openURL(href)}
                            />
                            :
                            null
                    }

                    {
                        item.file ?
                            <TouchableOpacity
                                style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}
                                onPress={() => this.downloadFile(item.file, this.state.dataSource.entity.title, true, item)}
                                activeOpacity={0.8}
                            >

                                {
                                    item.isDownloadFile ?
                                        <Progress.Circle
                                            animated
                                            style={{ justifyContent: "center", alignItems: "center" }}
                                            size={32}
                                            progress={this.state.progress}
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
                                <Text style={[setFont(17), { marginLeft: 8, flex: 1, marginBottom: 12 }]}>{item.file.split("/")[item.file.split("/").length - 1]}</Text>

                            </TouchableOpacity>
                            :
                            null
                    }

                </View>
                <View style={{ position: "absolute", left: 68, right: 0, bottom: 0, height: 0.5, backgroundColor: ColorApp.border, }} />
            </View>

        </View>
    );


    render() {

        const { isNet, passing_answers, isLoading, isRefreshing, isLoadingBtn, isSend, text } = this.state;

        this.globalState = this.context;

        return (
            <NetConnection isNet={isNet} onPress={this.checkConnection}>
                <KeyboardAvoidingView style={{ flex: 1, backgroundColor: ColorApp.bg }} behavior={Platform.OS == "ios" ? "padding" : null} contentContainerStyle={{ flex: 1 }} keyboardVerticalOffset={70}>
                    {
                        isLoading ?
                            <Loading />
                            :
                            <View style={{ flex: 1 }}>
                                <FlatList
                                    ref={ref => this.flatList = ref}
                                    data={passing_answers}
                                    ListHeaderComponent={this.ListHeaderComponent}
                                    ListHeaderComponentStyle={{ marginBottom: 24 }}
                                    renderItem={this.renderItem}
                                    keyExtractor={(item, index) => index + ""}
                                    refreshing={isRefreshing}
                                    onRefresh={this.onRefresh}
                                    onContentSizeChange={(w, h) => { isSend ? this.flatList.scrollToOffset({ animated: true, offset: h }) : null }}
                                    contentInset={{ bottom: 64 }}
                                />
                                <View style={{ backgroundColor: "#fff", position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32, borderTopWidth: 0.5, borderTopColor: ColorApp.border, borderBottomWidth: 0.5, borderBottomColor: ColorApp.border }}>
                                    <TouchableOpacity
                                        onPress={this.platformSelectFile}
                                        activeOpacity={0.8}
                                        style={{ width: 32, height: 32, justifyContent: "center", alignItems: "center" }}
                                    >
                                        <FastImage
                                            source={require("../assets/images/attach.png")}
                                            style={{ width: 24, height: 24 }}
                                        />
                                    </TouchableOpacity>


                                    <TextInput
                                        placeholderTextColor={ColorApp.placeholder}
                                        placeholder={strings["Напишите результаты задания"]}
                                        style={[setFont(15, "normal", "#000", null, 'input'), { backgroundColor: "#F6F6F6", paddingHorizontal: 14, paddingVertical: 6, maxHeight: 112, marginLeft: 14, marginRight: 8, borderRadius: 12, }]}
                                        multiline
                                        underlineColorAndroid={ColorApp.transparent}
                                        onChangeText={text => this.setState({ text })}
                                        value={text}
                                    />

                                    <Fragment>
                                        {
                                            isLoadingBtn ?

                                                <Progress.Circle
                                                    style={{ justifyContent: "center", alignItems: "center" }}
                                                    size={32}
                                                    progress={this.state.progress}
                                                    borderColor={ColorApp.main}
                                                    color={ColorApp.main}
                                                >

                                                    <TouchableOpacity
                                                        onPress={this.CancelToken.cancel}
                                                        activeOpacity={0.8}
                                                        style={{ position: "absolute", width: 20, height: 20, borderRadius: 10, backgroundColor: "red", justifyContent: "center", alignItems: "center" }}
                                                    >

                                                        <IconCancel name="ios-close" color="#fff" size={18} />

                                                    </TouchableOpacity>

                                                </Progress.Circle>

                                                :

                                                <TouchableOpacity
                                                    onPress={this.sendTask}
                                                    activeOpacity={0.8}
                                                    style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: ColorApp.main, justifyContent: "center", alignItems: "center" }}
                                                >

                                                    <FastImage
                                                        source={require("../assets/images/send.png")}
                                                        style={{ width: 16, height: 16 }}
                                                    />

                                                </TouchableOpacity>
                                        }
                                    </Fragment>

                                </View>
                            </View>
                    }
                </KeyboardAvoidingView>
            </NetConnection>
        );
    }
}
