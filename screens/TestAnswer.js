import React, { Component, Fragment } from 'react';
import { View, Text, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import { ColorApp } from '../theme/color/ColorApp';
import HTMLRENDER from 'react-native-render-html';
import Icon from 'react-native-vector-icons/Entypo';
import { setFont } from '../theme/font/FontApp';
import { Linking } from 'react-native';
import { strings } from '../localization/Localization';
const { width } = Dimensions.get("screen");
import IconCheckbox from 'react-native-vector-icons/Feather';
import IconFail from 'react-native-vector-icons/Ionicons';
import { StateContext } from '../provider/ProviderApp';

export default class TestAnswer extends Component {
    constructor(props) {
        super(props);
        this.state = {

        };

        this.answer = props.route.params.answer;
        this.list_answer = [];
        console.log("this.answer", this.answer);
    }

    static contextType = StateContext;


    componentDidMount() {

        this.props.navigation.setOptions({ title: strings["Результаты теста"], headerStyle: { backgroundColor: this.globalState.bottomBar ? this.globalState.bottomBar.color_app : ColorApp.main, } });

        for (let key in this.answer.questions) {
            this.list_answer.push(this.answer.questions[key]);
        }
        this.setState({});
    }

    renderItem = ({ item, index }) => (
        <View>

            <Text style={[setFont(13, "600", ColorApp.action), { textTransform: "uppercase", marginBottom: 8 }]}>{index + 1} - {strings.вопрос}</Text>

            <HTMLRENDER
                html={item.question.question}
                baseFontStyle={{ fontSize: 17 }}
                imagesMaxWidth={width - 32}
                tagsStyles={{ img: { marginVertical: 5 }, iframe: { height: 200, borderRadius: 10, } }}
                staticContentMaxWidth={width - 32}
                ignoredStyles={['display', 'font-family', 'font-weight', 'padding', 'margin', 'text-align']}
                alterChildren={node => {
                    if (node.name === "iframe" || node.name === "img") {
                        delete node.attribs.width;
                        delete node.attribs.height;
                        delete node.attribs.style;
                    }
                    return node.children;
                }}
                onLinkPress={(ev, href, htmlAttribs) => Linking.openURL(href)}
            />

            <FlatList
                data={item.question.answers}
                renderItem={(e) => this.renderItemAnswers(item, e)}
                keyExtractor={(item, index) => index + ""}
                showsVerticalScrollIndicator={false}
                bounces={false}
                extraData={this.state}
                scrollEnabled={false}
            />
        </View>
    );

    renderTypeAnswer = (item) => {
        if (this.answer.entity.result_type == "with_rights") {
            return (
                <Fragment>
                    {
                        item.is_passing ?
                            item.is_passing && item.is_correct ?
                                <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: ColorApp.main, justifyContent: 'center', alignItems: 'center' }}>
                                    <IconCheckbox name='check' color='#fff' size={18} />
                                </View>
                                :
                                <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: "#FF3B30", justifyContent: 'center', alignItems: 'center' }}>
                                    <IconFail name='close' color='#fff' size={18} />
                                </View>
                            :
                            <Fragment>
                                {
                                    item.is_correct ?
                                        <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: ColorApp.main, justifyContent: 'center', alignItems: 'center' }}>
                                            <IconCheckbox name='check' color='#fff' size={18} />
                                        </View>
                                        :
                                        <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: ColorApp.sectionBG }} />
                                }
                            </Fragment>
                    }
                </Fragment>
            );
        } else {
            return (
                <Fragment>
                    {
                        item.is_passing ?
                            item.is_passing && item.is_correct ?
                                <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: ColorApp.main, justifyContent: 'center', alignItems: 'center' }}>
                                    <IconCheckbox name='check' color='#fff' size={18} />
                                </View>
                                :
                                <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: "#FF3B30", justifyContent: 'center', alignItems: 'center' }}>
                                    <IconFail name='close' color='#fff' size={18} />
                                </View>
                            :
                            <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: ColorApp.sectionBG }} />
                    }
                </Fragment>
            );
        }
    };

    renderItemAnswers = (itemQuestion, { item, index }) => (
        <View
            style={{ backgroundColor: item.is_passing ? item.is_passing && item.is_correct ? "rgba(69, 142, 34, 0.08)" : "rgba(255, 59, 48, 0.08)" : ColorApp.transparent, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: ColorApp.sectionBG, borderRadius: 4, padding: 8, marginBottom: 8 }}
        >

            {this.renderTypeAnswer(item)}

            <HTMLRENDER
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
                        delete node.attribs.style;
                    }
                    return node.children;
                }}
                containerStyle={{ marginHorizontal: 8 }}
                onLinkPress={(ev, href, htmlAttribs) => Linking.openURL(href)}
            />

            {/* <Text style={[setFont(15), { marginLeft: 8, flex: 1 }]}>{item.answer}</Text> */}

        </View>
    );

    ListHeaderComponent = () => (
        <Text style={[setFont(20, "bold"), { marginBottom: 16 }]}>{strings['Правильные ответы']}</Text>
    );

    render() {

        this.globalState = this.context;

        return (
            <View style={{ flex: 1, backgroundColor: ColorApp.bg }}>
                <FlatList
                    data={this.list_answer}
                    ListHeaderComponent={this.ListHeaderComponent}
                    renderItem={this.renderItem}
                    keyExtractor={(item, index) => index + ""}
                    contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
                />
            </View>
        );
    }
}
