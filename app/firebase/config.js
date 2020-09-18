import * as firebase from 'firebase';
import '@firebase/auth';
import '@firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyANhwez6JdmY7wkiWq6LS_ZF55hYCdceC0',
  authDomain: 'xpense-fae94.firebaseapp.com',
  databaseURL: 'https://xpense-fae94.firebaseio.com',
  projectId: 'xpense-fae94',
  storageBucket: 'xpense-fae94.appspot.com',
  messagingSenderId: '352081677363',
  appId: '1:352081677363:android:0b62a56e36ad5e5269e746',
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
  firebase.firestore().settings({experimentalForceLongPolling: true});
}

export {firebase};
