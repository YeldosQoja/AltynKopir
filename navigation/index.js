import 'react-native-gesture-handler';
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Splash from '../screens/Splash';
import Tab1 from '../screens/tabs/tab1/Tab1';
import { navOptions } from '../constants/NavOptions';
import Tab2 from '../screens/tabs/tab2/Tab2';
import Tab3 from '../screens/tabs/tab3/Tab3';
import Login from '../screens/tabs/tab4/auth/Login';
import Register from '../screens/tabs/tab4/auth/Register';
import Password from '../screens/tabs/tab4/auth/password/Password';
import PasswordSend from '../screens/tabs/tab4/auth/password/PasswordSend';
import NewPassword from '../screens/tabs/tab4/auth/password/NewPassword';
import SuccessPassword from '../screens/tabs/tab4/auth/password/SuccessPassword';
import Profile from '../screens/tabs/tab4/profile/Profile';
import EditProfile from '../screens/tabs/tab4/profile/EditProfile';
import Offer from '../screens/tabs/tab4/profile/Offer';
import Settings from '../screens/tabs/tab4/profile/Settings';
import { strings } from '../localization/Localization';
import HistoryPayment from '../screens/tabs/tab4/profile/HistoryPayment';
import Referal from '../screens/tabs/tab4/profile/Referal';
import MyBalance from '../screens/tabs/tab4/profile/MyBalance';
import ChangePassword from '../screens/tabs/tab4/profile/ChangePassword';
import PushNotification from '../screens/tabs/tab4/profile/PushNotification';
import { ColorApp } from '../theme/color/ColorApp';
import { StateContext } from '../provider/ProviderApp';
import NewsOpen from '../screens/tabs/tab3/NewsOpen';
import CourseOpen from '../screens/tabs/tab1/CourseOpen';
import AllReviews from '../screens/AllReviews';
import Kaspi from '../screens/Kaspi';
import GB from '../screens/GB';
import Lesson from '../screens/Lesson';
import Test from '../screens/Test';
import TestResult from '../screens/TestResult';
import TestAnswer from '../screens/TestAnswer';
import FastImage from 'react-native-fast-image';
import Task from '../screens/Task';
import PdfView from '../screens/PdfView';
import TestOpen from '../screens/tabs/tab2/Olimp/TestOpen';
import Languages from '../screens/Languages';
import EndCourse from '../screens/EndCourse';
import WriteReview from '../screens/WriteReview';
import OlimpTest from '../screens/tabs/tab2/Olimp/OlimpTest';
import TransitionGB from '../screens/TransitionGB';
import PreviewTest from '../screens/PreviewTest';
import MyCourseOpen from '../screens/tabs/tab1/MyCourseOpen';
import Soon from '../screens/Soon';
import Conference from '../screens/Conference';
import { setTopLevelNavigator } from '../notification/NotificationService';


const Stack = createStackNavigator();

const TabStack = createBottomTabNavigator();

const Tab1Stack = createStackNavigator();
const Tab2Stack = createStackNavigator();
const Tab3Stack = createStackNavigator();
const Tab4Stack = createStackNavigator();
const Tab5Stack = createStackNavigator();
const TabNStack = createStackNavigator();

const AuthStack = createStackNavigator();
const ProfileStack = createStackNavigator();

const ProfileNavigator = ({ navigation }) => {
    return (
        <ProfileStack.Navigator screenOptions={navOptions.DEFAULTHEADER} initialRouteName="Profile">
            <ProfileStack.Screen name='Profile' component={Profile} options={navOptions.PROFILE(navigation)} initialParams={{ reload: false }} />
            <ProfileStack.Screen name='EditProfile' component={EditProfile} />
            <ProfileStack.Screen name='Offer' component={Offer} />
            <ProfileStack.Screen name='Settings' component={Settings} />
            <ProfileStack.Screen name='HistoryPayment' component={HistoryPayment} />
            <ProfileStack.Screen name='Referal' component={Referal} />
            <ProfileStack.Screen name='MyBalance' component={MyBalance} />
            <ProfileStack.Screen name='ChangePassword' component={ChangePassword} />
            <ProfileStack.Screen name='PushNotification' component={PushNotification} />
        </ProfileStack.Navigator>
    )
}

