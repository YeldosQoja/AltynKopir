import React from 'react';
import { Text, View } from 'react-native';
import { strings } from '../localization/Localization';
import { setFont } from '../theme/font/FontApp';
import { ButtonApp } from './ButtonApp';
import * as Animatable from 'react-native-animatable';

const NetConnection = ({
    style,
    isNet,
    children,
    onPress
}) => (
    <View style={[{ flex: 1 }, style]}>
        {
            isNet ?
                children
                :
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <Animatable.View animation="shake" useNativeDriver >
                        <Text style={setFont(18, "500")}>{strings['Вы не подключены ни к одной сети']}</Text>
                        <ButtonApp
                            style={{ marginTop: 16 }}
                            text={strings.Повторить}
                            onPress={onPress}
                        />
                    </Animatable.View>
                </View>
        }
    </View>
);

export default NetConnection;
