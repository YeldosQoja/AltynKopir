import React, { Component, Fragment } from 'react';
import { View, Text, FlatList, TouchableOpacity, Switch, Modal, ActivityIndicator, BackHandler, Platform } from 'react-native';
import FastImage from 'react-native-fast-image';
import SectionRow from '../../../../components/SectionRow';
import { ColorApp } from '../../../../theme/color/ColorApp';
import { setFont } from '../../../../theme/font/FontApp';
import Icon from 'react-native-vector-icons/Entypo'
import { strings } from '../../../../localization/Localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Axios from 'axios';
import { StateContext } from '../../../../provider/ProviderApp';
import RNRestart from 'react-native-restart';
import { constants } from '../../../../constants/Constants';
import Loading from '../../../../components/Loading';

const DATA = [
    {
        id: 1,
        code: 'ru',
        name: 'Русский',
        select: true

    },
    {
        id: 2,
        code: 'kz',
        name: 'Қазақша',
        select: false
    },
    {
        id: 3,
        code: 'en',
        name: 'English',
        select: false
    },
];

export default class Settings extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: [],
            isLoading: true,
            isPush: false,
            isCourse: false,
            visible: false
        };
    }

    static contextType = StateContext;

    componentDidMount() {
        this.props.navigation.setOptions({
            title: strings.Настройки,
            headerStyle: { backgroundColor: this.globaleState.bottomBar ? this.globaleState.bottomBar.color_app : ColorApp.main, }
        });

        if (Platform.OS == 'android') {
            BackHandler.addEventListener("hardwareBackPress", this.backAction);
        }

        AsyncStorage.getItem("lang")
            .then(res => {
                console.log("lang", res);
                if (res) {
                    let resJson = JSON.parse(res);
                    this.getLang(resJson.id);
                } else {
                    this.getLang();
                }
            })
            .catch(() => {
                this.getLang();
            });
    }

    componentWillUnmount() {
        if (Platform.OS == 'android') {
            BackHandler.removeEventListener("hardwareBackPress", this.backAction);
        }
    }

    backAction = () => {
        if (this.state.visible) {
            return true;
        }
    }


    getLang = (id = null, selected = false) => {
        const url = selected ? `languages/${id}` : "languages";
        Axios.get(url)
            .then(res => {
                console.log("getLang", res);

                if (!selected) {
                    res.data.data.forEach(item => {
                        if (id) {
                            if (item.id == id) {
                                item.select = true;
                            } else {
                                item.select = false;
                            }
                        } else {
                            if (item.id == 1) {
                                item.select = true;
                            } else {
                                item.select = false;
                            }
                        }

                    });

                    AsyncStorage.getItem('isPush').then(res => {
                        if (res) {
                            console.log('isPush', res);
                            this.setState({ isPush: JSON.parse(res) });
                        }
                    }).catch();

                    AsyncStorage.getItem('isCourse').then(res => {
                        if (res) {
                            this.setState({ isCourse: JSON.parse(res) });
                        }
                    }).catch();

                    this.setState({
                        dataSource: res.data.data,
                        isLoading: false
                    });
                }

                if (selected) {
                    AsyncStorage.setItem("LP", JSON.stringify(res.data.data.locale))
                        .then(() => {
                            this.setState({ visible: false });
                            RNRestart.Restart();
                        })
                        .catch(() => {
                            this.setState({ visible: false });
                        });
                }



            })
            .catch(e => {
                console.log(e);
                console.log(e.response);
                this.setState({ visible: false });
                constants.onHandlerError(e.response.data, e.response.status);
            });
    }


    selectLang = (item) => {
        console.log(item);
        let copyData = [];

        for (let i = 0; i < this.state.dataSource.length; i++) {
            copyData.push(Object.assign({}, this.state.dataSource[i]));
        }

        for (let i = 0; i < copyData.length; i++) {
            if (item.id == copyData[i].id) {
                copyData[i].select = true;
            } else {
                copyData[i].select = false;
            }
        }

        this.setState({ dataSource: copyData });
        AsyncStorage.setItem("lang", JSON.stringify(item))
            .then(() => {
                this.setState({ visible: true });
                this.getLang(item.id, true);
            })
            .catch();

    }

    onExit = () => {
        this.globaleState.setToken(false);
        this.globaleState.setExit(true);
        this.globaleState.setUser(null);
        AsyncStorage.removeItem('token').catch();
        AsyncStorage.removeItem('user').catch();
        delete Axios.defaults.headers.Authorization;
        this.props.navigation.replace("AuthNavigator", { screen: "Login" });
    }

    pushAction = (isPush) => {
        AsyncStorage.setItem("isPush", isPush + '');
        this.setState({ isPush });
    }

    courseAction = (isCourse) => {
        AsyncStorage.setItem("isCourse", isCourse + '');
        this.setState({ isCourse });
    }

    ListHeaderComponent = () => (
        <SectionRow text={strings["Выберите язык"]} />
    );

    renderItem = ({ item, index }) => (
        <TouchableOpacity
            onPress={() => this.selectLang(item)}
            activeOpacity={0.8}
            style={{ flexDirection: 'row', alignItems: 'center', padding: 16, paddingVertical: 12 }}
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
            <View style={{ position: 'absolute', bottom: 0, left: 16, right: 0, height: 1, backgroundColor: ColorApp.border }} />
        </TouchableOpacity>
    );

    ListFooterComponent = () => (
        <Fragment>
            <SectionRow text={strings.Уведомление} />
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 }}>
                <Text style={[setFont(17), { flex: 1, marginRight: 12 }]}>{strings["Уведомления о действиях"]}</Text>
                <Switch
                    thumbColor={ColorApp.main}
                    trackColor={{ false: '#f5f5f5', true: 'rgba(69,142,34,0.1)' }}
                    ios_backgroundColor='#f5f5f5'
                    onValueChange={(isPush) => this.pushAction(isPush)}
                    value={this.state.isPush}
                />
                <View style={{ position: 'absolute', bottom: 0, left: 16, right: 0, height: 1, backgroundColor: ColorApp.border }} />
            </View>
            <Text style={[setFont(13), { color: ColorApp.fade, marginTop: 4, marginBottom: 16, marginHorizontal: 16 }]}>{strings["Вы будете получать уведомление о покупках и прохождениях тестах"]}</Text>


            <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 }}>
                <Text style={[setFont(17), { flex: 1, marginRight: 12 }]}>{strings["Напоминание о прохождении курса"]}</Text>
                <Switch
                    thumbColor={ColorApp.main}
                    trackColor={{ false: '#f5f5f5', true: 'rgba(69,142,34,0.1)' }}
                    ios_backgroundColor='#f5f5f5'
                    onValueChange={(isCourse) => this.courseAction(isCourse)}
                    value={this.state.isCourse}
                />
                <View style={{ position: 'absolute', bottom: 0, left: 16, right: 0, height: 1, backgroundColor: ColorApp.border }} />
            </View>
            <Text style={[setFont(13), { color: ColorApp.fade, marginTop: 4, marginBottom: 24, marginHorizontal: 16 }]}>{strings["Еженедельные напоминание о прохождения курса"]}</Text>

            <TouchableOpacity
                onPress={this.onExit}
                activeOpacity={0.8}
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 }}
            >
                <FastImage
                    source={require('../../../../assets/images/exit.png')}
                    style={{ width: 24, height: 24 }}
                />
                <Text style={[setFont(17,), { color: '#FF3B30', marginHorizontal: 18 }]}>{strings["Выход из аккаунта"]}</Text>
            </TouchableOpacity>

        </Fragment>
    );

    render() {

        const { dataSource, isLoading, visible } = this.state;

        this.globaleState = this.context;

        return (
            <View style={{ flex: 1, backgroundColor: ColorApp.bg }}>
                {
                    isLoading ?
                        <Loading />
                        :
                        <FlatList
                            data={dataSource}
                            ListHeaderComponent={this.ListHeaderComponent}
                            renderItem={this.renderItem}
                            ListFooterComponent={this.ListFooterComponent}
                            keyExtractor={(item, index) => index + ''}
                            showsVerticalScrollIndicator={false}
                        />
                }
                <Modal
                    visible={visible}
                    animationType="fade"
                    transparent
                >
                    <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" }}>
                        <ActivityIndicator color={'#fff'} />
                    </View>
                </Modal>
            </ View>
        );
    }
}
