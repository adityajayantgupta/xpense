import React, {useEffect, useState} from 'react';
import {Alert, View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {firebase} from '../../firebase/config';
import Ionicons from 'react-native-vector-icons/Ionicons';
import vars from '../../shared/globalVars';

export default function ItemDetailsScreen({route, navigation}) {
  const [autoTransaction, setAutoTransaction] = useState(
    route.params.autoTransaction,
  );
  const [userData, setUserData] = useState();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let isSubscribed = true;
    vars.docRef
      .doc(firebase.auth().currentUser.uid)
      .get()
      .then((doc) => setUserData(doc.data()))
      .catch((err) => console.log(err));
    combineCategories();
    return () => (isSubscribed = false); // unsubscribe on unmount
  }, []);

  const combineCategories = () => {
    vars.docRef
      .doc(firebase.auth().currentUser.uid)
      .get()
      .then((doc) => {
        setCategories(vars.defaultCategories.concat(doc.data().userCategories));
      })
      .catch((err) => console.log(err));
  };

  const handleDelete = () => {
    Alert.alert('Delete', 'Are you sure you want to delete this transaction?', [
      {
        text: 'Yes',
        onPress: () => {
          vars.docRef
            .doc(firebase.auth().currentUser.uid)
            .get()
            .then((doc) => {
              var data = doc.data();
              data.automatedTransactions = data.automatedTransactions.filter(
                (i) => {
                  if (i.date !== autoTransaction.date) return i;
                },
              );
              vars.docRef
                .doc(firebase.auth().currentUser.uid)
                .set(data)
                .then(() => {
                  alert('Deleted successfully!');
                  navigation.navigate('Home');
                })
                .catch((err) => alert(err));
            });
        },
      },
      {
        text: 'No',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
    ]);
  };

  const handleEdit = () => {
    navigation.navigate('editAutoTransScreen', {
      autoTransaction: autoTransaction,
      onUpdate: setAutoTransaction,
    });
  };

  var itemCategory = categories.find(
    (el) => el.name.toLowerCase() == autoTransaction.category.toLowerCase(),
  );
  if (!itemCategory) {
    itemCategory = {
      iconName: 'alert',
      color: '#ff0000',
    };
  }
  return (
    <View style={styles.container}>
      {/* Navigation bar */}
      <View style={styles.navbar}>
        <Text styles={styles.navbarAlignLeft}>
          <TouchableOpacity
            onPress={() => {
              navigation.goBack();
            }}>
            <Ionicons name="arrow-back-outline" style={styles.navbarItem} />
          </TouchableOpacity>
        </Text>
      </View>
      {/* Category Icon */}
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

      {/* Transaction title */}
      <Text style={styles.title}>{transaction.title}</Text>
      {/* Transaction frequency */}
      <Text style={styles.transactionDate}>{transaction.frequency}</Text>
      {/* Transaction amount */}
      <Text style={styles.amount}>
        {userData ? userData.currency : '$'}
        {transaction.amount}
      </Text>
      {/* Transaction type */}
      <Text
        style={[
          styles.amtType,
          transaction.type === 'earned' ? styles.amtEarned : styles.amtSpent,
        ]}>
        {transaction.type}
      </Text>
      <View style={styles.actionButtonsContainer}>
        <Text style={styles.actionButtonWrapper}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              handleEdit();
            }}>
            <Ionicons name="pencil" style={styles.actionButtonIcon}></Ionicons>
            <Text style={styles.actionButtonTitle}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              handleDelete();
            }}>
            <Ionicons name="trash" style={styles.actionButtonIcon}></Ionicons>
            <Text style={styles.actionButtonTitle}>Delete</Text>
          </TouchableOpacity>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    backgroundColor: '#ffffff',
  },
  navbar: {
    marginBottom: 10,
  },
  navbarAlignLeft: {
    alignSelf: 'flex-start',
  },
  navbarItem: {
    fontSize: 25,
    color: vars.colors.dkGray,
  },
  categoryIcon: {
    alignSelf: 'center',
    padding: 20,
    marginBottom: 20,
    aspectRatio: 1,
    borderRadius: 20,
    fontSize: 40,
  },
  transactionDate: {
    textAlign: 'center',
    color: vars.colors.dkGray,
    fontSize: 15,
  },
  title: {
    fontSize: 25,
    textAlign: 'center',
  },
  amount: {
    marginVertical: 20,
    marginBottom: 10,
    fontSize: 60,
    textAlign: 'center',
    color: '#000000',
  },
  amtType: {
    alignSelf: 'center',
    textAlign: 'center',
    padding: 5,
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
  actionButtonsContainer: {
    marginTop: 20,
    alignSelf: 'center',
    borderTopColor: '#F5F8F8',
    borderTopWidth: 3,
  },
  actionButton: {
    marginVertical: 15,
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  actionButtonIcon: {
    padding: 15,
    marginTop: 20,
    marginBottom: 10,
    fontSize: 20,
    borderRadius: 100,
    aspectRatio: 1,
    color: vars.colors.primary,
    backgroundColor: vars.hexToRGBA(vars.colors.primary, 0.2),
  },
  actionButtonTitle: {
    color: vars.colors.dkGray,
  },
});