const AuthNavigator = () => {
    return (
        <AuthStack.Navigator screenOptions={navOptions.DEFAULTHEADER} initialRouteName="Login">
            <AuthStack.Screen name='Login' component={Login} />
            <AuthStack.Screen name='Register' component={Register} />
            <AuthStack.Screen name='Password' component={Password} />
            <AuthStack.Screen name='PasswordSend' component={PasswordSend} />
            <AuthStack.Screen name='NewPassword' component={NewPassword} />
            <AuthStack.Screen name='SuccessPassword' component={SuccessPassword} />
        </AuthStack.Navigator>
    )
}

const TabNNavigator = () => {
    return (
        <TabNStack.Navigator screenOptions={navOptions.DEFAULTHEADER}>
            <TabNStack.Screen name="Soon" component={Soon} />
        </TabNStack.Navigator>
    )
}

const Tab5Navigator = () => {
    return (
        <Tab5Stack.Navigator screenOptions={navOptions.DEFAULTHEADER}>
            <Tab5Stack.Screen name="Conference" component={Conference} />
        </Tab5Stack.Navigator>
    );
}

const Tab4Navigator = () => {
    return (
        <Tab4Stack.Navigator screenOptions={navOptions.DEFAULTHEADER}>
            <Tab4Stack.Screen name="AuthNavigator" component={AuthNavigator} options={navOptions.NOHEADER} />
            <Tab4Stack.Screen name="ProfileNavigator" component={ProfileNavigator} options={navOptions.NOHEADER} />
        </Tab4Stack.Navigator>
    );
}


const Tab3Navigator = () => {
    return (
        <Tab3Stack.Navigator screenOptions={navOptions.DEFAULTHEADER}>
            <Tab3Stack.Screen name='Tab3' component={Tab3} options={navOptions.HEADER(strings.Новости)} />
            <Tab3Stack.Screen name='NewsOpen' component={NewsOpen} />
        </Tab3Stack.Navigator>
    );
}

const Tab2Navigator = () => {
    return (
        <Tab2Stack.Navigator screenOptions={navOptions.DEFAULTHEADER}>
            <Tab2Stack.Screen name='Tab2' component={Tab2} options={navOptions.HEADER(strings.Тесты)} />
            <Tab2Stack.Screen name='TestOpen' component={TestOpen} />
        </Tab2Stack.Navigator>
    );
}

const Tab1Navigator = () => {
    return (
        <Tab1Stack.Navigator screenOptions={navOptions.DEFAULTHEADER}>
            <Tab1Stack.Screen name='Tab1' component={Tab1} options={navOptions.HEADER(strings.Курсы)} />
            <Tab1Stack.Screen name='CourseOpen' component={CourseOpen} />
            <Tab1Stack.Screen name='MyCourseOpen' component={MyCourseOpen} />
        </Tab1Stack.Navigator>
    );
}

