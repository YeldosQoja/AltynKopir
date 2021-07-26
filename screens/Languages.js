import Axios from 'axios';
import React, { Component, Fragment } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import Loading from '../components/Loading';
import { constants } from '../constants/Constants';
import { strings } from '../localization/Localization';
import { ColorApp } from '../theme/color/ColorApp';
import { setFont } from '../theme/font/FontApp';
import Icon from 'react-native-vector-icons/Entypo'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StateContext } from '../provider/ProviderApp';
import NoData from '../components/NoData';

export default class Languages extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: [],
            isLoading: true,
            visible: false
        };
    }

    static contextType = StateContext;

    componentDidMount() {
        this.props.navigation.setOptions({
            title: strings['Выберите язык'],
            headerStyle: { backgroundColor: this.globaleState.bottomBar ? this.globaleState.bottomBar.color_app : ColorApp.main, }
        });
        AsyncStorage.getItem("lang")
            .then(res => {
                if (res) {
                    let resJson = JSON.parse(res);
                    this.getLang(resJson.id);
                } else {
                    this.getLang();
                }
            }).catch(() => {
                this.getLang();
            });
    }

    componentDidUpdate() {
        this.props.navigation.setOptions({
            title: strings['Выберите язык']
        });
    }

    getLang = (id = null, selected = false) => {
        const url = selected ? `languages/${id}` : 'languages';
        if (selected) {
            this.setState({ visible: true });
        }
        Axios.get(url)
            .then(res => {
                console.log("getLang", res);

                if (!selected) {
                    res.data.data.forEach(item => {
                        if (id) {
                            if (item.id == id) {
                                item.select = true;
                            } else {
                                item.select = false;
                            }
                        } else {
                            if (item.id == 1) {
                                item.select = true;
                            } else {
                                item.select = false;
                            }
                        }

                    });

                    this.setState({
                        dataSource: res.data.data,
                        isLoading: false
                    });
                }

                if (selected) {
                    strings.setContent({ [res.data.data.code]: res.data.data.locale });
                    this.globaleState.reload();
                    this.setState({ visible: false });
                    AsyncStorage.setItem("LP", JSON.stringify(res.data.data.locale)).catch();
                }

            })
            .catch(e => {
                console.log(e);
                console.log(e.response);
                this.setState({ visible: false });
                constants.onHandlerError(e.response.data, e.response.status);
            });
    }

    selectLang = (item) => {
        console.log(item);
        let copyData = [];

        for (let i = 0; i < this.state.dataSource.length; i++) {
            copyData.push(Object.assign({}, this.state.dataSource[i]));
        }

        for (let i = 0; i < copyData.length; i++) {
            if (item.id == copyData[i].id) {
                copyData[i].select = true;
            } else {
                copyData[i].select = false;
            }
        }

        this.setState({ dataSource: copyData });
        AsyncStorage.setItem("lang", JSON.stringify(item))
            .then(() => {
                strings.setLanguage(item.code);
                Axios.defaults.headers.lang = item.code;
                this.getLang(item.id, true);
            })
            .catch();

    }

    renderItem = ({ item, index }) => (
        <TouchableOpacity
            onPress={() => this.selectLang(item)}
            activeOpacity={0.8}
            style={{ flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 16, }}
        >

            <Text style={[setFont(17), { flex: 1, marginRight: 16 }]}>{item.name}</Text>

            {
                item.select ?
                    <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: ColorApp.main, justifyContent: 'center', alignItems: 'center' }}>
                        <Icon name='check' color='#fff' />
                    </View>
                    :
                    <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#F5F5F5' }} />
            }
            <View style={{ position: 'absolute', bottom: 0, left: 16, right: 0, height: 1, backgroundColor: ColorApp.border }} />

        </TouchableOpacity>
    );

    render() {

        const { dataSource, isLoading, visible } = this.state;

        this.globaleState = this.context;

        return (
            <View style={{ flex: 1, backgroundColor: ColorApp.bg }}>
                {
                    isLoading ?
                        <Loading />
                        :
                        <FlatList
                            data={dataSource}
                            renderItem={this.renderItem}
                            ListEmptyComponent={() => <NoData />}
                            keyExtractor={(item, index) => index + ""}
                        />
                }
                <Modal
                    visible={visible}
                    animationType="fade"
                    transparent
                >
                    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: "center", alignItems: "center" }}>
                        <ActivityIndicator color={'#fff'} />
                    </View>
                </Modal>
            </View>
        );
    }
}
