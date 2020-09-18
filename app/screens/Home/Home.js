import * as React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {firebase} from '../../firebase/config';
import TransactionTimeline from '../../components/TransactionTimeline';
import Ionicons from 'react-native-vector-icons/Ionicons';
import colors from '../../shared/globalVars';

export default function Home({navigation}) {
  const handleLogout = () => {
    firebase
      .auth()
      .signOut()
      .then((error) => {
        if (error) {
          alert('Error signing out!');
        } else {
          navigation.navigate('Login');
        }
      });
  };
  return (
    <View style={styles.container}>
      <View style={styles.background} />
      <View style={styles.main}>
        <View style={styles.topBarContainer}>
          <Text style={styles.searchContainer}>
            <TouchableOpacity onPress={() => handleLogout()}>
              <Ionicons name="search" style={styles.topBarIcon} />
            </TouchableOpacity>
          </Text>
          <Text style={styles.menuContainer}>
            <TouchableOpacity
              onPress={() => navigation.navigate('addItemScreen')}>
              <Ionicons name="add-outline" style={styles.topBarIcon} />
            </TouchableOpacity>
            <Ionicons name="menu" style={styles.topBarIcon} />
          </Text>
        </View>
        <ScrollView style={styles.mainContentContainer}>
          <Text style={styles.mainContentHeader}>Overview</Text>
          <View style={styles.overviewChart}></View>
          <View style={styles.overviewListContainer}>
            <TransactionTimeline />
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    height: '40%',
    width: '100%',
    backgroundColor: colors.primary,
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
    alignItems: 'center',
  },
  topBarIcon: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 30,
  },
  mainContentContainer: {},
  mainContentHeader: {
    fontSize: 40,
    fontWeight: '100',
    color: '#ffffff',
  },
  overviewChart: {
    height: 200,
    margin: 20,
    marginHorizontal: 0,
    borderRadius: 20,
    backgroundColor: '#ffffff',
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
  overviewListContainer: {
    height: '45%',
  },
  overviewList: {
    paddingTop: 10,
  },
  actionButtonIcon: {
    fontSize: 20,
    height: 22,
    color: 'white',
  },
});
