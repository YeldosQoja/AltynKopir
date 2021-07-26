import React, { Component } from 'react';
import { View, Text, FlatList, TextInput } from 'react-native';
import { ButtonApp } from '../../../../components/ButtonApp';
import InputContainer from '../../../../components/InputContainer';
import Loading from '../../../../components/Loading';
import NoData from '../../../../components/NoData';
import { strings } from '../../../../localization/Localization';
import { StateContext } from '../../../../provider/ProviderApp';
import { ColorApp } from '../../../../theme/color/ColorApp';
import { setFont } from '../../../../theme/font/FontApp';

export default class MyBalance extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: [{}, {}],
            isLoading: true,
            edit: false,
            sum: '',
            disabled: true,
            isLoadingBtn: false
        };
    }


    static contextType = StateContext;

    componentDidMount() {
        this.props.navigation.setOptions({
            title: strings["Мой баланс"],
            headerStyle: { backgroundColor: this.globalState.bottomBar ? this.globalState.bottomBar.color_app : ColorApp.main, }
        });
    }

    ListHeaderComponent = () => (
        <View style={{ paddingTop: 16, paddingBottom: 24, paddingHorizontal: 16, borderBottomWidth: 0.5, borderBottomColor: ColorApp.border }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <Text style={[setFont(28, 'bold')]}>{strings["Мой баланс"]}</Text>
                <Text style={[setFont(17)]}>2,585₸</Text>
            </View>
            <InputContainer style={{ marginBottom: 8 }}>
                <TextInput
                    placeholder={strings["Введите сумму вывода"]}
                    placeholderTextColor={ColorApp.placeholder}
                    style={[setFont(17, 'normal', '#000', null, 'input'), { paddingVertical: 0 }]}
                    keyboardType='decimal-pad'
                    underlineColorAndroid={ColorApp.transparent}
                    onChangeText={sum => this.setState({ sum })}
                    onEndEditing={() => this.setState({
                        edit: this.state.sum.length > 0 ? true : false,
                        disabled: this.state.sum.length > 0 ? false : true
                    })}
                    contextMenuHidden
                />
            </InputContainer>

            <ButtonApp
                disabled={this.state.disabled}
                isLoading={this.state.isLoadingBtn}
                text={strings["Запросить вывод денег"]}
                style={{ backgroundColor: this.state.edit ? ColorApp.action : ColorApp.fade }}
            />
        </View>
    );

    renderItem = ({ item, index }) => (
        <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
            {
                index == 0 ?
                    <Text style={[setFont(20, 'bold'), { marginBottom: 20 }]}>{strings["История транзакции"]}</Text>
                    :
                    null
            }
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ flex: 1, marginRight: 45 }}>
                    <Text style={[setFont(15), { marginBottom: 4 }]}>Вывод денег со счета</Text>
                    <Text style={[setFont(15)]}>15 августа в 16:05</Text>
                </View>
                <Text>- 2,585₸</Text>
            </View>
            <View style={{ position: 'absolute', bottom: 0, left: 16, right: 0, height: 1, backgroundColor: ColorApp.border }} />
        </View>
    );

    ListEmptyComponent = () => (
        <NoData text=' ' />
    );

    render() {

        const { dataSource, isLoading } = this.state;

        this.globalState = this.context

        return (
            <View style={{ flex: 1, backgroundColor: ColorApp.bg }}>
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
                        />
                }
            </View>
        );
    }
}
