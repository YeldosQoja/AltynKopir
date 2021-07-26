import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ColorApp } from '../theme/color/ColorApp';
import { setFont } from '../theme/font/FontApp';

const Requisites = ({
    label,
    labelStyle,
    text,
    textStyle,
    onpress,
    style,
}) => (
        <TouchableOpacity
            onPress={onpress}
            activeOpacity={0.8}
            style={[{ paddingVertical: 14, paddingHorizontal: 16 }, style]}
        >
            <View style={{ flexDirection: "row", alignItems: "center", }}>
                <Text style={[setFont(15), { color: ColorApp.fade }, labelStyle]}>{label}</Text>
                <Text style={[setFont(17), { marginHorizontal: 10, flex: 1, textAlign: "right" }, textStyle]}>{text}</Text>
                <Icon name='content-copy' color='#eee' size={24} />
            </View>

            <View style={{ position: "absolute", height: 0.5, left: 16, right: 0, bottom: 0, backgroundColor: ColorApp.border }} />
        </TouchableOpacity>
    );

export default Requisites;
