/** @format */

import * as firebase from 'firebase';
import 'firebase/firestore';

const firebaseConfig = {
	apiKey: 'AIzaSyDXHrLpgMsl-tyN2h77pkTVLAvMAtRHZnI',
	authDomain: 'wily-e23b2.firebaseapp.com',
	databaseURL: 'https://wily-e23b2.firebaseio.com',
	projectId: 'wily-e23b2',
	storageBucket: 'wily-e23b2.appspot.com',
	messagingSenderId: '884017434164',
	appId: '1:884017434164:web:d03ec4405f1fba3a4f4461',
	measurementId: 'G-G80GENH1EC',
};

if (!firebase.apps.length) {
	// Initialize Firebase
	firebase.initializeApp(firebaseConfig);
}

export default firebase.firestore();
