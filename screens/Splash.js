import AsyncStorage from '@react-native-async-storage/async-storage';
import Axios from 'axios';
import React, { Component, Fragment } from 'react';
import { View, Text, ScrollView, StatusBar, Dimensions, TouchableOpacity, Linking } from 'react-native';
import FastImage from 'react-native-fast-image';
import { ButtonApp } from '../components/ButtonApp';
import Loading from '../components/Loading';
import { constants } from '../constants/Constants';
import { strings } from '../localization/Localization';
import { StateContext } from '../provider/ProviderApp';
import { ColorApp } from '../theme/color/ColorApp';
import * as Animatable from 'react-native-animatable';
import HTMLRENDER from 'react-native-render-html';

import { setFont } from '../theme/font/FontApp';
import { fcmService } from '../notification/FCMService';
import { localNotificationService } from '../notification/LocalNotificationService';

const { width } = Dimensions.get("screen");

export default class Splash extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: {},
            isLoading: true,
            isNotification: false
        };
    }

    static contextType = StateContext;

    componentDidMount() {

        AsyncStorage.getItem('token').then(res => {
            console.log('TOKEN', res);
            this.getSettings();
            if (res) {
                Axios.defaults.headers.Authorization = 'Bearer ' + res;
                this.globalState.setToken(true);
                AsyncStorage.getItem("user").then(user => {
                    if (user) {
                        this.globalState.setUser(JSON.parse(user));
                    }
                }).catch();
            }
        }).catch(() => this.getSettings());

        AsyncStorage.getItem("startApp")
            .then(res => {
                console.log("startApp", res);
                if (res) {
                    this.globalState.setFirstStartApp(false);
                    AsyncStorage.getItem("lang").then(resLang => {
                        console.log("lang", resLang);
                        if (resLang) {
                            let resLangJson = JSON.parse(resLang);
                            Axios.defaults.headers.lang = resLangJson.code;
                            AsyncStorage.getItem("LP").then(resLP => {
                                console.log("resLP", resLP);
                                if (resLP) {
                                    let resLPJson = JSON.parse(resLP);
                                    strings.setContent({ [resLangJson.code]: resLPJson });
                                }

                            }).catch();
                        }
                    }).catch();
                }
            }).catch();

        // fcmService.register(this.onRegister, this.onNotification, this.onOpenNotificaion);
        // localNotificationService.configure(this.onOpenNotificaion);
    }

    // onRegister = (token) => {
    //     console.log('App onRegister: ', token);
    // }

    // onNotification = (notify) => {
    //     console.log('App onNotification:', notify);
    //     const options = {
    //         soundName: 'default',
    //         playSound: true
    //     }
    //     localNotificationService.showNotification(
    //         0,
    //         notify.title,
    //         notify.body,
    //         notify,
    //         options
    //     );
    // }

    // onOpenNotificaion = (notify) => {
    //     console.log('App onOpenNotificaion');

    //     // this.props.navigation.navigate("TabNavigator", { screen: "Tab3Navigator", params: { screen: "Tab3" } });

    //     this.setState({
    //         isNotification: true
    //     }, () => this.getSettings())
    //     console.log("BOTTOM");
    // }


    getSettings = () => {
        console.log('getSettings');
        Axios.get("settings")
            .then(res => {
                console.log("getSettings", res);

                // delete res.data.data.bottom_nav[1];

                // res.data.data.bottom_nav[4] = {
                //     id: 5,
                //     navigation: "Tab5Navigator",
                //     title: "Конференция",
                //     requiredToken: false
                // }

                this.globalState.setBottomBar(res.data.data);
                ColorApp.main = res.data.data.color_app;

                this.setState({ dataSource: res.data.data, isLoading: false });
            })
            .catch(e => {
                console.log("catch getSettings", e);
                this.globalState.setBottomBar(null);
                setTimeout(() => this.props.navigation.replace('TabNavigator'), 2000);
            }).finally(() => {
                console.log("OK");
                if (!this.state.isLoading && this.state.isNotification) {
                    // this.props.navigation.navigate("TabNavigator", { screen: "Tab3Navigator", params: { screen: "Tab3" } });
                } else if (!this.globalState.firstStartApp) {
                    setTimeout(() => this.props.navigation.replace('TabNavigator'), 2000);
                }
            })

    }

    onNavigation = () => {
        AsyncStorage.setItem("startApp", JSON.stringify(false)).catch();
        this.props.navigation.replace('TabNavigator');
    }

    render() {

        const { dataSource, isLoading } = this.state;

        this.globalState = this.context;

        return (
            <View style={{ flex: 1, backgroundColor: '#fff' }}>
                <StatusBar barStyle="dark-content" backgroundColor={ColorApp.transparent} translucent />
                {
                    isLoading ?
                        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                            <Loading />
                        </View>
                        :
                        <ScrollView contentContainerStyle={{ flex: 1, padding: 16 }} showsVerticalScrollIndicator={false}>
                            <View style={{ flex: 8, alignItems: 'center', justifyContent: 'center' }}>
                                <Animatable.View animation="bounceIn" useNativeDriver>
                                    <FastImage
                                        source={{ uri: dataSource.logo, priority: FastImage.priority.high }}
                                        style={{ width: 80, height: 80 }}
                                    />
                                </Animatable.View>
                                <Animatable.View animation="fadeIn" useNativeDriver >
                                    <Text style={[{ textAlign: 'center', marginTop: 16, }, setFont(22, 'bold', '#000', 28)]}>{dataSource.app_description}</Text>
                                    {/* <Text style={[{ textAlign: 'center' }, setFont(22, 'bold', '#000', 28)]}>{dataSource.app_name}</Text> */}
                                </Animatable.View>
                            </View>

                            {
                                this.globalState.firstStartApp ?
                                    <Fragment>
                                        <View style={{ flex: 2, alignItems: 'center', justifyContent: 'center' }}>
                                            <Animatable.View animation="fadeIn" useNativeDriver style={{ alignSelf: "stretch" }}>
                                                <ButtonApp
                                                    onPress={this.onNavigation}
                                                    text={strings['Продолжить на русском']}
                                                    style={{ marginBottom: 8 }}
                                                />
                                            </Animatable.View>
                                            <Animatable.View animation="fadeIn" useNativeDriver style={{ alignSelf: "stretch" }}>

                                                <ButtonApp
                                                    onPress={() => this.props.navigation.navigate("Languages")}
                                                    text={strings['Поменять язык']}
                                                    textStyle={{ color: ColorApp.main, fontWeight: '600', }}
                                                    style={{ backgroundColor: ColorApp.transparent }}
                                                />
                                            </Animatable.View>

                                        </View>

                                        <View style={{ flex: 1 }}>
                                            <Animatable.View animation="fadeIn" useNativeDriver style={{ alignSelf: "stretch" }}>
                                                {/* <Text style={[setFont(13, '400', '#ACB4BE', 18), { textAlign: 'center' }]}>
                                                    {strings['Продолжая вы соглашаетесь с']}
                                                    <Text style={{ color: '#007AFF' }}> {strings['Пользовательским соглашением']}</Text>
                                                </Text> */}
                                                <TouchableOpacity
                                                    activeOpacity={1}
                                                    onPress={() => this.props.navigation.navigate("Offer")}
                                                >
                                                    <HTMLRENDER
                                                        html={`<p>${constants.wordLocalization(strings['Продолжая вы соглашаетесь с :word'], { word: `<span style='color:#007AFF'>${strings['Пользовательским соглашением']}</span>` })}</p>`}
                                                        baseFontStyle={{ fontSize: 13, textAlign: "center" }}
                                                        imagesMaxWidth={width - 32}
                                                        tagsStyles={{ img: { marginVertical: 5 }, p: { textAlign: "center" }, iframe: { height: 200, borderRadius: 10, backgroundColor: ColorApp.transparent } }}
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
                                                    />
                                                </TouchableOpacity>
                                            </Animatable.View>

                                        </View>
                                    </Fragment>
                                    :
                                    null
                            }

                        </ScrollView>

                }
            </View >
        );
    }
}
