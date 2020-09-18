import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {firebase} from '../../firebase/config';
import colors from '../../shared/globalVars';

const db = firebase.firestore();

const dataModel = {
  date: 0,
  amount: 0,
  category: 'uncategoriezed',
  title: '',
  type: 'spent',
};

export default function addItemScreen({navigation}) {
  const [category, setCategory] = useState('miscellaneous');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('0');
  const [selectedType, setSelectedType] = useState('spent');

  const sanitizeAmountInput = (text) => {
    // only allow input of upto 2 digits after the decimal point
    if (text.indexOf('.') !== -1) {
      text = text.split('.');
      if (text.length == 2 && text[1].length > 2) {
        text[1] = text[1].slice(0, 2);
        return text.join('.');
      } else return text.join('.');
    } else return text.replace(/[^\d]/g, ''); // regex to replace any non-numeric values
  };

  const handleAddItem = () => {
    if (sanitizeAmountInput(amount) <= 0) {
      return alert('Invalid amount');
    }
    if (!title) {
      return alert('Invalid title');
    }
    // Copy form values to the datamodel object
    dataModel.date = Date.now();
    dataModel.category = category;
    dataModel.title = title;
    dataModel.amount = sanitizeAmountInput(amount);
    dataModel.type = selectedType;
    // Get the user data doc
    db.collection('users')
      .doc(firebase.auth().currentUser.uid)
      .get()
      .then((doc) => {
        // Update the user data doc
        var userData = doc.data();
        userData.transactions.push(dataModel);
        db.collection('users')
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
    navigation.navigate('App');
  };
  const handleCategory = () => {
    navigation.navigate('categoryScreen');
  };
  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        style={{flex: 1, width: '100%'}}
        keyboardShouldPersistTaps="always">
        {/* Transaction Category wrapper */}
        <View style={styles.transactionTypeContainer}>
          {/* Highlight the selected button - earned */}
          <TouchableOpacity
            style={[
              styles.button,
              selectedType === 'earned'
                ? styles.buttonActivated
                : styles.buttonInActivated,
            ]}
            onPress={() => setSelectedType('earned')}>
            <Text
              style={[
                styles.buttonTitle,
                selectedType === 'earned'
                  ? styles.buttonActivatedTitle
                  : styles.buttonInActivatedTitle,
              ]}>
              Earned
            </Text>
          </TouchableOpacity>
          {/* Highlight the selected button - spent */}
          <TouchableOpacity
            style={[
              styles.button,
              selectedType === 'spent'
                ? styles.buttonActivated
                : styles.buttonInActivated,
            ]}
            onPress={() => setSelectedType('spent')}>
            <Text
              style={[
                styles.buttonTitle,
                selectedType === 'spent'
                  ? styles.buttonActivatedTitle
                  : styles.buttonInActivatedTitle,
              ]}>
              Spent
            </Text>
          </TouchableOpacity>
        </View>
        {/* Transaction title input element */}
        <TextInput
          style={styles.input}
          placeholder="Title"
          placeholderTextColor="#aaaaaa"
          onChangeText={(text) => setTitle(text)}
          value={title}
          underlineColorAndroid={colors.highlight}
          autoCapitalize="words"
        />
        {/* Wrap amount text input and category picker into one line */}
        <View style={styles.amtCatContainer}>
          {/* Transaction amount input element */}
          <TextInput
            style={styles.amount}
            placeholder="Amount"
            keyboardType="numeric"
            placeholderTextColor="#aaaaaa"
            onChangeText={(text) => setAmount(sanitizeAmountInput(text))}
            value={amount}
            underlineColorAndroid={colors.highlight}
            autoCapitalize="words"
          />
          {/* Transaction category picker element */}
          <TouchableOpacity
            style={[styles.button, styles.buttonInActivated]}
            onPress={() => handleCategory()}>
            <Text style={[styles.buttonTitle, styles.buttonInActivatedTitle]}>
              Select Category
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.transactionTypeContainer}>
          {/* cancel button */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => handleCancelItem()}>
            <Text style={styles.buttonTitle}>cancel</Text>
          </TouchableOpacity>
          {/* Add button */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => handleAddItem()}>
            <Text style={styles.buttonTitle}>Add</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
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
    margin: 20,
    height: 48,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonInActivated: {
    backgroundColor: colors.ltGray,
  },
  buttonActivated: {
    backgroundColor: colors.highlight,
  },
  buttonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonInActivatedTitle: {
    color: colors.dkGray,
  },
  buttonActivatedTitle: {
    color: '#ffffff',
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
});
