/** @format */

import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createBottomTabNavigator } from 'react-navigation-tabs';

import Transaction from './screens/BookTransaction';
import Login from './screens/login';
import Search from './screens/SearchScreen';

export default class App extends React.Component {
	render() {
		return <AppContainer />;
	}
}

const TabNavigator = createBottomTabNavigator(
	{
		Transaction: { screen: Transaction },
		Search: { screen: Search },
	},
	{
		defaultNavigationOptions: ({ navigation }) => ({
			tabBarIcon: ({}) => {
				const routeName = navigation.state.routeName;
				if (routeName === 'Transaction') {
					return (
						<Image
							source={require('./assets/book.png')}
							style={{ width: 40, height: 40, marginBottom: 10 }}
						/>
					);
				}
				if (routeName === 'Search') {
					return (
						<Image
							source={require('./assets/searchingbook.png')}
							style={{ width: 40, height: 40, marginBottom: 10 }}
						/>
					);
				}
			},
		}),
	}
);

const SwitchNavigator = createSwitchNavigator({
	Login: { screen: Login },
	TabNavigator: { screen: TabNavigator },
});

var AppContainer = createAppContainer(SwitchNavigator);

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center',
	},
});
