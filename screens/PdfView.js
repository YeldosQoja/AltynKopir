import React, { Component } from 'react';
import { View, Text, StyleSheet, Dimensions, Linking } from 'react-native';
import { ColorApp } from '../theme/color/ColorApp';
import Pdf from 'react-native-pdf';
import { Alert } from 'react-native';
import { strings } from '../localization/Localization';
import { StateContext } from '../provider/ProviderApp';

export default class PdfView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isFirst: true
        };
        this.pdfData = props.route.params.pdfFile;
        console.log(this.pdfData);
    }

    static contextType = StateContext;

    componentDidMount() {
        this.props.navigation.setOptions({ title: this.pdfData.title, headerStyle: { backgroundColor: this.globalState.bottomBar ? this.globalState.bottomBar.color_app : ColorApp.main, } });
    }

    render() {

        this.globalState = this.context;

        return (
            <View style={styles.container}>
                <Pdf
                    source={{ uri: encodeURI(this.pdfData.file), cache: true }}
                    onLoadComplete={(numberOfPages, filePath) => {
                        console.log(`number of pages: ${numberOfPages}`);
                    }}
                    onPageChanged={(page, numberOfPages) => {
                        console.log(`current page: ${page}`);
                    }}
                    onError={(error) => {
                        console.log(error);
                        console.log(error == "Error: canceled");

                        if (!(error == "Error: canceled")) {
                            if (this.state.isFirst) {
                                this.setState({ isFirst: false });
                                Alert.alert(strings["Внимание!"], strings["Что-то пошло не так"], [{ text: "OK", onPress: () => this.props.navigation.goBack() }]);
                            }
                        }
                    }}
                    onPressLink={(uri) => {
                        console.log(`Link presse: ${uri}`)
                        Linking.openURL(uri)
                    }}
                    activityIndicatorProps={{ color: ColorApp.main, progressTintColor: ColorApp.main }}
                    style={styles.pdf}
                />
            </View>
        );
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: ColorApp.bg
    },
    pdf: {
        flex: 1,
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    }
});
