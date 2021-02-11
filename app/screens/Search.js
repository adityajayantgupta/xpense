import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import {firebase} from '../firebase/config';
import Ionicons from 'react-native-vector-icons/Ionicons';
import vars from '../shared/globalVars';
const fuzzysort = require('fuzzysort');

export default function Search({navigation}) {
  const [userData, setUserData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // set states with sorted user data
  useEffect(() => {
    const subscriber = firebase.auth().onAuthStateChanged(sortUserData);
    if (!firebase.auth().currentUser) {
      navigation.navigate('Login');
    }
    return subscriber; // unsubscribe on unmount
  }, []);

  // subscribe to data updates
  useEffect(() => {
    const subscriber = vars.docRef
      .doc(firebase.auth().currentUser.uid)
      .onSnapshot(sortUserData);
    return subscriber;
  }, []);

  const sortUserData = () => {
    vars.docRef
      .doc(firebase.auth().currentUser.uid)
      .get()
      .then((doc) => {
        setUserData(doc.data());
        combineCategories();
      });
  };
  const combineCategories = () => {
    vars.docRef
      .doc(firebase.auth().currentUser.uid)
      .get()
      .then((doc) => {
        setCategories(vars.defaultCategories.concat(doc.data().userCategories));
      })
      .catch((err) => console.log(err));
  };

  const handleItemDetails = (item) => {
    navigation.navigate('ItemDetailsScreen', {transaction: item});
  };

  const handleSearchUpdate = (text) => {
    setQuery(text);
    var results = fuzzysort.go(text, userData.transactions, {
      keys: ['title', 'category'],
    });
    var resultsArray = [];
    results.forEach((e) => resultsArray.push(e.obj));
    setSearchResults(resultsArray);
  };

  const renderItem = ({item, index}) => {
    if (!item) return;
    var itemCategory = categories.find(
      (el) => el.name.toLowerCase() == item.category.toLowerCase(),
    );
    if (!itemCategory) {
      itemCategory = {
        iconName: 'alert',
        color: '#ff0000',
      };
    }
    // add a "selected" property to every list item
    item['selected'] = false;

    return (
      <TouchableOpacity
        style={styles.transactionItemContainer}
        onPress={() => {
          handleItemDetails(item);
        }}>
        <Ionicons
          name={itemCategory.iconName}
          style={[
            styles.categoryIcon,
            {
              backgroundColor: vars.hexToRGBA(itemCategory.color, 0.3),
              color: itemCategory.color,
            },
          ]}
        />
        <View style={styles.transactionData}>
          <Text style={styles.transactionTitle}>
            {item.title || 'No transactions yet'}
          </Text>
          <Text style={styles.transactionTime}>
            {new Date(item.date).toLocaleString()}
          </Text>
        </View>
        <View style={styles.transactionAmt}>
          <Text
            style={[
              styles.transactionAmtText,
              item.type === 'earned' ? styles.amtEarned : styles.amtSpent,
            ]}>
            {userData.currency} {item.amount}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBarContainer}>
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}>
          <Ionicons
            name="arrow-back-outline"
            style={[styles.topBarItem, styles.navBackBtn]}
          />
        </TouchableOpacity>
        <TextInput
          style={[styles.topBarItem, styles.searchBar]}
          placeholderTextColor="#aaaaaa"
          placeholder="Search by name or category"
          value={query}
          onChangeText={(text) => handleSearchUpdate(text)}
          autoCapitalize="words"
          autoFocus={true}
        />
      </View>

      <View style={styles.searchResultsContainer}>
        <FlatList
          data={searchResults}
          keyExtractor={(item, index) => item + index}
          renderItem={renderItem}
          contentContainerStyle={{paddingBottom: 100}}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    paddingLeft: 20,
    backgroundColor: '#ffffff',
  },
  topBarContainer: {
    flexDirection: 'row',
  },
  topBarItem: {
    flex: 1,
    textAlignVertical: 'center',
  },
  navBackBtn: {
    fontSize: 25,
    marginRight: 10,
    color: vars.colors.dkGray,
  },
  searchBar: {
    flex: 1,
    padding: 10,
    paddingLeft: 15,
    fontSize: 18,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: vars.colors.dkGray,
  },
  screenHeader: {
    fontSize: 25,
    fontWeight: 'bold',
    color: vars.colors.primary,
  },
  categoryIcon: {
    flex: 1,
    margin: 5,
    aspectRatio: 1,
    padding: 5,
    borderRadius: 20,
    fontSize: 20,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  searchResultsContainer: {
    marginTop: 10,
  },
  transactionItemContainer: {
    flex: 1,
    flexDirection: 'row',
    marginVertical: 10,
  },
  transactionData: {
    marginLeft: 20,
    flex: 5,
    color: vars.colors.dkGray,
    paddingTop: 10,
  },
  transactionAmt: {
    marginTop: 10,
  },
  transactionAmtText: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  amtEarned: {
    backgroundColor: vars.hexToRGBA(vars.colors.green, 0.2),
    color: vars.colors.green,
  },
  amtSpent: {
    backgroundColor: vars.hexToRGBA(vars.colors.red, 0.2),
    color: vars.colors.red,
  },
});
