import React, { Component } from 'react';
import { View, Text, TextInput } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ButtonApp } from '../../../../../components/ButtonApp';
import InfoContainer from '../../../../../components/InfoContainer';
import InputContainer from '../../../../../components/InputContainer';
import { StateContext } from '../../../../../provider/ProviderApp';
import { ColorApp } from '../../../../../theme/color/ColorApp';
import { setFont } from '../../../../../theme/font/FontApp';

export default class NewPassword extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    static contextType = StateContext;

    componentDidMount() {
        this.props.setOptions({
            headerStyle: { backgroundColor: this.globalState.bottomBar ? this.globalState.bottomBar.color_app : ColorApp.main, }
        });
    }

    render() {

        this.globalState = this.context;

        return (
            <KeyboardAwareScrollView style={{ backgroundColor: ColorApp.bg, paddingVertical: 40, paddingHorizontal: 16 }} showsVerticalScrollIndicator={false}>

                <InfoContainer
                    source={require('../../../../../assets/logo/logo.png')}
                    title='Новый пароль'
                    text='Придумайте новый пароль'
                />

                <InputContainer style={{ marginVertical: 24, }}>
                    <TextInput
                        autoCapitalize='none'
                        placeholder='Новый пароль'
                        placeholderTextColor={ColorApp.placeholder}
                        secureTextEntry
                        style={[setFont(17, 'normal', '#000', null, 'input'), { paddingVertical: 0 }]}
                        underlineColorAndroid={ColorApp.transparent}
                    />
                </InputContainer>

                <ButtonApp
                    onPress={() => this.props.navigation.replace('SuccessPassword')}
                    text='Сохранить'
                />

            </KeyboardAwareScrollView>
        );
    }
}
