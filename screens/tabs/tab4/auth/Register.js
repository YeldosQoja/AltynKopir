import AsyncStorage from '@react-native-async-storage/async-storage';
import Axios from 'axios';
import React, { Component } from 'react';
import { View, Text, TextInput, Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { TextInputMask } from 'react-native-masked-text';
import { ButtonApp } from '../../../../components/ButtonApp';
import InfoContainer from '../../../../components/InfoContainer';
import InputContainer from '../../../../components/InputContainer';
import { constants } from '../../../../constants/Constants';
import { strings } from '../../../../localization/Localization';
import { StateContext } from '../../../../provider/ProviderApp';
import { ColorApp } from '../../../../theme/color/ColorApp';
import { setFont } from '../../../../theme/font/FontApp';


export default class Register extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            phone: '',
            email: '',
            password: '',
            nameFocus: false,
            phoneFocus: false,
            emailFocus: false,
            passwordFocus: false,
            isLoadingBtn: false,
            disabled: false
        };
    }

    static contextType = StateContext;

    componentDidMount() {
        this.props.navigation.setOptions({
            title: strings["Создать аккаунт"],
            headerStyle: { backgroundColor: this.globalState.bottomBar ? this.globalState.bottomBar.color_app : ColorApp.main, }
        });
    }


    getRegister = () => {
        this.setState({ isLoadingBtn: true, disabled: true });
        Axios.get('auth/register', {
            params: {
                name: this.state.name,
                email: this.state.email,
                phone: this.state.phone,
                password: this.state.password
            }
        })
            .then(res => {
                console.log('getRegister res: ', res);
                AsyncStorage.setItem("token", res.data.data.api_token).catch();
                this.globalState.setToken(true);
                Axios.defaults.headers.Authorization = "Bearer " + res.data.data.api_token;
                this.props.navigation.replace("ProfileNavigator", { screen: "Profile" });
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

        const { phone, isLoadingBtn, disabled, nameFocus, phoneFocus, emailFocus, passwordFocus } = this.state;

        this.globalState = this.context;

        return (
            <View style={{ flex: 1, backgroundColor: ColorApp.bg }}>
                <KeyboardAwareScrollView
                    style={{ paddingVertical: 40, paddingHorizontal: 16 }}
                    showsVerticalScrollIndicator={false}
                >
                    <InfoContainer
                        source={{ uri: this.globalState.bottomBar ? this.globalState.bottomBar.logo : null }}
                        title={strings["Создать аккаунт"]}
                    />

                    <InputContainer style={{ marginTop: 24, marginBottom: 8 }} isFocus={nameFocus}>
                        <TextInput
                            placeholder={strings.ФИО}
                            placeholderTextColor={ColorApp.placeholder}
                            style={[setFont(17, 'normal', '#000', null, 'input'), { paddingVertical: 0 }]}
                            underlineColorAndroid={ColorApp.transparent}
                            onChangeText={name => this.setState({ name })}
                            onFocus={() => this.setState({ nameFocus: true })}
                            onBlur={() => this.setState({ nameFocus: false })}
                        />
                    </InputContainer>

                    <InputContainer style={{ marginBottom: 8, }} isFocus={phoneFocus}>
                        <TextInputMask
                            type='custom'
                            options={{ mask: '+9(999) 999-99-99' }}
                            placeholder='+7(777) 777-77-77'
                            placeholderTextColor={ColorApp.placeholder}
                            style={[setFont(17, 'normal', '#000', null, 'input'), { paddingVertical: 0 }]}
                            keyboardType='phone-pad'
                            underlineColorAndroid={ColorApp.transparent}
                            onChangeText={phone => this.setState({ phone })}
                            value={phone}
                            onFocus={() => this.setState({ phoneFocus: true })}
                            onBlur={() => this.setState({ phoneFocus: false })}
                        />
                    </InputContainer>

                    <InputContainer style={{ marginBottom: 8 }} isFocus={emailFocus}>
                        <TextInput
                            autoCapitalize='none'
                            placeholder='E-mail'
                            placeholderTextColor={ColorApp.placeholder}
                            style={[setFont(17, 'normal', '#000', null, 'input'), { paddingVertical: 0 }]}
                            keyboardType={Platform.OS == "ios" ? "email-address" : "default"}
                            underlineColorAndroid={ColorApp.transparent}
                            onChangeText={email => this.setState({ email })}
                            onFocus={() => this.setState({ emailFocus: true })}
                            onBlur={() => this.setState({ emailFocus: false })}
                        />
                    </InputContainer>

                    <InputContainer style={{ marginBottom: 24 }} isFocus={passwordFocus}>
                        <TextInput
                            autoCapitalize='none'
                            placeholder={strings["Придумайте пароль"]}
                            placeholderTextColor={ColorApp.placeholder}
                            style={[setFont(17, 'normal', '#000', null, 'input'), { paddingVertical: 0 }]}
                            underlineColorAndroid={ColorApp.transparent}
                            onChangeText={password => this.setState({ password })}
                            secureTextEntry
                            onFocus={() => this.setState({ passwordFocus: true })}
                            onBlur={() => this.setState({ passwordFocus: false })}
                        />
                    </InputContainer>

                    <ButtonApp
                        onPress={this.getRegister}
                        text={strings.Зарегистрироваться}
                        isLoading={isLoadingBtn}
                        disabled={disabled}
                    />


                </KeyboardAwareScrollView>
            </View >
        );
    }
}
