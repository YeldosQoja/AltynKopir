import Axios from 'axios';
import React, { Component } from 'react';
import { View, Text, ScrollView, Linking } from 'react-native';
import Loading from '../../../components/Loading';
import { constants } from '../../../constants/Constants';
import { ColorApp } from '../../../theme/color/ColorApp';
import HTMLRENDER from 'react-native-render-html';
import { Dimensions } from 'react-native';
import { setFont } from '../../../theme/font/FontApp';
import FastImage from 'react-native-fast-image';
import { strings } from '../../../localization/Localization';
import { StateContext } from '../../../provider/ProviderApp';
import NetConnection from '../../../components/NetConnection';

const { width } = Dimensions.get('screen');

export default class NewsOpen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: {},
            isLoading: true,
            isNet: true
        };

        this.itemNews = props.route.params.itemNews;
    }

    static contextType = StateContext;

    componentDidMount() {
        this.props.navigation.setOptions({ title: strings.Новость, headerStyle: { backgroundColor: this.globalState.bottomBar ? this.globalState.bottomBar.color_app : ColorApp.main, } });
        // this.getNewsOpen();
        this.checkConnection();
    }

    checkConnection = () => {
        constants.NetCheck({ send: this.getNewsOpen, error: () => this.setState({ isNet: false }) });
    }

    getNewsOpen = () => {

        this.setState({ isNet: true });

        Axios.get(`news/${this.itemNews.id}`)
            .then(res => {
                console.log('getNewsOpen', res);

                this.setState({
                    dataSource: res.data.data,
                    isLoading: false
                });
            })
            .catch(e => {
                console.log(e);
                console.log(e.response);
                constants.onHandlerError(e.response, data, e.response.status);
            });
    }

    render() {

        const { isNet, dataSource, isLoading } = this.state;

        this.globalState = this.context;

        return (
            <NetConnection isNet={isNet} onPress={this.checkConnection}>
                <View style={{ flex: 1, backgroundColor: ColorApp.bg }}>
                    {
                        isLoading ?
                            <Loading />
                            :
                            <ScrollView style={{ padding: 16 }}>

                                <Text style={[setFont(28, 'bold'), { textAlign: "center", marginBottom: 8 }]}>{dataSource.title}</Text>
                                <Text style={[setFont(15), { color: ColorApp.fade, textAlign: "center", marginBottom: 8 }]}>{constants.dateFormat(dataSource.updated_at)}</Text>

                                <FastImage
                                    source={{ uri: dataSource.poster, priority: FastImage.priority.high }}
                                    style={{ width: "100%", height: 200, borderRadius: 12, marginBottom: 16 }}
                                />

                                {
                                    dataSource.short_description ?
                                        <HTMLRENDER
                                            html={dataSource.short_description}
                                            baseFontStyle={{ fontSize: 17 }}
                                            imagesMaxWidth={width - 32}
                                            tagsStyles={{ img: { marginVertical: 5 }, iframe: { height: 200 } }}
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

                            </ScrollView>
                    }
                </View>
            </NetConnection>
        );
    }
}
