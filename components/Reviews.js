import React from 'react';
import { Text, View, Dimensions, Easing } from 'react-native';
import FastImage from 'react-native-fast-image';
import { constants } from '../constants/Constants';
import { ColorApp } from '../theme/color/ColorApp';
import { setFont } from '../theme/font/FontApp';
import Rating from 'react-native-rating'
import { strings } from '../localization/Localization';

const { width } = Dimensions.get("screen");

const images = {
    starFilled: require('../assets/images/starFil.png'),
    starUnfilled: require('../assets/images/starUnfil.png')
};

const Reviews = ({
    style,
    avatar,
    name,
    date,
    stars,
    text,
    users
}) => (
    <View style={[{ padding: 12, backgroundColor: ColorApp.sectionBG, borderRadius: 10, }, style]}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
            <FastImage
                source={{ uri: avatar, priority: FastImage.priority.high }}
                style={{ width: 36, height: 36, borderRadius: 18 }}
            />
            <Text numberOfLines={2} style={[setFont(15, "600"), { flex: 1, marginHorizontal: 8 }]}>{name} <Text style={{ color: ColorApp.action }}>{users.id == users.userId ? strings.Вы : null}</Text></Text>

            <Text style={[setFont(13), { color: ColorApp.fade }]}>{constants.dateFormat(date)}</Text>

        </View>

        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginVertical: 12 }}>
            <View>
                <Text style={[setFont(10, "500", ColorApp.fade), { marginBottom: 2 }]}>{strings.Оценка}</Text>
                <Text style={[setFont(13)], { textAlign: "center" }}>{constants.wordLocalization(':rating из 5', { rating: stars })}</Text>
            </View>
            <Rating
                max={5}
                initial={stars}
                onChange={rating => console.log(rating)}
                selectedStar={images.starFilled}
                unselectedStar={images.starUnfilled}
                config={{
                    easing: Easing.inOut(Easing.ease),
                    duration: 350
                }}
                editable={false}
                stagger={80}
                maxScale={1.4}
                starStyle={{
                    width: 22,
                    height: 21
                }}
            />
        </View>

        <Text style={[setFont(15)]}>{text}</Text>
    </View>
);

export default Reviews;
