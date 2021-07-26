import React, { Component, Fragment } from 'react';
import { View, Text, FlatList, Dimensions } from 'react-native';
import FastImage from 'react-native-fast-image';
import Loading from '../../../../components/Loading';
import NoData from '../../../../components/NoData';
import { strings } from '../../../../localization/Localization';
import { StateContext } from '../../../../provider/ProviderApp';
import { ColorApp } from '../../../../theme/color/ColorApp';
import { setFont } from '../../../../theme/font/FontApp';
import HTMLRENDER from 'react-native-render-html';
import { constants } from '../../../../constants/Constants';
import Axios from 'axios';
import NetConnection from '../../../../components/NetConnection';

const { width } = Dimensions.get("screen");

export default class PushNotification extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: [],
            isLoading: true,
            isRefreshing: false,
            isNet: true
        };
    }

    static contextType = StateContext;

    componentDidMount() {
        this.props.navigation.setOptions({
            title: strings.Уведомление,
            headerStyle: { backgroundColor: this.globalState.bottomBar ? this.globalState.bottomBar.color_app : ColorApp.main, }
        });
        // this.getDataPush();
        this.checkConnection();
    }

    checkConnection = () => {
        constants.NetCheck({ send: this.getDataPush, error: () => this.setState({ isNet: false }) });
    }

    getDataPush = () => {

        this.setState({ isNet: true });

        Axios.get("notifications")
            .then(res => {
                console.log("getDataPush", res);

                for (let i = 0; i < res.data.data.length; i++) {

                    if (res.data.data[i].type == "default") {
                        for (let key in res.data.data[i].data) {
                            res.data.data[i].data[key] = `<span style='color:#007AFF'>${res.data.data[i].data[key]}</span>`;
                        }
                    }

                }

                this.setState({
                    dataSource: res.data.data,
                    isLoading: false,
                    isRefreshing: false
                })
            })
            .catch(e => {
                console.log(e);
                console.log(e.reponse);
                this.setState({ isRefreshing: false });
                constants.onHandlerError(e.response.data, e.response.status);
            });
    }

    onRefresh = () => {
        this.setState({ isRefreshing: true }, this.getDataPush);
    }

    getTypeItem = (item) => {
        switch (item.type) {
            case "buy":

                return ({
                    text: item.message,
                    // data: {
                    //     course_name: `<span style='color:#007AFF'>“${item.data.course_name}”</span>`,
                    //     username: `<span style='color:#007AFF'>“${item.data.username}”</span>`
                    // }
                });

            case "test":
                return ({
                    text: item.message,
                    // data: { course_name: `<span style='color:#007AFF'>“${item.data.course_name}”</span>` }
                });

            case "course":
                return ({
                    text: item.message,
                    // data: { course_name: `<span style='color:#007AFF'>“${item.data.course_name}”</span>` }
                });

            case "complete":
                return (
                    {
                        text: item.message,
                        // data: { course_name: `<span style='color:#007AFF'>“${item.data.course_name}”</span>` }
                    }
                );

            case "default":
                return (
                    {
                        text: item.message,
                        // data: item.data
                    }
                );
        }
    }

    getTypeItemImage = (item) => {
        switch (item.type) {
            case "buy":

                return require("../../../../assets/images/p_buy.png");

            case "test":
                return require("../../../../assets/images/p_test.png");

            case "course":
                return require("../../../../assets/images/p_course.png");

            case "complete":
                return require("../../../../assets/images/p_complete.png");

            case "default":
                return require("../../../../assets/images/p_buy.png");
        }
    }

    renderItem = ({ item, index }) => (
        <Fragment>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 }}>
                <FastImage
                    source={this.getTypeItemImage(item)}
                    style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#eee', alignSelf: 'flex-start' }} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <HTMLRENDER
                        html={`${constants.wordLocalization(this.getTypeItem(item).text, this.getTypeItem(item).data, item.type != "default" ? true : false)}`}
                        baseFontStyle={{ fontSize: 17 }}
                        imagesMaxWidth={width - 32}
                        tagsStyles={{ img: { marginVertical: 5 }, iframe: { height: 200, borderRadius: 10, backgroundColor: ColorApp.transparent } }}
                        staticContentMaxWidth={width - 32}
                        ignoredStyles={['display', 'font-family', 'font-weight', 'padding', 'margin', 'text-align']}
                        alterChildren={node => {
                            if (node.name === "iframe" || node.name === "img") {
                                delete node.attribs.width;
                                delete node.attribs.height;
                            }
                            return node.children;
                        }}
                        onLinkPress={(ev, href, htmlAttribs) => { Linking.openURL(href); console.log(ev) }}
                    />

                    {/* <Text style={setFont(15)}>Ваш курс “Психология” купил(а) “Арман Жумахан”</Text> */}

                    {
                        item.created_at ?
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                <FastImage
                                    source={require('../../../../assets/images/time.png')}
                                    style={{ width: 16, height: 16 }}
                                />
                                <Text style={[setFont(15), { color: ColorApp.fade, marginLeft: 4 }]}>{constants.dateFormat(item.created_at)}</Text>
                            </View>
                            :
                            null
                    }

                </View>
                <View style={{ position: 'absolute', left: 16, right: 0, bottom: 0, height: 0.5, backgroundColor: ColorApp.border }} />
            </View>
        </Fragment>
    );

    ListEmptyComponent = () => (
        <NoData text={'Нет уведомлений'} />
    );

    render() {

        const { isNet, dataSource, isLoading, isRefreshing } = this.state;

        this.globalState = this.context;

        return (
            <NetConnection isNet={isNet} onPress={this.checkConnection}>
                <View style={{ flex: 1, backgroundColor: ColorApp.bg }}>
                    {
                        isLoading ?
                            <Loading />
                            :
                            <FlatList
                                data={dataSource}
                                renderItem={this.renderItem}
                                ListEmptyComponent={this.ListEmptyComponent}
                                keyExtractor={(item, index) => index + ''}
                                onRefresh={this.onRefresh}
                                refreshing={isRefreshing}
                            />
                    }
                </View>
            </NetConnection>
        );
    }
}
