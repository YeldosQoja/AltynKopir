import Axios from 'axios';
import React, { Component, Fragment } from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView, TextInput, StyleSheet, Modal, Dimensions, PermissionsAndroid, Alert, Platform, StatusBar, Keyboard } from 'react-native';
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
import * as Progress from 'react-native-progress';
import { StateContext } from '../../../provider/ProviderApp';
import { navOptions } from '../../../constants/NavOptions';
import * as Animatable from 'react-native-animatable';
import IconPlay from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFetchBlob from 'rn-fetch-blob';
import IconCancel from 'react-native-vector-icons/Ionicons';
import NetConnection from '../../../components/NetConnection';

const { height } = Dimensions.get("screen");

export default class Tab1 extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {},
            dataSource: [],
            dataSourceAllCourse: [],
            sorts: [],
            category: [],
            isLoading: true,
            isRefreshing: false,
            tabIndex: 0,
            visibleSort: false,
            visibleCategor: false,
            itemCategor: { name: "", select: false },
            itemSort: { select: false },
            query: "",
            isSendServer: false,
            isSearch: false,
            onAnimation: true,
            showSearch: false,
            sendSearch: false,
            showSearchAllRender: false,
            saveTabIndex: 0,
            searchWords: [],
            scrollEnabled: true,
            progress: 0,
            isNet: true,
            nStatus: '0'
        };
        this.isInput = false;
    }

    static contextType = StateContext;

    componentDidMount() {
        this.props.navigation.setOptions(navOptions.HEADER(this.globalState.bottomBar ? this.globalState.bottomBar.bottom_nav[this.globalState.bottomBar.bottom_nav.findIndex(i => i.id == 1)]?.title : strings.Курсы, this.globalState.bottomBar ? this.globalState.bottomBar.logo : null));
        if (this.globalState.token) {
            this.setState({ tabIndex: 0 }, this.getStatus);
        } else {
            this.setState({ tabIndex: 1 }, this.getStatus);
        }

        AsyncStorage.getItem("SearchHistory").then(res => {
            if (res) {
                let resJson = JSON.parse(res);
                if (resJson.length > 0) {
                    this.setState({ searchWords: resJson });
                }
            }
        }).catch();
    }

    getStatus = () => {
        Axios({
            method: 'GET',
            url: Axios.defaults.baseURL + 'get'
        }).then(res => {
            console.log('getStatus', res);
            this.setState({ nStatus: Platform.OS == 'ios' ? res.data.ios : res.data.android })
            this.checkConnection();
        })
            .catch(e => {
                console.log("catch getStatus", e);
                this.setState({ nStatus: '0' });
                this.checkConnection();
            });
    }

    componentDidUpdate() {
        if (this.globalState.exit) {
            this.setState({ isLoading: true, tabIndex: 1 }, this.checkConnection);
            this.globalState.setExit(false);
        } else {
            if (this.globalState.token) {
                if (this.globalState.isReload) {
                    this.setState({ isLoading: true, tabIndex: 0 }, this.checkConnection);
                    this.globalState.setIsReload(false);
                }
            }
        }

        this.props.navigation.setOptions({
            headerShown: this.isInput ? false : true
        });

    }

    checkConnection = () => {
        constants.NetCheck({ send: this.state.tabIndex == 0 ? this.getMyCourse : this.getCourse, error: () => this.setState({ isNet: false }) });
    }


    getCourse = (reload = false, np) => {
        this.setState({ isNet: true });
        let param = {
            filter: true,
            page: 1
        };

        if (np) {
            let nextPage = np;
            nextPage = nextPage.split("=")[nextPage.split("=").length - 1];
            param.page = nextPage;
        }

        if (this.state.itemSort.select) {
            param.price = this.state.itemSort.type;
        }

        if (this.state.itemCategor.select) {
            param.category_id = this.state.itemCategor.id;
        }

        if (reload || this.state.query.length > 0) {
            // if (!np) {
            //     this.setState({ isLoading: true });
            // }
        }

        if (this.state.query.length > 0) {
            param.query = this.state.query;
        }

        Axios.get("courses", { params: param })
            .then(res => {
                console.log('getCourse: ', res);

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

                this.setState({
                    data: res.data,
                    // dataSource: np ? this.state.dataSource.concat(res.data.data) : res.data.data,
                    dataSourceAllCourse: np ? this.state.dataSourceAllCourse.concat(res.data.data) : res.data.data,
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

    getMyCourse = (reload = false, np) => {
        this.setState({ isNet: true });
        let param = {
            filter: true,
            page: 1
        };

        if (np) {
            let nextPage = np;
            nextPage = nextPage.split("=")[nextPage.split("=").length - 1];
            param.page = nextPage;
        }

        if (this.state.itemSort.select) {
            param.price = this.state.itemSort.type;
        }

        if (this.state.itemCategor.select) {
            param.category_id = this.state.itemCategor.id;
        }

        if (reload || this.state.query.length > 0) {
            // if (!np) {
            //     this.setState({ isLoading: true });
            // }
        }

        if (this.state.query.length > 0) {
            param.query = this.state.query;
        }

        Axios.get("my_courses", { params: param })
            .then(res => {
                console.log('getMyCourse: ', res);

                if (res.data.data.length > 0) {
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
                } else {
                    this.setState({ tabIndex: 1 }, this.checkConnection);
                }


            })
            .catch(e => {
                console.log(e);
                console.log(e.response);
                this.setState({ isRefreshing: false, isSendServer: false });
                constants.onHandlerError(e.response.data, e.response.status);
            });
    }

    onRefresh = () => {
        this.setState({ isRefreshing: true, isSendServer: false });
        if (this.state.tabIndex == 0) {
            this.getMyCourse();
        } else {
            this.getCourse();
        }
    }

    onEndReached = () => {
        if (this.state.data.next_page_url) {
            this.setState({ isSendServer: true });
            if (this.state.isSendServer) {
                if (this.state.tabIndex == 0) {
                    this.getMyCourse(false, this.state.data.next_page_url);
                } else {
                    this.getCourse(false, this.state.data.next_page_url);
                }
            }
        }
    }

    onFilter = () => {
        this.isInput = true;
        this.setState({ isLoading: true, sendSearch: true, visibleSort: false, visibleCategor: false, isSearch: true, showSearch: false, showSearchAllRender: true, tabIndex: 1, scrollEnabled: true }, () => {
            if (this.state.itemSort.select || this.state.itemCategor.select) {
                if (this.state.tabIndex == 0) {
                    this.checkConnection();
                } else {
                    this.checkConnection();
                }
            }
        });
        StatusBar.setBarStyle("dark-content");
    }

    onClearFilter = () => {

        this.isInput = false;
        this.setState({
            visibleSort: false,
            visibleCategor: false,
            itemCategor: { name: "", select: false },
            itemSort: { select: false },
            showSearchAllRender: false,
            tabIndex: this.state.saveTabIndex,
            sendSearch: false,
            isLoading: true,
            isSearch: false,
            scrollEnabled: true
        }, () => {
            console.log();
            if (this.state.tabIndex == 0) {
                this.checkConnection();
            } else {
                console.log("THIS IS");
                this.checkConnection();
            }
        });
        StatusBar.setBarStyle("light-content");
    }

    onSubmitEditing = (index, itemWord) => {

        if (index == 0) {
            if (this.state.query.trim().length > 2) {
                console.log("this.state.query.trim().length", this.state.query.trim().length);
                // if (this.state.tabIndex == 0) {
                //     this.setState({ isSearch: true, showSearch: false, sendSearch: true, showSearchAllRender: true });
                //     this.getMyCourse();
                // } else {
                //     this.setState({ isSearch: true, showSearch: false, sendSearch: true, showSearchAllRender: true });
                //     this.getCourse();
                // }

                this.setState({ tabIndex: 1, searchWords: this.state.searchWords, isSearch: true, showSearch: false, sendSearch: true, showSearchAllRender: true }, this.checkConnection);
            }
        } else {
            this.setState({ tabIndex: 1, query: itemWord, searchWords: this.state.searchWords, isSearch: true, showSearch: false, sendSearch: true, showSearchAllRender: true }, this.checkConnection);
        }

    }

    clearSearch = () => {
        this.isInput = false;
        this.setState({
            isLoading: true,
            query: "",
            isSearch: false,
            showSearch: false,
            sendSearch: false,
            itemCategor: { name: "", select: false },
            itemSort: { select: false },
            showSearchAllRender: false,
            tabIndex: this.state.saveTabIndex,
            scrollEnabled: true
        }, () => {

            if (this.state.tabIndex == 0) {
                this.checkConnection();
            } else {
                this.checkConnection();
            }
        });
        StatusBar.setBarStyle("light-content");
    }

    selectTab = (index) => {
        switch (index) {
            case 0:
                if (this.globalState.token) {
                    this.setState({ tabIndex: index, isLoading: true }, this.checkConnection);
                } else {
                    this.props.navigation.navigate("Tab4Navigator", { screen: "AuthNavigator" });
                }
                break;
            case 1:
                this.setState({ tabIndex: index, isLoading: true }, this.checkConnection);
                break;
        }
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
                        console.log('file android: ', res);
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
            this.task.cancel((e, d) => {
                this.setState({ progress: 0 });
            });
        }
    }

    ListHeaderComponent = () => (
        <Animatable.View animation={this.state.onAnimation ? "slideInDown" : undefined} onAnimationEnd={() => this.setState({ onAnimation: false })} useNativeDriver>
            {
                this.globalState.bottomBar?.show_filter ?
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
                        {
                            this.state.isSearch ?
                                <Animatable.View animation="slideInLeft" useNativeDriver duration={300}>
                                    <TouchableOpacity
                                        onPress={this.clearSearch}
                                        activeOpacity={0.8}
                                    >
                                        <IconClear name="close" size={24} color={ColorApp.fade} />
                                    </TouchableOpacity>
                                </Animatable.View>
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
                                onChangeText={(query) => this.setState({ query }, () => this.onSubmitEditing(0))}
                                onSubmitEditing={() => this.onSubmitEditing(0)}
                                value={this.state.query}
                                onFocus={() => { this.setState({ scrollEnabled: false, showSearch: true, isSearch: true, saveTabIndex: this.state.tabIndex }); this.isInput = true; StatusBar.setBarStyle("dark-content"); }}
                                onBlur={() => {
                                    if (this.state.query.trim().length > 2) {
                                        this.setState({ scrollEnabled: true });
                                        this.state.searchWords.unshift(this.state.query);
                                        AsyncStorage.setItem("SearchHistory", JSON.stringify(this.state.searchWords)).catch();
                                    }
                                }}
                            />
                        </InputContainer>

                        <TouchableOpacity
                            onPress={() => this.setState({ visibleSort: true, saveTabIndex: this.state.tabIndex }, Keyboard.dismiss)}
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
                    :
                    null
            }


            {
                this.state.sendSearch ?
                    null
                    :
                    <View style={{ flexDirection: 'row', height: 38, paddingHorizontal: 2, backgroundColor: ColorApp.inputColor, alignItems: 'center', borderRadius: 8 }}>
                        <TouchableOpacity
                            onPress={() => this.selectTab(0)}
                            activeOpacity={0.8}
                            style={this.state.tabIndex == 0 ? styles.active : styles.inActive}
                        >
                            <Text>{strings["Мои курсы"]}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => this.selectTab(1)}
                            activeOpacity={0.8}
                            style={this.state.tabIndex == 1 ? styles.active : styles.inActive}
                        >
                            <Text>{strings["Все курсы"]}</Text>
                        </TouchableOpacity>
                    </View>
            }

        </Animatable.View>
    );

    renderItem = ({ item, index }) => (
        <Fragment>
            {
                this.state.showSearchAllRender ?
                    <Animatable.View animation={this.state.onAnimation ? "fadeInUp" : undefined} useNativeDriver>
                        <TouchableOpacity
                            onPress={() => this.props.navigation.navigate("CourseOpen", { itemCourse: item })}
                            activeOpacity={0.8}
                            style={{ flexDirection: "row", alignItems: "center", paddingTop: index != 0 ? 16 : 0 }}
                        >
                            <FastImage
                                source={{ uri: item.poster, priority: FastImage.priority.high }}
                                style={{ width: 60, height: 60, borderRadius: 10 }}
                            />
                            <View style={{ flex: 1, marginLeft: 8 }}>
                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                    <Text style={[setFont(10, "500", ColorApp.action), { flex: 1, marginRight: 16, textTransform: "uppercase" }]}>{item.category_name}</Text>
                                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                                        <FastImage
                                            source={require("../../../assets/images/star.png")}
                                            style={{ width: 16, height: 16 }}
                                        />
                                        <Text style={[setFont(10, "500"), { marginHorizontal: 2 }]}>{item.reviews_stars}</Text>
                                        <Text style={[setFont(10, "500")]}>({item.reviews_count})</Text>
                                    </View>
                                </View>
                                <Text style={[setFont(15, "600"), { marginTop: 2, marginBottom: 4 }]}>{item.title}</Text>
                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                    <Text style={[setFont(13, "600", ColorApp.main)]}>{item.price > 0 ? constants.priceFormat(item.price) + '₸' : strings.Бесплатно}</Text>
                                    {
                                        item.price == 0 ?
                                            null
                                            :
                                            item.old_price == null || item.old_price == 0 ?
                                                null
                                                :
                                                <Text style={[setFont(13, 'normal', ColorApp.fade), { textDecorationLine: 'line-through', textDecorationColor: ColorApp.fade, marginLeft: 4 }]}>{constants.priceFormat(item.old_price)}₸</Text>
                                    }
                                </View>
                                <View style={{ height: 1, backgroundColor: ColorApp.border, marginTop: 16 }} />
                            </View>
                        </TouchableOpacity>
                    </Animatable.View>
                    :
                    <Animatable.View animation={this.state.onAnimation ? "fadeInUp" : undefined} useNativeDriver>
                        <TouchableOpacity
                            onPress={() => this.props.navigation.navigate("CourseOpen", { itemCourse: item })}
                            activeOpacity={0.8}
                            style={{ marginBottom: 16 }}
                        >
                            {
                                item.poster ?
                                    <FastImage
                                        source={{ uri: item.poster, priority: FastImage.priority.high }}
                                        style={{ width: '100%', height: 200, borderRadius: 12 }}
                                    />
                                    :
                                    null
                            }

                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 4 }}>
                                <Text numberOfLines={2} style={[setFont(13, '600'), { flex: 1, marginRight: 16, textTransform: "uppercase" }]}>{item.category_name}</Text>
                                {
                                    this.state.nStatus == '2' ?
                                        null
                                        :
                                        <View style={{ paddingHorizontal: 12, paddingVertical: 4, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', backgroundColor: ColorApp.main, borderRadius: 4 }}>
                                            <Text style={[setFont(13, '600', '#fff'), { marginRight: 4 }]}>{item.price > 0 ? constants.priceFormat(item.price) + '₸' : strings.Бесплатно}</Text>
                                            {
                                                item.price == 0 ?
                                                    null
                                                    :
                                                    item.old_price == null || item.old_price == 0 ?
                                                        null
                                                        :
                                                        <Text style={[setFont(13, 'normal', 'rgba(255,255,255,0.6)'), { textDecorationLine: 'line-through', textDecorationColor: 'rgba(255,255,255,0.6)' }]}>{constants.priceFormat(item.old_price)}₸</Text>
                                            }
                                        </View>
                                }

                            </View>

                            <Text numberOfLines={4} style={[setFont(20, 'bold')]}>{item.title}</Text>

                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                                <Text style={[setFont(15)]}>{item.author.name}</Text>
                                <View style={{ width: 1, height: 16, backgroundColor: "rgba(0,0,0,0.24)", marginHorizontal: 4 }} />
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <FastImage
                                        source={require('../../../assets/images/star.png')}
                                        style={{ width: 16, height: 16 }}
                                    />
                                    <Text style={[setFont(10, '500'), { marginLeft: 4, marginRight: 2 }]}>{item.reviews_stars}</Text>
                                    <Text style={[setFont(10, 'normal', "rgba(0,0,0,0.8)")]}>({item.reviews_count} {strings.отзывов})</Text>
                                </View>
                            </View>
                        </TouchableOpacity >
                    </Animatable.View>
            }
        </Fragment >

    );

    ListEmptyComponent = () => (
        <NoData />
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
                onPress={() => this.setState({ visibleSort: false, visibleCategor: true })}
                activeOpacity={0.8}
                style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, }}
            >
                <Text style={[setFont(17), { marginRight: 12 }]}>{strings.Категория}</Text>
                <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                    <Text numberOfLines={1} style={[setFont(13), { color: ColorApp.fade }, { flex: 1, marginRight: 16, textAlign: "right" }]}>{this.state.itemCategor.name}</Text>
                    <FastImage
                        source={require('../../../assets/images/next.png')}
                        style={{ width: 24, height: 24 }}
                    />
                </View>
                <View style={{ position: 'absolute', left: 16, right: 0, bottom: 0, height: 0.5, backgroundColor: ColorApp.border }} />
            </TouchableOpacity>

            <SectionRow text={strings.Сортировка} style={{ marginTop: 16 }} />
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
                disabled={this.state.itemSort.select || this.state.itemCategor.select ? false : true}
                style={{ marginHorizontal: 16, backgroundColor: this.state.itemSort.select || this.state.itemCategor.select ? ColorApp.main : ColorApp.fade }}
                text={strings.Применить}
            />
            <ButtonApp
                onPress={this.onClearFilter}
                disabled={this.state.itemSort.select || this.state.itemCategor.select ? false : true}
                style={{ marginHorizontal: 16, marginTop: 10, backgroundColor: ColorApp.transparent }}
                text={strings.Сбросить}
                textStyle={{ color: this.state.itemSort.select || this.state.itemCategor.select ? ColorApp.main : ColorApp.fade }}
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
                <Text style={[setFont(17, "600"), { textAlign: 'center' }]}>{strings["Выберите категорию"]}</Text>
            </View>
        </TouchableOpacity>
    );


    renderItemCategory = ({ item, index }) => (
        <TouchableOpacity
            onPress={() => this.onSelectCategor(item)}
            activeOpacity={0.8}
            style={{ flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 16 }}
        >
            <Text style={[setFont(17), { flex: 1, marginRight: 16 }]}>{item.name}</Text>
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



    renderItemMyCourse = ({ item, index }) => (
        <Animatable.View animation={this.state.onAnimation ? "fadeInUp" : undefined} useNativeDriver>
            <TouchableOpacity
                onPress={() => this.props.navigation.navigate("Lesson", { itemLesson: { id: item.progress_information?.next_lesson?.id }, title: item.title })}
                activeOpacity={0.8}
                style={{ marginBottom: 24 }}
            >
                <FastImage
                    source={{ uri: item.progress_information?.next_lesson?.preview, priority: FastImage.priority.high }}
                    style={{ width: "100%", height: 200, borderRadius: 12 }}
                >
                    <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.16)", padding: 16, borderRadius: 12 }}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            {
                                item.user_certificate ?
                                    <View style={{ flex: 1 }} />
                                    :
                                    <Text numberOfLines={1} style={[setFont(18, "600", "rgba(255,255,255,0.8)"), styles.lessonTextShadow, { flex: 1, marginRight: 16, textTransform: "uppercase" }]}>{item.progress_information?.next_lesson?.position} {strings.урок}</Text>
                            }


                            <Progress.Circle
                                size={40}
                                progress={item.progress_information?.number ? parseFloat(item.progress_information.number) / 100 : 0}
                                formatText={() => item.progress_information?.number ? item.progress_information.number : "0 %"}
                                borderWidth={0}
                                unfilledColor={"rgba(255,255,255,0.4)"}
                                borderColor={null}
                                color={"#fff"}
                                showsText
                                textStyle={setFont(10, "500", "#fff")}
                            />

                        </View>
                        <View style={{ position: "absolute", bottom: 16, left: 16, right: 16 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                                {
                                    item.progress_information?.number == '100%' ?
                                        <Fragment>
                                            <View style={{ width: 16, height: 16, borderRadius: 9, justifyContent: "center", alignItems: "center", backgroundColor: ColorApp.main }}>
                                                <IconPlay name="checkmark" color={"#fff"} size={9} />
                                            </View>
                                            <Text style={[setFont(10, "500", "#fff"), { marginLeft: 4 }]}>{strings['Курс завершен']}</Text>
                                        </Fragment>
                                        :
                                        <Fragment>
                                            <View style={{ width: 16, height: 16, borderRadius: 9, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(245, 245, 245,0.24)" }}>
                                                <IconPlay name="play" color={"#fff"} size={9} />
                                            </View>
                                            <Text style={[setFont(10, "500", "#fff"), { marginLeft: 4 }]}>{strings['Продолжить урок']}</Text>
                                        </Fragment>
                                }
                            </View>
                            <Text numberOfLines={1} style={[setFont(17, "600", "#fff"), { marginBottom: 4 }]}>{item.progress_information?.next_lesson?.title}</Text>
                            <Text numberOfLines={2} style={[setFont(13, "600", "#fff")]}>{item.progress_information?.next_lesson?.description}</Text>
                        </View>
                    </View>
                </FastImage>

                <TouchableOpacity
                    onPress={() => this.props.navigation.navigate("MyCourseOpen", { itemCourse: item })}
                    activeOpacity={0.9}
                    style={{ flexDirection: "row", alignItems: "center", marginTop: 16 }}
                >
                    <FastImage
                        source={{ uri: item.poster, priority: FastImage.priority.high }}
                        style={{ width: 60, height: 60, borderRadius: 10 }}
                    />
                    <View style={{ flex: 1, marginLeft: 8 }}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <Text style={[setFont(10, "500", ColorApp.action), { flex: 1, marginRight: 16, textTransform: "uppercase" }]}>{item.category_name}</Text>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <FastImage
                                    source={require("../../../assets/images/star.png")}
                                    style={{ width: 16, height: 16 }}
                                />
                                <Text style={[setFont(10, "500")], { marginHorizontal: 2 }}>{item.reviews_stars}</Text>
                                <Text style={[setFont(10)]}>({item.reviews_count})</Text>
                            </View>
                        </View>
                        <Text style={[setFont(15, "600"), { marginVertical: 4 }]}>{item.title}</Text>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            {
                                item.user_certificate ?
                                    <TouchableOpacity
                                        onPress={() => this.downloadFile(item.user_certificate.file, item.title, true, item)}
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
                                    null
                            }
                        </View>
                    </View>
                </TouchableOpacity>
                <View style={{ height: 0.5, backgroundColor: ColorApp.border, marginTop: 16 }} />
            </TouchableOpacity>
        </Animatable.View>

    );

    ListFooterComponent = () => (
        <Fragment>
            {
                this.state.isSendServer ?
                    <Loading style={{ marginVertical: 16 }} />
                    :
                    null
            }
        </Fragment>
    );


    ListHeaderComponentWord = () => (
        <Fragment>
            {
                this.state.searchWords.length > 0 ?
                    <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 6, backgroundColor: ColorApp.sectionBG }}>
                        <Text style={setFont(13, 'normal', ColorApp.fade)}>{strings['История поиска']}</Text>
                    </View>
                    :
                    null
            }
        </Fragment>
    );

    renderItemWord = ({ item, index }) => (
        <TouchableOpacity
            onPress={() => this.onSubmitEditing(1, item)}
            activeOpacity={0.9}
            style={{ paddingHorizontal: 16, paddingTop: 12 }}
        >
            <Text style={setFont(17, 'normal', ColorApp.main)}>{item}</Text>
            <View style={{ height: 1, backgroundColor: ColorApp.border, marginTop: 12 }} />
        </TouchableOpacity>
    );

    render() {

        const { isNet, scrollEnabled, data, searchWords, dataSource, dataSourceAllCourse, sorts, category, isLoading, isRefreshing, visibleSort, visibleCategor, tabIndex } = this.state;

        this.globalState = this.context;

        return (
            <NetConnection isNet={isNet} onPress={this.checkConnection}>
                <SafeAreaView style={{ flex: 1, backgroundColor: ColorApp.bg, paddingTop: Platform.OS == 'android' && this.isInput ? StatusBar.currentHeight : 0 }}>
                    {
                        isLoading ?
                            <Loading />
                            :
                            <View style={{ flex: 1 }}>
                                <FlatList
                                    data={tabIndex == 0 ? dataSource : dataSourceAllCourse}
                                    ListHeaderComponent={this.ListHeaderComponent}
                                    ListHeaderComponentStyle={{ marginBottom: 14 }}
                                    ListEmptyComponent={this.ListEmptyComponent}
                                    renderItem={tabIndex == 0 ? this.renderItemMyCourse : this.renderItem}
                                    ListFooterComponent={this.ListFooterComponent}
                                    keyExtractor={(item, index) => index + ''}
                                    style={{ paddingTop: 6, paddingBottom: 16, paddingHorizontal: 16 }}
                                    refreshing={isRefreshing}
                                    onRefresh={this.onRefresh}
                                    onEndReachedThreshold={0.1}
                                    onEndReached={this.onEndReached}
                                    scrollEnabled={scrollEnabled}
                                />

                                {
                                    this.state.showSearch ?
                                        <Animatable.View style={[StyleSheet.absoluteFill, { top: 50, backgroundColor: ColorApp.transparent }]} duration={500} animation="fadeIn" useNativeDriver>
                                            <View style={{ flex: 1, backgroundColor: "#fff" }} >
                                                <FlatList
                                                    data={searchWords}
                                                    ListHeaderComponent={this.ListHeaderComponentWord}
                                                    renderItem={this.renderItemWord}
                                                    keyExtractor={(item, index) => index + ''}
                                                    onEndReachedThreshold={0.1}
                                                    onEndReached={this.onEndReached}
                                                    contentContainerStyle={{ paddingBottom: 16 }}
                                                />
                                            </View>
                                        </Animatable.View>
                                        :
                                        null
                                }




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

                                        <View style={{ paddingBottom: 20, maxHeight: height < 896 ? height / 1.6 : height / 2, backgroundColor: "#fff", borderTopLeftRadius: 14, borderTopRightRadius: 14 }}>
                                            {this.ListHeaderComponentSort()}
                                            <FlatList
                                                data={sorts}
                                                // ListHeaderComponent={this.ListHeaderComponentSort}
                                                renderItem={this.renderItemSort}
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
                                                data={category}
                                                // ListHeaderComponent={this.ListHeaderComponentCategory}
                                                ListHeaderComponentStyle={{ marginBottom: 28 }}
                                                renderItem={this.renderItemCategory}
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
                            </View>
                    }
                </SafeAreaView>
            </NetConnection>
        );
    }
}


const styles = StyleSheet.create({
    active: {
        flex: 1,
        height: 34,
        backgroundColor: '#fff',
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: "center",
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
        elevation: 1
    },
    inActive: {
        flex: 1,
        height: 34,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: ColorApp.transparent,
        borderRadius: 6
    },
    lessonTextShadow: {
        textShadowColor: "rgba(0,0,0,0.16)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 1
    }
})
