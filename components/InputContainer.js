import React from 'react';
import { Text, View } from 'react-native';
import { ColorApp } from '../theme/color/ColorApp';

const InputContainer = ({
    style,
    children,
    isFocus
}) => (
        <View style={[{ borderWidth: isFocus ? 0.5 : 0, borderColor: isFocus ? ColorApp.action : ColorApp.transparent, height: 48, justifyContent: 'center', backgroundColor: ColorApp.inputColor, borderRadius: 8, paddingHorizontal: 12 }, style]}>
            {
                children
            }
        </View>
    );

export default InputContainer;