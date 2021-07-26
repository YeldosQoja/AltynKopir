import React, { Component } from 'react';
import { View, Text, ScrollView, Easing, TextInput, KeyboardAvoidingView, Platform, Dimensions, Alert, Keyboard } from 'react-native';
import { ColorApp } from '../theme/color/ColorApp';
import Rating from 'react-native-rating';
import { strings } from '../localization/Localization';
import { setFont } from '../theme/font/FontApp';
import { ButtonApp } from '../components/ButtonApp';
import { set } from 'react-native-reanimated';
import Axios from 'axios';
import { constants } from '../constants/Constants';
import { StateContext } from '../provider/ProviderApp';

const images = {
    starFilled: require('../assets/images/bigstar.png'),
    starUnfilled: require('../assets/images/bigunstar.png')
};


const { height } = Dimensions.get("screen");

export default class WriteReview extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rating: 0,
            text: "",
            textFocus: false,
            isLoadingBtn: false,
            disabled: false
        };
        this.courseId = props.route.params.finishCourseId;
    }

    static contextType = StateContext;

    componentDidMount() {
        this.props.navigation.setOptions({ title: strings['Оставить отзыв'], headerStyle: { backgroundColor: this.globalState.bottomBar ? this.globalState.bottomBar.color_app : ColorApp.main, } })
    }

    sendReview = () => {

        Keyboard.dismiss();

        let params = {};

        if (this.state.rating != 0) {
            params.stars = this.state.rating;
        }

        if (this.state.text.length > 0) {
            params.text = this.state.text;
        }

        this.setState({ isLoadingBtn: true, disabled: true });

        Axios.get(`course/${this.courseId}/rate`, { params: params })
            .then(res => {
                console.log("sendReview", res);

                this.setState({
                    isLoadingBtn: false,
                    disabled: false
                });

                Alert.alert(strings['Внимание!'], strings['Отзыв отправлено'], [{ text: "OK", onPress: () => this.props.navigation.goBack() }]);
            })
            .catch(e => {
                console.log(e);
                console.log(e.response);
                this.setState({ isLoadingBtn: false, disabled: false });
                constants.noInternet(e);
                constants.onHandlerError(e.response.data, e.response.status);
            });
    }

    render() {
        const { rating, textFocus, isLoadingBtn, disabled } = this.state;

        this.globalState = this.context;

        return (
            <KeyboardAvoidingView style={{ flex: 1, backgroundColor: ColorApp.bg }} contentContainerStyle={{ flex: 1 }} behavior={Platform.OS == "ios" ? "height" : null} keyboardVerticalOffset={70}>
                <ScrollView
                    style={{ padding: 16, paddingTop: 24 }}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={{ alignItems: "center", borderBottomWidth: 0.5, borderBottomColor: "#e5e5e5", paddingBottom: 26, marginBottom: 16 }}>
                        <Rating
                            max={5}
                            initial={rating}
                            onChange={rating => this.setState({ rating })}
                            selectedStar={images.starFilled}
                            unselectedStar={images.starUnfilled}
                            config={{
                                easing: Easing.inOut(Easing.ease),
                                duration: 350
                            }}
                            editable={true}
                            stagger={80}
                            maxScale={1.4}
                            starStyle={{
                                width: 40,
                                height: 40,
                                marginHorizontal: 12
                            }}
                        />
                    </View>

                    <TextInput
                        placeholder={strings['Ваш отзыв']}
                        placeholderTextColor={ColorApp.placeholder}
                        multiline
                        underlineColorAndroid={ColorApp.transparent}
                        onChangeText={text => this.setState({ text })}
                        style={[setFont(17, "normal", "#000", null), { maxHeight: textFocus ? height / 3.2 : null, marginBottom: textFocus ? 0 : 200 }]}
                        onFocus={() => this.setState({ textFocus: true })}
                        onBlur={() => this.setState({ textFocus: false })}
                    />

                </ScrollView>

                <ButtonApp
                    onPress={this.sendReview}
                    isLoading={isLoadingBtn}
                    disabled={disabled}
                    text={strings['Оставить отзыв']}
                    style={{ position: "absolute", bottom: 32, left: 16, right: 16 }}
                />
            </KeyboardAvoidingView>
        );
    }
}
