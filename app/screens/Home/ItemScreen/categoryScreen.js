import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, FlatList, TouchableOpacity} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {get} from 'react-native/Libraries/Utilities/PixelRatio';
import {firebase} from '../../../firebase/config';
import colors from '../../../shared/globalVars';

const db = firebase.firestore();

export default function addItemScreen({navigation}) {
  const [categories, setCategories] = useState([]);
  const defaultCategories = [
    {
      name: 'Housing',
      iconName: 'home-outline',
    },
    {
      name: 'Transportation',
      iconName: 'bus-outline',
    },
    {
      name: 'Food',
      iconName: 'food-outline',
    },
    {
      name: 'Utilities',
      iconName: 'flash-outline',
    },
    {
      name: 'Insurance',
      iconName: 'shield-checkmark-outline',
    },
    {
      name: 'Healthcare',
      iconName: 'medkit-outline',
    },
    {
      name: 'Finance',
      iconName: 'cash-outline',
    },
    {
      name: 'Entertainment',
      iconName: 'film-outline',
    },
    {
      name: 'Miscellanenous',
      iconName: 'bookmark-outline',
    },
  ];

  // Get all categories from user doc
  useEffect(() => {
    let isSubscribed = true;
    db.collection('users')
      .doc(firebase.auth().currentUser.uid)
      .get()
      .then((doc) => {
        setCategories(doc.data().categories);
      })
      .catch((err) => console.log(err));
    return () => (isSubscribed = false); // unsubscribe on unmount
  }, []);

  const renderItem = ({item, index}) => {
    return (
      <View>
        <Text>{item.name}</Text>
        <Ionicons name={item.iconName} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        numColumns="3"></FlatList>
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
