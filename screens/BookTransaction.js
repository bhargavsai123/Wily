/** @format */

import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import {
	StyleSheet,
	Text,
	TextInput,
	View,
	TouchableOpacity,
	KeyboardAvoidingView,
	Image,
	Alert,
} from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import db from '../config';
import * as firebase from 'firebase';

export default class Transaction extends React.Component {
	constructor() {
		super();
		this.state = {
			hasCameraPermissions: null,
			scanned: false,
			scannedBookId: '',
			scannedStudentId: '',
			buttonState: 'normal',
			transactionMessage: '',
		};
	}
	getCameraPermissions = async (id) => {
		const { status } = await Permissions.askAsync(Permissions.CAMERA);
		this.setState({
			hasCameraPermissions: status === 'granted',
			buttonState: id,
		});
	};
	handleTransaction = async () => {
		var transactionType = await this.checkBookEligibility();
		console.log(transactionType);
		if (!transactionType) {
			Alert.alert('Book not Found');
			this.setState({ scannedStudentId: '', scannedBookId: '' });
		} else if (transactionType === 'Issue') {
			var isStudentEligible = await this.checkStudentEligibilityForBookIssue();
			if (isStudentEligible) this.initiateBookIssued();
			Alert.alert('Book Issued');
		} else {
			var isStudentEligible = await this.checkStudentEligibilityForBookReturn();
			if (isStudentEligible) this.initiateBookReturn();
			console.log(transactionType);
			Alert.alert('Book Returned');
		}
	};
	initiateBookIssued = async () => {
		db.collection('transactions').add({
			studentId: this.state.scannedStudentId,
			bookId: this.state.scannedBookId,
			date: firebase.firestore.Timestamp.now().toDate(),
			transactionType: 'Issue',
		});
		db.collection('books')
			.doc(this.state.scannedBookId)
			.update({ bookAvailability: false });
		db.collection('students')
			.doc(this.state.scannedStudentId)
			.update({
				numberOfBooksIssued: firebase.firestore.FieldValue.increment(1),
			});
		this.setState({ scannedStudentId: '', scannedBookId: '' });
	};
	initiateBookReturn = async () => {
		db.collection('transactions').add({
			studentId: this.state.scannedStudentId,
			bookId: this.state.scannedBookId,
			date: firebase.firestore.Timestamp.now().toDate(),
			transactionType: 'Return',
		});
		db.collection('books')
			.doc(this.state.scannedBookId)
			.update({ bookAvailability: true });
		db.collection('students')
			.doc(this.state.scannedStudentId)
			.update({
				numberOfBooksIssued: firebase.firestore.FieldValue.increment(-1),
			});
		Alert.alert('Book Returned');
		this.setState({ scannedStudentId: '', scannedBookId: '' });
	};
	checkBookEligibility = async () => {
		const bookRef = await db
			.collection('books')
			.where('bookId', '==', this.state.scannedBookId)
			.get();
		var transactionType = '';
		if (bookRef.docs.length == 0) {
			transactionType = 'false';
		} else {
			bookRef.docs.map((doc) => {
				var book = doc.data();
				if (book.bookAvailability) {
					transactionType = 'Issue';
				} else {
					transactionType = 'Return';
				}
			});
		}
		return transactionType;
	};
	checkStudentEligibilityForBookIssue = async () => {
		const studentRef = await db
			.collection('students')
			.where('studentId', '==', this.state.scannedStudentId)
			.get();
		var isStudentEligible = '';
		if (studentRef.docs.length == 0) {
			isStudentEligible = false;
			Alert.alert('Student ID not Found');
			this.setState({ scannedStudentId: '', scannedBookId: '' });
		} else {
			studentRef.docs.map((doc) => {
				var student = doc.data();
				if (student.numberOfBooksIssued < 2) {
					isStudentEligible = true;
				} else {
					isStudentEligible = false;
					Alert.alert('Student Has Issued 2 Books');
					this.setState({ scannedStudentId: '', scannedBookId: '' });
				}
			});
		}
		return isStudentEligible;
	};
	checkStudentEligibilityForBookReturn = async () => {
		const transactionRef = await db
			.collection('transactions')
			.where('bookId', '==', this.state.scannedBookId)
			.limit(1)
			.get();
		var isStudentEligible = '';
		console.log(isStudentEligible);
		transactionRef.docs.map((doc) => {
			var lastBookTransaction = doc.data();
			if (lastBookTransaction.studentId === this.state.scannedStudentId) {
				isStudentEligible = true;
			} else {
				isStudentEligible = false;
				Alert.alert('Book not Issued by the Student');
				this.setState({ scannedStudentId: '', scannedBookId: '' });
			}
		});
		return isStudentEligible;
	};
	handleBarCodeScanned = async ({ type, data }) => {
		const buttonState = this.state.buttonState;
		if (buttonState === 'BookID') {
			this.setState({
				scanned: true,
				scannedBookId: data,
				buttonState: 'normal',
			});
		}
		if (buttonState === 'StudentID') {
			this.setState({
				scanned: true,
				scannedStudentId: data,
				buttonState: 'normal',
			});
		}
	};
	render() {
		const hasCameraPermissions = this.state.hasCameraPermissions;
		const scanned = this.state.scanned;
		const buttonState = this.state.buttonState;
		if (buttonState != 'normal' && hasCameraPermissions) {
			return (
				<BarCodeScanner
					onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
					style={StyleSheet.absoluteFillObject}
				/>
			);
		} else if (buttonState === 'normal') {
			return (
				<KeyboardAvoidingView style={styles.container}>
					<Image
						style={{ width: 300, height: 300, alignSelf: 'center' }}
						source={require('../assets/booklogo.png')}
					/>
					<Text style={{ textAlign: 'center', fontSize: 30, color: '#111111' }}>
						Wily
					</Text>
					<View style={styles.inputView}>
						<TextInput
							style={styles.inputBox}
							placeholder=' Book Id'
							onChangeText={(text) => this.setState({ scannedBookId: text })}
							value={this.state.scannedBookId}
						/>
						<TouchableOpacity
							style={styles.scanButton}
							onPress={() => this.getCameraPermissions('BookID')}>
							<Text style={styles.buttonText}>Scan</Text>
						</TouchableOpacity>
					</View>
					<View style={styles.inputView}>
						<TextInput
							style={styles.inputBox}
							placeholder=' Student Id'
							onChangeText={(text) => this.setState({ scannedStudentId: text })}
							value={this.state.scannedStudentId}
						/>
						<TouchableOpacity
							style={styles.scanButton}
							onPress={() => this.getCameraPermissions('StudentID')}>
							<Text style={styles.buttonText}>Scan</Text>
						</TouchableOpacity>
					</View>
					<TouchableOpacity
						style={styles.submitButton}
						onPress={async () => {
							var transactionMessage = this.handleTransaction();
							console.log(transactionMessage);
						}}>
						<Text style={styles.submitButtonText}>Submit</Text>
					</TouchableOpacity>
				</KeyboardAvoidingView>
			);
		}
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center',
	},
	scanButton: {
		backgroundColor: '#2196F3',
		paddingHorizontal: 10,
		borderWidth: 1.5,
		borderRadius: 5,
		borderColor: '#333333',
		borderTopLeftRadius: 0,
		borderBottomLeftRadius: 0,
	},
	buttonText: {
		fontSize: 15,
		textAlign: 'center',
		marginTop: 10,
		color: '#ffffff',
	},
	inputView: {
		flexDirection: 'row',
		margin: 20,
		alignSelf: 'center',
	},
	inputBox: {
		width: 200,
		height: 40,
		borderColor: '#333333',
		borderWidth: 1.5,
		borderRightWidth: 0,
		borderRadius: 5,
		borderTopRightRadius: 0,
		borderBottomRightRadius: 0,
		fontSize: 20,
	},
	submitButton: {
		backgroundColor: '#FBC02D',
		borderColor: '#333333',
		width: 100,
		height: 50,
		paddingHorizontal: 6,
		borderWidth: 1.5,
		borderRadius: 5,
		alignSelf: 'center',
	},
	submitButtonText: {
		padding: 10,
		textAlign: 'center',
		fontSize: 20,
		fontWeight: 'bold',
		color: 'white',
	},
});
