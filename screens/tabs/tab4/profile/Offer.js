import React, { Component, Fragment } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { setFont } from '../../../../theme/font/FontApp';
import HTMLRENDER from 'react-native-render-html'
import { Dimensions } from 'react-native';
import { Linking } from 'react-native';
import { ColorApp } from '../../../../theme/color/ColorApp';
import { strings } from '../../../../localization/Localization';
import Axios from 'axios';
import { constants } from '../../../../constants/Constants';
import Loading from '../../../../components/Loading';
import { StateContext } from '../../../../provider/ProviderApp';
import NoData from '../../../../components/NoData';
import NetConnection from '../../../../components/NetConnection';

const { width } = Dimensions.get('screen');

export default class Offer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: {},
            isLoading: true,
            isNet: true
        };
    }

    static contextType = StateContext;

    componentDidMount() {
        this.props.navigation.setOptions({
            title: strings["Правила и соглашения"],
            headerStyle: { backgroundColor: this.globalState.bottomBar.color_app, }
        });

        // this.getPage();
        this.checkConnection();
    }

    checkConnection = () => {
        constants.NetCheck({ send: this.getPage, error: () => this.setState({ isNet: false }) });
    }

    getPage = () => {

        this.setState({ isNet: true });

        Axios.get(`pages/3`)
            .then(res => {
                console.log("getPage", res);

                this.setState({
                    dataSource: res.data.data,
                    isLoading: false
                });

            })
            .catch(e => {
                console.log(e);
                console.log(e.response);
                constants.onHandlerError(e.response.data, e.response.status, () => this.props.navigation.goBack());
            });
    }

    render() {

        const { isNet, dataSource, isLoading } = this.state;

        this.globalState = this.context;

        return (
            <NetConnection isNet={isNet} onPress={this.checkConnection}>
                <ScrollView style={{ backgroundColor: ColorApp.bg, padding: 16 }}>

                    {
                        isLoading ?
                            <Loading />
                            :
                            <Fragment>

                                {
                                    dataSource.title ?
                                        <Text style={[setFont(20, 'bold'), { marginBottom: 16 }]}>{dataSource.title}</Text>
                                        :
                                        null
                                }

                                {
                                    dataSource.description ?
                                        <HTMLRENDER
                                            html={dataSource.description}
                                            baseFontStyle={{ fontSize: 15 }}
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
                                        <NoData />
                                }


                            </Fragment>
                    }

                </ScrollView>
            </NetConnection>
        );
    }
}
