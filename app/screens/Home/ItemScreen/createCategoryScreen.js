import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {firebase} from '../../../firebase/config';
import Ionicons from 'react-native-vector-icons/Ionicons';
import vars from '../../../shared/globalVars';

const db = firebase.firestore();

const dataModel = {
  date: 0,
  amount: 0,
  category: 'uncategorized',
  title: '',
  type: 'spent',
};

export default function createCategoryScreen({navigation}) {
  const [title, setTitle] = useState('');
  const [color, setColor] = useState('');

  const handleAddItem = () => {
    if (sanitizeAmountInput(amount) <= 0) {
      return alert('Invalid amount');
    }
    if (!title) {
      return alert('Invalid title');
    }
    // Copy form values to the datamodel object
    dataModel.name = title;
    dataModel.iconName = 'person';
    dataModel.color = color;
    // Get the user data doc
    vars.docRef
      .doc(firebase.auth().currentUser.uid)
      .get()
      .then((doc) => {
        // Update the user data doc
        var userData = doc.data();
        userData.categories.push(dataModel);
        vars.docRef
          .doc(firebase.auth().currentUser.uid)
          .set(userData)
          .then(() => {
            alert('Added');
          })
          .catch((error) => {
            alert(error);
          });
      })
      .catch((error) => {
        alert(error);
      });
  };

  const handleCancelItem = () => {
    navigation.navigate('categoryScreen');
  };
  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        style={{flex: 1, width: '100%'}}
        keyboardShouldPersistTaps="always">
        {/* Category title input element */}
        <TextInput
          style={styles.input}
          placeholder="Title"
          placeholderTextColor="#aaaaaa"
          onChangeText={(text) => setTitle(text)}
          value={title}
          underlineColorAndroid={vars.colors.highlight}
          autoCapitalize="words"
        />
        {/* add color picker */}
      </KeyboardAwareScrollView>
      <View style={styles.footer}>
        {/* cancel button */}
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => handleCancelItem()}>
          <Ionicons name="close-outline" style={styles.footerButtonTitle} />
        </TouchableOpacity>
        {/* Add button */}
        <TouchableOpacity
          style={[styles.footerButton, styles.buttonActivated]}
          onPress={() => handleAddItem()}>
          <Ionicons
            name="checkmark-outline"
            style={[styles.footerButtonTitle, styles.buttonActivatedTitle]}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#ffffff',
  },
  transactionTypeContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  input: {
    height: 48,
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: 'white',
    margin: 20,
    marginVertical: 40,
    fontSize: 18,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    height: 48,
    borderRadius: 5,
  },
  buttonInActivated: {
    backgroundColor: vars.colors.ltGray,
  },
  buttonActivated: {
    backgroundColor: vars.colors.highlight,
  },
  buttonTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonInActivatedTitle: {
    color: vars.colors.dkGray,
  },
  buttonActivatedTitle: {
    color: '#ffffff',
  },
  categoryButtonTitle: {
    flex: 2,
    textAlign: 'left',
    color: '#000000',
  },
  categoryIcon: {
    flex: 1,
    width: 26,
    paddingLeft: 10,
    fontSize: 26,
  },
  amtCatContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginVertical: 40,
  },
  amount: {
    flex: 1,
    fontSize: 18,
  },
  categories: {
    flex: 1,
    marginLeft: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '105%',
    flex: 1,
    flexDirection: 'row',
    padding: 0,
  },
  footerButton: {
    flex: 1,
    margin: 0,
    paddingVertical: 20,
    alignItems: 'center',
    borderRadius: 0,
    backgroundColor: vars.colors.ltGray,
  },
  footerButtonTitle: {
    fontSize: 26,
  },
});
