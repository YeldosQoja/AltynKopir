import Axios from 'axios';
import React, { Component } from 'react';
import { View, Text, TextInput, ScrollView, Platform, Keyboard } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ButtonApp } from '../../../../components/ButtonApp';
import InputContainer from '../../../../components/InputContainer';
import { constants } from '../../../../constants/Constants';
import { strings } from '../../../../localization/Localization';
import { ColorApp } from '../../../../theme/color/ColorApp';
import { setFont } from '../../../../theme/font/FontApp';
import { StateContext } from '../../../../provider/ProviderApp';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navOptions } from '../../../../constants/NavOptions';

export default class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
            emailFocus: false,
            passwordFocus: false,
            isLoadingBtn: false,
            disabled: false,
            showButton: true
        };
    }

    static contextType = StateContext;

    componentDidMount() {
        this.props.navigation.setOptions(navOptions.HEADER(strings["Войти в аккаунт"], this.globalState.bottomBar ? this.globalState.bottomBar.logo : null));
        this.kbShow = Keyboard.addListener("keyboardDidHide", this.showBottomButton);
        this.kbHide = Keyboard.addListener("keyboardDidShow", this.hideBottomButton);
    }

    componentWillUnmount() {
        this.kbShow.remove();
        this.kbHide.remove();
    }

    hideBottomButton = () => {
        this.setState({ showButton: false });
    }

    showBottomButton = () => {
        this.setState({ showButton: true });
    }

    getLogin = () => {
        this.setState({ isLoadingBtn: true, disabled: true });
        Axios.get("auth/login", {
            params: {
                email: this.state.email,
                password: this.state.password
            }
        })
            .then(res => {
                console.log('getLogin: ', res);

                Axios.defaults.headers.Authorization = "Bearer " + res.data.data.token;

                this.globalState.setToken(true);
                this.globalState.setIsReload(true);

                AsyncStorage.setItem("token", res.data.data.token).catch();

                this.props.navigation.replace("ProfileNavigator", { screen: "Profile" });

                this.setState({ isLoadingBtn: false, disabled: false });
            })
            .catch(e => {
                console.log(e);
                console.log(e.response);
                this.setState({ isLoadingBtn: false, disabled: false });
                constants.noInternet(e);
                constants.onHandlerError(e.response.data, e.response.status);
            });
    }

    render() {

        this.globalState = this.context;

        const { isLoadingBtn, disabled, emailFocus, passwordFocus, showButton } = this.state;

        return (
            <View style={{ flex: 1, backgroundColor: ColorApp.bg }}>
                <KeyboardAwareScrollView
                    style={{ paddingVertical: 40, paddingHorizontal: 16 }}
                    contentContainerStyle={{ flex: 1 }}
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={[setFont(20, 'bold'), { textAlign: 'center', marginBottom: 24 }]}>{strings["Войдите или создайте аккаунт чтобы смотреть онлайн курсы"]}</Text>
                    <InputContainer style={{ marginBottom: 8 }} isFocus={emailFocus}>
                        <TextInput
                            autoCapitalize='none'
                            placeholder='E-mail'
                            placeholderTextColor={ColorApp.placeholder}
                            keyboardType={Platform.OS == 'ios' ? "email-address" : "default"}
                            style={[{ paddingVertical: 0 }, setFont(17, 'normal', '#000', null, 'input')]}
                            underlineColorAndroid={ColorApp.transparent}
                            onChangeText={email => this.setState({ email })}
                            onFocus={() => this.setState({ emailFocus: true, showButton: false })}
                            onBlur={() => this.setState({ emailFocus: false })}
                        />
                    </InputContainer>

                    <InputContainer style={{ marginBottom: 24 }} isFocus={passwordFocus}>
                        <TextInput
                            autoCapitalize='none'
                            placeholder={strings.Пароль}
                            placeholderTextColor={ColorApp.placeholder}
                            secureTextEntry
                            style={[{ paddingVertical: 0 }, setFont(17, 'normal', '#000', null, 'input')]}
                            underlineColorAndroid={ColorApp.transparent}
                            onChangeText={password => this.setState({ password })}
                            onFocus={() => this.setState({ passwordFocus: true, showButton: false })}
                            onBlur={() => this.setState({ passwordFocus: false })}
                        />
                    </InputContainer>

                    <ButtonApp
                        onPress={this.getLogin}
                        text={strings.Войти}
                        isLoading={isLoadingBtn}
                        disabled={disabled}
                    />

                    <ButtonApp
                        text={strings["Я забыл пароль"]}
                        textStyle={{ color: '#000', fontWeight: 'normal', }}
                        style={{ backgroundColor: ColorApp.transparent, marginTop: 10 }}
                        onPress={() => this.props.navigation.navigate('Password')}
                    />


                    {
                        showButton ?
                            <ButtonApp
                                text={strings["У меня нет аккаунта"]}
                                textStyle={{ color: '#007AFF', fontWeight: 'normal', }}
                                style={{ backgroundColor: ColorApp.transparent, position: "absolute", bottom: 0, left: 0, right: 0 }}
                                onPress={() => this.props.navigation.navigate('Register')}
                            />
                            :
                            null
                    }


                </KeyboardAwareScrollView>
            </View>
        );
    }
}
