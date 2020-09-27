/** @format */

import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import db from '../config';
import * as firebase from 'firebase';
import { TextInput } from 'react-native-gesture-handler';

export default class Search extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			allTransactions: [],
			lastVisibleTransaction: null,
		};
	}
	componentDidMount = async () => {
		const query = await db.collection('transactions').get();
		query.docs.map((doc) => {
			this.setState({
				allTransactions: [...this.state.allTransactions, doc.data()],
			});
		});
	};
	fetchMoreTransactions = async () => {
		const query = await db
			.collection('transactions')
			.startAfter(this.state.lastVisibleTransaction)
			.limit(10)
			.get();
		query.docs.map((doc) => {
			this.setState({
				allTransactions: [...this.state.allTransactions, doc.data()],
				lastVisibleTransaction: doc,
			});
		});
	};
	render() {
		return (
			<View>
				<View>
					<TextInput style={styles.input} placeholder={'Type Here'} />
				</View>
				<FlatList
					data={this.state.allTransactions}
					renderItem={({ item }) => (
						<View style={{ borderBottomWidth: 2 }}>
							<Text>{'bookId : ' + item.bookId}</Text>
							<Text>{'data : ' + item.date.toDate()}</Text>
							<Text>{'studentId : ' + item.studentId}</Text>
							<Text>{'transactionType : ' + item.transactionType}</Text>
						</View>
					)}
					keyExtractor={(item, index) => index.toString()}
					onEndReached={this.fetchMoreTransactions()}
					onEndReachedThreshold={0.7}
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
		borderWidth: 1,
		borderRadius: 10,
	},
});
