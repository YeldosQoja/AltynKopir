import Axios from 'axios';
import React, { Component } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import Loading from '../../../components/Loading';
import { constants } from '../../../constants/Constants';
import { navOptions } from '../../../constants/NavOptions';
import { StateContext } from '../../../provider/ProviderApp';
import { ColorApp } from '../../../theme/color/ColorApp';
import { setFont } from '../../../theme/font/FontApp';
import * as Animatable from 'react-native-animatable';
import NoData from '../../../components/NoData';
import NetConnection from '../../../components/NetConnection';
import { strings } from '../../../localization/Localization';

export default class Tab3 extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {},
            dataSource: [],
            isLoading: true,
            isRefreshing: false,
            isSendServerServer: false,
            isNet: true
        };
    }

    static contextType = StateContext;

    componentDidMount() {
        this.props.navigation.setOptions(navOptions.HEADER(this.globalState.bottomBar ? this.globalState.bottomBar.bottom_nav[this.globalState.bottomBar.bottom_nav.findIndex(i => i.id == 3)]?.title : strings.Новости, this.globalState.bottomBar ? this.globalState.bottomBar.logo : null));
        // this.getNews();
        this.checkConnection();
    }

    checkConnection = () => {
        constants.NetCheck({ send: this.getNews, error: () => this.setState({ isNet: false }) });
    }

    getNews = (np) => {

        this.setState({ isNet: true });

        let params = {};

        if (np) {
            let page = np.split('=');
            page = page[page.length - 1];
            params.page = page;
        }

        Axios.get('news', { params })
            .then(res => {
                console.log('getNews', res);

                this.setState({
                    data: res.data.data,
                    dataSource: np ? this.state.dataSource.concat(res.data.data.data) : res.data.data.data,
                    isLoading: false,
                    isRefreshing: false,
                    isSendServer: false
                })
            })
            .catch(e => {
                console.log(e);
                console.log(e.response);
                this.setState({ isRefreshing: false, isSendServer: false });
                constants.onHandlerError(e.response.data, e.response.status);
            });
    }

    onRefresh = () => {
        this.setState({ isRefreshing: true });
        this.getNews();
    }

    onEndReached = () => {
        if (this.state.data.next_page_url) {
            this.setState({ isSendServer: true });
            if (this.state.isSendServer) {
                this.getNews(this.state.data.next_page_url);
            }
        }
    }

    openNews = (item) => {
        console.log(item);
        this.props.navigation.navigate("NewsOpen", { itemNews: item });
    }


    renderItem = ({ item, index }) => (
        <Animatable.View animation={"fadeInUp"} useNativeDriver>
            <TouchableOpacity
                onPress={() => this.openNews(item)}
                activeOpacity={0.8}
                style={{ flexDirection: "row", alignItems: "center", paddingBottom: 16, marginBottom: 16 }}
            >
                <FastImage
                    source={{ uri: item.poster }}
                    style={{ width: 60, height: 60, borderRadius: 10 }}
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text numberOfLines={4} style={[setFont(15, "600"), { marginBottom: 4 }]}>{item.title}</Text>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <FastImage
                            source={require('../../../assets/images/time.png')}
                            style={{ width: 12, height: 12 }}
                        />
                        <Text style={[setFont(15), { marginLeft: 6, color: ColorApp.fade }]}>{constants.dateFormat(item.updated_at)}</Text>
                    </View>
                </View>
                <View style={{ position: "absolute", height: 0.5, backgroundColor: ColorApp.border, bottom: 0, left: 80, right: -16 }} />
            </TouchableOpacity>
        </Animatable.View>
    )

    ListFooterComponent = () => (
        <View style={{ marginVertical: 16 }}>
            {
                this.state.isSendServer ?
                    <Loading style={{ marginVertical: 0 }} />
                    :
                    null
            }
        </View>
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
                                keyExtractor={(item, index) => index + ''}
                                contentContainerStyle={{ padding: 16 }}
                                refreshing={isRefreshing}
                                onRefresh={this.onRefresh}
                                onEndReached={this.onEndReached}
                                onEndReachedThreshold={0.01}
                                ListEmptyComponent={<NoData />}
                                ListFooterComponent={this.ListFooterComponent}
                            />
                    }
                </View>
            </NetConnection>
        );
    }
}
