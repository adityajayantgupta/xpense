import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, FlatList, TouchableOpacity} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {firebase} from '../../../firebase/config';
import vars from '../../../shared/globalVars';

export default function categoryScreen({route, navigation}) {
  const [categories, setCategories] = useState([]);
  const defaultCategories = vars.defaultCategories;

  // Concatenate user categories with default categories
  useEffect(() => {
    let isSubscribed = true;
    vars.docRef
      .doc(firebase.auth().currentUser.uid)
      .get()
      .then((doc) => {
        const allCategories = defaultCategories.concat(
          doc.data().userCategories,
        );
        setCategories(allCategories);
      })
      .catch((err) => console.log(err));
    return () => (isSubscribed = false); // unsubscribe on unmount
  }, []);

  const handleCategorySelection = (categoryName) => {
    const category = categories.find((el) => el.name == categoryName);
    route.params.onSelect(category); // pass selected category back to parent
    navigation.goBack();
  };

  const renderItem = ({item, index}) => {
    return (
      <TouchableOpacity onPress={() => handleCategorySelection(item.name)}>
        <Ionicons
          name={item.iconName}
          style={[
            styles.categoryIcon,
            {
              backgroundColor: vars.hexToRGBA(item.color, 0.3),
              color: item.color,
            },
          ]}
        />
        <Text style={styles.categoryIconTitle}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Categories</Text>
      <FlatList
        data={categories}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        numColumns="3"
        contentContainerStyle={{paddingBottom: 100}}
        showsVerticalScrollIndicator={false}></FlatList>
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => navigation.navigate('createCategoryScreen')}>
          <Text style={styles.footerButtonTitle}>Create Category</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    paddingTop: 30,
    alignItems: 'center',
    padding: 10,
    paddingBottom: 0,
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 20,
    fontSize: 30,
    fontWeight: '100',
    color: '#aaaaaa',
  },
  categoryItemContainer: {
    margin: 10,
    backgroundColor: '#ffffff',
  },
  categoryIcon: {
    margin: 20,
    aspectRatio: 1,
    width: 70,
    padding: 10,
    borderRadius: 20,
    fontSize: 40,
    textAlign: 'center',
  },
  categoryIconTitle: {
    textAlign: 'center',
    color: vars.colors.dkGray,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '105%',
    flex: 1,
    flexDirection: 'row',
    padding: 0,
  },
  footerButton: {
    flex: 1,
    margin: 50,
    marginBottom: 30,
    paddingVertical: 20,
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: vars.colors.highlight,
    elevation: 5,
  },
  footerButtonTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
