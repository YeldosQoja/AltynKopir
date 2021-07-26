import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { ColorApp } from '../theme/color/ColorApp';
import { setFont } from '../theme/font/FontApp';

const RowButton = ({
    style,
    text,
    textStyle,
    iconLeft,
    iconRight,
    iconLeftStyle,
    iconRigthStyle,
    disabled,
    onPress,
    leftTintColor,
    rightTintColor,

}) => (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            activeOpacity={0.8}
            style={[{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                paddingLeft: 18,
                paddingRight: 16
            }, style]}
        >
            <FastImage
                source={iconLeft}
                style={[{ width: 24, height: 24 }, iconLeftStyle]}
                tintColor={leftTintColor}
            />

            <Text style={[setFont(17), { flex: 1, marginHorizontal: 18 }, textStyle]}>{text}</Text>

            <FastImage
                source={iconRight}
                style={[{ width: 24, height: 24 }, iconRigthStyle]}
                tintColor={rightTintColor}
            />
            <View style={{ position: 'absolute', bottom: 0, right: 0, width: '93%', height: 1, backgroundColor: ColorApp.border }} />
        </TouchableOpacity>
    );

export default RowButton;
