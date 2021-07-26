import React from 'react';
import { Alert } from 'react-native';
import Share from 'react-native-share';
import Toast from 'react-native-toast-message';
import 'intl';
import 'intl/locale-data/jsonp/en';
import 'intl/locale-data/jsonp/kk-KZ';
import { strings } from '../localization/Localization';
import NetInfo from "@react-native-community/netinfo";

class Constants {

    priceFormat = (price) => {
        return Intl.NumberFormat('en').format(price);
    }

    dateFormat = (date) => {
        return Intl.DateTimeFormat('kk-KZ').format(new Date(date));
    }

    onShare = (data) => {

        if (data) {
            const options = {
                title: data.title,
                message: data.msg,
                url: data.url
            };

            Share.open(options)
                .then()
                .catch();
        }

    }

    onToast = (text, _onShow) => {
        console.log('onToast');

        Toast.show({
            type: 'error',
            position: 'bottom',
            text2: text,
            visibilityTime: 1000,
            autoHide: true,
            bottomOffset: 100,
            onShow: _onShow
        });
    }

    onHandlerError = (data, status, onPress, _onShow) => {

        if (data.hasOwnProperty('code')) {
            if (data.code == 303) {
                if (data.hasOwnProperty('data')) {
                    let value = Object.values(data.data);
                    value = value.flat();
                    this.onToast(value[0], _onShow);
                    return;
                } else if (data.hasOwnProperty('errors')) {
                    for (let i = 0; i < data.errors.length; i++) {
                        this.onToast(Object.values(data.errors[i]), _onShow);
                        break;
                    }
                }
            }
        } else if (data.hasOwnProperty('errors')) {
            let value = Object.values(data.errors);
            value = value.flat();
            this.onToast(value[0], _onShow);
            return;
        } else {
            Alert.alert('Ошибка!', `Код: ${status}`, [{ text: 'OK', onPress: onPress }]);
        }
    }

    wordLocalization = (word, args = {}, type = false) => {

        if (typeof strings[word] !== "undefined") {
            if (!type) {
                word = strings[word];
            }
        }

        for (let [arg, value] of Object.entries(args)) {
            let reg = new RegExp(`:${arg}`, "gi");
            word = word.replace(reg, value);
        }
        return word;
    }


    noInternet = (e) => {
        if (e == "Error: Network Error") {
            Alert.alert(strings['Внимание!'], strings['Вы не подключены ни к одной сети']);
        }
    }


    NetCheck = (options) => {
        NetInfo.fetch()
            .then(state => {
                if (state.isConnected) {
                    options.send();
                } else {
                    options.error();
                }
            }).catch();
    }

}

export const constants = new Constants();