import React, { Component } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { contextType } from 'react-native-render-html';
import { ButtonApp } from '../../../../../components/ButtonApp';
import InfoContainer from '../../../../../components/InfoContainer';
import { StateContext } from '../../../../../provider/ProviderApp';
import { ColorApp } from '../../../../../theme/color/ColorApp';

export default class SuccessPassword extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    static contextType = StateContext;

    componentDidMount() {
        this.props.navigation.setOptions({
            headerStyle: { backgroundColor: this.globalState.bottomBar ? this.globalState.bottomBar.color_app : ColorApp.main, }
        });
    }

    render() {

        this.globalState = this.context;

        return (
            <ScrollView style={{ backgroundColor: ColorApp.bg, paddingVertical: 40, paddingHorizontal: 16 }} showsVerticalScrollIndicator={false}>

                <InfoContainer
                    source={require('../../../../../assets/logo/logo.png')}
                    title='Отлино!'
                    text='Вы установили новый пароль. Войдите в свой аккаунт использую новый пароль'
                    style={{ marginBottom: 24 }}
                />

                <ButtonApp
                    text='Войти'
                />

            </ScrollView>
        );
    }
}
