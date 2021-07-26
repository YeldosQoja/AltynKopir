import React, { Component, Fragment } from 'react';
import { View, Text, FlatList, TouchableOpacity, Dimensions, Linking, Platform } from 'react-native';
import FastImage from 'react-native-fast-image';
import BuyButton from '../../../../components/BuyButton';
import Loading from '../../../../components/Loading';
import Reviews from '../../../../components/Reviews';
import { strings } from '../../../../localization/Localization';
import { StateContext } from '../../../../provider/ProviderApp';
import { ColorApp } from '../../../../theme/color/ColorApp';
import { setFont } from '../../../../theme/font/FontApp';
import { constants } from '../../../../constants/Constants';
import Axios from 'axios';
import HTMLRENDER from 'react-native-render-html';
import NetConnection from '../../../../components/NetConnection';

const { width } = Dimensions.get("screen");


export default class TestOpen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: {},
            chapters: [],
            isLoading: true,
            isRefreshing: false,
            showText: false,
            numberOfLines: 0,
            isNet: true,
            nStatus: "0"
        };

        this.itemTestOpen = props.route.params.itemTestOpen;
    }

    static contextType = StateContext;

    componentDidMount() {
        this.props.navigation.setOptions({ title: null, headerStyle: { backgroundColor: this.globaleState.bottomBar.color_app ? this.globaleState.bottomBar.color_app : ColorApp.main, } });
        // this.getTestOpen();
        // this.checkConnection();
        this.getStatus();
    }

    getStatus = () => {
        Axios({
            method: 'GET',
            url: Axios.defaults.baseURL + 'get'
        }).then(res => {
            console.log('getStatus', res);
            this.setState({ nStatus: Platform.OS == 'ios' ? res.data.ios : res.data.android })
            this.checkConnection();
        })
            .catch(e => {
                console.log("catch getStatus", e);
                this.setState({ nStatus: '0' });
                this.checkConnection();
            });
    }

    checkConnection = () => {
        if (this.globaleState.token) {
            constants.NetCheck({ send: this.itemTestOpen.price > 0 ? this.getTestOpen : this.freeSubcribe, error: () => this.setState({ isNet: false }) });
        } else {

        } constants.NetCheck({ send: this.getTestOpen, error: () => this.setState({ isNet: false }) });
    }

    getTestOpen = () => {

        this.setState({ isNet: true });

        Axios.get(`modules/tests/${this.itemTestOpen.id}`)
            .then(res => {
                console.log('getTestOpen: ', res);

                // for (let i = 0; i < res.data.data.chapters.length; i++) {
                //     res.data.data.chapters[i].selected = false;
                // }

                res.data.data.isCourseOrTest = "test";

                this.setState({
                    dataSource: res.data.data,
                    chapters: res.data.data.chapters,
                    isLoading: false,
                    isRefreshing: false
                });
            })
            .catch(e => {
                console.log(e);
                console.log(e.response);
                this.setState({ isRefreshing: false });
                constants.onHandlerError(e.response.data, e.reponse.status);
            });
    }

    onRefresh = () => {
        this.setState({ isRefreshing: true, isLoading: true });
        this.getTestOpen();
    }

    onNavigation = () => {

        if (this.state.dataSource.passing_user) {
            if (this.state.dataSource.attempts - this.state.dataSource.passing_user.attempts > 0) {
                this.props.navigation.navigate("OlimpTest", { lesson: this.state.dataSource });
            }
        } else {
            if (this.state.dataSource.attempts) {
                this.props.navigation.navigate("OlimpTest", { lesson: this.state.dataSource });
            }
        }

    }

    ListHeaderComponent = () => (
        <Fragment>
            {
                this.state.dataSource.poster ?
                    <FastImage
                        source={{ uri: this.state.dataSource.poster }}
                        style={{ width: '100%', height: 232 }}
                    />
                    :
                    null
            }

            <View style={{ margin: 16 }}>
                <Text style={[setFont(13, "600"), { marginBottom: 4, color: ColorApp.fade, textTransform: "uppercase" }]}>{this.state.dataSource.category.name}</Text>
                <Text style={[setFont(20, "bold"), { marginBottom: 10 }]}>{this.state.dataSource.title}</Text>

                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 18 }}>
                    <FastImage
                        source={require("../../../../assets/images/timer.png")}
                        style={{ width: 20, height: 20 }}
                        tintColor={ColorApp.main}
                    />
                    <Text style={[setFont(15, "400", ColorApp.main,), { marginHorizontal: 4 }]}>{this.state.dataSource.timer ? this.state.dataSource.timer : 0} {strings.мин}.</Text>
                    <View style={{ width: 1, height: 16, backgroundColor: "rgba(0,0,0,0.24)" }} />
                    <Text style={[setFont(15, "400", ColorApp.fade), { marginHorizontal: 4 }]}>{this.state.dataSource.passing_user?.tests_count} {strings.вопросов}</Text>
                    <View style={{ width: 1, height: 16, backgroundColor: "rgba(0,0,0,0.24)" }} />
                    <Text style={[setFont(15, "400", ColorApp.fade), { marginHorizontal: 4 }]}>{strings['Всего попыток:']} {this.itemTestOpen.attempts ? this.itemTestOpen.attempts : 0}</Text>
                </View>

                {
                    this.state.dataSource.description ?
                        <HTMLRENDER
                            html={this.state.dataSource.description}
                            baseFontStyle={{ fontSize: 17, color: '#000' }}
                            imagesMaxWidth={width - 32}
                            tagsStyles={{ img: { marginVertical: 5 }, iframe: { heigth: 200 } }}
                            staticContentMaxWidth={width - 32}
                            ignoredStyles={['display', 'font-family', 'font-weight', 'padding', 'margin', 'text-align']}
                            alterChildren={node => {
                                if (node.name === "iframe" || node.name === "img") {
                                    delete node.attribs.width;
                                    delete node.attribs.heigth;
                                }
                                return node.children;
                            }}
                            renderers={{
                                p: (_, children, convertedCSSStyles, { allowFontScaling, key }) => {
                                    return (
                                        <Text onTextLayout={e => this.setState({ numberOfLines: this.state.numberOfLines + e.nativeEvent.lines.length })} numberOfLines={this.state.numberOfLines > 5 && this.state.showText != false ? null : 6} allowFontScaling={allowFontScaling} key={key} style={convertedCSSStyles}>{children}</Text>
                                    );
                                }
                            }}
                            onLinkPress={(ev, href, htmlAttribs) => Linking.openURL(href)}
                        />
                        :
                        null
                }



                {
                    this.state.numberOfLines > 5 && this.state.showText == false ?
                        <Text
                            onPress={() => this.setState({ showText: true })}
                            style={[setFont(13, "600", ColorApp.action), { textTransform: "uppercase", marginTop: 8 }]} >
                            {strings.Подробнее}
                        </Text>
                        :
                        null
                }


                <View style={{ height: 1, backgroundColor: 'rgba(0,0,0,0.12)', marginTop: 20 }} />
            </View>
            {/* <Text onPress={() => this.props.navigation.navigate("OlimpTest", { lesson: { id: this.state.dataSource.id } })}>TEST</Text> */}
        </Fragment>
    );

    renderItem = ({ item, index }) => (
        <Fragment />
    );

    ListFooterComponent = () => (
        <Fragment>
            <Text style={[setFont(20, "bold"), { marginHorizontal: 16, marginBottom: 16 }]}>{strings['Автор теста']}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 8, marginBottom: 24 }}>
                <FastImage
                    source={{ uri: this.state.dataSource.author.avatar, priority: FastImage.priority.high }}
                    style={{ width: 56, height: 56, borderRadius: 28, alignSelf: "flex-start" }}
                />
                <View style={{ flex: 1, marginLeft: 16 }}>
                    <Text style={[setFont(17, "600"), { marginBottom: 2 }]}>{this.state.dataSource.author.name}</Text>
                    <Text style={[setFont(13), { color: ColorApp.fade }]}>{this.state.dataSource.author.description}</Text>
                </View>
                <View style={{ position: "absolute", left: 88, right: 0, bottom: 0, height: 0.5, backgroundColor: ColorApp.border }} />
            </View>

            {/* {
                this.state.dataSource.reviews.length > 0 ?
                    <Fragment>
                        <TouchableOpacity
                            onPress={() => this.props.navigation.navigate("AllReviews", { courseId: this.state.dataSource })}
                            activeOpacity={0.8}
                            style={{ flexDirection: "row", alignItems: "center", marginHorizontal: 16, marginBottom: 12, justifyContent: "space-between" }}>
                            <Text style={[setFont(20, "bold")]}>{strings.Отзывы}</Text>
                            <Text style={[setFont(13, "600", ColorApp.action)]}>{strings.Все}</Text>
                        </TouchableOpacity>

                        <FlatList
                            data={this.state.dataSource.reviews}
                            renderItem={this.renderItemReviews}
                            keyExtractor={(item, index) => index + ""}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={{ marginBottom: 32 }}
                        />
                    </Fragment>
                    :
                    null
            } */}

        </Fragment>
    );


    // renderItemReviews = ({ item, index }) => (
    //     <Reviews
    //         style={{ width: width / 1.2, marginLeft: index == 0 ? 16 : 4, marginRight: index == this.state.dataSource.reviews.length - 1 ? 16 : 4 }}
    //         name={item.user.name}
    //         avatar={item.user.avatar}
    //         date={item.updated_at}
    //         stars={item.stars}
    //         text={item.text}
    //     />
    // );

    attempts = () => {

        if (this.state.dataSource?.passing_user) {

            if (this.state.dataSource?.attempts > 0) {

                return this.state.dataSource?.attempts - this.state.dataSource?.passing_user?.attempts;

            } else {

                return '0';

            }

        } else {

            if (this.state.dataSource.attempts) {
                return this.state.dataSource.attempts;
            } else {
                return '0';
            }

        }

    }

    freeSubcribe = () => {
        Axios.get(`subscribes/test/${this.itemTestOpen.id}/subscribe`)
            .then(res => {
                console.log('freeSubcribe', res);

                this.getTestOpen();

            })
            .catch(e => {
                console.log(e);
            });
    }

    render() {

        const { isNet, dataSource, chapters, isLoading, isRefreshing } = this.state;

        this.globaleState = this.context;

        return (
            <NetConnection isNet={isNet} onPress={this.checkConnection}>
                <View style={{ flex: 1, backgroundColor: ColorApp.bg }}>
                    {
                        isLoading ?
                            <Loading />
                            :
                            <View style={{ flex: 1 }}>
                                <FlatList
                                    data={0}
                                    ListHeaderComponent={this.ListHeaderComponent}
                                    renderItem={this.renderItem}
                                    ListFooterComponent={this.ListFooterComponent}
                                    ListFooterComponentStyle={{ marginTop: 24 }}
                                    keyExtractor={(item, index) => index + ""}
                                    refreshing={isRefreshing}
                                    onRefresh={this.onRefresh}
                                />
                                {
                                    this.globaleState.token ?
                                        <Fragment>
                                            {
                                                dataSource.has_subscribed ?

                                                    <Fragment>
                                                        <BuyButton
                                                            onPress={this.onNavigation}
                                                            text={strings['Пройти тест']}
                                                            style={{ backgroundColor: ColorApp.action }}
                                                            isAttempts
                                                            attempts={this.attempts()}
                                                        />
                                                    </Fragment>

                                                    :
                                                    this.state.nStatus == '2' ?
                                                        null
                                                        :
                                                        <BuyButton
                                                            onPress={() => this.props.navigation.navigate("GB", { course: dataSource })}
                                                            text={strings['Купить тест']}
                                                            price={dataSource.price}
                                                            oldPrice={dataSource.old_price}
                                                        />
                                            }
                                        </Fragment>

                                        :
                                        this.state.nStatus == '2' ?
                                            null
                                            :
                                            <BuyButton
                                                onPress={() => this.globaleState.token ?
                                                    this.props.navigation.navigate("GB", { course: dataSource })
                                                    :
                                                    this.props.navigation.navigate("Tab4Navigator", {
                                                        screen: "AuthNavigator", params: {
                                                            screen: 'Login'
                                                        }
                                                    })
                                                }
                                                text={strings['Купить тест']}
                                                price={dataSource.price}
                                                oldPrice={dataSource.old_price}
                                            />
                                }

                            </View>
                    }
                </View>
            </NetConnection>
        );
    }
}
