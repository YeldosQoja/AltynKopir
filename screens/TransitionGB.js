import Axios from 'axios';
import React, { Component } from 'react';
import { View, Text, Linking, AppState } from 'react-native';
import WebView from 'react-native-webview';
import Loading from '../components/Loading';
import NetConnection from '../components/NetConnection';
import { constants } from '../constants/Constants';
import { StateContext } from '../provider/ProviderApp';
import { ColorApp } from '../theme/color/ColorApp';

export default class TransitionGB extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: {},
            isLoading: true,
            isUrl: false,
            isNet: true
        };
        this.gb = props.route.params.gb;
        console.log(this.gb);
    }

    static contextType = StateContext;

    componentDidMount() {
        this.props.navigation.setOptions({
            title: null,
            headerStyle: {
                backgroundColor: this.globalState.bottomBar ? this.globalState.bottomBar.color_app : ColorApp.main
            }
        });

        if (this.gb.types == 'cloudpayments') {
            AppState.addEventListener('change', this.handleBackNavigation);
        }

        // this.getGB();
        this.checkConnection();
    }

    componentWillUnmount() {
        AppState.removeEventListener('change', this.handleBackNavigation);
    }

    handleBackNavigation = (nextAppState) => {
        console.log('handleBackNavigation', nextAppState);
        if (nextAppState == 'active') {
            this.props.navigation.goBack();
        }
    }

    checkConnection = () => {
        constants.NetCheck({ send: this.getGB, error: () => this.setState({ isNet: false }) });
    }

    getGB = () => {

        this.setState({ isNet: true });

        let params = null;

        if (this.gb.isPromocode) {
            params = {};
            params.promocode = this.gb.promocode;
        }

        Axios.get(`payments/${this.gb.id}/selected_type/${this.gb.types}`, { params })
            .then(res => {
                console.log("getGB", res);

                if (this.gb.types == 'paybox') {

                    this.setState({
                        dataSource: res.request.responseURL,
                        isUrl: true,
                        isLoading: false
                    });
                } else if (this.gb.types == 'cloudpayments') {
                    console.log("cloudpayments", res);
                    Linking.openURL(res.request.responseURL);
                }
                else {
                    this.setState({
                        dataSource: res.data,
                        isUrl: false,
                        isLoading: false
                    });
                }
            })
            .catch(e => {
                console.log(e);
                console.log(e.response);
                constants.onHandlerError(e.response.data, e.response.status, () => this.props.navigation.goBack(), null);
            });
    }

    render() {

        const { isNet, dataSource, isLoading, isUrl } = this.state;

        this.globalState = this.context;

        return (
            <NetConnection isNet={isNet} onPress={this.checkConnection}>
                <View style={{ flex: 1, backgroundColor: ColorApp.bg }}>
                    {
                        isLoading ?
                            <Loading />
                            :
                            <WebView
                                source={isUrl ? { uri: dataSource } : { html: dataSource }}
                                startInLoadingState
                                javaScriptEnabled
                                showsVerticalScrollIndicator={false}
                            />
                    }
                </View>
            </NetConnection>
        );
    }
}
