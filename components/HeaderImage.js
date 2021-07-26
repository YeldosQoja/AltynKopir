import React from 'react';
import { Text, View } from 'react-native';
import FastImage from 'react-native-fast-image';

const Headerimage = ({
    source,
    style
}) => (
        <FastImage
            source={source}
            style={[{ width: 34, height: 34 }, style]}
        />
    );

export default Headerimage;
