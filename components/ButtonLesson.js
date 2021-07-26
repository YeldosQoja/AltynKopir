import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { constants } from '../constants/Constants';
import { ColorApp } from '../theme/color/ColorApp';
import { setFont } from '../theme/font/FontApp';
import IconPlay from 'react-native-vector-icons/Ionicons';
import { strings } from '../localization/Localization';

const ButtonLesson = ({
    style,
    text,
    textStyle,
    countLesson,
    onPress
}) => (
    <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        style={[{ flexDirection: "row", padding: 16, alignItems: "center", backgroundColor: ColorApp.action }, style]}>
        <Text style={[setFont(17, "600", '#fff'), { flex: 1, marginRight: 8 }, textStyle]}>{text}</Text>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ marginRight: 4, height: 22, width: 22, borderRadius: 22, backgroundColor: 'rgba(245, 245, 245,0.24)', justifyContent: "center", alignItems: "center" }}>
                <IconPlay name="play" size={8} color="#fff" />
            </View>
        </View>
        <Text style={[setFont(17, "400", "#fff")]}>{constants.wordLocalization(strings[':num урок'], { num: countLesson })}</Text>
    </TouchableOpacity>
);

export default ButtonLesson;
