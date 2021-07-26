import React, { Component } from 'react';
import { View, Text, ScrollView } from 'react-native';
import InfoContainer from '../../../../../components/InfoContainer';
import { strings } from '../../../../../localization/Localization';
import { StateContext } from '../../../../../provider/ProviderApp';
import { ColorApp } from '../../../../../theme/color/ColorApp';

export default class PasswordSend extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    static contextType = StateContext;

    componentDidMount() {
        this.props.navigation.setOptions({
            title: strings["Восстановить пароль"],
            headerStyle: { backgroundColor: this.globalState.bottomBar ? this.globalState.bottomBar.color_app : ColorApp.main, }
        });
    }

    render() {

        this.globalState = this.context;

        return (
            <ScrollView style={{ backgroundColor: ColorApp.bg, paddingVertical: 40, paddingHorizontal: 16 }} showsVerticalScrollIndicator={false}>
                <InfoContainer
                    source={require('../../../../../assets/logo/logo.png')}
                    title={strings.titlePassword}
                    text='Мы отправили на почту test@buginsoft.kz ссылку на воостановление. Перейдите по ссылке чтобы установить новый пароль'
                />
            </ScrollView>
        );
    }
}
