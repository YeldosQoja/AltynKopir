import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { ColorApp } from '../theme/color/ColorApp';
import Loading from './Loading';

const HeaderButton = ({
    onPress,
    isLoading,
    disabled,
    isPush,
    source,
    style,
    imgStyle

}) => (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            style={[{ width: 32, height: 32, justifyContent: 'center', alignItems: 'center' }, style]}
            disabled={disabled}
        >
            {
                isLoading ?
                    <ActivityIndicator color='#fff' />
                    :
                    isPush ?
                        <View>
                            < FastImage
                                source={source}
                                style={[{ width: 20, height: 20 }, imgStyle]}
                            />
                            <View style={{ position: 'absolute', top: 0, right: 0, backgroundColor: ColorApp.main, width: 12, height: 12, borderRadius: 6, justifyContent: 'center', alignItems: 'center' }}>
                                <View style={{ backgroundColor: '#FF3B30', width: 6, height: 6, borderRadius: 3 }} />
                            </View>
                        </View>
                        :
                        < FastImage
                            source={source}
                            style={[{ width: 20, height: 20 }, imgStyle]}
                        />

            }
        </TouchableOpacity>
    );

export default HeaderButton;
