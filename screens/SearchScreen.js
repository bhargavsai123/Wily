/** @format */

import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
	StyleSheet,
	Text,
	TextInput,
	View,
	FlatList,
	TouchableOpacity,
} from 'react-native';
import db from '../config';
import * as firebase from 'firebase';

export default class Search extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			allTransactions: [],
			search: '',
		};
	}
	componentDidMount = async () => {
		const query = await db.collection('transactions').get();
		query.docs.map((doc) => {
			this.setState({
				allTransactions: [],
			});
		});
	};
	searchTransaction = async (text) => {
		var enterText = text.split('');
		if (enterText[0].toUpperCase() === 'B') {
			const transactions = await db
				.collection('transactions')
				.where('bookId', '==', text)
				.get();
			transactions.docs.map((doc) => {
				this.setState({
					allTransactions: [...this.state.allTransactions, doc.data()],
				});
			});
		} else if (enterText[0].toUpperCase() === 'S') {
			const transactions = await db
				.collection('transactions')
				.where('studentId', '==', text)
				.get();
			transactions.docs.map((doc) => {
				this.setState({
					allTransactions: [...this.state.allTransactions, doc.data()],
				});
			});
		}
	};
	render() {
		return (
			<View>
				<TextInput
					placeHolder={'Enter BookID or StudentID'}
					style={styles.input}
					onChangeText={(text) => {
						this.setState({ search: text });
					}}
				/>
				<TouchableOpacity
					style={{
						width: 50,
						height: 30,
						borderRadius: 5,
						borderWidth: 2,
						alignSelf: 'center',
					}}
					onPress={() => this.searchTransaction(this.state.search)}>
					<Text>Search</Text>
				</TouchableOpacity>
				<FlatList
					data={this.state.allTransactions}
					renderItem={({ item }) => (
						<View style={{ borderBottomWidth: 2 }}>
							<Text>{'bookId : ' + item.bookId}</Text>
							<Text>{'data : ' + item.date}</Text>
							<Text>{'studentId : ' + item.studentId}</Text>
							<Text>{'transactionType : ' + item.transactionType}</Text>
						</View>
					)}
					keyExtractor={(item, index) => index.toString()}
				/>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center',
	},
	input: {
		width: '90%',
		height: 30,
		borderRadius: 5,
		borderWidth: 2,
		alignSelf: 'center',
		marginTop: '10%',
	},
});
