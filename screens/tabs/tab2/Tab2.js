import Axios from 'axios';
import React, { Component, Fragment } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Modal, ActivityIndicator, Dimensions, PermissionsAndroid, Alert, Platform } from 'react-native';
import FastImage from 'react-native-fast-image';
import { ButtonApp } from '../../../components/ButtonApp';
import InputContainer from '../../../components/InputContainer';
import Loading from '../../../components/Loading';
import NoData from '../../../components/NoData';
import SectionRow from '../../../components/SectionRow';
import { constants } from '../../../constants/Constants';
import { strings } from '../../../localization/Localization';
import { ColorApp } from '../../../theme/color/ColorApp';
import { setFont } from '../../../theme/font/FontApp';
import Icon from 'react-native-vector-icons/Entypo';
import IconClear from 'react-native-vector-icons/Ionicons';
import { navOptions } from '../../../constants/NavOptions';
import { StateContext } from '../../../provider/ProviderApp';
import * as Progress from 'react-native-progress';
import IconCancel from 'react-native-vector-icons/Ionicons';
import RNFetchBlob from 'rn-fetch-blob';
import * as Animatable from 'react-native-animatable';
import NetConnection from '../../../components/NetConnection';

const { height } = Dimensions.get("screen");

export default class Tab2 extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {},
            dataSource: [],
            sorts: [],
            category: [],
            tests: [],
            isLoading: true,
            isRefreshing: false,
            isSendServer: false,
            tabindex: 1,
            visibleSort: false,
            visibleCategor: false,
            itemCategor: { name: "", select: false },
            itemSort: { select: false },
            itemTestCategor: { title: "", select: false },
            query: "",
            isSearch: false,
            isTestClick: false,
            progress: 0,
            onAnimation: true,
            isNet: true,
            nStatus: '0'
        };
    }

    static contextType = StateContext;


    componentDidMount() {
        this.props.navigation.setOptions(navOptions.HEADER(this.globalState.bottomBar ? this.globalState.bottomBar.bottom_nav[this.globalState.bottomBar.bottom_nav.findIndex(i => i.id == 2)]?.title : strings.Тесты, this.globalState.bottomBar ? this.globalState.bottomBar.logo : null));
        // this.getAllTest();
        // this.checkConnection();
        this.getStatus();
    }

    componentDidUpdate() {
        if (this.globalState.exit) {
            this.setState({ isLoading: true, tabindex: 1 }, this.getStatus);
            this.globalState.setExit(false);
        } else {
            if (this.globalState.token) {
                if (this.globalState.isReload) {
                    this.setState({ isLoading: true, tabindex: 0 }, this.getStatus);
                    this.globalState.setIsReload(false);
                }
            }
        }
    }

    getStatus = () => {
        Axios({
            method: 'GET',
            url: Axios.defaults.baseURL + 'get'
        }).then(res => {
            console.log('getStatus', res);
            this.setState({ nStatus: Platform.OS == 'ios' ? res.data.ios : res.data.android })
            if (this.globalState.token) {
                this.setState({ tabindex: 0 }, this.checkConnection);
            } else {
                this.checkConnection();
            }
        })
            .catch(e => {
                console.log("catch getStatus", e);
                this.setState({ nStatus: '0' });
                this.checkConnection();
            });
    }

    checkConnection = () => {
        constants.NetCheck({ send: this.state.tabindex == 0 ? this.getMyTest : this.state.tabindex == 1 ? this.getAllTest : this.getRaiting, error: () => this.setState({ isNet: false }) });
    }


    getMyTest = (reload = false, np) => {

        this.setState({ isNet: true });

        let param = {
            page: 1,
            filter: true,
        };

        if (np) {
            let nextPage = np.split("=")[np.split("=").length - 1];
            console.log("nextPage", nextPage);
            param.page = nextPage;
        }

        if (this.state.itemSort.select) {
            param.price = this.state.itemSort.type;
        }

        if (this.state.itemCategor.select) {
            param.category_id = this.state.itemCategor.id;
        }

        if (reload || this.state.query.length > 0) {
            if (!np) {
                this.setState({ isLoading: true });
            }
        }

        if (this.state.query.length > 0) {
            param.query = this.state.query;
        }

        Axios.get("modules/tests/my/tests", { params: param })
            .then(res => {
                console.log("getMyTest", res);

                let arrSorts = [];
                let i = 0;
                for (let key in res.data.filters.sorts) {
                    if (this.state.itemSort.select) {
                        arrSorts.push({ id: i, type: key.split("_")[key.split("_").length - 1], text: res.data.filters.sorts[key], select: this.state.itemSort.id == i ? true : false });
                    } else {
                        arrSorts.push({ id: i, type: key.split("_")[key.split("_").length - 1], text: res.data.filters.sorts[key], select: false });
                    }
                    i++;
                }

                for (let _i = 0; _i < res.data.filters.categories.length; _i++) {
                    if (this.state.itemCategor.select) {
                        res.data.filters.categories[_i].select = this.state.itemCategor.id == res.data.filters.categories[_i].id ? true : false;
                    } else {
                        res.data.filters.categories[_i].select = false;
                    }
                }

                for (let _i = 0; _i < res.data.data.length; _i++) {
                    res.data.data[_i].isCourseOrTest = "test";
                    res.data.data[_i].isDownloadFile = false;
                }

                if (res.data.data.length > 0) {
                    this.setState({
                        data: res.data,
                        dataSource: np ? this.state.dataSource.concat(res.data.data) : res.data.data,
                        sorts: arrSorts,
                        category: res.data.filters.categories,
                        isLoading: false,
                        isRefreshing: false,
                        isSendServer: false
                    });
                } else {
                    this.setState({ tabindex: 1 }, this.checkConnection);
                }


            })
            .catch(e => {
                console.log(e);
                console.log(e.response);
                this.setState({ isRefreshing: false, isSendServer: false });
                constants.onHandlerError(e.response.data, e.response.status);
            });
    }

    getAllTest = (reload = false, np) => {

        this.setState({ isNet: true });

        let param = {
            page: 1,
            filter: true,
        }

        if (np) {
            let nextPage = np.split("=")[np.split("=").length - 1];
            console.log("nextPage", nextPage);
            param.page = nextPage;
        }

        if (this.state.itemSort.select) {
            param.price = this.state.itemSort.type;
        }

        if (this.state.itemCategor.select) {
            param.category_id = this.state.itemCategor.id;
        }

        if (reload || this.state.query.length > 0) {
            if (!np) {
                this.setState({ isLoading: true });
            }
        }

        if (this.state.query.length > 0) {
            param.query = this.state.query;
        }

        Axios.get("modules/tests", {
            params: param
        })
            .then(res => {
                console.log("getAllTest", res);

                let arrSorts = [];
                let i = 0;
                for (let key in res.data.filters.sorts) {
                    if (this.state.itemSort.select) {
                        arrSorts.push({ id: i, type: key.split("_")[key.split("_").length - 1], text: res.data.filters.sorts[key], select: this.state.itemSort.id == i ? true : false });
                    } else {
                        arrSorts.push({ id: i, type: key.split("_")[key.split("_").length - 1], text: res.data.filters.sorts[key], select: false });
                    }
                    i++;
                }

                for (let _i = 0; _i < res.data.filters.categories.length; _i++) {
                    if (this.state.itemCategor.select) {
                        res.data.filters.categories[_i].select = this.state.itemCategor.id == res.data.filters.categories[_i].id ? true : false;
                    } else {
                        res.data.filters.categories[_i].select = false;
                    }
                }

                for (let _i = 0; _i < res.data.data.length; _i++) {
                    res.data.data[_i].isCourseOrTest = "test";
                    res.data.data[_i].isDownloadFile = false;
                }



                this.setState({
                    data: res.data,
                    dataSource: np ? this.state.dataSource.concat(res.data.data) : res.data.data,
                    sorts: arrSorts,
                    category: res.data.filters.categories,
                    isLoading: false,
                    isRefreshing: false,
                    isSendServer: false
                });
            })
            .catch(e => {
                console.log(e);
                console.log(e.response);
                this.setState({ isRefreshing: false, isSendServer: false });
                constants.onHandlerError(e.response.data, e.response.status);
            });
    }

    getRaiting = (reload = false, np) => {

        this.setState({ isNet: true });

        let param = {
            page: 1,
            filter: true,
        }

        if (np) {
            let nextPage = np.split("=")[np.split("=").length - 1];
            console.log("nextPage", nextPage);
            param.page = nextPage;
        }

        // if (this.state.itemSort.select) {
        //     param.price = this.state.itemSort.type;
        // }

        if (this.state.itemCategor.select) {
            param.category_id = this.state.itemCategor.id;
        }

        if (this.state.itemTestCategor.select) {
            param.test_id = this.state.itemTestCategor.id;
        }

        if (reload || this.state.query.length > 0) {
            if (!np) {
                this.setState({ isLoading: true });
            }
        }

        if (this.state.query.length > 0) {
            param.query = this.state.query;
        }

        Axios.get("modules/tests/my/rating", { params: param })
            .then(res => {
                console.log("getRaiting", res);


                let arrSorts = [];
                let i = 0;
                for (let key in res.data.filters.sorts) {
                    if (this.state.itemSort.select) {
                        arrSorts.push({ id: i, type: key.split("_")[key.split("_").length - 1], text: res.data.filters.sorts[key], select: this.state.itemSort.id == i ? true : false });
                    } else {
                        arrSorts.push({ id: i, type: key.split("_")[key.split("_").length - 1], text: res.data.filters.sorts[key], select: false });
                    }
                    i++;
                }

                for (let _i = 0; _i < res.data.filters.categories.length; _i++) {
                    if (this.state.itemCategor.select) {
                        res.data.filters.categories[_i].select = this.state.itemCategor.id == res.data.filters.categories[_i].id ? true : false;
                    } else {
                        res.data.filters.categories[_i].select = false;
                    }
                }

                // res.data.filters.tests = res.data.filters.tests.concat(res.data.filters.tests);
                console.log(res.data.filters.tests);
                for (let _i = 0; _i < res.data.filters.tests.length; _i++) {
                    if (this.state.itemTestCategor.select) {
                        res.data.filters.tests[_i].select = this.state.itemTestCategor.id == res.data.filters.tests[_i].id ? true : false;
                    } else {
                        res.data.filters.tests[_i].select = false;
                    }
                }

                this.setState({
                    data: res.data,
                    dataSource: np ? this.state.dataSource.concat(res.data.data) : res.data.data,
                    sorts: arrSorts,
                    category: res.data.filters.categories,
                    tests: res.data.filters.tests,
                    isLoading: false,
                    isRefreshing: false,
                    isSendServer: false
                });
            })
            .catch(e => {
                console.log(e);
                console.log(e.response);
                this.setState({ isRefreshing: false, isSendServer: false });
                constants.onHandlerError(e.response.data, e.response.status);
            });
    }

    onRefresh = () => {
        switch (this.state.tabindex) {
            case 0:
                this.setState({ isRefreshing: true, isSendServer: false });
                this.getMyTest();
                break;
            case 1:
                this.setState({ isRefreshing: true, isSendServer: false });
                this.getAllTest();
                break;
            case 2:
                this.setState({ isRefreshing: true, isSendServer: false });
                this.getRaiting();
                break;

        }
    }

    onEndReached = () => {
        switch (this.state.tabindex) {
            case 0:
                if (this.state.data.next_page_url) {
                    this.setState({ isSendServer: true });
                    if (this.state.isSendServer) {
                        this.getMyTest(false, this.state.data.next_page_url);
                    }
                }
                break;

            case 1:
                if (this.state.data.next_page_url) {
                    this.setState({ isSendServer: true });
                    if (this.state.isSendServer) {
                        this.getAllTest(false, this.state.data.next_page_url);
                    }
                }
                break;
            case 2:
                if (this.state.data.next_page_url) {
                    this.setState({ isSendServer: true });
                    if (this.state.isSendServer) {
                        this.getRaiting(false, this.state.data.next_page_url);
                    }
                }
                break;
        }
    }



    selectTab = (index) => {
        switch (index) {
            case 0:
                if (this.globalState.token) {
                    this.setState({ tabindex: index, isLoading: true, isTestClick: false }, this.checkConnection);
                } else {
                    this.props.navigation.navigate("Tab4Navigator", { screen: "AuthNavigator" });
                }
                // this.getMyTest();
                break;
            case 1:
                this.setState({ tabindex: index, isLoading: true, isTestClick: false }, this.checkConnection);
                // this.getAllTest();
                break;
            case 2:
                if (this.globalState.token) {
                    this.setState({ tabindex: index, isLoading: true }, this.checkConnection);
                } else {
                    this.props.navigation.navigate("Tab4Navigator", { screen: "AuthNavigator" });
                }
                // this.getRaiting();
                break;
        }
    }

    onFilter = () => {
        this.setState({ isLoading: true, visibleSort: false, visibleCategor: false });

        if (this.state.itemSort.select || this.state.itemCategor.select) {
            if (this.state.tabindex == 0) {
                // this.getMyTest(true);
                this.checkConnection();
            } else if (this.state.tabindex == 1) {
                // this.getAllTest(true);
                this.checkConnection();
            } else {
                // this.getRaiting(true);
                this.checkConnection();
            }
        } else {
            if (this.state.tabindex == 2) {
                // this.getRaiting(true);
                this.checkConnection();
            }
        }

    }

    onClearFilter = () => {

        this.setState({
            isLoading: true,
            visibleSort: false,
            visibleCategor: false,
            itemCategor: { name: "", select: false },
            itemSort: { select: false },
            itemTestCategor: { title: "", select: false },
            isTestClick: false
        }, () => {
            if (this.state.tabindex == 0) {
                // this.getMyTest(true);
                this.checkConnection();
            } else if (this.state.tabindex == 1) {
                // this.getAllTest(true);
                this.checkConnection();
            } else {
                // this.getRaiting(true);
                this.checkConnection();
            }
        });

    }

    onSubmitEditing = () => {
        if (this.state.query.length > 0) {
            if (this.state.tabindex == 0) {
                this.setState({ isSearch: true });
                // this.getMyTest();
                this.checkConnection();
            } else if (this.state.tabindex == 1) {
                this.setState({ isSearch: true });
                // this.getAllTest();
                this.checkConnection();
            } else {
                this.setState({ isSearch: true });
                // this.getRaiting();
                this.checkConnection();
            }
        }
    }

    clearSearch = () => {
        this.setState({
            isLoading: true,
            query: "",
            isSearch: false
        }, () => {

            if (this.state.tabindex == 0) {
                // this.getMyTest();
                this.checkConnection();
            } else if (this.state.tabindex == 1) {
                // this.getAllTest();
                this.checkConnection();
            } else {
                // this.getRaiting();
                this.checkConnection();
            }
        });

    }

    onSelectSort = (item) => {
        let copySort = [];

        for (let i = 0; i < this.state.sorts.length; i++) {
            copySort.push(Object.assign({}, this.state.sorts[i]));
        }

        console.log("copySort", copySort);

        for (let i = 0; i < copySort.length; i++) {
            if (item.id == copySort[i].id) {
                copySort[i].select = true;
                item.select = true;
            } else {
                copySort[i].select = false;
            }
        }

        this.setState({ sorts: copySort, itemSort: item });
    }


    onSelectCategor = (item) => {
        let copyCategor = [];

        for (let i = 0; i < this.state.category.length; i++) {
            copyCategor.push(Object.assign({}, this.state.category[i]));
        }

        console.log("copySort", copyCategor);

        for (let i = 0; i < copyCategor.length; i++) {
            if (item.id == copyCategor[i].id) {
                copyCategor[i].select = true;
                item.select = true;
            } else {
                copyCategor[i].select = false;
            }
        }

        this.setState({ category: copyCategor, itemCategor: item });
    }

    onSelectCategorTest = (item) => {
        let copyCategorTest = [];

        for (let i = 0; i < this.state.tests.length; i++) {
            copyCategorTest.push(Object.assign({}, this.state.tests[i]));
        }

        console.log("copySort", copyCategorTest);

        for (let i = 0; i < copyCategorTest.length; i++) {
            if (item.id == copyCategorTest[i].id) {
                copyCategorTest[i].select = true;
                item.select = true;
            } else {
                copyCategorTest[i].select = false;
            }
        }

        this.setState({ tests: copyCategorTest, itemTestCategor: item });
    }

    scoreTest = (item) => {
        let p = parseFloat(item.passing?.percent);
        if (item.passing) {
            if (p <= 50) {
                return item.passing.score + "%" + "・" + strings['Тест не пройден'];
            }
            else if (p > 50) {
                return p + "%" + "・" + strings['Тест пройден'];
            } else {
                return 0 + "%";
            }

        } else {
            return 0 + "%";
        }
    }


    onNavigation = (item) => {
        console.log("onNavigation", item);

        this.props.navigation.navigate("TestOpen", { itemTestOpen: item });

    }

    onNavigationTest = (item) => {
        console.log("onNavigationTest", item);

        if (item.has_subscribed) {
            if (item.user_certificate) {

            } else {
                if (item.attempts && item.attempts > 0) {
                    this.props.navigation.navigate("OlimpTest", { lesson: { id: item.id, title: item.title, attempts: item.attempts } });
                }
            }

        } else {
            this.props.navigation.navigate("GB", { course: item });
        }

    }

    downloadFile = (itemFile, item) => {
        console.log("itemFile", itemFile);
        this.itemDownload(item);
        if (this.task) {
            this.cancelDownloadFile();
        }

        console.log('donwloadPdfFile item: ', itemFile);
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

                    this.state.dataSource.forEach(i => {
                        i.isDownloadFile = false;
                    });

                    this.setState({ progress: 0 });
                    ios.previewDocument('file://' + res.path());
                } else {
                    this.state.dataSource.forEach(i => {
                        i.isDownloadFile = false;
                    });
                    this.setState({ progress: 0 });
                    Alert.alert("Ошибка!", `Код: ${res.info().status}`);
                }

            })
                .catch((e, s) => {
                    if (s == 500 || s == 404) {
                        Alert.alert("Ошибка!", `Код: ${s}`);
                    }
                    this.state.dataSource.forEach(i => {
                        i.isDownloadFile = false;
                    });
                    this.setState({ progress: 0 });
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
                        console.log('file android: ', res.info());
                        if (res.info().status == 200) {

                            this.state.dataSource.forEach(i => {
                                i.isDownloadFile = false;
                            });

                            this.setState({ progress: 0 });
                            android.actionViewIntent(res.path(), 'application/*');
                        } else {
                            this.state.dataSource.forEach(i => {
                                i.isDownloadFile = false;
                            });
                            this.setState({ progress: 0 });
                            if (res.info().status) {
                                Alert.alert("Ошибка!", `Код: ${res.info().status}`);
                            }
                        }

                    })
                        .catch((e, s) => {
                            if (s == 500 || s == 404) {
                                Alert.alert("Ошибка!", `Код: ${s}`);
                            }
                            this.state.dataSource.forEach(i => {
                                i.isDownloadFile = false;
                            });
                            this.setState({ progress: 0 });
                        });
                } else {
                    this.state.dataSource.forEach(i => {
                        i.isDownloadFile = false;
                    });
                    this.setState({ progress: 0 });
                }
            });
        }
    }


    itemDownload = (item) => {
        console.log("itemTask", item);

        let copyPassing_answers = [];

        this.state.dataSource.forEach(i => {
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

        this.setState({ dataSource: copyPassing_answers });
    }

    cancelDownloadFile = () => {
        console.log("cancelDownloadFile");
        this.state.dataSource.forEach(i => {
            i.isDownloadFile = false;
        });
        if (this.task) {
            console.log("CAn");
            this.task.cancel((e, d) => {
                this.setState({ progress: 0 });
            });
        }
    }

    ListHeaderComponent = () => (
        <Animatable.View animation={this.state.onAnimation ? "slideInDown" : undefined} onAnimationEnd={() => this.setState({ onAnimation: false })} useNativeDriver>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
                {
                    this.state.isSearch ?
                        <TouchableOpacity
                            onPress={this.clearSearch}
                            activeOpacity={0.8}
                        >
                            <IconClear name="close" size={24} color={ColorApp.fade} />
                        </TouchableOpacity>
                        :
                        null
                }
                <InputContainer style={{ flexDirection: 'row', flex: 1, marginLeft: this.state.isSearch ? 16 : 0, marginRight: 16, alignItems: 'center', height: 36, borderRadius: 10, }}>
                    <FastImage
                        source={require('../../../assets/images/search.png')}
                        style={{ width: 16, height: 16 }}
                    />
                    <TextInput
                        placeholder={strings["Поиск курсов и тестов"]}
                        placeholderTextColor={ColorApp.placeholder}
                        style={[setFont(15, 'normal', '#000', null, 'input'), { marginHorizontal: 12, paddingVertical: 0, flex: 1 }]}
                        underlineColorAndroid={ColorApp.transparent}
                        onChangeText={(query) => this.setState({ query })}
                        value={this.state.query}
                        onSubmitEditing={this.onSubmitEditing}
                    />
                </InputContainer>

                <TouchableOpacity
                    onPress={() => this.setState({ visibleSort: true })}
                    activeOpacity={0.8}
                    style={{ width: 32, height: 32, justifyContent: 'center', alignItems: 'center' }}
                >
                    <FastImage
                        source={require('../../../assets/images/filter.png')}
                        style={{ width: 24, height: 24 }}
                    />
                    {
                        this.state.itemSort.select || this.state.itemCategor.select ?
                            <View style={{ position: "absolute", bottom: 2, right: 6, width: 12, height: 12, borderRadius: 6, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
                                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: ColorApp.main }} />
                            </View>
                            :
                            null
                    }
                </TouchableOpacity>

            </View>


            <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 2, paddingHorizontal: 2, backgroundColor: ColorApp.sectionBG, borderRadius: 8 }}>
                <ButtonApp
                    onPress={() => this.selectTab(0)}
                    style={[{ flex: 1, height: null, paddingVertical: 8, backgroundColor: this.state.tabindex == 0 ? '#fff' : ColorApp.transparent, marginHorizontal: 2, borderRadius: 6 }, this.state.tabindex == 0 ? styles.shadowActiv : null]}
                    text={strings["Мои тесты"]}
                    textStyle={[setFont(15), { color: this.state.tabindex == 0 ? "#000" : ColorApp.fade }]}
                />
                <ButtonApp
                    onPress={() => this.selectTab(1)}
                    style={[{ flex: 1, height: null, paddingVertical: 8, backgroundColor: this.state.tabindex == 1 ? '#fff' : ColorApp.transparent, marginHorizontal: 2, borderRadius: 6 }, this.state.tabindex == 1 ? styles.shadowActiv : null]}
                    text={strings["Все тесты"]}
                    textStyle={[setFont(15), { color: this.state.tabindex == 1 ? "#000" : ColorApp.fade }]}
                />
                <ButtonApp
                    onPress={() => this.selectTab(2)}
                    style={[{ flex: 1, height: null, paddingVertical: 8, backgroundColor: this.state.tabindex == 2 ? '#fff' : ColorApp.transparent, marginHorizontal: 2, borderRadius: 6 }, this.state.tabindex == 2 ? styles.shadowActiv : null]}
                    text={strings.Рейтинг}
                    textStyle={[setFont(15), { color: this.state.tabindex == 2 ? "#000" : ColorApp.fade }]}
                />
            </View>
        </Animatable.View>

    );

    renderItemMyTest = ({ item, index }) => (
        <Animatable.View animation={this.state.onAnimation ? "fadeInLeft" : undefined} useNativeDriver >
            <TouchableOpacity
                style={{ paddingTop: 14, paddingBottom: 10 }}
                onPress={() => this.onNavigation(item)}
            >
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <Text style={[setFont(10, "500", ColorApp.action), { flex: 1, marginRight: 16, textTransform: "uppercase" }]}>{item.category.name}</Text>

                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <FastImage
                            source={require("../../../assets/images/timer.png")}
                            style={{ width: 16, height: 16 }}
                            tintColor={ColorApp.fade}
                        />
                        <Text style={[setFont(10, "500", ColorApp.fade), { marginLeft: 4 }]}>{item.timer ? item.timer : 30} {strings.мин}</Text>
                    </View>

                </View>

                <Text style={[setFont(15, "600"), { marginBottom: 4 }]}>{item.title}</Text>

                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                    <View style={{ flexDirection: "row", alignItems: 'center' }}>
                        <Text style={[setFont(13), { color: ColorApp.fade }]}>{strings['Всего попыток:']}</Text>
                        <Text style={[setFont(13)]}> {item.attempts != null ? item.attempts : 0}</Text>
                    </View>

                    <View style={{ flexDirection: "row", alignItems: "center", marginHorizontal: 16, flex: 1 }}>
                        <Text style={[setFont(13), { color: ColorApp.fade }]}>{strings['Пройденные попытки:']}</Text>
                        <Text style={[setFont(13), { flex: 1 }]}> {item.passing ? item.passing.attempts : 0}</Text>
                    </View>

                </View>

                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <Text style={[setFont(13), { color: item.passing?.percent > 50 ? ColorApp.main : ColorApp.fade }]}>{this.scoreTest(item)}</Text>
                    {
                        item.user_certificate ?
                            <TouchableOpacity
                                onPress={() => this.downloadFile(item.user_certificate.file, item)}
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
                                        <Text style={[setFont(13, "600", ColorApp.action), { textTransform: "uppercase" }]}>{strings['Скачать сертификат']}</Text>

                                }

                            </TouchableOpacity>
                            :
                            <Text onPress={() => this.onNavigationTest(item)} style={[setFont(13, "600", ColorApp.action), { textTransform: "uppercase" }]}>{strings.Пройти}</Text>
                    }
                </View>

                <View style={{ position: "absolute", left: 16, right: -16, bottom: 0, height: 0.5, backgroundColor: ColorApp.border }} />
            </TouchableOpacity>
        </Animatable.View >
    );

    renderItemAllTest = ({ item, index }) => (
        <Animatable.View animation={this.state.onAnimation ? "fadeInLeft" : undefined} useNativeDriver >
            <TouchableOpacity
                onPress={() => this.onNavigation(item)}
                activeOpacity={0.8}
            >
                <View style={{ paddingTop: 14, paddingBottom: 10 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>

                        <Text style={[setFont(10, "500", ColorApp.action), { flex: 1, marginRight: 16, textTransform: "uppercase" }]}>{item.category.name}</Text>

                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <FastImage
                                source={require("../../../assets/images/timer.png")}
                                style={{ width: 16, height: 16 }}
                                tintColor={ColorApp.fade}
                            />
                            <Text style={[setFont(10, "500", ColorApp.fade), { marginLeft: 4 }]}>{item.timer ? item.timer : 30} {strings.мин}</Text>
                        </View>


                    </View>

                    <Text style={[setFont(15, "600"), { marginBottom: 4 }]}>{item.title}</Text>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Text style={[setFont(13), { color: ColorApp.fade }]}>{strings['Всего попыток:']}</Text>
                        <Text style={[setFont(13)]}> {item.attempts ? item.attempts : 0}</Text>
                    </View>

                    <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10, justifyContent: "space-between" }}>
                        {
                            this.state.nStatus == '2' ?
                                <Text></Text>
                                :
                                <View style={{ flexDirection: "row", alignItems: "center", flex: 1, marginRight: 16 }}>
                                    <Text style={[setFont(13, "600", ColorApp.main)]}>{item.price > 0 ? item.price + '₸' : strings.Бесплатно}</Text>
                                    {
                                        item.price != 0 && item.old_price != 0 ?
                                            <Text style={[setFont(13), { marginLeft: 4, color: ColorApp.fade, textDecorationColor: ColorApp.fade, textDecorationLine: "line-through" }]}>{item.old_price}</Text>
                                            :
                                            null
                                    }
                                </View>
                        }

                        <Text style={[setFont(13, "600", ColorApp.action), { textTransform: "uppercase" }]}>{strings.Пройти}</Text>
                    </View>

                    <View style={{ position: "absolute", left: 16, right: -16, bottom: 0, height: 0.5, backgroundColor: ColorApp.border }} />
                </View>
            </TouchableOpacity>
        </Animatable.View>
    );

    renderItemRaiting = ({ item, index }) => (
        <Animatable.View animation={this.state.onAnimation ? "fadeInLeft" : undefined} useNativeDriver >
            <View style={{ flexDirection: "row", alignItems: "center", paddingTop: 14, paddingBottom: 10 }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={[setFont(10, "500", ColorApp.fade), { marginRight: 4 }]}>{index + 1}.</Text>
                    <FastImage
                        source={{ uri: item.user.avatar, priority: FastImage.priority.high }}
                        style={{ width: 36, height: 36, borderRadius: 36 }}
                    />
                </View>


                <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={[setFont(10, "500", ColorApp.action), { marginBottom: 2 }]}>{item.entity.category.name}</Text>
                    <Text style={[setFont(15, "600")]}>{item.user.name}</Text>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Text style={[setFont(13)], { flex: 1, marginRight: 16 }}>{item.entity.title}</Text>
                        <Text style={[setFont(13, "600", ColorApp.main), { textTransform: "uppercase" }]}>{item.score}-{strings.БАЛЛ}</Text>
                    </View>
                </View>

                <View style={{ position: "absolute", left: 16, right: -16, bottom: 0, height: 0.5, backgroundColor: ColorApp.border }} />
            </View>
        </Animatable.View>
    );

    ListFooterComponent = () => (
        <Fragment>
            {
                this.state.isSendServer ?
                    <ActivityIndicator style={{ marginVertical: 16 }} color={ColorApp.main} />
                    :
                    null
            }
        </Fragment>
    );



    ListHeaderComponentSort = () => (
        <TouchableOpacity
            activeOpacity={1}
            style={{
                backgroundColor: ColorApp.transparent,
                borderTopLeftRadius: 14,
                borderTopRightRadius: 14
            }}
        >
            <View style={{ width: 36, height: 4, alignSelf: 'center', marginTop: 4, backgroundColor: "rgba(203, 205, 204, 0.5)", marginBottom: 20 }} />

            <Text style={[setFont(17, '600'), { textAlign: 'center' }]}>{strings.Фильтр}</Text>

            <TouchableOpacity
                onPress={() => this.setState({ visibleSort: false, visibleCategor: true, isTestClick: false })}
                activeOpacity={0.8}
                style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, }}
            >
                <Text style={[setFont(17), { marginRight: 12 }]}>{strings['Выберите направление']}</Text>
                <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                    <Text numberOfLines={1} style={[setFont(13), { color: ColorApp.fade }, { flex: 1, textAlign: "right", marginRight: 16 }]}>{this.state.itemCategor.name}</Text>
                    <FastImage
                        source={require('../../../assets/images/next.png')}
                        style={{ width: 24, height: 24 }}
                    />
                </View>
                <View style={{ position: 'absolute', left: 16, right: 0, bottom: 0, height: 0.5, backgroundColor: ColorApp.border }} />
            </TouchableOpacity>

            {
                this.state.tabindex == 2 ?
                    <TouchableOpacity
                        onPress={() => this.setState({ visibleSort: false, isTestClick: true, visibleCategor: true })}
                        activeOpacity={0.8}
                        style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, }}
                    >
                        <Text style={[setFont(17), { marginRight: 12 }]}>{strings['Выберите тест']}</Text>
                        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                            <Text numberOfLines={1} style={[setFont(13), { color: ColorApp.fade }, { flex: 1, textAlign: "right", marginRight: 16 }]}>{this.state.itemTestCategor.title}</Text>
                            <FastImage
                                source={require('../../../assets/images/next.png')}
                                style={{ width: 24, height: 24 }}
                            />
                        </View>
                        <View style={{ position: 'absolute', left: 16, right: 0, bottom: 0, height: 0.5, backgroundColor: ColorApp.border }} />
                    </TouchableOpacity>
                    :
                    null
            }

            {
                this.state.tabindex == 2 ?
                    null
                    :
                    <SectionRow text={strings.Сортировка} style={{ marginTop: 16 }} />

            }
        </TouchableOpacity>

    );

    renderItemSort = ({ item, index }) => (
        <TouchableOpacity
            onPress={() => this.onSelectSort(item)}
            activeOpacity={0.8}
            style={{ flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 16 }}
        >
            <Text style={[setFont(17), { flex: 1, marginRight: 16 }]}>{item.text}</Text>
            {
                item.select ?
                    <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: ColorApp.main, justifyContent: 'center', alignItems: 'center' }}>
                        <Icon name='check' color='#fff' />
                    </View>
                    :
                    <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#F5F5F5' }} />
            }
            <View style={{ position: 'absolute', left: 16, right: 0, bottom: 0, height: 0.5, backgroundColor: ColorApp.border }} />
        </TouchableOpacity>

    );

    ListFooterComponentSort = () => (
        <TouchableOpacity activeOpacity={1} >
            <ButtonApp
                onPress={this.onFilter}
                disabled={this.state.itemSort.select && this.state.tabindex !== 2 || this.state.itemCategor.select || this.state.tabindex == 2 && this.state.itemTestCategor.select ? false : true}
                style={{ marginHorizontal: 16, backgroundColor: this.state.itemSort.select && this.state.tabindex !== 2 || this.state.itemCategor.select || this.state.tabindex == 2 && this.state.itemTestCategor.select ? ColorApp.main : ColorApp.fade }}
                text={strings.Применить}
            />
            <ButtonApp
                onPress={this.onClearFilter}
                disabled={this.state.itemSort.select && this.state.tabindex !== 2 || this.state.itemCategor.select || this.state.tabindex == 2 && this.state.itemTestCategor.select ? false : true}
                style={{ marginHorizontal: 16, marginTop: 10, backgroundColor: ColorApp.transparent }}
                text={strings.Сбросить}
                textStyle={{ color: this.state.itemSort.select && this.state.tabindex !== 2 || this.state.itemCategor.select || this.state.tabindex == 2 && this.state.itemTestCategor.select ? ColorApp.main : ColorApp.fade }}
            />
        </TouchableOpacity>
    );

    ListHeaderComponentCategory = () => (
        <TouchableOpacity
            activeOpacity={1}
            style={{
                backgroundColor: ColorApp.transparent,
                borderTopLeftRadius: 14,
                borderTopRightRadius: 14
            }}
        >
            <View style={{ width: 36, height: 4, alignSelf: 'center', marginTop: 4, backgroundColor: "rgba(203, 205, 204, 0.5)", marginBottom: 20 }} />

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <TouchableOpacity
                    onPress={() => this.setState({ visibleCategor: false, visibleSort: true })}
                    activeOpacity={0.8}
                    style={{ position: 'absolute', left: 16 }}
                >
                    <FastImage
                        source={require('../../../assets/images/back.png')}
                        style={{ width: 24, height: 24 }}
                    />
                </TouchableOpacity>
                <Text style={[setFont(17, "600"), { textAlign: 'center' }]}>{this.state.tabindex == 2 && this.state.isTestClick ? strings['Выберите тест'] : strings['Выберите направление']}</Text>
            </View>
        </TouchableOpacity>
    );

    renderItemCategory = ({ item, index }) => (
        <TouchableOpacity
            onPress={() => this.state.tabindex == 2 && this.state.isTestClick ? this.onSelectCategorTest(item) : this.onSelectCategor(item)}
            activeOpacity={0.8}
            style={{ flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 16 }}
        >
            <Text style={[setFont(17), { flex: 1, marginRight: 16 }]}>{this.state.tabindex == 2 && this.state.isTestClick ? item.title : item.name}</Text>
            {
                item.select ?
                    <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: ColorApp.main, justifyContent: 'center', alignItems: 'center' }}>
                        <Icon name='check' color='#fff' />
                    </View>
                    :
                    <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#F5F5F5' }} />
            }
            <View style={{ position: 'absolute', left: 16, right: 0, bottom: 0, height: 0.5, backgroundColor: ColorApp.border }} />
        </TouchableOpacity>
    );

    render() {

        const { isNet, dataSource, sorts, category, tests, isTestClick, isLoading, isRefreshing, tabindex, visibleSort, visibleCategor } = this.state;

        this.globalState = this.context;

        return (
            <NetConnection isNet={isNet} onPress={this.checkConnection}>
                <View style={{ flex: 1, backgroundColor: ColorApp.bg }}>
                    {
                        isLoading ?
                            <Loading />
                            :
                            <View style={{ flex: 1 }}>
                                <FlatList
                                    data={dataSource}
                                    ListHeaderComponent={this.ListHeaderComponent}
                                    ListHeaderComponentStyle={{ marginBottom: 8 }}
                                    renderItem={tabindex == 0 ? this.renderItemMyTest : tabindex == 1 ? this.renderItemAllTest : this.renderItemRaiting}
                                    ListEmptyComponent={() => <NoData />}
                                    ListFooterComponent={this.ListFooterComponent}
                                    contentContainerStyle={{ padding: 16 }}
                                    contentInset={{ bottom: 32 }}
                                    keyExtractor={(item, index) => index + ""}
                                    refreshing={isRefreshing}
                                    onRefresh={this.onRefresh}
                                    onEndReached={this.onEndReached}
                                    onEndReachedThreshold={0.1}
                                />

                                {/* Sorts */}
                                <Modal
                                    transparent
                                    visible={visibleSort}
                                    animationType="fade"
                                >
                                    <TouchableOpacity
                                        onPress={() => this.setState({ visibleSort: false })}
                                        activeOpacity={1}
                                        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: 'flex-end' }}
                                    >

                                        <View style={{ paddingBottom: 20, maxHeight: height < 896 ? height / 1.6 : height / 2, backgroundColor: '#fff', borderTopLeftRadius: 14, borderTopRightRadius: 14 }}>
                                            {this.ListHeaderComponentSort()}
                                            <FlatList
                                                data={sorts}
                                                // ListHeaderComponent={this.ListHeaderComponentSort}
                                                renderItem={tabindex == 2 ? null : this.renderItemSort}
                                                // ListFooterComponent={this.ListFooterComponentSort}
                                                ListFooterComponentStyle={{ marginVertical: 24 }}
                                                keyExtractor={(item, index) => index + ""}
                                                style={{ marginBottom: 24 }}
                                            // showsVerticalScrollIndicator={false}
                                            />
                                            {this.ListFooterComponentSort()}
                                        </View>
                                    </TouchableOpacity>
                                </Modal>



                                {/* Category */}
                                <Modal
                                    transparent
                                    visible={visibleCategor}
                                    animationType='fade'
                                >
                                    <TouchableOpacity
                                        onPress={() => this.setState({ visibleCategor: false, visibleSort: true })}
                                        activeOpacity={1}
                                        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: 'flex-end' }}
                                    >

                                        <View style={{ paddingBottom: 20, maxHeight: height < 896 ? height / 1.6 : height / 2, backgroundColor: '#fff', borderTopLeftRadius: 14, borderTopRightRadius: 14 }}>
                                            {this.ListHeaderComponentCategory()}
                                            <FlatList
                                                data={tabindex == 2 && isTestClick ? tests : category}
                                                // ListHeaderComponent={this.ListHeaderComponentCategory}
                                                ListHeaderComponentStyle={{ marginBottom: 28 }}
                                                renderItem={this.renderItemCategory}
                                                // ListFooterComponent={this.ListFooterComponentSort}
                                                ListEmptyComponent={() => <NoData />}
                                                ListFooterComponentStyle={{ marginVertical: 24 }}
                                                keyExtractor={(item, index) => index + ""}
                                                style={{ marginBottom: 24 }}
                                            // showsVerticalScrollIndicator={false}
                                            />
                                            {this.ListFooterComponentSort()}
                                        </View>
                                    </TouchableOpacity>
                                </Modal>
                            </View>
                    }

                </View>
            </NetConnection>
        );
    }
}

const styles = StyleSheet.create({
    shadowActiv: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
        elevation: 1
    }
});
