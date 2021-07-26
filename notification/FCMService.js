import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

class FCMService {

    // we use this method to register notification service in our app.
    // we call this method in componetDidMount() so, we app load we get permission to 
    // display notification.
    register = (onRegister, onNotification, onOpenNotification) => {
        this.checkPermission(onRegister)
        // when register function call that time we create notification listener 
        this.createNoitificationListeners(onRegister, onNotification, onOpenNotification)
    }

    registerAppWithFCM = async () => {
        if (Platform.OS == 'ios') {
            await messaging().registerDeviceForRemoteMessages();
            await messaging().setAutoInitEnabled(true);
        }
    }

    checkPermission = (onRegister) => {
        messaging().hasPermission()
            .then(enabled => {
                if (enabled) {
                    //user has permission
                    this.getToken(onRegister)
                } else {
                    //user don't have permission
                    this.requestPermission(onRegister)
                }
            }).catch(error => {
                console.log("Permission rejected", error)
            })
    }

    getToken = (onRegister) => {
        messaging().getToken()
            .then(fcmToken => {
                if (fcmToken) {
                    onRegister(fcmToken)
                } else {
                    console.log("User does not have a device token")
                }
            }).catch(error => {
                console.log("getToken rejected ", error)
            })
    }

    requestPermission = (onRegister) => {
        messaging().requestPermission()
            .then(() => {
                this.getToken(onRegister)
            }).catch(error => {
                console.log("Requested persmission rejected ", error)
            })
    }

    deletedToken = () => {
        messaging().deleteToken()
            .catch(error => {
                console.log("Delected token error ", error)
            })
    }

    createNoitificationListeners = (onRegister, onNotification, onOpenNotification) => {

        messaging().onNotificationOpenedApp(remoteMessage => {
            console.log('onNotificationOpenedApp', remoteMessage);
            if (remoteMessage) {
                const notifiaction = remoteMessage.notification;
                onOpenNotification(notifiaction)
            }
        });

        messaging().getInitialNotification()
            .then(remoteMessage => {
                console.log('messaging().getInitialNotification()', remoteMessage);
                if (remoteMessage) {
                    const notifiaction = remoteMessage.notification;
                    onOpenNotification(notifiaction)
                }
            });

        this.messageListener = messaging().onMessage(async remoteMessage => {
            console.log('messageListener', remoteMessage);
            if (remoteMessage) {
                let notifiaction = null;
                if (Platform.OS == 'ios') {
                    notifiaction = remoteMessage.notification;
                } else {
                    notifiaction = remoteMessage.notification;
                }
                onNotification(notifiaction);
            }
        });

        messaging().onTokenRefresh(fcmToken => {
            console.log('messaging().onTokenRefresh', fcmToken);
            onRegister(fcmToken);
        });

    }

    unRegister = () => {
        this.messageListener();
    }


}
export const fcmService = new FCMService();