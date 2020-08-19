import * as React from 'react';
import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import {firebase} from '../firebase/config';

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

const getTransactionData = () => {
  const user = firebase.auth().currentUser;
};

export default function TransactionTimeline() {
  return (
    <View>
      {DATA.map((item, key) => (
        //key is the index of the array
        //item is the single item of the array
        <View key={key} style={styles.item}>
          <Text style={styles.text}>
            {key}. {item.title}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    backgroundColor: '#f9c2ff',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 0,
  },
  title: {
    fontSize: 32,
  },
});
