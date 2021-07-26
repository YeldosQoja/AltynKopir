import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { ColorApp } from '../theme/color/ColorApp';

const Loading = ({
    style,
}) => (
        <ActivityIndicator style={[{ marginTop: 16 }, style]} color={ColorApp.main} />
    );

export default Loading;
