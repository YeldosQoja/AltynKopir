import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { ColorApp } from '../theme/color/ColorApp';
import { setFont } from '../theme/font/FontApp';

const ButtonApp = ({
    text,
    textStyle,
    onPress,
    style,
    isLoading,
    disabled
}) => (
    <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
        style={[{ padding: 16, borderRadius: 10, backgroundColor: ColorApp.main, alignSelf: "stretch" }, style]}
    >
        {
            isLoading ?
                <ActivityIndicator color='#fff' />
                :
                <Text style={[setFont(17, '600', '#fff'), { textAlign: 'center' }, textStyle]}>{text}</Text>
        }
    </TouchableOpacity>
);

export { ButtonApp };
