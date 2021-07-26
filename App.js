import Axios from 'axios';
import React, { Component, Fragment } from 'react';
import { strings } from './localization/Localization';
import Navigation from './navigation/index';
import { ColorApp } from './theme/color/ColorApp';
import Toast from 'react-native-toast-message';
import { setFont } from './theme/font/FontApp';
import { StatusBar, Text, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { ProviderApp } from './provider/ProviderApp';
import TrackPlayer from 'react-native-track-player';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fcmService } from './notification/FCMService';
import { localNotificationService } from './notification/LocalNotificationService';
import codePush from "react-native-code-push";



const toastConfig = {
  error: (internalState) => (
    <View
      style={{
        backgroundColor: 'rgba(17, 22, 33, 0.88)', paddingVertical: 10, paddingHorizontal: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.04,
        shadowRadius: 24, elevation: 1, borderRadius: 8, alignSelf: 'stretch', marginHorizontal: 16,
        flexDirection: 'row', alignItems: 'center'
      }}>
      <FastImage
        source={require('./assets/images/info.png')}
        style={{ width: 24, height: 24 }}
      />
      <Text style={[setFont(15, 'normal', '#fff'), { marginLeft: 8, flex: 1 }]}>{internalState.text2}</Text>
    </View>
  ),
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  
  componentDidMount() {
    Axios.defaults.baseURL = "https://www.altynkopir.com/api/v1/";
    Axios.defaults.headers.Accept = 'application/json';

    AsyncStorage.getItem("lang")
      .then(res => {
        if (res) {
          console.log("res", res);
          let resJson = JSON.parse(res);
          strings.setLanguage(resJson.code);
          Axios.defaults.headers.lang = resJson.code;
        } else {
          Axios.defaults.headers.lang = "ru";
          strings.setLanguage("ru");
        }
      }).catch(() => {
        Axios.defaults.headers.lang = "ru";
        strings.setLanguage("ru");
      });


    TrackPlayer.setupPlayer();
    TrackPlayer.updateOptions({
      stopWithApp: true,
      capabilities: [
        TrackPlayer.CAPABILITY_PLAY,
        TrackPlayer.CAPABILITY_PAUSE,
        TrackPlayer.CAPABILITY_STOP
      ],
      compactCapabilities: [
        TrackPlayer.CAPABILITY_PLAY,
        TrackPlayer.CAPABILITY_PAUSE,
        TrackPlayer.CAPABILITY_STOP
      ]
    });

    // fcmService.registerAppWithFCM();
    // fcmService.register(this.onRegister, this.onNotification, this.onOpenNotificaion);
    // localNotificationService.configure(this.onOpenNotificaion);

  }

  // setDeviceToken = (fcm, token) => {
  //   Axios.post("device/tokens", null, {
  //     params: {
  //       token: fcm,
  //       type_id: 2,
  //     },
  //     headers: {
  //       Authorization: "Bearer " + token
  //     }
  //   })
  //     .then(res => {
  //       console.log("setDeviceToken", res);
  //     })
  //     .catch(e => { console.log(e); console.log(e.response) })
  // }

  // componentWillUnmount() {
  //   fcmService.unRegister();
  //   localNotificationService.unRegister();
  // }

  // onRegister = (token) => {
  //   console.log('App onRegister: ', token);
  //   AsyncStorage.getItem('token').then(val => {
  //     console.log("USER TOKEN", val);
  //     if (val) {
  //       this.setDeviceToken(token, val);

  //     }
  //   })
  // }

  // onNotification = (notify) => {
  //   console.log('App onNotification:', notify);
  //   const options = {
  //     soundName: 'default',
  //     playSound: true
  //   }
  //   localNotificationService.showNotification(
  //     0,
  //     notify.title,
  //     notify.body,
  //     notify,
  //     options
  //   );
  // }

  // onOpenNotificaion = (notify) => {
  //   console.log('App onOpenNotificaion', notify);
  // }

  render() {
    return (
      <ProviderApp>
        <Fragment>
          <StatusBar backgroundColor={ColorApp.transparent} translucent barStyle="light-content" />
          <Navigation />
          <Toast config={toastConfig} ref={(ref) => Toast.setRef(ref)} />
        </Fragment>
      </ProviderApp>
    );
  }
}

const codePushOptions = {
  checkFrequency: codePush.CheckFrequency.ON_APP_START,
  installMode: codePush.InstallMode.ON_NEXT_RESUME
};


export default codePush(codePushOptions)(App);