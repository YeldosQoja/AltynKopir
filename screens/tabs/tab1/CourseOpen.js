import Axios from 'axios';
import React, { Component, Fragment } from 'react';
import { View, Text, FlatList, TouchableOpacity, Dimensions, Linking, Platform } from 'react-native';
import FastImage from 'react-native-fast-image';
import Loading from '../../../components/Loading';
import { constants } from '../../../constants/Constants';
import { strings } from '../../../localization/Localization';
import { ColorApp } from '../../../theme/color/ColorApp';
import { setFont } from '../../../theme/font/FontApp';
import HTMLRENDER from 'react-native-render-html';
import Reviews from '../../../components/Reviews';
import BuyButton from '../../../components/BuyButton';
import { Collapse, CollapseHeader, CollapseBody } from 'accordion-collapse-react-native';
import Icon from 'react-native-vector-icons/Feather';
import IconPlay from 'react-native-vector-icons/Ionicons';
import { StateContext } from '../../../provider/ProviderApp';
import * as Animatable from 'react-native-animatable';
import ButtonLesson from '../../../components/ButtonLesson';
import NetConnection from '../../../components/NetConnection';

const { width } = Dimensions.get("screen");

export default class CourseOpen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: {},
            chapters: [],
            isLoading: true,
            isRefreshing: false,
            numberOfLines: 6,
            showText: false,
            isNet: true,
            nStatus: '0'
        };

        this.itemCourse = props.route.params.itemCourse;
    }

    static contextType = StateContext;

    componentDidMount() {
        this.props.navigation.setOptions({ title: null, headerStyle: { backgroundColor: this.globaleState.bottomBar ? this.globaleState.bottomBar.color_app : ColorApp.main, } })
        // this.getCourseOpen();

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
            });
    }

    checkConnection = () => {
        constants.NetCheck({ send: this.getCourseOpen, error: () => this.setState({ isNet: false }) });
    }

    getCourseOpen = () => {

        this.setState({ isNet: true });

        Axios.get(`course/${this.itemCourse.id}`)
            .then(res => {
                console.log('getCourseOpen: ', res);

                res.data.data.isCourseOrTest = "course";

                for (let i = 0; i < res.data.data.chapters.length; i++) {
                    res.data.data.chapters[i].selected = false;
                    for (let j = 0; j < res.data.data.chapters[i].lessons.length; j++) {
                        if (res.data.data.chapters[i].lessons[j].is_promo) {
                            res.data.data.chapters[i].is_promo = true;
                            break;
                        }
                    }
                }

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
        this.getCourseOpen();
    }


    onCollapse = (item) => {
        console.log('onCollapse item: ', item);

        let copyChapters = [];

        for (let i = 0; i < this.state.chapters.length; i++) {
            copyChapters.push(Object.assign({}, this.state.chapters[i]));
        }

        for (let i = 0; i < copyChapters.length; i++) {
            if (item.id == copyChapters[i].id) {
                copyChapters[i].selected = !item.selected;
            }
        }

        this.setState({ chapters: copyChapters });

        console.log('copyChapters: ', copyChapters);
    }

    onNavigation = (item, outerItem) => {
        if (this.globaleState.token) {
            if (item.is_promo) {
                this.props.navigation.navigate("Lesson", { itemLesson: item, title: outerItem.title })
            } else {
                if (this.state.nStatus == '2') {
                    this.props.navigation.navigate("Lesson", { itemLesson: item, title: outerItem.title })
                } else {
                    if (this.state.dataSource.has_subscribed) {
                        this.props.navigation.navigate("Lesson", { itemLesson: item, title: outerItem.title });
                    } else {
                        this.props.navigation.navigate("GB", { course: this.state.dataSource });
                    }
                }
            }
        } else {
            this.props.navigation.navigate("Tab4Navigator", { screen: "AuthNavigator" });
        }
    }

    ListHeaderComponent = () => (
        <Fragment>
            {
                this.state.dataSource.poster ?
                    <FastImage
                        source={{ uri: this.state.dataSource.poster, priority: FastImage.priority.high }}
                        style={{ width: '100%', height: 232 }}
                    />
                    :
                    null
            }

            <View style={{ margin: 16 }}>
                <Text style={[setFont(13, "600"), { marginBottom: 4 }]}>{this.state.dataSource.category_name}</Text>
                <Text style={[setFont(20, "bold"), { marginBottom: 10 }]}>{this.state.dataSource.title}</Text>

                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 18 }}>
                    <Text style={[setFont(15)]}>{this.state.chapters.length} {strings.урока}</Text>
                    <View style={{ width: 1, height: 16, backgroundColor: "rgba(0,0,0,0.24)", marginHorizontal: 4 }} />
                    <FastImage
                        source={require("../../../assets/images/star.png")}
                        style={{ width: 14, height: 14 }}
                    />
                    <Text style={[setFont(10, "500"), { marginLeft: 4, marginRight: 2 }]}>{this.state.dataSource.reviews_stars}</Text>
                    <Text style={[setFont(10, "500")]}>({this.state.dataSource.reviews_count} {strings.отзывов})</Text>
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
                                        <Text onTextLayout={e => this.setState({ numberOfLines: e.nativeEvent.lines.length })} numberOfLines={this.state.numberOfLines > 5 && this.state.showText != false ? null : 6} allowFontScaling={allowFontScaling} key={key} style={convertedCSSStyles}>{children}</Text>
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
        </Fragment>
    );

    renderItem = ({ item, index }) => (
        <Fragment>
            {
                index == 0 ?
                    <Text style={[setFont(20, "bold"), { marginHorizontal: 16 }]}>{strings["Программа курса"]}</Text>
                    :
                    null
            }
            <Collapse
                onToggle={() => this.onCollapse(item)}
            // disabled={this.state.dataSource.has_subscribed}
            >
                <CollapseHeader>
                    <View>
                        <View
                            activeOpacity={0.8}
                            style={{ flexDirection: "row", alignItems: "center", paddingVertical: 16, paddingHorizontal: 16 }}
                        >
                            <View style={{ flex: 1, marginRight: 12 }}>
                                <Text numberOfLines={1} style={[setFont(15, "600"), { marginBottom: 4 }]}>{index + 1}. {item.title}</Text>
                                <Text style={[setFont(13), { color: ColorApp.fade }]}>{item.lessons_count} {strings.лекции}・{item.files_count} {strings.файла}・{item.tests_count} {strings.тест}</Text>
                                {
                                    item.is_promo || this.state.dataSource.has_subscribed ?
                                        null
                                        :
                                        this.state.nStatus == '2' ?
                                            null
                                            :
                                            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}>
                                                <FastImage
                                                    source={require("../../../assets/images/close.png")}
                                                    style={{ width: 16, height: 19 }}
                                                />
                                                <Text style={[setFont(13), { color: ColorApp.fade, marginLeft: 8 }]}>{strings["Купите курс чтобы смотреть"]}</Text>
                                            </View>
                                }
                            </View>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                {
                                    this.state.dataSource.chapters[index].lessons[0]?.preview ?
                                        <FastImage
                                            source={{ uri: this.state.dataSource.chapters[index].lessons[0].preview, priority: FastImage.priority.high }}
                                            style={{ width: 60, height: 60, borderRadius: 10 }}
                                        />
                                        :
                                        null
                                }

                                <Icon name={item.selected ? "chevron-up" : "chevron-down"} size={24} color={ColorApp.fade} style={{ marginLeft: 16 }} />
                            </View>
                        </View>
                        {
                            item.is_promo ?
                                <Fragment>
                                    {
                                        this.state.nStatus == '2' ?
                                            null
                                            :
                                            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16, marginHorizontal: 16 }}>
                                                <View style={{ width: 18, height: 18, borderRadius: 9, marginRight: 10, justifyContent: "center", alignItems: "center", backgroundColor: ColorApp.sectionBG }}>
                                                    <IconPlay name="play" color={ColorApp.action} size={9} />
                                                </View>
                                                <Text style={[setFont(13, "600", ColorApp.action)]}>{strings['Смотреть первый урок бесплатно']}</Text>
                                            </View>
                                    }

                                </Fragment>
                                :
                                null
                        }
                        <View style={{ position: "absolute", left: 16, right: 0, bottom: 0, height: 0.5, backgroundColor: ColorApp.border }} />
                    </View>
                </CollapseHeader>

                <CollapseBody>
                    <FlatList
                        data={item.lessons}
                        renderItem={(e) => this.renderItemCollapse(e, item)}
                        keyExtractor={(item, index) => index + ""}
                        showsVerticalScrollIndicator={false}
                    />
                </CollapseBody>
            </Collapse>

        </Fragment>
    );

    renderItemCollapse = ({ item, index }, outerItem) => (
        <Animatable.View animation="fadeInLeft" useNativeDriver>
            <TouchableOpacity
                onPress={() => this.onNavigation(item, outerItem)}
                activeOpacity={0.8}
                style={{ flexDirection: "row", alignItems: "center", marginHorizontal: 16, marginVertical: 5, paddingVertical: 10 }}
            >
                {
                    item.is_promo || this.state.dataSource.has_subscribed ?
                        <View style={{ width: 18, height: 18, borderRadius: 9, justifyContent: "center", alignItems: "center", backgroundColor: ColorApp.sectionBG }}>
                            <IconPlay name="play" color={ColorApp.action} size={9} />
                        </View>
                        :
                        <FastImage
                            source={require("../../../assets/images/close.png")}
                            style={{ width: 16, height: 19 }}
                        />
                }

                <Text style={[setFont(13)], { flex: 1, marginHorizontal: 8 }}>{outerItem.position}.{index + 1} {item.title}</Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <FastImage
                        source={require("../../../assets/images/time.png")}
                        style={{ width: 16, height: 16 }}
                        tintColor="#000"
                    />
                    <Text style={[setFont(10, "500"), { marginLeft: 2 }]}>{new Date(item.time * 60 * 1000).toISOString().substr(item.time < 60 ? 14 : 11, item.time < 60 ? 5 : 8)}</Text>
                </View>
            </TouchableOpacity>
        </Animatable.View>
    );

    ListFooterComponent = () => (
        <Fragment>
            <Text style={[setFont(20, "bold"), { marginHorizontal: 16, marginBottom: 16 }]}>{strings["Автор курса"]}</Text>
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

            {
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
            }

        </Fragment>
    );


    renderItemReviews = ({ item, index }) => (
        <Fragment>
            {
                item.user ?
                    <Reviews
                        style={{ width: width / 1.2, marginLeft: index == 0 ? 16 : 4, marginRight: index == this.state.dataSource.reviews.length - 1 ? 16 : 4 }}
                        name={item.user.name}
                        avatar={item.user.avatar}
                        date={item.updated_at}
                        stars={item.stars}
                        text={item.text}
                        users={{ id: item.user_id, userId: this.globaleState.user?.id }}
                    />
                    :
                    null
            }
        </Fragment>
    );



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
                                    data={chapters}
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
                                                    dataSource.progress ?
                                                        <ButtonLesson
                                                            onPress={() => this.props.navigation.navigate("Lesson", { itemLesson: { id: dataSource.progress.next_lesson_id }, title: dataSource.title })}
                                                            text={strings['Продолжить урок']}
                                                            countLesson={dataSource.progress.next_lesson.position}
                                                        />
                                                        :
                                                        null
                                                    :
                                                    this.state.nStatus == '2' ?
                                                        null
                                                        :
                                                        <Animatable.View animation="fadeIn" useNativeDriver>
                                                            <BuyButton
                                                                onPress={() => { this.globaleState.token ? this.props.navigation.navigate("GB", { course: dataSource }) : this.props.navigation.navigate("Login") }}
                                                                text={strings["Купить полный курс"]}
                                                                price={dataSource.price}
                                                                oldPrice={dataSource.old_price}
                                                            />
                                                        </Animatable.View>
                                            }
                                        </Fragment>
                                        :

                                        this.state.nStatus == '2' ?
                                            null
                                            :
                                            <Animatable.View animation="fadeIn" useNativeDriver>
                                                <BuyButton
                                                    onPress={() => {
                                                        this.globaleState.token ? this.props.navigation.navigate("GB", { course: dataSource }) : this.props.navigation.navigate("Tab4Navigator", {
                                                            screen: "AuthNavigator", params: {
                                                                screen: 'Login'
                                                            }
                                                        })
                                                    }}
                                                    text={strings["Купить полный курс"]}
                                                    price={dataSource.price}
                                                    oldPrice={dataSource.old_price}
                                                />
                                            </Animatable.View>

                                }


                            </View>
                    }
                </View>
            </NetConnection>
        );
    }
}
