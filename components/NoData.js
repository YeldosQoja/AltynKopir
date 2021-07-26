import React from 'react';
import { Text, View } from 'react-native';
import { strings } from '../localization/Localization';
import { setFont } from '../theme/font/FontApp';

const NoData = ({
    text,
    textStyle,
    style
}) => (
        <View style={[{ marginTop: 16 }, style]}>
            <Text style={[setFont(), { textAlign: 'center' }, textStyle]}>{text ? text : strings["Нет данных"]}</Text>
        </View>
    );

export default NoData;
