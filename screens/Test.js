import Axios from 'axios';
import React, { Component, Fragment } from 'react';
import { View, Text, FlatList, Dimensions, TouchableOpacity, Linking } from 'react-native';
import Loading from '../components/Loading';
import { constants } from '../constants/Constants';
import { strings } from '../localization/Localization';
import { ColorApp } from '../theme/color/ColorApp';
import { setFont } from '../theme/font/FontApp';
import HTMLRENDER from 'react-native-render-html';
import Icon from 'react-native-vector-icons/Entypo';
import RowContainer from '../components/RowContainer';
import qs from 'qs';
import FastImage from 'react-native-fast-image';
import { StateContext } from '../provider/ProviderApp';
import NetConnection from '../components/NetConnection';

const { width } = Dimensions.get("screen");

export default class Test extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: {},
            tests: [],
            isLoading: true,
            timer: '',
            HH: null,
            MM: null,
            SS: null,
            isLoadingBtnR: false,
            disabledR: false,
            isNet: true
        };

        this.lesson = props.route.params.lesson;
        this.ArrAnswer = {};
        this.title = props.route.params.title;
    }

    static contextType = StateContext;

    componentDidMount() {
        this.props.navigation.setOptions({
            title: this.title,
            headerTitleContainerStyle: { marginHorizontal: 132 },
            headerStyle: { backgroundColor: this.globalState.bottomBar ? this.globalState.bottomBar.color_app : ColorApp.main }
        });
        // this.getTest();
        this.checkConnection();
    }

    componentDidUpdate() {
        this.props.navigation.setOptions({
            title: this.title,
            headerTitleContainerStyle: { marginHorizontal: 132 },
            headerRight: () => (
                <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255, 255, 255, 0.24)", borderRadius: 4, paddingVertical: 6, paddingLeft: 6, paddingRight: 4 }}>
                    <FastImage
                        source={require("../assets/images/timer.png")}
                        style={{ width: 16, height: 16 }}
                    />
                    <Text style={[setFont(13), { color: "#fff", marginLeft: 4 }]}>{this.state.timer}</Text>
                </View>
            ),
            headerRightContainerStyle: { marginRight: 20 }
        });
    }

    componentWillUnmount() {
        clearInterval(this._timer);
    }

    checkConnection = () => {
        constants.NetCheck({ send: this.getTest, error: () => this.setState({ isNet: false }) });
    }

    getTest = () => {

        this.setState({ isNet: true });

        Axios.get(`lesson/${this.lesson.id}/test`)
            .then(res => {
                console.log("getTest", res);

                for (let i = 0; i < res.data.data.entity.tests.length; i++) {
                    for (let j = 0; j < res.data.data.entity.tests[i].answers.length; j++) {
                        res.data.data.entity.tests[i].answers[j].selected = false;
                    }
                }

                this.setState({
                    dataSource: res.data.data,
                    tests: res.data.data.entity.tests,
                    timer: this.beginTimer(res.data.data.finishing_time),
                    isLoading: false
                });
                this._timer = setInterval(() => this.onTimer(res.data.data.finishing_time), 1000);
            })
            .catch(e => {
                console.log(e);
                console.log(e.response);
                constants.onHandlerError(e.response.data, e.response.status, () => this.props.navigation.navigate("Lesson"), () => this.props.navigation.navigate("Lesson"));
            });
    }

    SendTest = () => {
        this.setState({ isLoadingBtnR: true, disabledR: true });

        clearInterval(this._timer);

        // this.props.navigation.replace("TestResult");

        Axios.post(`test/${this.state.dataSource.id}/finish`,null, {
            params: {
                answer: Object.keys(this.ArrAnswer).length > 0 ? this.ArrAnswer : []
            },
            paramsSerializer: params => (qs.stringify(params, { arrayFormat: "brackets" }))
        })
            .then(res => {
                console.log('SendTest res: ', res);
                this.setState({ isLoadingBtn: false, disabled: false });

                this.props.navigation.replace('TestResult', { lessonId: this.state.dataSource, title: this.title });

            })
            .catch(e => {
                console.log(e);
                console.log(e.response);
                this.setState({ isLoadingBtnR: false, disabledR: false });
                constants.noInternet(e);
                constants.onHandlerError(e.response.data, e.response.status);
            });
    }

    beginTimer = (finishing_time) => {
        let date1 = new Date();
        let date2 = new Date(finishing_time);
        let diff = date2.getTime() - date1.getTime();

        let msec = diff;
        let hh = Math.floor(msec / 1000 / 60 / 60);

        msec -= hh * 1000 * 60 * 60;

        let mm = Math.floor(msec / 1000 / 60);

        msec -= mm * 1000 * 60;
        let ss = Math.floor(msec / 1000);

        msec -= ss * 1000;

        let timer = '';

        if (hh != 0) {
            timer += `${hh} : `;
        }

        if (mm != 0) {
            timer += `${mm} : `;
        }

        if (ss != 0) {
            timer += `${ss}`;
        }

        return timer;
    }

    onTimer = (finishing_time) => {
        let date1 = new Date();
        let date2 = new Date(finishing_time);
        let diff = date2.getTime() - date1.getTime();
        // console.log(diff);

        let msec = diff;
        let hh = Math.floor(msec / 1000 / 60 / 60);
        // console.log('hh', hh);
        msec -= hh * 1000 * 60 * 60;
        // console.log('msec', msec);
        let mm = Math.floor(msec / 1000 / 60);
        // console.log('mm', mm);
        msec -= mm * 1000 * 60;
        let ss = Math.floor(msec / 1000);
        // console.log('ss', ss);
        msec -= ss * 1000;

        let timer = '';

        if (hh != 0) {
            timer += `${hh} : `;
        }

        if (mm != 0) {
            timer += `${mm}`;
        }

        if (ss != 0) {
            timer += ` : ${ss}`;
        }

        console.log(timer);


        if (hh == 0 && mm == 0 && ss == 0) {
            if (ss == 0) {
                timer += '0'
            }
            this.setState({ timer: timer });
            this.SendTest();
        } else {
            this.setState({ timer: timer, HH: hh, MM: mm, SS: ss });
        }
    }


    onSelectAnswer = (itemQuestion, itemAnswer, index) => {
        console.log("itemQuestion", itemQuestion);
        console.log("item", itemAnswer);
        console.log("index", index);

        let copyQuestion = itemQuestion.answers;

        if (itemQuestion.is_multiple) {
            for (let i = 0; i < copyQuestion.length; i++) {
                if (typeof this.ArrAnswer[itemQuestion.id] === "undefined") {
                    this.ArrAnswer[itemQuestion.id] = {};
                }
                if (itemAnswer.id == copyQuestion[i].id) {
                    copyQuestion[i].selected = !itemAnswer.selected;
                    this.ArrAnswer[itemQuestion.id][itemAnswer.id] = itemAnswer.id;

                    if (!copyQuestion[i].selected) {
                        this.ArrAnswer[itemQuestion.id][itemAnswer.id] = itemAnswer.id;
                        delete this.ArrAnswer[itemQuestion.id][itemAnswer.id];
                    }
                }
            }
        } else {
            for (let i = 0; i < copyQuestion.length; i++) {
                if (itemAnswer.id == copyQuestion[i].id) {
                    copyQuestion[i].selected = true;
                    this.ArrAnswer[itemQuestion.id] = itemAnswer.id;
                } else {
                    copyQuestion[i].selected = false;
                }
            }
        }

        console.log('copyQuestion', copyQuestion);
        console.log('this.ArrAnswer:', this.ArrAnswer);

        this.setState({});


    }

    ListHeaderComponent = () => (
        <View>
            <Text style={[setFont(20, "bold")]}>{strings["Онлайн тест"]}</Text>
            <Text style={[setFont(15), { marginTop: 4 }]}>{strings["Пройдите онлайн тест, чтобы закрепить материалы курса и получить сертификат."]}</Text>
        </View>
    );

    renderItem = ({ item, index }) => (
        <View>

            <Text style={[setFont(13, "600", ColorApp.action), { textTransform: "uppercase", marginBottom: 8 }]}>{index + 1} - {strings.вопрос}</Text>

            <HTMLRENDER
                html={item.question}
                baseFontStyle={{ fontSize: 17 }}
                imagesMaxWidth={width - 32}
                tagsStyles={{ img: { marginVertical: 5 }, iframe: { height: 200, borderRadius: 10, } }}
                staticContentMaxWidth={width - 32}
                ignoredStyles={['display', 'font-family', 'font-weight', 'padding', 'margin', 'text-align']}
                alterChildren={node => {
                    if (node.name === "iframe" || node.name === "img") {
                        delete node.attribs.width;
                        delete node.attribs.height;
                    }
                    return node.children;
                }}
                onLinkPress={(ev, href, htmlAttribs) => Linking.openURL(href)}
            />

            <FlatList
                data={item.answers}
                renderItem={(e) => this.renderItemAnswers(item, e)}
                keyExtractor={(item, index) => index + ""}
                showsVerticalScrollIndicator={false}
                bounces={false}
                extraData={this.state}
                scrollEnabled={false}
            />
        </View>
    );


    renderItemAnswers = (itemQuestion, { item, index }) => (
        <TouchableOpacity
            onPress={() => this.onSelectAnswer(itemQuestion, item, index)}
            activeOpacity={0.8}
            style={{ backgroundColor: item.selected ? "rgba(0,122,255,0.08)" : ColorApp.transparent, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: ColorApp.sectionBG, borderRadius: 4, padding: 8, marginBottom: 8 }}
        >

            <Fragment>
                {
                    itemQuestion.is_multiple ?

                        <Fragment>
                            {
                                item.selected ?
                                    <View style={{ width: 24, height: 24, borderRadius: 4, backgroundColor: ColorApp.action, justifyContent: "center", alignItems: "center" }} >
                                        <Icon name='check' color='#fff' />
                                    </View>
                                    :
                                    <View style={{ width: 24, height: 24, borderRadius: 4, backgroundColor: ColorApp.sectionBG }} />
                            }
                        </Fragment>
                        :
                        <Fragment>
                            {
                                item.selected ?
                                    <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: ColorApp.action, justifyContent: "center", alignItems: "center" }} >
                                        <Icon name='check' color='#fff' />
                                    </View>
                                    :
                                    <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: ColorApp.sectionBG }} />
                            }
                        </Fragment>

                }
            </Fragment>

            {
                item.answer ?
                    <HTMLRENDER
                        containerStyle={{ marginLeft: 8, flex: 1 }}
                        html={item.answer}
                        baseFontStyle={{ fontSize: 17 }}
                        imagesMaxWidth={width - 32}
                        tagsStyles={{ img: { marginVertical: 5 }, iframe: { height: 200, borderRadius: 10, } }}
                        staticContentMaxWidth={width - 32}
                        ignoredStyles={['display', 'font-family', 'font-weight', 'padding', 'margin', 'text-align']}
                        alterChildren={node => {
                            if (node.name === "iframe" || node.name === "img") {
                                delete node.attribs.width;
                                delete node.attribs.height;
                            }
                            return node.children;
                        }}
                        onLinkPress={(ev, href, htmlAttribs) => Linking.openURL(href)}
                    />
                    :
                    null
            }

            {/* <Text style={[setFont(15), { marginLeft: 8, flex: 1 }]}>{item.answer}</Text> */}

        </TouchableOpacity>
    )

    render() {

        const { isNet, dataSource, tests, isLoading, isLoadingBtnR, disabledR } = this.state;

        this.globalState = this.context;

        return (
            <NetConnection isNet={isNet} onPress={this.checkConnection}>
                <View style={{ flex: 1, backgroundColor: ColorApp.bg }}>
                    {
                        isLoading ?
                            <Loading />
                            :
                            <View style={{ flex: 1 }}>
                                <FlatList
                                    data={tests}
                                    ListHeaderComponent={this.ListHeaderComponent}
                                    ListHeaderComponentStyle={{ marginBottom: 16 }}
                                    renderItem={this.renderItem}
                                    keyExtractor={(item, index) => index + ""}
                                    style={{ padding: 16 }}
                                    contentInset={{ bottom: 16 }}
                                />

                                <RowContainer
                                    style={{ justifyContent: "flex-end" }}
                                    showRight
                                    rightText={strings["Завершить тест"]}
                                    rightOnPress={this.SendTest}
                                    isLoadingRight={isLoadingBtnR}
                                    disabledRight={disabledR}
                                />
                            </View>
                    }
                </View>
            </NetConnection>
        );
    }
}
