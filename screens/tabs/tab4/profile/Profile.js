import Axios from 'axios';
import React, { Component, Fragment } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, Platform } from 'react-native';
import FastImage from 'react-native-fast-image';
import Loading from '../../../../components/Loading';
import RowButton from '../../../../components/RowButton';
import SectionRow from '../../../../components/SectionRow';
import { constants } from '../../../../constants/Constants';
import { strings } from '../../../../localization/Localization';
import { ColorApp } from '../../../../theme/color/ColorApp';
import { setFont } from '../../../../theme/font/FontApp';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StateContext } from '../../../../provider/ProviderApp';
import { navOptions } from '../../../../constants/NavOptions';
import NetConnection from '../../../../components/NetConnection';

export default class Profile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: [],
            isLoading: true,
            isRefreshing: false,
            isNet: true,
            nStatus: '0'
        };
        this.DATA = [
            {
                id: 1,
                title: strings["История оплаты"],
                iconLeft: require('../../../../assets/images/history_pay.png'),
                iconRight: require('../../../../assets/images/next.png'),
                navigation: "HistoryPayment",
                select: false
            },
            // {
            //     id: 2,
            //     title: strings["Реферальная программа"],
            //     iconLeft: require('../../../../assets/images/referal.png'),
            //     iconRight: require('../../../../assets/images/next.png'),
            //     navigation: "Referal",
            //     select: false
            // },
            {
                id: 3,
                title: strings["Сменить пароль"],
                iconLeft: require('../../../../assets/images/pass_change.png'),
                iconRight: require('../../../../assets/images/next.png'),
                navigation: "ChangePassword",
                select: false
            },
            {
                id: 4,
                title: strings.Настройки,
                iconLeft: require('../../../../assets/images/settings.png'),
                iconRight: require('../../../../assets/images/next.png'),
                navigation: "Settings",
                select: false
            },
            {
                id: 5,
                title: strings["Правила и соглашения"],
                iconLeft: require('../../../../assets/images/test.png'),
                iconRight: require('../../../../assets/images/next.png'),
                navigation: "Offer",
                select: false
            }
        ];
    }

    static contextType = StateContext;

    componentDidMount() {
        this.props.navigation.setOptions(navOptions.HEADER(this.globalState.bottomBar ? this.globalState.bottomBar.bottom_nav[this.globalState.bottomBar.bottom_nav.findIndex(i => i.id == 4)]?.title : strings.Профиль, this.globalState.bottomBar ? this.globalState.bottomBar.logo : null));
        // this.getProfile();
        // this.checkConnection();
        this.getStatus();
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
        if (this.props.route.params.reload) {
            this.reload();
            this.props.route.params.reload = false;
        }
    }

    checkConnection = () => {
        constants.NetCheck({ send: this.getProfile, error: () => this.setState({ isNet: false }) });
    }

    reload = () => {
        this.setState({ isLoading: true });
        // this.getProfile();
        this.checkConnection();
    }

    getProfile = () => {

        this.setState({ isNet: true });

        Axios.get('user/profile')
            .then(res => {
                console.log('getProfile: ', res);

                AsyncStorage.setItem("user", JSON.stringify(res.data.data)).catch();

                this.globalState.setUser(res.data.data);

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
                constants.onHandlerError(e.response.data, e.response.status);
            });
    }

    onRefresh = () => {
        this.setState({ isRefreshing: true });
        this.getProfile();
    }

    onNavigation = (item) => {

        for (let i = 0; i < this.DATA.length; i++) {
            if (item.id == this.DATA[i].id) {
                item.select = true;
            } else {
                this.DATA[i].select = false;
            }
        }

        this.setState({});

        this.props.navigation.navigate(item.navigation);
    }

    Menu = () => (
        this.DATA.map((item, index) => {
            if (this.state.nStatus == '2' && item.id == 1) {
                return null;
            } else {
                return (
                    <RowButton
                        key={index + ""}
                        onPress={() => this.onNavigation(item)}
                        iconLeft={item.iconLeft}
                        leftTintColor={item.select ? ColorApp.action : ColorApp.fade}
                        text={item.title}
                        textStyle={item.select ? { color: ColorApp.action } : null}
                        iconRight={item.iconRight}
                    />
                )
            }
        })
    );

    render() {
        const { isNet, dataSource, isLoading, isRefreshing } = this.state;
        this.globalState = this.context;
        return (
            <NetConnection isNet={isNet} onPress={this.checkConnection}>
                <View style={{ flex: 1 }}>
                    {
                        isLoading ?
                            <Loading />
                            :
                            <ScrollView
                                style={{ backgroundColor: ColorApp.bg }}
                                showsVerticalScrollIndicator={false}
                                refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={this.onRefresh} />}
                            >

                                <TouchableOpacity
                                    onPress={() => this.props.navigation.navigate('EditProfile', { userData: dataSource })}
                                    activeOpacity={0.8}
                                    style={{ backgroundColor: '#fff', padding: 16 }}>

                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <FastImage
                                            source={{ uri: dataSource.avatar, priority: FastImage.priority.high }}
                                            style={{ width: 56, height: 56, borderRadius: 28 }}
                                        />
                                        <View style={{ flex: 1, marginHorizontal: 12 }}>
                                            <Text style={[setFont(17, '600'), { marginBottom: 4 }]}>{dataSource.name}</Text>
                                            <Text style={[setFont(13), { color: ColorApp.fade, marginBottom: 4 }]}>{dataSource.email}</Text>
                                            <Text style={[setFont(13), { color: ColorApp.fade, marginBottom: 4 }]}>{dataSource.phone}</Text>
                                            <Text style={[setFont(15), { color: ColorApp.action, marginTop: 4 }]}>{strings["Редактировать профиль"]}</Text>
                                        </View>

                                        <FastImage
                                            source={require('../../../../assets/images/next_black.png')}
                                            style={{ width: 24, height: 24 }}
                                            resizeMode={FastImage.resizeMode.contain}
                                        />
                                    </View>

                                </TouchableOpacity>

                                <SectionRow text={strings["Мои профиль"]} />

                                {this.Menu()}

                                {
                                    this.globalState.bottomBar?.show_dev_info ?
                                        <Fragment>
                                            <SectionRow text={strings["Информация о разработчике"]} />

                                            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
                                                <View style={{ flex: 1, marginRight: 16 }}>
                                                    <Text style={[setFont(15), { marginBottom: 2 }]}>{this.globalState.bottomBar.dev_app_name}</Text>
                                                    <Text style={setFont(13, 'normal', ColorApp.fade)}>{this.globalState.bottomBar.dev_app_description}</Text>
                                                </View>
                                                <FastImage
                                                    source={{ uri: this.globalState.bottomBar.dev_logo, priority: FastImage.priority.high }}
                                                    style={{ width: 48, height: 48 }}
                                                />
                                                <View style={{ position: 'absolute', bottom: 0, left: 16, right: 0, height: 1, backgroundColor: ColorApp.border }} />
                                            </View>

                                            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
                                                <View style={{ flex: 1, marginRight: 16 }}>
                                                    <Text style={[setFont(15), { marginBottom: 2 }]}>1.02</Text>
                                                    <Text style={setFont(13, 'normal', ColorApp.fade)}>{strings["Версия приложения"]}</Text>
                                                </View>
                                                <View style={{ position: 'absolute', bottom: 0, left: 16, right: 0, height: 1, backgroundColor: ColorApp.border }} />
                                            </View>
                                        </Fragment>
                                        :
                                        null
                                }

                            </ScrollView>
                    }
                </View>
            </NetConnection>

        );
    }
}
