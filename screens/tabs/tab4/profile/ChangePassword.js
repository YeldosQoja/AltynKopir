import Axios from 'axios';
import React, { Component } from 'react';
import { Alert } from 'react-native';
import { View, Text, TextInput } from 'react-native';
import FastImage from 'react-native-fast-image';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ButtonApp } from '../../../../components/ButtonApp';
import InputContainer from '../../../../components/InputContainer';
import { constants } from '../../../../constants/Constants';
import { strings } from '../../../../localization/Localization';
import { StateContext } from '../../../../provider/ProviderApp';
import { ColorApp } from '../../../../theme/color/ColorApp';
import { setFont } from '../../../../theme/font/FontApp';

export default class ChangePassword extends Component {
    constructor(props) {
        super(props);
        this.state = {
            old_pwd: '',
            new_pwd: '',
            replay_pwd: '',
            disabled: false,
            isLoadingBtn: false,
            old_password_focus: false,
            new_pwd_focus: false,
            replay_pwd_focus: false
        };
    }

    static contextType = StateContext;

    componentDidMount() {
        this.props.navigation.setOptions({
            title: strings["Сменить пароль"],
            headerStyle: { backgroundColor: this.globalState.bottomBar ? this.globalState.bottomBar.color_app : ColorApp.main, }
        });
    }

    getUpdatePassword = () => {

        this.setState({ isLoadingBtn: true, disabled: true });

        if (this.state.new_pwd.length > 0 && this.state.replay_pwd.length > 0) {
            if (this.state.new_pwd !== this.state.replay_pwd) {
                Alert.alert(strings["Внимание!"], strings["Пароли не совпадают"]);
                this.setState({ isLoadingBtn: false, disabled: false });
                return;
            }
        } else {
            this.setState({ isLoadingBtn: false, disabled: false });
            return;
        }

        Axios.get('user/update_password', {
            params: {
                old_password: this.state.old_pwd,
                password: this.state.new_pwd
            }
        }).then(res => {
            console.log('getUpdatePassword: ', res);

            this.setState({ isLoadingBtn: false, disabled: false });

            Alert.alert(strings["Внимание!"], strings["Данные изменины"], [{ text: 'OK', onPress: () => this.props.navigation.goBack() }]);
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

        const { disabled, isLoadingBtn, old_password_focus, new_pwd_focus, replay_pwd_focus } = this.state;

        this.globalState = this.context;

        return (
            <KeyboardAwareScrollView
                style={{ backgroundColor: ColorApp.bg, paddingVertical: 40, paddingHorizontal: 16 }}
                showsVerticalScrollIndicator={false}
            >
                <FastImage
                    source={{ uri: this.globalState.bottomBar ? this.globalState.bottomBar.logo : null }}
                    style={{ width: 48, height: 48, alignSelf: 'center' }}
                />

                <InputContainer style={{ marginTop: 24, marginBottom: 8 }} isFocus={old_password_focus}>
                    <TextInput
                        autoCapitalize='none'
                        placeholder={strings["Введите старый пароль"]}
                        placeholderTextColor={ColorApp.placeholder}
                        style={[setFont(17, 'normal', '#000', null, 'input'), { paddingVertical: 0 }]}
                        underlineColorAndroid={ColorApp.transparent}
                        secureTextEntry
                        onChangeText={old_pwd => this.setState({ old_pwd })}
                        onFocus={() => this.setState({ old_password_focus: true })}
                        onBlur={() => this.setState({ old_password_focus: false })}
                    />
                </InputContainer>

                <InputContainer style={{ marginBottom: 8 }} isFocus={new_pwd_focus}>
                    <TextInput
                        autoCapitalize='none'
                        placeholder={strings["Придумайте новый пароль"]}
                        placeholderTextColor={ColorApp.placeholder}
                        style={[setFont(17, 'normal', '#000', null, 'input'), { paddingVertical: 0 }]}
                        underlineColorAndroid={ColorApp.transparent}
                        secureTextEntry
                        onChangeText={new_pwd => this.setState({ new_pwd })}
                        onFocus={() => this.setState({ new_pwd_focus: true })}
                        onBlur={() => this.setState({ new_pwd_focus: false })}
                    />
                </InputContainer>

                <InputContainer style={{ marginBottom: 8 }} isFocus={replay_pwd_focus}>
                    <TextInput
                        autoCapitalize='none'
                        placeholder={strings["Придумайте новый пароль"]}
                        placeholderTextColor={ColorApp.placeholder}
                        style={[setFont(17, 'normal', '#000', null, 'input'), { paddingVertical: 0 }]}
                        underlineColorAndroid={ColorApp.transparent}
                        secureTextEntry
                        onChangeText={replay_pwd => this.setState({ replay_pwd })}
                        onFocus={() => this.setState({ replay_pwd_focus: true })}
                        onBlur={() => this.setState({ replay_pwd_focus: false })}
                    />
                </InputContainer>

                <ButtonApp
                    onPress={this.getUpdatePassword}
                    text={strings["Сохранить новый пароль"]}
                    disabled={disabled}
                    isLoading={isLoadingBtn}
                />

            </KeyboardAwareScrollView>
        );
    }
}
