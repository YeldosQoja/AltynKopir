import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { constants } from '../constants/Constants';
import { strings } from '../localization/Localization';
import { ColorApp } from '../theme/color/ColorApp';
import { setFont } from '../theme/font/FontApp';

const BuyButton = ({
    style,
    text,
    textStyle,
    price,
    priceStyle,
    oldPrice,
    oldPriceStyle,
    onPress,
    isAttempts,
    attempts

}) => (
    <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={[{ backgroundColor: ColorApp.main, flexDirection: "row", alignItems: "center", padding: 16 }, style]}>
        <Text style={[setFont(17, "600", "#fff"), { flex: 1, marginRight: 8 }, textStyle]}>{text}</Text>
        {
            isAttempts ?
                <Text style={[setFont(17, "400", '#fff')]}>{constants.wordLocalization(strings['Осталось :attempts попытки'], { attempts: attempts })}</Text>
                :
                <View style={{ flexDirection: "row", alignItems: "center", flex: 1, marginLeft: 16, justifyContent: "flex-end" }}>
                    {
                        price ?
                            <Text style={[setFont(17, "600", "#fff"), priceStyle]}>{constants.priceFormat(price)}₸</Text>
                            :
                            null
                    }
                    {
                        parseFloat(oldPrice) > 0 ?
                            <Text style={[setFont(17), { marginLeft: 4, color: "rgba(255,255,255,0.6)", textDecorationLine: "line-through", textDecorationColor: "rgba(255,255,255,0.6)" }, oldPriceStyle]}>{constants.priceFormat(oldPrice)}₸</Text>
                            :
                            null
                    }

                </View>
        }
    </TouchableOpacity>
);

export default BuyButton;
