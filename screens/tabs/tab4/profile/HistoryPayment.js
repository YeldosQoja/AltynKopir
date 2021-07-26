import Axios from 'axios';
import React, { Component } from 'react';
import { View, Text, FlatList } from 'react-native';
import FastImage from 'react-native-fast-image';
import Loading from '../../../../components/Loading';
import NoData from '../../../../components/NoData';
import { constants } from '../../../../constants/Constants';
import { strings } from '../../../../localization/Localization';
import { ColorApp } from '../../../../theme/color/ColorApp';
import { setFont } from '../../../../theme/font/FontApp';
import IconTransfer from 'react-native-vector-icons/MaterialCommunityIcons';
import { StateContext } from '../../../../provider/ProviderApp';
import * as Animatable from 'react-native-animatable';
import NetConnection from '../../../../components/NetConnection';

export default class HistoryPayment extends Component {
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
    }

    static contextType = StateContext;

    componentDidMount() {
        this.props.navigation.setOptions({
            title: strings["История оплаты"],
            headerStyle: { backgroundColor: this.globalState.bottomBar ? this.globalState.bottomBar.color_app : ColorApp.main, }
        });

        // this.getHistory();
        this.checkConnection();
    }

    checkConnection = () => {
        constants.NetCheck({ send: this.getHistory, error: () => this.setState({ isNet: false }) });
    }

    getHistory = (np) => {

        this.setState({ isNet: true });

        let params = {};

        if (np) {
            let page = np.split("=");
            page = page[page.length - 1];
            params.page = page;
        }

        Axios.get('user/history', { params })
            .then(res => {
                console.log('getHistory: ', res);
                this.setState({
                    data: res.data.data,
                    dataSource: np ? this.state.dataSource.concat(res.data.data.data) : res.data.data.data,
                    isLoading: false,
                    isRefreshing: false,
                    isSendServer: false
                });
            })
            .catch(e => {
                console.log(e);
                console.log(e.response);
                this.setState({ isRefreshing: false, isSendServer: false });
                constants.onHandlerError(e.response.data, e.response.status, () => this.props.navigation.goBack());
            });
    }

    onRefresh = () => {
        this.setState({ isRefreshing: false });
        this.getHistory();
    }

    onEndReached = () => {
        if (this.state.data.next_page_url) {
            this.setState({ isSendServer: true });
            if (this.state.isSendServer) {
                this.getHistory(this.state.data.next_page_url);
            }
        }
    }


    renderTypePayment = (item) => {
        switch (item.type) {
            case 'kaspi':
                return (
                    <FastImage
                        source={require('../../../../assets/images/Kaspi_logo.png')}
                        style={{ width: 20, height: 20, borderRadius: 4 }}
                    />)

            case 'paypost':
                return (
                    <FastImage
                        source={require('../../../../assets/images/Walletone.png')}
                        style={{ width: 20, height: 20, borderRadius: 4 }}
                    />)

            case 'paybox':
                return (
                    <FastImage
                        source={require('../../../../assets/images/Paybox.png')}
                        style={{ width: 20, height: 20, borderRadius: 4 }}
                    />)

            case 'paypost':
                return (
                    <FastImage
                        source={require('../../../../assets/images/Paypost.png')}
                        style={{ width: 20, height: 20, borderRadius: 4 }}
                    />)

        }
    }


    renderItem = ({ item, index }) => (
        <Animatable.View animation="fadeInUp" useNativeDriver>
            <View style={{ paddingTop: 16, paddingHorizontal: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ flex: 1, marginRight: 24 }}>
                        {
                            item.entity ?
                                <Text style={[setFont(15),]}>{item.entity.title}</Text>
                                :
                                null
                        }
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' }}>
                        <Text style={[setFont(15), { marginRight: 2 }]}>{constants.priceFormat(item.cost)}₸</Text>
                        {
                            item.type == null || item.type == 'local' ?
                                <IconTransfer name="bank-transfer" size={20} color={ColorApp.fade} />
                                :
                                this.renderTypePayment(item)
                        }
                    </View>

                </View>
                <Text style={[setFont(13), { color: ColorApp.fade, marginTop: 4 }]}>{constants.dateFormat(item.created_at)}</Text>
                <View style={{ height: 1, backgroundColor: ColorApp.border, marginTop: 16 }} />
            </View>
        </Animatable.View>
    );

    ListEmptyComponent = () => (
        <NoData />
    );

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
                                ListEmptyComponent={this.ListEmptyComponent}
                                keyExtractor={(item, index) => index + ''}
                                refreshing={isRefreshing}
                                onRefresh={this.onRefresh}
                                onEndReached={this.onEndReached}
                                onEndReachedThreshold={0.01}
                                ListFooterComponent={this.ListFooterComponent}
                            />
                    }
                </View>
            </NetConnection>
        );
    }
}
