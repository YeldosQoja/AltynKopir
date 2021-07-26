import React from 'react';
import FastImage from 'react-native-fast-image';
import HeaderButton from '../components/HeaderButton';
import Headerimage from "../components/HeaderImage";
import { strings } from "../localization/Localization";
import { ColorApp } from "../theme/color/ColorApp";
import { setFont } from "../theme/font/FontApp";

class NavOptions {

    NOHEADER = {
        headerShown: false
    };

    DEFAULTHEADER = {
        headerStyle: {
            backgroundColor: ColorApp.main,
            shadowColor: ColorApp.transparent,
            borderBottomWidth: 0,
        },
        headerBackTitleVisible: false,
        headerTintColor: '#fff',
        headerTitleAlign: 'center',
        headerTitleStyle: setFont(17, '600', '#fff'),
    };

    HEADER = (title, url) => ({
        title: title,
        headerStyle: { backgroundColor: ColorApp.main },
        headerTitleAlign: 'left',
        headerTitleStyle: setFont(28, 'bold', '#fff'),
        headerLeft: () => <Headerimage source={url ? { uri: url, priority: FastImage.priority.high } : require('../assets/logo/logo.png')} />,
        headerLeftContainerStyle: { marginLeft: 16 },
    });

    PROFILE = (navigation) => ({
        title: strings.headerTitleProfile,
        headerStyle: { backgroundColor: ColorApp.main },
        headerTitleAlign: 'left',
        headerTitleStyle: setFont(28, 'bold', '#fff'),
        headerLeft: () => <Headerimage source={require('../assets/logo/logo.png')} />,
        headerLeftContainerStyle: { marginLeft: 16 },
        headerRight: () => (
            <HeaderButton
                source={require('../assets/images/push.png')}
                style={{ width: 20, height: 20, }}
                onPress={() => navigation.navigate('PushNotification')}
                isPush={true}
            />
        ),
        headerRightContainerStyle: { marginRight: 16, }
    });

    COURSE = () => ({

    });

}

export const navOptions = new NavOptions();