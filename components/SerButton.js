import React, { Fragment } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { ColorApp } from '../theme/color/ColorApp';
import { setFont } from '../theme/font/FontApp';

const SerButton = ({
    textLeft,
    textLeftStyle,
    textRight,
    textRightStyle,
    onPress,
    isloadingFile
}) => (
    <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={{ flexDirection: "row", alignItems: "center", justifyContent: isloadingFile ? "center" : "space-between", padding: 16, backgroundColor: ColorApp.main }}
    >
        {
            isloadingFile ?
                <ActivityIndicator color="#fff" />
                :
                <Fragment>
                    <Text style={[setFont(17, '600', '#fff'), { marginRight: 8 }, textLeftStyle]}>{textLeft}</Text>
                    <Text style={[setFont(17, '400', '#fff'), textRightStyle]}>{textRight}</Text>
                </Fragment>
        }

    </TouchableOpacity>
);

export default SerButton;
