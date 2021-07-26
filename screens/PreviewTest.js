import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { ButtonApp } from '../components/ButtonApp';
import { constants } from '../constants/Constants';
import { strings } from '../localization/Localization';
import { StateContext } from '../provider/ProviderApp';
import { ColorApp } from '../theme/color/ColorApp';
import { setFont } from '../theme/font/FontApp';


const Label = ({ text, data }) => (
    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
        <View style={{ width: 6, height: 6, borderRadius: 6, marginRight: 8, backgroundColor: ColorApp.fade }} />
        <Text style={[setFont(13), { flex: 1 }]}>{constants.wordLocalization(text, data)}</Text>
    </View>
);

export default class PreviewTest extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };

        this.lesson = props.route.params.lesson;
        this.title = props.route.params.title;
        console.log("this.lesson: ", this.lesson);
        console.log("this.title: ", this.title);
    }

    static contextType = StateContext;


    componentDidMount() {
        this.props.navigation.setOptions({ title: this.title, headerStyle: { backgroundColor: this.globalState.bottomBar ? this.globalState.bottomBar.color_app : ColorApp.main, } });
    }

    render() {
        this.globalState = this.context;
        return (
            <View style={{ flex: 1, padding: 16, backgroundColor: ColorApp.bg }}>
                <Text style={[setFont(20, "bold"), { marginBottom: 4 }]}>{strings['Онлайн тест']}</Text>
                <Text style={[setFont(15), { marginBottom: 16 }]}>{strings['Пройдите онлайн тест, чтобы закрепить материалы курса и получить сертификат.']}</Text>
                <Label text={strings['Прохождения теста занимает :num минут.']} data={{ num: this.lesson.timer }} />
                <Label text={strings['Тест состоит из :num вопросов']} data={{ num: this.lesson.chapter.tests_count }} />
                <Label text={strings['Чтобы пройти тест вам нужно ответить правильно на 50% и более вопросов.']} />

                <ButtonApp
                    onPress={() => this.props.navigation.navigate("Test", { lesson: this.lesson, title: this.title })}
                    style={{ backgroundColor: '#fff', borderWidth: 2, borderColor: ColorApp.border, marginTop: 16 }}
                    text={strings["Начать тестирование"]}
                    textStyle={{ color: ColorApp.action }}
                />
            </View>
        );
    }
}
