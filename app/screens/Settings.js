import React, {useState, useEffect} from 'react';
import {
  Alert,
  View,
  Text,
  TouchableOpacity,
  SectionList,
  TextInput,
  StyleSheet,
} from 'react-native';
import {firebase} from '../firebase/config';
import Ionicons from 'react-native-vector-icons/Ionicons';
import vars from '../shared/globalVars';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

export default function Settings({navigation}) {
  const [userData, setUserData] = useState({fullName: ''});
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(userData.fullName);
  const [email, setEmail] = useState(userData.email);
  const [currency, setCurrency] = useState(userData.currency);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confPassword, setConfPassword] = useState('');

  useEffect(() => {
    vars.docRef
      .doc(firebase.auth().currentUser.uid)
      .get()
      .then((doc) => {
        setUserData(doc.data());
        initStates(doc.data());
      })
      .catch((err) => console.log(err));
  }, []);

  const initStates = (data) => {
    setName(data.fullName);
    setEmail(data.email);
    setCurrency(data.currency);
    setOldPassword('');
    setNewPassword('');
    setConfPassword('');
  };
  const handleEditToggle = () => {
    if (editMode) {
      Alert.alert('Edit Profile', 'Do you want to save these changes?', [
        {
          text: 'Yes',
          onPress: () => {
            vars.docRef
              .doc(firebase.auth().currentUser.uid)
              .get()
              .then((doc) => {
                var data = doc.data();
                data.fullName = name;
                data.currency = currency;
                if (email !== data.email) {
                  data.email = email;
                  firebase
                    .auth()
                    .currentUser.updateEmail(email)
                    .then((err) => {
                      if (err) Alert.prompt(err);
                    });
                }
                if (newPassword !== confPassword) {
                  return alert('Passwords do not match!');
                }
                if (oldPassword !== '') {
                  var credential = firebase.auth.EmailAuthProvider.credential(
                    firebase.auth().currentUser.email,
                    oldPassword,
                  );
                  firebase
                    .auth()
                    .currentUser.reauthenticateWithCredential(credential)
                    .then(function () {
                      // User re-authenticated
                      firebase.auth().currentUser.updatePassword(newPassword);
                      setEditMode(false);
                    })
                    .catch(function (err) {
                      // Error occured
                      console.log(err);
                      return alert(err);
                    });
                }
                vars.docRef
                  .doc(firebase.auth().currentUser.uid)
                  .set(data)
                  .then(() => {
                    alert('Profile updated successfully!');
                    setEditMode(false);
                  })
                  .catch((err) => alert(err));
              });
          },
        },
        {
          text: 'No',
          onPress: () => {
            setEditMode(false);
            initStates();
          },
          style: 'cancel',
        },
      ]);
    } else setEditMode(true);
  };

  const handleLogout = () => {
    firebase
      .auth()
      .signOut()
      .then(navigation.navigate('Login'))
      .catch((err) => alert('Error signing out!'));
  };

  return (
    <KeyboardAwareScrollView style={styles.container}>
      <View style={styles.main}>
        <View style={styles.screenHeaderContainer}>
          <Text style={styles.screenHeader}>Profile</Text>
          <TouchableOpacity
            style={styles.headerRight}
            onPress={() => handleEditToggle()}>
            <Text>
              <Ionicons
                name={editMode ? 'checkmark-circle-outline' : 'create-outline'}
                style={[
                  styles.topBarIcon,
                  editMode
                    ? {color: vars.colors.highlight}
                    : {color: vars.colors.primary},
                ]}
              />
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.profileContainer}>
          {/* Name */}
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholderTextColor="#000000"
            value={name}
            onChangeText={(text) => setName(text)}
            underlineColorAndroid={editMode ? vars.colors.highlight : '#ffffff'}
            autoCapitalize="words"
            editable={editMode}
          />
          {/* Email */}
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholderTextColor="#000000"
            value={email}
            onChangeText={(text) => setEmail(text)}
            underlineColorAndroid={editMode ? vars.colors.highlight : '#ffffff'}
            autoCapitalize="words"
            editable={editMode}
          />
          {/* Currency */}
          <Text style={styles.label}>Currency</Text>
          <TextInput
            style={styles.input}
            placeholderTextColor="#000000"
            value={currency}
            onChangeText={(text) => setCurrency(text)}
            underlineColorAndroid={editMode ? vars.colors.highlight : '#ffffff'}
            autoCapitalize="words"
            editable={editMode}
          />
          {/* Password */}
          <View style={editMode ? {display: 'flex'} : {display: 'none'}}>
            <Text style={styles.label}>Change Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Old Password"
              placeholderTextColor="#aaaaaa"
              value={oldPassword}
              onChangeText={(text) => setOldPassword(text)}
              underlineColorAndroid={vars.colors.highlight}
              autoCapitalize="words"
              secureTextEntry={true}
            />
            <TextInput
              style={styles.input}
              placeholder="New Password"
              placeholderTextColor="#aaaaaa"
              value={newPassword}
              onChangeText={(text) => setNewPassword(text)}
              underlineColorAndroid={vars.colors.highlight}
              autoCapitalize="words"
              secureTextEntry={true}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm New Password"
              placeholderTextColor="#aaaaaa"
              value={confPassword}
              onChangeText={(text) => setConfPassword(text)}
              underlineColorAndroid={vars.colors.highlight}
              autoCapitalize="words"
              secureTextEntry={true}
            />
          </View>
        </View>
        <TouchableOpacity
          onPress={() => handleLogout()}
          style={styles.btnWideContainer}>
          <Text style={styles.btnText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  main: {
    padding: 30,
  },
  screenHeaderContainer: {
    flexDirection: 'row',
  },
  screenHeader: {
    fontSize: 25,
    fontWeight: 'bold',
    color: vars.colors.primary,
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  topBarIcon: {
    fontSize: 30,
    color: vars.colors.primary,
  },
  profileContainer: {
    marginVertical: 20,
  },
  label: {
    marginBottom: 5,
    color: vars.colors.dkGray,
    fontWeight: 'bold',
    fontSize: 12,
  },
  input: {
    marginBottom: 20,
    fontSize: 18,
    color: '#000000',
  },
  btnWideContainer: {
    marginHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#E17283',
    color: '#ffffff',
    borderRadius: 10,
  },
  btnText: {
    textAlign: 'center',
    color: '#ffffff',
    fontSize: 15,
  },
});
