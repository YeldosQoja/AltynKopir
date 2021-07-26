import { CommonActions } from '@react-navigation/native';


let _navigator;

export const setTopLevelNavigator = (navigatorRef) => {
    console.log("navigatorRef", navigatorRef);
    _navigator = navigatorRef;
}

export const navigate = (routeName, params) => {
    _navigator.dispatch({
        ...CommonActions.navigate({
            name: routeName,
            params: params
        })
    });
}