import React, { Component } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import Loading from '../../../../components/Loading';
import { ColorApp } from '../../../../theme/color/ColorApp';
import { setFont } from '../../../../theme/font/FontApp';
import Icon from 'react-native-vector-icons/MaterialIcons';
import NoData from '../../../../components/NoData';
import { constants } from '../../../../constants/Constants';
import { strings } from '../../../../localization/Localization';
import { StateContext } from '../../../../provider/ProviderApp';

export default class Referal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: [{}, {}],
            isLoading: true
        };
    }


    static contextType = StateContext;

    componentDidMount() {
        this.props.navigation.setOptions({
            title: strings["Реферальная программа"],
            headerStyle: { backgroundColor: this.globalState.bottomBar ? this.globalState.bottomBar.color_app : ColorApp.main, }
        });
    }

    ListHeaderComponent = () => (
        <View style={{ backgroundColor: '#fff' }}>
            <View style={{ backgroundColor: ColorApp.main, padding: 16 }}>
                <Text style={[setFont(20, 'bold', '#fff'), { textAlign: 'center', marginTop: 40, marginBottom: 16 }]}>Скопируйте и поделитесь ссылкой с друзьями</Text>

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8, paddingVertical: 12, paddingLeft: 12, paddingRight: 16, borderRadius: 8, backgroundColor: '#fff' }}
                    >
                        <Text style={[setFont(17), { marginRight: 16, flex: 1 }]}>{'edu.buginsoft.kz/59879'}</Text>
                        <Icon name='content-copy' color='#eee' size={24} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => constants.onShare({ title: 'Title', url: 'https://www.youtube.com/' })}
                        activeOpacity={0.8}
                        style={{ width: 44, height: 44, borderRadius: 8, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}
                    >
                        <Icon name='share' color={ColorApp.action} size={24} />
                    </TouchableOpacity>
                </View>

                <Text style={[setFont(13), { textAlign: 'center', marginTop: 8, color: '#fff' }]}>Пригласите своих друзей с помощью ссылки и получите 10% от их покупки.</Text>

            </View>

            <TouchableOpacity
                onPress={() => this.props.navigation.navigate('MyBalance')}
                activeOpacity={0.8}
                style={{ flexDirection: 'row', paddingHorizontal: 16, height: 48, alignItems: 'center', backgroundColor: '#fff', }}>
                <FastImage
                    source={require('../../../../assets/images/history_pay.png')}
                    style={{ width: 24, height: 24 }}
                />
                <Text numberOfLines={1} style={[setFont(17), { flex: 1, marginHorizontal: 18 }]}>{strings["Мой баланс"]}</Text>

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={setFont(15)}>2,585₸</Text>
                    <FastImage
                        source={require('../../../../assets/images/next.png')}
                        style={{ width: 24, height: 24 }}
                    />
                </View>
                <View style={{ position: 'absolute', left: 56, right: 0, bottom: 0, backgroundColor: ColorApp.border, height: 1 }} />
            </TouchableOpacity>

            <Text style={[setFont(20, 'bold'), { marginHorizontal: 16, marginTop: 24, marginBottom: 8 }]}>Приглашенные</Text>
        </View>
    );


    renderItem = ({ item, index }) => (
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 }}>
            <FastImage
                source={{ uri: 'https://upload.wikimedia.org/wikipedia/ru/c/cb/AmazingSpiderMan50.jpg', priority: FastImage.priority.high }}
                style={{ width: 56, height: 56, borderRadius: 28 }}
            />
            <View style={{ flex: 1, marginLeft: 16 }}>
                <Text numberOfLines={2} style={[setFont(17, '600'), { marginBottom: 4 }]}>Ануар Надралиев</Text>
                <Text numberOfLines={2} style={[setFont(15), { color: ColorApp.fade }]}>15.10.2020 в 13:45</Text>
            </View>
            <View style={{ position: 'absolute', bottom: 0, left: 88, right: 0, height: 1, backgroundColor: ColorApp.border }} />
        </View>
    );

    ListEmptyComponent = () => (
        <NoData text=' ' />
    );

    render() {

        const { dataSource, isLoading } = this.state;

        this.globalState = this.context;

        return (
            <View style={{ flex: 1, }}>
                {
                    !isLoading ?
                        <Loading />
                        :
                        <FlatList
                            data={dataSource}
                            ListHeaderComponent={this.ListHeaderComponent}
                            renderItem={this.renderItem}
                            ListEmptyComponent={this.ListEmptyComponent}
                            keyExtractor={(item, index) => index + ''}
                            style={{ backgroundColor: '#fff' }}
                        />
                }
            </View>
        );
    }
}
