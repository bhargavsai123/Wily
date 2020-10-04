/** @format */

import React from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import * as firebase from 'firebase';

export default class Login extends React.Component {
	constructor() {
		super();
		this.state = {
			email: '',
			password: '',
		};
	}
	login = async (email, password) => {
		if (email && password) {
			try {
				const response = await firebase
					.auth()
					.signInWithEmailAndPassword(email, password);
				if (response) {
					this.props.navigation.navigate('Transaction');
				}
			} catch (error) {
				switch (error.code) {
					case 'auth.user/not/found':
						Alert.alert('User Does not Exist');

					case 'auth/invalid-email':
						Alert.alert('Invalid EmailID');

					case 'auth/invalid-password':
						Alert.alert('Wrong Password');
				}
			}
		} else {
			Alert.alert('Please Enter Your Email ID and Password');
		}
	};
	render() {
		return (
			<View>
				<TextInput
					placeholder={'Email ID'}
					style={style.input}
					keyboardType={'email-address'}
					onChangeText={(text) => {
						this.setState({ email: text });
					}}
				/>
				<TextInput
					placeholder={'Password'}
					style={style.input}
					secureTextEntry={true}
					onChangeText={(text) => {
						this.setState({ password: text });
					}}
				/>
				<TouchableOpacity
					style={style.button}
					onPress={() => {
						this.login(this.state.email, this.state.password);
					}}>
					<Text style={style.text}>Login</Text>
				</TouchableOpacity>
			</View>
		);
	}
}

const style = StyleSheet.create({
	input: {
		borderWidth: 1.5,
		borderRadius: 5,
		marginTop: '10%',
		width: '90%',
		alignSelf: 'center',
	},
	button: {
		borderRadius: 5,
		borderWidth: 1,
		backgroundColor: 'blue',
		width: '30%',
		height: '30%',
		alignSelf: 'center',
		alignContent: 'center',
		justifyContent: 'center',
		marginTop: '5%',
	},
	text: {
		textAlign: 'center',
		color: '#ffffff',
	},
});
