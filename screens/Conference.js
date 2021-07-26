import React, { Component } from 'react';
import { View } from 'react-native';
import { ColorApp } from '../theme/color/ColorApp';
import { WebView } from 'react-native-webview';
import Loading from '../components/Loading';
import Axios from 'axios';

export default class Conference extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: {},
            isLoading: true
        };
    }

    componentDidMount() {
        this.props.navigation.setOptions({ title: "", headerStyle: { backgroundColor: ColorApp.main } });

        this.getData();
    }

    getData = () => {
        Axios.get("modules/conference/2/iframe")
            .then(res => {
                console.log("Conference", res);

                this.setState({
                    dataSource: res.data.data,
                    isLoading: false
                })
            })
            .catch(e => console.log("catch", e.response));
    }

    render() {

        const { isLoading, dataSource } = this.state;

        return (
            <View style={{ flex: 1, backgroundColor: ColorApp.bg }}>
                {
                    isLoading ?
                        <Loading />
                        :
                        <WebView
                            source={{ html: dataSource }}
                        />
                }
            </View>
        );
    }
}
