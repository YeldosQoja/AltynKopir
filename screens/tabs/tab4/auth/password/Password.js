import Axios from 'axios';
import React, { Component } from 'react';
import { Alert, Platform } from 'react-native';
import { View, Text, TextInput } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ButtonApp } from '../../../../../components/ButtonApp';
import InfoContainer from '../../../../../components/InfoContainer';
import InputContainer from '../../../../../components/InputContainer';
import { constants } from '../../../../../constants/Constants';
import { strings } from '../../../../../localization/Localization';
import { StateContext } from '../../../../../provider/ProviderApp';
import { ColorApp } from '../../../../../theme/color/ColorApp';
import { setFont } from '../../../../../theme/font/FontApp';

export default class Password extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoadingBtn: false,
            disabled: false,
            email: '',
            emailFocus: false
        };
    }

    static contextType = StateContext;

    componentDidMount() {
        this.props.navigation.setOptions({
            title: strings["Восстановить пароль"],
            headerStyle: { backgroundColor: this.globalState.bottomBar ? this.globalState.bottomBar.color_app : ColorApp.main, }
        });
    }


    getRecovery = () => {
        this.setState({ isLoadingBtn: true, disabled: true });
        Axios.get('auth/recovery', {
            params: {
                email: this.state.email
            }
        })
            .then(res => {
                console.log('getRecovery: ', res);

                this.setState({ isLoadingBtn: false, disabled: false });
                Alert.alert(strings["Внимание!"], res.data.message);

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

        const { isLoadingBtn, disabled, emailFocus } = this.state;

        this.globalState = this.context;

        return (
            <KeyboardAwareScrollView
                style={{ backgroundColor: ColorApp.bg, paddingVertical: 40, paddingHorizontal: 16 }}
                showsVerticalScrollIndicator={false}
            >
                <InfoContainer
                    source={{ uri: this.globalState.bottomBar ? this.globalState.bottomBar.logo : null }}
                    title={strings.titlePasword}
                    text={strings["Введите ваш E-mail чтобы восстановить ваш пароль"]}
                />

                <InputContainer style={{ marginVertical: 24, }} isFocus={emailFocus}>
                    <TextInput
                        autoCapitalize='none'
                        placeholder='E-mail'
                        placeholderTextColor={ColorApp.placeholder}
                        keyboardType={Platform.OS == "ios" ? "email-address" : "default"}
                        style={[setFont(17, 'normal', '#000', null, 'input'), { paddingVertical: 0 }]}
                        underlineColorAndroid={ColorApp.transparent}
                        onChangeText={email => this.setState({ email })}
                        onFocus={() => this.setState({ emailFocus: true })}
                        onBlur={() => this.setState({ emailFocus: false })}
                    />
                </InputContainer>

                <ButtonApp
                    onPress={this.getRecovery}
                    text={strings.Восстановить}
                    style={{ marginBottom: 10 }}
                    isLoading={isLoadingBtn}
                    disabled={disabled}
                />

                <ButtonApp
                    onPress={() => this.props.navigation.goBack()}
                    text={strings["Я вспомнил пароль"]}
                    textStyle={{ color: '#000', fontWeight: 'normal', }}
                    style={{ backgroundColor: ColorApp.transparent }}
                />
            </KeyboardAwareScrollView>
        );
    }
}
