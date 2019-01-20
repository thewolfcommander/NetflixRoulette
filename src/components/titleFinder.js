import React, { Component } from 'react'
import { StyleSheet, Text, View, Slider, Button, Image, ScrollView, ActivityIndicator } from 'react-native'

import * as Constants from '../constants';
import Header from './header'
import Tab from './tab'
import { getRecommendationUrl } from '../utils'
import Recommendation from '../components/recommendation'

const TypeSelector = ({activeTab, onTabPress}) => {
    return (
        <View style={{ flexDirection: 'row'}}>
            <Tab name={Constants.TV_SHOWS} isActive={activeTab === Constants.TV_SHOWS} onPress={onTabPress} />
            <Tab name={Constants.MOVIES} isActive={activeTab === Constants.MOVIES} onPress={onTabPress} />
        </View>
    )
}


export default class TitleFinder extends Component {


    constructor(props) {
        super(props)
        this.state = {
            loading: false,
            error: null, 
            data: null,
            minimumScore: 0,
            activeTab: Constants.TV_SHOWS
        }
    } 

    renderSpinButton () {
        const buttonText = this.state.data ? 'Spin again!' : 'Spin!';

        return (
            <View style={styles.buttonContainer}>
                <Button onPress={this.fetchData.bind(this)} title={buttonText} />
            </View>
        )
    }

    renderScorePicker () {
        const scoreToDisplay = this.state.minimumScore === 0 ? 'Any' : `More than ${this.state.minimumScore}`

        return (
            <React.Fragment>

                <Text style={styles.scoreLabel}>
                    IMDB Score:
                </Text>

                <Slider step={1} minimumValue={0} maximumValue={9} onValueChange={(newValue) => this.setState({minimumScore:newValue})} value={this.state.minimumScore} style={styles.scoreSlider} />

                <Text style={styles.scoreValue}>
                    {scoreToDisplay}
                </Text>
            </React.Fragment>
        )
    }


    renderType () {
        return (
            <TypeSelector activeTab={this.state.activeTab} onTabPress={this.onTabPress} />
        )
    }


    renderForm() {
        return (
            <View style={styles.container}>
                <Header title='NetFlix Roulette' />
                {this.renderType()}
                {this.renderScorePicker()}
                {this.renderSpinButton()}
            </View>
            
        )
    }

    renderRecommendation (recommendation) {
        const { id } = recommendation
        return (
            <ScrollView style={styles.recommendationContainer}>
                <Recommendation {...recommendation} />
                {this.renderSpinButton()}
                {this.renderResetButton()}
            </ScrollView>
        )
    }

    renderResetButton () {
        return (
            <View style={styles.buttonContainer}>
                <Button onPress={this.renderScorePicker.bind(this)} title='Reset filters!' />
            </View>
        )
    }

    reset () {
        this.setState({
            loading: false,
            error: false,
            data: null,
            minimumScore: 0,
            activeTab: Constants.TV_SHOWS
        })
    }

    onTabPress = tab => {
        this.setState({ activeTab: tab })
    }
    
    render() {
        const { loading, data, error, activeTab} = this.state
        let content
        if (data) {
            return this.renderRecommendation(data)
        } else if (loading) {
            content = <ActivityIndicator size='large' />
        } else if (error) {
            content = <Text> Ops! </Text>
        } else {
            content = this.renderForm()
        }

        return (
            <View style={loading ? styles.loaderContainer : styles.container}>
                {content}
            </View> 
        )
    }

    fetchData () {
        const { activeTab, minimumScore } = this.state
        const url = getRecommendationUrl({activeTab, minimumScore})
        this.setState({
            loading: true,
            data: null,
            error: false,
        }, () => {
            fetch(url).then((recommendationResponse) =>
            recommendationResponse.json()).then((recommendationJSON) => {
                this.setState ({
                    data: recommendationJSON,
                    error: false,
                    loading: false
                })
            })
            .catch((error) => {
                this.setState({
                    loading: false,
                    error: false,
                    data: null
                })
            })
        })
    }

}


const styles = StyleSheet.create({
    loaderContainer: {
      flex: 1,
      backgroundColor: '#008080',
      alignItems: 'center',
      justifyContent: 'center',
    },
    scoreLabel: {
        paddingTop: 20,
        paddingLeft: 10,
    },
    scoreValue: {
        textAlign: 'center',
        marginBottom: 10
    },
    scoreSlider: {
        margin: 10,
    },
    recommendationContainer: {
        marginBottom: 10,
    },
    buttonContainer: {
        paddingHorizontal: 20,
        paddingVertical: 8,
    }
});


