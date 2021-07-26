import React from 'react';
import { Text, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { setFont } from '../theme/font/FontApp';

const InfoContainer = ({
    source,
    style,
    title,
    text,
    titleStyle,
    textStyle,
    infoStyle
}) => (
        <View style={[{ alignItems: 'center' }, style]}>
            <FastImage
                source={source}
                style={{ width: 48, height: 48 }}
            />
            <View style={[{ marginTop: 12 }, infoStyle]}>
                <Text style={[setFont(20, 'bold', '#000'), { textAlign: 'center' }, titleStyle]}>{title}</Text>
                {
                    text ?
                        <Text style={[setFont(15), { textAlign: 'center', marginTop: 8 }, textStyle]}>{text}</Text>
                        :
                        null
                }
            </View>
        </View>
    );

export default InfoContainer;
