import React, { Component } from 'react';
import { Alert, Dimensions, Modal, TouchableOpacity } from 'react-native';
import { View, Text, ScrollView } from 'react-native';
import FastImage from 'react-native-fast-image';
import Requisites from '../components/Requisites';
import { strings } from '../localization/Localization';
import { ColorApp } from '../theme/color/ColorApp';
import { setFont } from '../theme/font/FontApp';
import ImagePicker from "react-native-image-picker";
import Clipboard from '@react-native-community/clipboard';
import { ButtonApp } from '../components/ButtonApp';
import Icon from 'react-native-vector-icons/Feather';
import { StateContext } from '../provider/ProviderApp';
import Axios from 'axios';
import { constants } from '../constants/Constants';
import Loading from '../components/Loading';
import HTMLRENDER from 'react-native-render-html';
import NetConnection from '../components/NetConnection';

const { width } = Dimensions.get("screen");

const OPTIONS = {
    title: null,
    cancelButtonTitle: null,
    takePhotoButtonTitle: null,
    chooseFromLibraryButtonTitle: null,
    chooseWhichLibraryTitle: null,
    storageOptions: {
        skipBackup: true,
        quality: 0.2,
        path: 'images',
        mediaType: 'photo'
    },
};

export default class Kaspi extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: {},
            selectImage: false,
            check: null,
            visible: false,
            text: "",
            isLoading: true,
            isLoadingBtn: false,
            disabled: false,
            isNet: true
        };

        this.kaspi = props.route.params.kaspi;

        console.log("kaspi", this.kaspi);
    }

    static contextType = StateContext;

    componentDidMount() {
        this.props.navigation.setOptions({
            title: strings['Kaspi перевод'],
            headerStyle: {
                backgroundColor: this.globalState.bottomBar ? this.globalState.bottomBar.color_app : ColorApp.main
            }
        });

        // this.getKaspi();
        this.checkConnection();

        // console.log(strings);
    }

    componentWillUnmount() {
        if (this.CancelToken) {
            console.log("CANCEL KASPI CHECK");
            this.CancelToken.cancel();
        }
    }

    checkConnection = () => {
        constants.NetCheck({ send: this.getKaspi, error: () => this.setState({ isNet: false }) });
    }


    getKaspi = () => {

        this.setState({ isNet: true });

        let params = { json: true };

        if (this.kaspi.isPromocode) {
            params.promocode = this.kaspi.promocode;
        }

        Axios.get(`payments/${this.kaspi.id}/selected_type/${this.kaspi.types}`, { params: params })
            .then(res => {
                console.log("getKaspi", res);
                this.setState({
                    dataSource: res.data,
                    isLoading: false
                });
            })
            .catch(e => {
                console.log(e);
                console.log(e.response);
                constants.onHandlerError(e.response.data, e.response.status, () => this.props.navigation.goBack(), null);
            });
    }

    sendCheque = () => {

        if (this.state.selectImage) {
            this.setState({ isLoadingBtn: true, disabled: true });

            const formData = new FormData();

            formData.append("check_file", this.state.check);
            formData.append("type", this.kaspi.types);

            this.CancelToken = Axios.CancelToken.source();

            Axios.post(`subscribes/upload_check/${this.kaspi.id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                cancelToken: this.CancelToken.token
            })
                .then(res => {
                    console.log("sendCheque", res);

                    if (res.data.data.hasOwnProperty("id")) {
                        Alert.alert(strings['Внимание!'], strings["Ваш чек находится на проверке"], [
                            {
                                text: "OK",
                                onPress: () => this.props.navigation.navigate("TabNavigator", { screen: "Tab1Navigator", params: { screen: "Tab1" } })
                            }
                        ]);
                    } else {
                        Alert.alert(strings['Внимание!'], strings['Что-то пошло не так']);
                    }

                    this.setState({
                        isLoadingBtn: false,
                        disabled: false
                    });

                })
                .catch(e => {

                    if (Axios.isCancel(e)) {
                        this.setState({ isLoadingBtn: false, disabled: false });
                    }
                    else {
                        console.log(e);
                        console.log(e.response);
                        this.setState({ isLoadingBtn: false, disabled: false });
                        constants.noInternet(e);
                        constants.onHandlerError(e.response.data, e.response.status);
                    }

                });
        }
    }

    showCopy = () => {
        this.setState({ visible: true });
    }

    hideCopy = () => {
        this.setState({ visible: false });
    }

    copyData = (index) => {
        switch (index) {
            case 1:
                Clipboard.setString(this.state.dataSource.card_number);
                this.setState({ text: `${strings["Номер карты"]} ${strings.скопировано}` });
                this.showCopy();
                break;
            case 2:
                Clipboard.setString(this.state.dataSource.phone);
                this.setState({ text: `${strings["Номер телефона"]} ${strings.скопировано}` });
                this.showCopy();
                break;
            case 3:
                Clipboard.setString(this.state.dataSource.iin);
                this.setState({ text: `${strings.ИИН} ${strings.скопировано}` });
                this.showCopy();
                break;
            case 4:
                Clipboard.setString(this.state.dataSource.fio);
                this.setState({ text: `${strings.ФИО} ${strings.скопировано}` });
                this.showCopy();
                break;
        }

    }


    selectImage = () => {
        ImagePicker.launchImageLibrary(OPTIONS, (response) => {
            console.log('Response = ', response);

            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            } else {
                let name = response.uri.split('/');
                name = name[name.length - 1];
                const source = {
                    uri: response.uri,
                    type: response.type,
                    name: name,
                };

                // You can also display the image using data:
                // const source = { uri: 'data:image/jpeg;base64,' + response.data };

                this.setState({
                    check: source,
                    selectImage: true
                });
            }
        });
    }

    render() {

        const { isNet, visible, isLoading, isLoadingBtn, disabled } = this.state;

        this.globalState = this.context;

        return (
            <NetConnection isNet={isNet} onpress={this.checkConnection}>
                <View style={{ flex: 1, backgroundColor: ColorApp.bg }}>
                    {
                        isLoading ?
                            <Loading />
                            :
                            <ScrollView>
                                <HTMLRENDER
                                    html={`${constants.wordLocalization('Переведите :sum по реквизитам указанный ниже и прикрепите чек.', { sum: `<span style='color:#007AFF'>${constants.priceFormat(this.state.dataSource.price)}₸</span>` })}`}
                                    baseFontStyle={{ fontSize: 17 }}
                                    imagesMaxWidth={width - 32}
                                    tagsStyles={{ img: { marginVertical: 5 }, iframe: { height: 200, borderRadius: 10, backgroundColor: ColorApp.transparent } }}
                                    staticContentMaxWidth={width - 32}
                                    ignoredStyles={['display', 'font-family', 'font-weight', 'padding', 'margin', 'text-align']}
                                    alterChildren={node => {
                                        if (node.name === "iframe" || node.name === "img") {
                                            delete node.attribs.width;
                                            delete node.attribs.height;
                                        }
                                        return node.children;
                                    }}
                                    onLinkPress={(ev, href, htmlAttribs) => { Linking.openURL(href); console.log(ev) }}
                                    containerStyle={{ margin: 16 }}
                                />


                                <FastImage
                                    source={require("../assets/images/kaspi.png")}
                                    style={{ width: width - 32, height: 224, alignSelf: "center", borderRadius: 10 }}
                                >
                                    <View style={{ flex: 1, justifyContent: "flex-end" }}>
                                        <View style={{ marginLeft: 32 }}>
                                            <Text style={[setFont(28), { color: '#fff', marginBottom: 27 }]}>{this.state.dataSource.card_number}</Text>
                                            <Text numberOfLines={1} style={[setFont(18), { color: "#fff", textTransform: "uppercase", marginBottom: 32, marginRight: 90 }]}>{this.state.dataSource.card_name}</Text>
                                        </View>
                                    </View>
                                </FastImage>

                                <Requisites
                                    onpress={() => this.copyData(1)}
                                    label={strings["Номер карты"]}
                                    text={this.state.dataSource.card_number}
                                />

                                <Requisites
                                    onpress={() => this.copyData(2)}
                                    label={strings["Номер телефона"]}
                                    text={this.state.dataSource.phone}
                                />

                                <Requisites
                                    onpress={() => this.copyData(3)}
                                    label={strings.ИИН}
                                    text={this.state.dataSource.iin}
                                />

                                <Requisites
                                    onpress={() => this.copyData(4)}
                                    label={strings.ФИО}
                                    text={this.state.dataSource.fio}
                                />

                                <TouchableOpacity
                                    onPress={this.selectImage}
                                    activeOpacity={0.8}
                                    style={{
                                        borderTopWidth: 0.5, borderTopColor: ColorApp.border, borderBottomWidth: 0.5, borderBottomColor: ColorApp.border, marginTop: 40,
                                        paddingVertical: 20, paddingHorizontal: 16, flexDirection: "row", alignItems: "center"
                                    }}
                                >
                                    <Text style={[setFont(17)]}>{strings["Прикрепите чек"]}</Text>
                                    {
                                        this.state.selectImage ?
                                            <View style={{ flex: 1, alignItems: "flex-end" }}>
                                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                    <View style={{ borderWidth: 1, borderColor: "rgba(172, 180, 190, 0.08)", borderRadius: 4 }}>
                                                        <FastImage
                                                            source={this.state.check}
                                                            style={{ width: 48, height: 48, borderRadius: 4, }}
                                                        />
                                                    </View>


                                                    <TouchableOpacity
                                                        onPress={() => this.setState({ selectImage: false, check: null })}
                                                        activeOpacity={0.8}
                                                        style={{ marginLeft: 16, width: 48, height: 48, justifyContent: "center", alignItems: "center" }}
                                                    >
                                                        <FastImage
                                                            source={require("../assets/images/delete.png")}
                                                            style={{ width: 24, height: 24 }}
                                                        />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                            :
                                            <View style={{ flex: 1, alignItems: "flex-end" }}>
                                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                    <Text style={[setFont(13), { color: ColorApp.fade, textAlign: "right" }]}>{strings["Загрузите чек"]}</Text>
                                                    <FastImage
                                                        source={require("../assets/images/next.png")}
                                                        style={{ width: 24, height: 24 }}
                                                    />
                                                </View>
                                            </View>
                                    }
                                </TouchableOpacity>

                                <ButtonApp
                                    onPress={this.sendCheque}
                                    style={{ marginHorizontal: 16, marginVertical: 24, }}
                                    text={strings["Подтвердить оплату"]}
                                    isLoading={isLoadingBtn}
                                    disabled={disabled}
                                />

                                <Modal
                                    visible={visible}
                                    animationType="fade"
                                    transparent
                                    onShow={() => setTimeout(() => this.hideCopy(), 500)}
                                >
                                    <TouchableOpacity
                                        activeOpacity={1}
                                        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.2)", justifyContent: "center" }}>
                                        <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingLeft: 20, paddingRight: 16, backgroundColor: "#fff", marginHorizontal: 16, borderRadius: 8 }}>
                                            <Icon name="check" color={ColorApp.action} size={24} />
                                            <Text style={[setFont(17, "600"), { marginLeft: 10 }]}>{this.state.text}</Text>
                                        </View>
                                    </TouchableOpacity>
                                </Modal>

                            </ScrollView>
                    }
                </View>
            </NetConnection>
        );
    }
}
