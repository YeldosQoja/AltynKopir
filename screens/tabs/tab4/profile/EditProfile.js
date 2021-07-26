import React, { Component } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import FastImage from 'react-native-fast-image';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { TextInputMask } from 'react-native-masked-text';
import { ButtonApp } from '../../../../components/ButtonApp';
import { ColorApp } from '../../../../theme/color/ColorApp';
import { setFont } from '../../../../theme/font/FontApp';
import ImagePicker from 'react-native-image-picker';
import { strings } from '../../../../localization/Localization';
import Axios from 'axios';
import { constants } from '../../../../constants/Constants';
import { Alert } from 'react-native';
import { StateContext } from '../../../../provider/ProviderApp';

export default class EditProfile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            avatar: {},
            name: '',
            phone: '',
            email: '',
            nameFocus: false,
            phoneFocus: false,
            emailFocus: false,
            edit: false,
            disabled: true,
            isLoadingBtn: false,
            isSelectImage: false
        };
        this.userData = props.route.params.userData;
    }

    static contextType = StateContext;

    componentDidMount() {
        this.props.navigation.setOptions({
            title: strings.headerTitleEditProfile,
            headerStyle: { backgroundColor: this.globalState.bottomBar ? this.globalState.bottomBar.color_app : ColorApp.main, }
        });
        this.setState({
            avatar: {
                uri: this.userData.avatar
            },
            name: this.userData.name,
            phone: this.userData.phone,
            email: this.userData.email
        });
    }


    componentWillUnmount() {
        if (this.CancelToken) {
            this.CancelToken.cancel();
        }
    }

    getUpdate = () => {

        this.setState({ isLoadingBtn: true, disabled: true });

        const formData = new FormData();
        if (this.userData.name != this.state.name) {
            formData.append('name', this.state.name);
        }
        if (this.userData.phone != this.state.phone) {
            formData.append('phone', this.state.phone);

        }
        if (this.userData.email != this.state.email) {
            formData.append('email', this.state.email);
        }

        if (this.state.isSelectImage) {
            formData.append('avatar', {
                uri: this.state.avatar.uri,
                type: this.state.avatar.type,
                name: this.state.avatar.name
            });
        }

        this.CancelToken = Axios.CancelToken.source();

        Axios.post('user/update', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            cancelToken: this.CancelToken.token
        })
            .then(res => {
                console.log('getUpdate:', res);
                this.setState({
                    isLoadingBtn: false,
                    disabled: true,
                    isSelectImage: false
                });

                Alert.alert(
                    strings["Внимание!"],
                    strings['Данные изменины'],
                    [{
                        text: "OK",
                        onPress: () => this.props.navigation.navigate("Profile", { reload: true })
                    }]
                );
            })
            .catch(e => {
                if (Axios.isCancel(e)) {
                    this.setState({ isLoadingBtn: false, disabled: false });
                } else {
                    console.log(e);
                    console.log(e.response);
                    this.setState({ isLoadingBtn: false, disabled: false });
                    constants.noInternet(e);
                    constants.onHandlerError(e.response.data, e.response.status);
                }
            });
    }


    selectImage = () => {
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
                    avatar: source,
                    isSelectImage: true,
                    disabled: false
                });
            }
        });
    }

    render() {

        const { name, phone, email, edit, disabled, isLoadingBtn, avatar, isSelectImage } = this.state;

        this.globalState = this.context;

        return (
            <KeyboardAwareScrollView
                style={{ backgroundColor: ColorApp.bg, padding: 16 }}
                showsVerticalScrollIndicator={false}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
                    <TouchableOpacity
                        onPress={this.selectImage}
                        activeOpacity={0.8}
                    >
                        <FastImage
                            source={avatar}
                            style={{ width: 56, height: 56, borderRadius: 28 }}
                        />
                    </TouchableOpacity>

                    <TextInput
                        placeholder={strings.ФИО}
                        placeholderTextColor={ColorApp.placeholder}
                        style={[styles.input, { marginLeft: 16 }, setFont(17, 'normal', '#000', null, 'input')]}
                        underlineColorAndroid={ColorApp.transparent}
                        onChangeText={name => this.setState({ name })}
                        value={name}
                        onEndEditing={() => this.setState({
                            edit: name.length > 0 && name !== this.userData.name ? true : false,
                            disabled: this.state.isSelectImage || name.length > 0 && name !== this.userData.name ? false : true,
                        })}
                    />
                </View>

                <View style={{ marginBottom: 24 }}>
                    <Text style={[setFont(13), { color: ColorApp.fade, marginBottom: 8 }]}>{strings["Номер телефона"]}</Text>
                    <TextInputMask
                        type='custom'
                        options={{ mask: '+9(999) 999-99-99' }}
                        placeholder='+7(777) 777-77-77'
                        placeholderTextColor={ColorApp.placeholder}
                        style={[styles.input, { marginLeft: 16, height: 44 }, setFont(17, 'normal', '#000', null, 'input')]}
                        underlineColorAndroid={ColorApp.transparent}
                        keyboardType='phone-pad'
                        onChangeText={phone => this.setState({ phone: phone })}
                        value={phone}
                        onEndEditing={() => this.setState({
                            edit: phone.length > 0 && phone !== this.userData.phone ? true : false,
                            disabled: this.state.isSelectImage || phone.length > 0 && phone !== this.userData.phone ? false : true,
                        })}
                    />
                </View>

                <View style={{ marginBottom: 40 }}>
                    <Text style={[setFont(13), { color: ColorApp.fade, marginBottom: 8 }]}>E-mail</Text>
                    <TextInput
                        autoCapitalize='none'
                        placeholder='example@mail.com'
                        placeholderTextColor={ColorApp.placeholder}
                        style={[styles.input, { marginLeft: 16, height: 44 }, setFont(17, 'normal', '#000', null, 'input')]}
                        underlineColorAndroid={ColorApp.transparent}
                        keyboardType={Platform.OS == "ios" ? "email-address" : 'default'}
                        onChangeText={email => this.setState({ email })}
                        value={email}
                        onEndEditing={() => this.setState({
                            edit: email.length > 0 && email !== this.userData.email ? true : false,
                            disabled: this.state.isSelectImage || email.length > 0 && email !== this.userData.email ? false : true
                        })}
                    />
                </View>


                <ButtonApp
                    onPress={this.getUpdate}
                    text={strings["Сохранить изменения"]}
                    textStyle={{ color: edit || isSelectImage ? '#fff' : ColorApp.fade }}
                    style={{ backgroundColor: edit || isSelectImage ? ColorApp.main : '#F5F5F5' }}
                    disabled={disabled}
                    isLoading={isLoadingBtn}
                />

            </KeyboardAwareScrollView >
        );
    }
}

const styles = StyleSheet.create({
    input: {
        height: 48,
        paddingVertical: 0,
        paddingHorizontal: 12,
        backgroundColor: ColorApp.inputColor,
        borderRadius: 8,
        flex: 1,
        borderWidth: 1,
        borderColor: ColorApp.inputBorder,
    }
})
