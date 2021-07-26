import Axios from 'axios';
import React, { Component, Fragment } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import Loading from '../components/Loading';
import Reviews from '../components/Reviews';
import { constants } from '../constants/Constants';
import { ColorApp } from '../theme/color/ColorApp';
import { setFont } from '../theme/font/FontApp';
import Rating from 'react-native-rating'
import { Easing } from 'react-native-reanimated';
import { strings } from '../localization/Localization';
import { StateContext } from '../provider/ProviderApp';
import { navOptions } from '../constants/NavOptions';
import NetConnection from '../components/NetConnection';
const images = {
    starFilled: require('../assets/images/starFil.png'),
    starUnfilled: require('../assets/images/starUnfil.png')
};

export default class AllReviews extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {},
            dataSource: [],
            isLoading: true,
            isRefreshing: false,
            isSendServer: false,
            isNet: true
        };
        this.courseId = props.route.params.courseId;
    }

    static contextType = StateContext;

    componentDidMount() {
        this.props.navigation.setOptions({
            title: strings.Отзывы,
            headerStyle: {
                backgroundColor: this.globalState.bottomBar ? this.globalState.bottomBar.color_app : ColorApp.main
            }
        });

        // this.getReviews();
        this.checkConnection();
    }

    checkConnection = () => {
        constants.NetCheck({ send: this.getReviews, error: () => this.setState({ isNet: false }) });
    }

    getReviews = (np) => {

        this.setState({ isNet: true });

        let params = {
            page: 1
        }

        if (np) {
            let nextPage = np.split("=")[np.split("=").length - 1];
            console.log("nextPage", nextPage);
            params.page = nextPage;
        }


        Axios.get(`reviews/${this.courseId.id}`, {
            params: params
        })
            .then(res => {
                console.log("getReviews", res);

                this.setState({
                    data: res.data.data,
                    dataSource: np ? this.state.dataSource.concat(res.data.data.data) : res.data.data.data,
                    isLoading: false,
                    isSendServer: false,
                    isRefreshing: false,
                });
            })
            .catch(e => {
                console.log(e);
                console.log(e.response);
                this.setState({ isRefreshing: false, isSendServer: false });
                constants.onHandlerError(e.response.data, e.response.status, () => this.props.navigation.navigate("CourseOpen"));
            });

    }

    onRefresh = () => {
        this.setState({ isRefreshing: true, isSendServer: false });
        this.getReviews();
    }

    onEndReached = () => {

        if (this.state.data.next_page_url) {
            this.setState({ isSendServer: true });
            if (this.state.isSendServer) {
                this.getReviews(this.state.data.next_page_url);
            }
        }

    }

    ListHeaderComponent = () => (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={[setFont(40, "bold")]}>{this.courseId.reviews_stars}</Text>
            <View style={{ flex: 1, marginLeft: 16 }}>
                <Rating
                    max={5}
                    initial={this.courseId.reviews_stars}
                    onChange={rating => console.log(rating)}
                    selectedStar={images.starFilled}
                    unselectedStar={images.starUnfilled}
                    config={{
                        easing: Easing.inOut(Easing.ease),
                        duration: 350
                    }}
                    editable={false}
                    stagger={80}
                    maxScale={1.4}
                    starStyle={{
                        width: 22,
                        height: 21
                    }}
                />
                <Text style={[setFont(13), { marginTop: 4 }]}>{constants.wordLocalization(strings['Оставлено :num отзывов'], { num: this.courseId.reviews_count })}</Text>
            </View>
        </View>
    );

    renderItem = ({ item, index }) => (
        <Fragment>
            {
                item.user ?
                    <Reviews
                        style={{ marginHorizontal: 16, marginBottom: 8, }}
                        name={item.user.name}
                        avatar={item.user.avatar}
                        date={item.updated_at}
                        stars={item.stars}
                        text={item.text}
                        users={{ id: item.user_id, userId: this.globalState.user?.id }}
                    />
                    :
                    null
            }
        </Fragment>

    );

    ListFooterComponent = () => (
        <Fragment>
            {
                this.state.isSendServer ?
                    <Loading style={{ marginVertical: 16 }} />
                    :
                    null
            }
        </Fragment>
    );

    render() {

        const { isNet, data, dataSource, isLoading, isRefreshing } = this.state;

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
                                ListHeaderComponent={this.ListHeaderComponent}
                                ListHeaderComponentStyle={{ paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 0.5, borderBottomColor: ColorApp.border, marginBottom: 16 }}
                                renderItem={this.renderItem}
                                ListFooterComponent={this.ListFooterComponent}
                                keyExtractor={(item, index) => index + ""}
                                refreshing={isRefreshing}
                                onRefresh={this.onRefresh}
                                contentInset={{ bottom: 32 }}
                                onEndReachedThreshold={0.1}
                                onEndReached={this.onEndReached}
                            />
                    }
                </View>
            </NetConnection>
        );
    }
}
