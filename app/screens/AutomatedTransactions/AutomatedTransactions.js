import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, FlatList, StyleSheet} from 'react-native';
import {firebase} from '../../firebase/config';
import OverviewChart from '../../components/OverviewChart';
import Ionicons from 'react-native-vector-icons/Ionicons';
import vars from '../../shared/globalVars';

export default function AutomatedTransactions({navigation}) {
  const [userData, setUserData] = useState([]);
  const [automatedBillsList, setautomatedBillsList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [multiselect, setMultiselect] = useState(false);

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
    const subscriber = firebase
      .firestore()
      .collection('users')
      .doc(firebase.auth().currentUser.uid)
      .onSnapshot(sortUserData);
    return subscriber;
  }, []);

  const sortUserData = () => {
    firebase
      .firestore()
      .collection('users')
      .doc(firebase.auth().currentUser.uid)
      .get()
      .then((doc) => {
        setautomatedBillsList(doc.data().automatedTransactions);
        setUserData(doc.data());
        combineCategories();
      });
  };
  const combineCategories = () => {
    firebase
      .firestore()
      .collection('users')
      .doc(firebase.auth().currentUser.uid)
      .get()
      .then((doc) => {
        setCategories(vars.defaultCategories.concat(doc.data().userCategories));
      })
      .catch((err) => console.log(err));
  };

  const handleItemDetails = (item) => {
    // navigation.navigate('ItemDetailsScreen', {bill: item});
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
        style={[
          styles.billItemContainer,
          {backgroundColor: item.selected ? '#ff0000' : '#ffffff'},
        ]}
        onLongPress={() => {
          item.selected = true;
          setMultiselect(true);
        }}
        onPress={() => {
          if (multiselect) {
            handleMultiSelect(item);
          } else handleItemDetails(item);
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
        <View style={styles.billData}>
          <Text style={styles.billTitle}>{item.title || 'No bills yet'}</Text>
          <Text style={styles.billFrequency}>{item.frequency}</Text>
        </View>
        <View style={styles.billAmt}>
          <Text
            style={[
              styles.billAmtText,
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
      <View style={styles.main}>
        <View
          style={[
            styles.topBarContainer,
            {display: multiselect ? 'none' : 'flex'},
          ]}>
          <Text style={styles.headerText}>Automated Bills</Text>
          <Text style={styles.menuContainer}>
            <TouchableOpacity
              onPress={() => navigation.navigate('addAutoTransScreen')}>
              <Ionicons name="add-outline" style={styles.topBarIcon} />
            </TouchableOpacity>
          </Text>
        </View>
        <View style={styles.automatedBillsList}>
          <FlatList
            data={automatedBillsList}
            keyExtractor={(item, index) => item + index}
            renderItem={renderItem}
            contentContainerStyle={{paddingBottom: 100}}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  background: {
    position: 'absolute',
    height: '40%',
    width: '100%',
    backgroundColor: vars.colors.primary,
  },
  main: {
    padding: 30,
    paddingHorizontal: 30,
  },
  topBarContainer: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  searchContainer: {
    flex: 1,
  },
  menuContainer: {
    flex: 1,
    textAlign: 'right',
    textAlignVertical: 'center',
  },
  topBarIcon: {
    color: vars.colors.primary,
    fontWeight: 'bold',
    fontSize: 30,
  },
  headerText: {
    fontSize: 30,
    fontWeight: '100',
    color: '#000000',
  },
  headerUsername: {
    fontWeight: 'bold',
  },
  multiselectTopBar: {
    flexDirection: 'row',
    textAlignVertical: 'center',
  },
  multiselectAlignLeft: {
    flex: 1,
    flexDirection: 'row',
    textAlignVertical: 'center',
  },
  multiselectAlignRight: {
    flex: 1,
    flexDirection: 'row',
    textAlign: 'right',
  },
  multiselectItem: {
    paddingRight: 10,
    fontSize: 25,
  },
  automatedBillsList: {
    height: '100%',
  },
  overviewList: {
    paddingTop: 10,
  },
  sectionHeader: {
    fontSize: 20,
    marginVertical: 20,
    color: vars.colors.dkGray,
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
  billItemContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomColor: '#eeeeee',
    borderBottomWidth: 1,
  },
  billData: {
    marginLeft: 20,
    flex: 5,
    color: vars.colors.dkGray,
    paddingTop: 10,
  },
  billFrequency: {
    color: vars.colors.dkGray,
  },
  billAmt: {
    marginTop: 10,
  },
  billAmtText: {
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
