import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SectionList,
  StyleSheet,
} from 'react-native';
import {firebase} from '../../firebase/config';
import OverviewChart from '../../components/OverviewChart';
import Ionicons from 'react-native-vector-icons/Ionicons';
import vars from '../../shared/globalVars';
import {add} from 'react-native-reanimated';

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

  // check for automatic transactions
  useEffect(() => {
    firebase
      .firestore()
      .collection('users')
      .doc(firebase.auth().currentUser.uid)
      .get()
      .then((doc) => {
        const ONE_DAY = 86400000;
        const ONE_WEEK = ONE_DAY * 7;
        const ONE_MONTH = ONE_DAY * 28;
        const ONE_YEAR = ONE_DAY * 365;
        var userData = doc.data();
        var automatedTransactions = userData.automatedTransactions;
        var transactions = userData.transactions;

        for (transaction of automatedTransactions) {
          switch (transaction.frequency) {
            case 'daily':
              ({transaction, transactions} = addAutoTransaction(
                transaction,
                transactions,
                ONE_DAY,
              ));
              break;
            case 'weekly':
              ({transaction, transactions} = addAutoTransaction(
                transaction,
                transactions,
                ONE_WEEK,
              ));
              break;
            case 'monthly':
              ({transaction, transactions} = addAutoTransaction(
                transaction,
                transactions,
                ONE_MONTH,
              ));
              break;
            case 'yearly':
              ({transaction, transactions} = addAutoTransaction(
                transaction,
                transactions,
                ONE_YEAR,
              ));
              break;
          }
          userData.automatedTransactions = automatedTransactions;
          userData.transactions = transactions;
          firebase
            .firestore()
            .collection('users')
            .doc(firebase.auth().currentUser.uid)
            .set(userData)
            .catch((err) => console.log(err));
        }
      })
      .catch((err) => console.log(err));
  });

  const addAutoTransaction = (transaction, transactions, TIME_CONST) => {
    const TODAY = Date.now();
    var timeDifference = parseInt(
      (TODAY - transaction.lastTransactionDate) / TIME_CONST,
    );
    if (timeDifference >= 1) {
      for (let count = 0; count < timeDifference - 1; count++) {
        var dataModel = {
          date: Date.now() - TIME_CONST * count,
          category: transaction.category,
          title: transaction.title,
          amount: transaction.amount,
          type: transaction.type,
        };
        transactions.push(dataModel);
        dataModel.date -= TIME_CONST;
      }
      transaction.lastTransactionDate = Date.now();
    }
    return {transaction, transactions};
  };

  const sortUserData = () => {
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
        sortedUserData.transactions = sortedUserData.transactions.reverse();
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

  const handleLogout = () => {
    firebase
      .auth()
      .signOut()
      .then(navigation.navigate('Login'))
      .catch((err) => alert('Error signing out!'));
  };

  const handleMultiSelect = (item) => {
    setUserData(
      userData.transactions.map((section) => {
        section.data.map((i) => {
          if (i.date === item.date) {
            i.selected = !i.selected;
          }
          return i;
        });
        return section;
      }),
    );

    console.log(userData.transactions);
  };

  const handleItemDetails = (item) => {
    navigation.navigate('ItemDetailsScreen', {transaction: item});
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
          styles.transactionItemContainer,
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
        <View style={styles.transactionData}>
          <Text style={styles.transactionTitle}>
            {item.title || 'No transactions yet'}
          </Text>
          <Text style={styles.transactionTime}>
            {new Date(item.date).getHours()}:
            {new Date(item.date).getMinutes() < 10
              ? '0' + new Date(item.date).getMinutes()
              : new Date(item.date).getMinutes()}
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
      <View style={styles.main}>
        <View
          style={[
            styles.topBarContainer,
            {display: multiselect ? 'none' : 'flex'},
          ]}>
          <Text style={styles.greetingText}>
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
        <View style={styles.overviewChart}>
          <OverviewChart></OverviewChart>
        </View>
        <View style={styles.overviewListContainer}>
          <SectionList
            sections={userData.transactions}
            keyExtractor={(item, index) => item + index}
            renderItem={renderItem}
            renderSectionHeader={({section: {date}}) => (
              <Text style={styles.sectionHeader}>{vars.formatDate(date)}</Text>
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
  greetingText: {
    fontSize: 30,
    fontWeight: '100',
    color: vars.colors.primary,
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
  overviewChart: {
    margin: 0,
    marginBottom: 20,
    backgroundColor: '#ffffff',
  },
  overviewListContainer: {
    height: '45%',
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
    backgroundColor: vars.hexToRGBA(vars.colors.green, 0.2),
    color: vars.colors.green,
  },
  amtSpent: {
    backgroundColor: vars.hexToRGBA(vars.colors.red, 0.2),
    color: vars.colors.red,
  },
});
