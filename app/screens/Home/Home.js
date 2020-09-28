import React, {useState, useEffect} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {
  View,
  Text,
  TouchableOpacity,
  SectionList,
  StyleSheet,
} from 'react-native';
import {firebase} from '../../firebase/config';
import Ionicons from 'react-native-vector-icons/Ionicons';
import vars from '../../shared/globalVars';

export default function Home({navigation}) {
  const placeholderData = {
    fullName: 'User',
    transactions: [
      {
        date: 'Today',
        data: [
          {
            date: 0,
            title: 'No transactions',
          },
        ],
      },
    ],
  };
  const [categories, setCategories] = useState([]);
  const [userData, setUserData] = useState(placeholderData);

  const handleLogout = () => {
    firebase
      .auth()
      .signOut()
      .then(navigation.navigate('Login'))
      .catch((err) => alert('Error signing out!'));
  };
  // set states with sorted user data
  useEffect(() => {
    const subscriber = firebase.auth().onAuthStateChanged(sortUserData);
    return subscriber; // unsubscribe on unmount
  }, []);

  const sortUserData = () => {
    if (!firebase.auth().currentUser) {
      return navigation.navigate('Login');
    }
    console.log(firebase.auth().currentUser.uid);
    firebase
      .firestore()
      .collection('users')
      .doc(firebase.auth().currentUser.uid)
      .get()
      .then((doc) => {
        const ONE_DAY = 86400000;
        const TODAY = Date.now();
        // initialize user object with unprocessed data
        var sortedUserData = doc.data();
        // flush the unsorted transaction data
        sortedUserData.transactions = [];
        // unprocessed transactions list
        var unsortedTransactions = doc.data().transactions;
        // if no transactions exist, use a placeholder
        if (unsortedTransactions.length === 0) {
          return setUserData(placeholderData);
        }
        // get the first transaction date
        var firstDate = unsortedTransactions.reduce((prev, curr) =>
          prev.date < curr.date ? prev : curr,
        );
        var sectionDate = firstDate.date;
        while (sectionDate <= TODAY) {
          var transactionSection = {
            date: sectionDate,
            data: [],
          };
          for (let transaction of unsortedTransactions) {
            // if the transaction lies between one day of time, push it into that section
            if (
              transaction.date >= sectionDate &&
              transaction.date <= sectionDate + ONE_DAY
            ) {
              transactionSection.data.push(transaction);
            }
          }
          // if there are any transactions in the section, push it
          if (transactionSection.data.length > 0) {
            sortedUserData.transactions.push(transactionSection);
          }
          sectionDate += ONE_DAY;
        }
        setUserData(sortedUserData);
        combineCategories();
      })
      .catch((err) => console.log(err));
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

  const formatDate = (UTCString) => {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const dateObj = new Date(UTCString);
    const date = dateObj.getDate();
    const month = months[dateObj.getMonth()];
    return `${date} ${month}`;
  };

  const renderItem = ({item, index}) => {
    var itemCategory = categories.find(
      (el) => el.name.toLowerCase() == item.category,
    );
    if (!itemCategory) {
      itemCategory = {
        iconName: 'alert',
        color: 'ff0000',
      };
    }
    return (
      <View style={styles.transactionItemContainer}>
        <Ionicons
          name={itemCategory.iconName}
          style={[
            styles.categoryIcon,
            {
              backgroundColor: vars.hexToRGBA(itemCategory.color, 0.3),
              color: '#' + itemCategory.color,
            },
          ]}
        />
        <View style={styles.transactionData}>
          <Text style={styles.transactionTitle}>
            {item.title || 'No transactions yet'}
          </Text>
          <Text style={styles.transactionTime}>
            {new Date(item.date).getHours()}:{new Date(item.date).getMinutes()}
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
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.main}>
        <View style={styles.topBarContainer}>
          <Text style={styles.mainContentHeader}>
            Hello,
            <Text style={styles.headerUsername}> {userData.fullName}</Text>
          </Text>
          <Text style={styles.menuContainer}>
            <TouchableOpacity
              onPress={() => navigation.navigate('addItemScreen')}>
              <Ionicons name="add-outline" style={styles.topBarIcon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleLogout()}>
              <Ionicons name="menu" style={styles.topBarIcon} />
            </TouchableOpacity>
          </Text>
        </View>
        <View style={styles.overviewChart}></View>
        <View style={styles.overviewListContainer}>
          <SectionList
            sections={userData.transactions}
            keyExtractor={(item, index) => item + index}
            renderItem={renderItem}
            renderSectionHeader={({section: {date}}) => (
              <Text style={styles.sectionHeader}>{formatDate(date)}</Text>
            )}
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
  mainContentContainer: {},
  mainContentHeader: {
    fontSize: 30,
    fontWeight: '100',
    color: vars.colors.primary,
  },
  headerUsername: {
    fontWeight: 'bold',
  },
  overviewChart: {
    height: 150,
    margin: 20,
    marginHorizontal: 0,
    borderRadius: 20,
    backgroundColor: '#ffffff',
  },
  overviewListContainer: {
    height: '55%',
  },
  item: {
    backgroundColor: '#f9c2ff',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 0,
  },
  title: {
    fontSize: 32,
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
  transactionItemContainer: {
    flex: 1,
    flexDirection: 'row',
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
    backgroundColor: vars.hexToRGBA('A0D380', 0.2),
    color: '#A0D380',
  },
  amtSpent: {
    backgroundColor: vars.hexToRGBA('E39098', 0.2),
    color: '#E39098',
  },
});
