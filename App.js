// import packages
import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {firebase} from './app/firebase/config';
// import views
import TabContainer from './app/screens/TabContainer';
import Login from './app/screens/Login';
import Signup from './app/screens/Signup';
import Search from './app/screens/Search';
import addItemScreen from './app/screens/Home/ItemScreen/addItemScreen';
import editItemScreen from './app/screens/Home/ItemScreen/editItemScreen';
import categoryScreen from './app/screens/Home/ItemScreen/categoryScreen';
import createCategoryScreen from './app/screens/Home/ItemScreen/createCategoryScreen';
import ItemDetailsScreen from './app/screens/Home/ItemScreen/itemDetailsScreen';
import addAutoTransScreen from './app/screens/AutomatedTransactions/addAutoTransScreen';
import autoTransDetailsScreen from './app/screens/AutomatedTransactions/autoTransDetailsScreen';
import editAutoTransScreen from './app/screens/AutomatedTransactions/editAutoTransScreen';
import {LogBox} from 'react-native';
import {decode, encode} from 'base-64';
if (!global.btoa) {
  global.btoa = encode;
}
if (!global.atob) {
  global.atob = decode;
}

const Stack = createStackNavigator();

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();

  LogBox.ignoreLogs(['Setting a timer']);

  // Handle user state changes
  function onAuthStateChanged(user) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = firebase.auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  if (initializing) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen
          name="App"
          component={TabContainer}
          style={{display: user ? 'flex' : 'none'}}
        />
        <Stack.Screen name="Search" component={Search} />
        <Stack.Screen name="addItemScreen" component={addItemScreen} />
        <Stack.Screen name="editItemScreen" component={editItemScreen} />
        <Stack.Screen name="categoryScreen" component={categoryScreen} />
        <Stack.Screen
          name="createCategoryScreen"
          component={createCategoryScreen}
        />
        <Stack.Screen name="ItemDetailsScreen" component={ItemDetailsScreen} />
        <Stack.Screen
          name="addAutoTransScreen"
          component={addAutoTransScreen}
        />
        <Stack.Screen
          name="editAutoTransScreen"
          component={editAutoTransScreen}
        />
        <Stack.Screen
          name="autoTransDetailsScreen"
          component={autoTransDetailsScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
