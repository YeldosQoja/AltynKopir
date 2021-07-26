import React from 'react';
import { Text, View } from 'react-native';
import { ColorApp } from '../theme/color/ColorApp';
import { setFont } from '../theme/font/FontApp';

const SectionRow = ({
    style,
    text,
    textStyle
}) => (
        <View style={[{ backgroundColor: ColorApp.sectionBG, paddingTop: 16, paddingBottom: 6, paddingHorizontal: 16, borderTopWidth: 1, borderTopColor: ColorApp.border, borderBottomWidth: 1, borderBottomColor: ColorApp.border }, style]}>
            <Text style={[setFont(13), { color: ColorApp.sectionColor }, textStyle]}>{text}</Text>
        </View>
    );

export default SectionRow;
