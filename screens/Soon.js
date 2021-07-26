import React, { Component } from 'react';
import { View, Text } from 'react-native';
import FastImage from 'react-native-fast-image';
import { strings } from '../localization/Localization';
import { ColorApp } from '../theme/color/ColorApp';
import { setFont } from '../theme/font/FontApp';

export default class Soon extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentDidMount() {
        this.props.navigation.setOptions({ title: "", headerStyle: { backgroundColor: ColorApp.main } });
    }

    render() {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: ColorApp.bg }}>
                <FastImage
                    source={require("../assets/images/soon.png")}
                    style={{ width: 128, height: 128 }}
                />
                <Text style={[setFont(28, "500"), { marginTop: 16 }]}> {strings.Скоро} </Text>
            </View>
        );
    }
}