const TabNavigator = ({ navigation }) => {

    const TabOptions = (title, source, w = 28, h = 28) => {
        return {
            title: title,
            tabBarIcon: ({ color }) => <FastImage
                source={source}
                style={{ width: w, height: h }}
                tintColor={color}
            />
        }
    }

    const renderBottom = (data) => {

        const dataTab = (id) => {
            switch (id) {
                case 1:
                    return Tab1Navigator;
                case 2:
                    return Tab2Navigator;
                case 3:
                    return Tab3Navigator;
                case 4:
                    return Tab4Navigator;
                case 5:
                    return Tab5Navigator;
                default:
                    return TabNNavigator;
            }
        }

        return data.bottomBar.bottom_nav.map((item, index) => (

            <TabStack.Screen key={index} name={item.navigation} component={dataTab(item.id)} options={TabOptions(item.title, { uri: item.icon, priority: FastImage.priority.high })}
                listeners={{
                    tabPress: e => {
                        switch (item.navigation) {
                            case 'Tab4Navigator':
                                if (data.token) {
                                    e.preventDefault();
                                    navigation.navigate('Tab4Navigator', { screen: 'ProfileNavigator' });
                                } else {
                                    e.preventDefault();
                                    navigation.navigate('Tab4Navigator', { screen: 'AuthNavigator' });
                                }
                                break;

                            case 'Tab5Navigator':
                                if (data.token) {
                                    e.preventDefault();
                                    navigation.navigate('Tab5Navigator', { screen: 'Conference' });
                                } else {
                                    e.preventDefault();
                                    navigation.navigate('Tab4Navigator', { screen: 'AuthNavigator' });
                                }
                                break;

                        }
                    }
                }}
            />

        ));
    };

    return (
        <StateContext.Consumer>
            {
                data =>
                    <TabStack.Navigator tabBarOptions={{ activeTintColor: ColorApp.main, inactiveTintColor: "#000" }}>
                        {
                            data.bottomBar && data.bottomBar.bottom_nav?.length > 0 ?
                                renderBottom(data)
                                :
                                <React.Fragment>
                                    <TabStack.Screen name='Tab1Navigator' component={Tab1Navigator} options={TabOptions(strings.Курсы, require("../assets/images/tab1.png"))} />
                                    <TabStack.Screen name='Tab2Navigator' component={Tab2Navigator} options={TabOptions(strings.Тесты, require("../assets/images/tab2.png"))}
                                    />
                                    <TabStack.Screen name='Tab3Navigator' component={Tab3Navigator} options={TabOptions(strings.Новости, require("../assets/images/tab3.png"))} />
                                    <TabStack.Screen name='Tab4Navigator' component={Tab4Navigator} options={TabOptions(strings.Профиль, require("../assets/images/tab4.png"), 24, 24)}
                                        listeners={{
                                            tabPress: e => {
                                                if (data.token) {
                                                    e.preventDefault();
                                                    navigation.navigate('Tab4Navigator', { screen: 'ProfileNavigator' });
                                                } else {
                                                    e.preventDefault();
                                                    navigation.navigate('Tab4Navigator', { screen: 'AuthNavigator' });
                                                }
                                            }
                                        }}
                                    />
                                </React.Fragment>
                        }

                    </TabStack.Navigator>
            }

        </StateContext.Consumer>
    );
}

const App = () => {

    return (
        <NavigationContainer ref={setTopLevelNavigator}>
            <Stack.Navigator screenOptions={navOptions.DEFAULTHEADER} >
                <Stack.Screen name='Splash' component={Splash} options={navOptions.NOHEADER} />
                <Stack.Screen name='TabNavigator' component={TabNavigator} options={navOptions.NOHEADER} />
                <Stack.Screen name='AllReviews' component={AllReviews} />
                <Stack.Screen name='GB' component={GB} />
                <Stack.Screen name='Kaspi' component={Kaspi} />
                <Stack.Screen name='Lesson' component={Lesson} />
                <Stack.Screen name='Test' component={Test} />
                <Stack.Screen name='PreviewTest' component={PreviewTest} />
                <Stack.Screen name='TestResult' component={TestResult} />
                <Stack.Screen name='TestAnswer' component={TestAnswer} />
                <Stack.Screen name='Task' component={Task} />
                <Stack.Screen name='PdfView' component={PdfView} />
                <Stack.Screen name='Languages' component={Languages} />
                <Stack.Screen name='EndCourse' component={EndCourse} />
                <Stack.Screen name='WriteReview' component={WriteReview} />
                <Stack.Screen name='OlimpTest' component={OlimpTest} />
                <Stack.Screen name='TransitionGB' component={TransitionGB} />
                <Stack.Screen name='Offer' component={Offer} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default App;