import Axios from 'axios';
import React, { Component, Fragment } from 'react';
import { View, Text, TextInput, Alert } from 'react-native';
import FastImage from 'react-native-fast-image';
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view';
import { ButtonApp } from '../components/ButtonApp';
import InputContainer from '../components/InputContainer';
import Loading from '../components/Loading';
import NetConnection from '../components/NetConnection';
import RowButton from '../components/RowButton';
import { constants } from '../constants/Constants';
import { strings } from '../localization/Localization';
import { StateContext } from '../provider/ProviderApp';
import { ColorApp } from '../theme/color/ColorApp';
import { setFont } from '../theme/font/FontApp';

export default class GB extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {},
            dataSource: [],
            promocode: {},
            isLoading: true,
            promocodeText: "",
            isPromocode: false,
            isLoadingBtn: false,
            disabled: false,
            isNet: true
        };
        this.course = props.route.params.course;
    }

    static contextType = StateContext;

    componentDidMount() {
        console.log("this.course", this.course);
        this.props.navigation.setOptions({
            title: strings.Купить, headerStyle: {
                backgroundColor: this.globalState.bottomBar ? this.globalState.bottomBar.color_app : ColorApp.main
            }
        })
        // this.getGO();
        this.checkConnection();
    }

    checkConnection = () => {
        constants.NetCheck({ send: this.getGO, error: () => this.setState({ isNet: false }) });
    }

    getGO = () => {

        this.setState({ isNet: true });

        Axios.get(`subscribes/${this.course.isCourseOrTest}/${this.course.id}/subscribe`)
            .then(res => {
                console.log("getGO", res);


                if (res.data.data.hasOwnProperty("message")) {
                    let k = res.data.data.message;
                    k = Object.values(k);
                    Alert.alert(strings['Внимание!'], k[0], [{ text: "OK", onPress: () => this.props.navigation.goBack() }]);

                } else {
                    let values = [];


                    for (let i in res.data.data.types) {
                        console.log(i);
                        res.data.data.types[i].types = i;
                        res.data.data.types[i].id = res.data.data.id;
                        values.push(res.data.data.types[i]);
                    }

                    console.log("values", values);


                    this.setState({
                        data: res.data.data,
                        dataSource: values,
                        isLoading: false
                    });
                }

            })
            .catch(e => {
                console.log(e);
                console.log(e.response);
                constants.onHandlerError(e.response.data, e.response.status, () => this.props.navigation.goBack());
            });
    }

    getPromocode = () => {
        if (this.state.promocodeText.length > 0) {
            this.setState({ isLoadingBtn: true, disabled: true });
            Axios.get("promocodes", {
                params: {
                    promocode: this.state.promocodeText,
                    id: this.state.data.id
                }
            })
                .then(res => {
                    console.log("getPromocode", res);

                    this.setState({
                        isLoadingBtn: false,
                        disabled: false,
                        promocode: res.data.data,
                        isPromocode: true
                    }, () => {
                        setTimeout(() => this.flRef.scrollToEnd(), 100);
                    });

                })
                .catch(e => {
                    console.log(e);
                    console.log(e.response);
                    this.setState({ isLoadingBtn: false, disabled: false });
                    constants.noInternet(e);
                    constants.onHandlerError(e.response.data, e.response.status);
                });
        }
    }


    onNavigation = (item) => {
        console.log("onNavigation", item);

        if (this.state.isPromocode) {
            item.isPromocode = true;
            item.promocode = this.state.promocodeText;
        }

        if (item.types == 'kaspi') {
            this.props.navigation.navigate("Kaspi", { kaspi: item });
        } else {
            this.props.navigation.navigate("TransitionGB", { gb: item });
        }
    }


    ListHeaderComponent = () => (
        <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 16, paddingLeft: 16, paddingRight: 8 }}>

            <FastImage
                source={{ uri: this.course.poster, priority: FastImage.priority.high }}
                style={{ width: 60, height: 60, borderRadius: 10 }}
                resizeMode={FastImage.resizeMode.contain}
            />

            <View style={{ flex: 1, marginLeft: 8 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <Text style={[setFont(10, "500", ColorApp.action)]}>{this.course.isCourseOrTest == "course" ? this.course.category_name : this.course.category.name}</Text>
                    {
                        this.course.isCourseOrTest == "course" ?
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <FastImage
                                    source={require("../assets/images/star.png")}
                                    style={{ width: 14, height: 14 }}
                                />
                                <Text style={[setFont(10, "500"), { marginHorizontal: 2 }]}>{this.course.reviews_stars}</Text>
                                <Text style={[setFont(10), { marginHorizontal: 2 }]}>({this.course.reviews_count})</Text>
                            </View>
                            :
                            null
                    }

                </View>

                <Text numberOfLines={1} style={[setFont(15, "600"), { marginTop: 2 }]}>{this.course.title}</Text>
                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                    <Text style={[setFont(13, "600", ColorApp.main)]}>{constants.priceFormat(this.course.price)}₸</Text>
                    {
                        this.course.old_price ?
                            <Text style={[setFont(13), { color: ColorApp.fade, marginLeft: 4, textDecorationColor: ColorApp.fade, textDecorationLine: "line-through" }]}>{constants.priceFormat(this.course.old_price)}₸</Text>
                            :
                            null
                    }
                </View>
            </View>

            <View style={{ position: "absolute", left: 88, right: 0, bottom: 0, height: 0.5, backgroundColor: ColorApp.border }} />
        </View>
    );

    renderItem = ({ item, index }) => (
        <Fragment>
            {
                index == 0 ?
                    <Text style={[setFont(20, "bold"), { marginHorizontal: 16 }]}>{strings["Выберите тип оплаты"]}</Text>
                    :
                    null
            }
            <RowButton
                iconLeft={{ uri: item.logo, priority: FastImage.priority.high }}
                iconLeftStyle={{ width: 32, height: 32, borderRadius: 4 }}
                text={item.title}
                iconRight={require("../assets/images/next.png")}
                onPress={() => this.onNavigation(item)}
            />
        </Fragment>
    );

    ListFooterComponent = () => (
        <View style={{ borderTopWidth: 0.5, borderTopColor: ColorApp.border, marginTop: 16 }}>
            <InputContainer style={{ marginHorizontal: 16, marginTop: 16, marginBottom: 24 }}>
                <TextInput
                    placeholder={strings["Введите промокод"]}
                    placeholderTextColor={ColorApp.placeholder}
                    style={[setFont(17, "normal", "#000", null, "input"), { paddingVertical: 0 }]}
                    underlineColorAndroid={ColorApp.transparent}
                    onChangeText={promocodeText => this.setState({ promocodeText })}
                />
            </InputContainer>

            <ButtonApp
                onPress={this.getPromocode}
                text={strings['Проверить промокод']}
                style={{ marginHorizontal: 16, marginBottom: 20 }}
                isLoading={this.state.isLoadingBtn}
                disabled={this.state.disabled}
            />

            {
                this.state.isPromocode ?
                    <View style={{ marginBottom: 20 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", marginHorizontal: 16, marginBottom: 16 }}>
                            <Text style={[setFont(28, "bold")]}>{strings.Итого}</Text>
                            <Text style={[setFont(28, "bold", ColorApp.main), { flex: 1, textAlign: "right", marginLeft: 12 }]}>{constants.priceFormat(this.state.promocode.total)}₸</Text>
                        </View>

                        <View style={{ flexDirection: "row", alignItems: "center", marginHorizontal: 16 }}>
                            <Text style={[setFont(17), { color: ColorApp.fade }]}>{strings.Стоимость}</Text>
                            <Text style={[setFont(17), { flex: 1, textAlign: "right", marginLeft: 12 }]}>{constants.priceFormat(this.state.promocode.price)}₸</Text>
                        </View>

                        <View style={{ flexDirection: "row", alignItems: "center", marginHorizontal: 16, marginTop: 8 }}>
                            <Text style={[setFont(17), { color: ColorApp.fade }]}>{strings["Скидка"]} {this.state.promocode.discount}%</Text>
                            <Text style={[setFont(17), { flex: 1, textAlign: "right", marginLeft: 12 }]}>{constants.priceFormat(this.state.promocode.total)}₸</Text>
                        </View>

                        <View style={{ flexDirection: "row", alignItems: "center", marginHorizontal: 16, marginTop: 8 }}>
                            <Text style={[setFont(17), { color: ColorApp.fade }]}>{strings.Промокод}</Text>
                            <Text style={[setFont(17), { flex: 1, textAlign: "right", marginLeft: 12 }]}>{constants.priceFormat(this.state.promocode.promocode_price)}₸</Text>
                        </View>
                    </View>
                    :
                    null
            }

        </View>
    );

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
                            <KeyboardAwareFlatList
                                ref={ref => this.flRef = ref}
                                data={dataSource}
                                ListHeaderComponent={this.ListHeaderComponent}
                                ListHeaderComponentStyle={{ marginBottom: 24 }}
                                renderItem={this.renderItem}
                                ListFooterComponent={this.ListFooterComponent}
                                keyExtractor={(item, index) => index + ""}
                            />
                    }
                </View>
            </NetConnection>
        );
    }
}
