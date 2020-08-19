import * as React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {firebase} from '../firebase/config';
import Ionicons from 'react-native-vector-icons/Ionicons';
import TransactionTimeline from '../components/TransactionTimeline';

const DATA = [
  {
    id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
    title: 'First Item',
  },
  {
    id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
    title: 'Second Item',
  },
  {
    id: '58694a0f-3da1-471f-bd96-145571e29d72',
    title: 'Third Item',
  },
  {
    id: '58694a0f-3da1-471f-bd96-145571e29972',
    title: 'Third Item',
  },
  {
    id: '58694a0f-3da1-471f-bd96-145571e29372',
    title: 'Third Item',
  },
];

const Item = ({title}) => (
  <View style={styles.item}>
    <Text style={styles.title}>{title}</Text>
  </View>
);

const renderItem = ({item}) => <Item title={item.title} />;

export default function Home({navigation}) {
  const handleLogout = () => {
    firebase.auth().signOut();
    navigation.navigate('Login');
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
    backgroundColor: '#416EEE',
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
});
