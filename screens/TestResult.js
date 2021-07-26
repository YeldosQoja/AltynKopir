import Axios from 'axios';
import React, { Component } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { ButtonApp } from '../components/ButtonApp';
import Loading from '../components/Loading';
import NetConnection from '../components/NetConnection';
import RowContainer from '../components/RowContainer';
import { constants } from '../constants/Constants';
import { strings } from '../localization/Localization';
import { StateContext } from '../provider/ProviderApp';
import { ColorApp } from '../theme/color/ColorApp';
import { setFont } from '../theme/font/FontApp';

export default class TestResult extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: {},
            isLoading: true,
            isNet: true
        };
        this.lessonId = props.route.params.lessonId;
        this.title = props.route.params.title;
    }

    static contextType = StateContext;

    componentDidMount() {
        this.props.navigation.setOptions({ title: this.title, headerStyle: { backgroundColor: this.globalState.bottomBar ? this.globalState.bottomBar.color_app : ColorApp.main, } });
        // this.getTestResult();
        this.checkConnection();
    }

    checkConnection = () => {
        constants.NetCheck({ send: this.getTestResult, error: () => this.setState({ isNet: false }) });
    }

    getTestResult = () => {

        this.setState({ isNet: true });

        Axios.get(`test/${this.lessonId.id}/result`)
            .then(res => {
                console.log('getTestResult: ', res);

                this.setState({
                    dataSource: res.data.data,
                    shareDisabled: false,
                    isLoading: false
                });
            })
            .catch(e => {
                console.log(e);
                console.log(e.response);
                constants.onHandlerError(e.response.data, e.response.status);
            });
    }

    render() {

        const { isNet, dataSource, isLoading } = this.state;

        this.globalState = this.context;

        return (
            <NetConnection isNet={isNet} onPress={this.checkConnection}>
                <View style={{ flex: 1, backgroundColor: ColorApp.bg }}>
                    {
                        isLoading ?
                            <Loading />
                            :
                            <View style={{ flex: 1 }}>
                                <ScrollView

                                    contentContainerStyle={{ backgroundColor: ColorApp.main, flex: 1, justifyContent: "center", alignItems: "center", padding: 16 }}
                                    showsVerticalScrollIndicator={false}
                                >
                                    <Text style={[setFont(17, "600", "#fff"), { textAlign: "center" }]}>{parseFloat(dataSource.percent) > 50 ? strings["Поздравляем, вы прошли тест успешно"] : strings["К сожалению, вы не прошли тест"]}</Text>
                                    <Text style={[setFont(40, "bold", "#fff"), { marginTop: 8, marginBottom: 16, textAlign: "center" }]}>{dataSource.score} / {dataSource.tests_count}</Text>
                                    <Text style={[setFont(15, "normal", "#fff"), { marginBottom: 40, textAlign: "center" }]}>{parseFloat(dataSource.percent) > 50 ? strings["У вас больше 50% правильных ответов"] : strings["У вас меньше 50% правильных ответов. Вам нужно зановой пройти тест."]}</Text>


                                    {
                                        dataSource.entity.result_type != "default" ?
                                            <ButtonApp
                                                onPress={() => this.props.navigation.navigate("TestAnswer", { answer: dataSource })}
                                                text={strings["Посмотреть результаты"]}
                                                style={{ borderWidth: 2, borderColor: "#fff", }}
                                            />
                                            :
                                            null
                                    }

                                    <ButtonApp
                                        onPress={() => this.props.navigation.navigate("Tab1" || "Tab2")}
                                        text={strings['На главную']}
                                        style={{ borderWidth: 2, borderColor: "#fff", marginTop: 10, }}
                                    />
                                </ScrollView>


                                {/* <RowContainer
                                style={{ justifyContent: "flex-end", backgroundColor: "#fff" }}
                                showRight
                                rightText={strings['Следующий урок']}
                            /> */}

                            </View>
                    }
                </View>
            </NetConnection>
        );
    }
}
