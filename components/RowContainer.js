import React, { Fragment } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { setFont } from '../theme/font/FontApp';
import Icon from 'react-native-vector-icons/Ionicons';
import { ColorApp } from '../theme/color/ColorApp';
import { ActivityIndicator } from 'react-native';

const RowContainer = ({
    style,
    showLeft,
    showRight,
    leftOnPress,
    leftText,
    leftTextStyle,
    leftStyle,
    rightOnPress,
    rightText,
    rightTextStyle,
    rightStyle,
    isLoadingRight,
    disabledRight
}) => (
        <View style={[{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 8, marginBottom: 20, shadowColor: "#000", shadowOffset: { width: 0, height: -1 }, shadowOpacity: 0.04, shadowRadius: 2, elevation: 1 }, style]}>

            {
                showLeft ?
                    <TouchableOpacity
                        onPress={leftOnPress}
                        activeOpacity={0.8}
                        style={[{ flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: ColorApp.main, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 10 }, leftStyle]}>
                        <Icon name="chevron-back" color="#fff" size={20} />
                        <Text style={[setFont(17, "600", "#fff"), { textAlign: "center" }, leftTextStyle]}>{leftText}</Text>
                    </TouchableOpacity>
                    :
                    null

            }

            {
                showRight ?
                    <TouchableOpacity
                        onPress={rightOnPress}
                        disabled={disabledRight}
                        activeOpacity={0.8}
                        style={[{ flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: ColorApp.main, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 10 }, { rightStyle }]}>
                        {
                            isLoadingRight ?
                                <ActivityIndicator color="#fff" />
                                :
                                <Fragment>
                                    <Text style={[setFont(17, "600", "#fff"), { textAlign: "center" }, rightTextStyle]}>{rightText}</Text>
                                    <Icon name="chevron-forward" color="#fff" size={20} />
                                </Fragment>
                        }

                    </TouchableOpacity>
                    :
                    null
            }

        </View >
    );

export default RowContainer;
