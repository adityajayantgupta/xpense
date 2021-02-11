import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import DatePicker from 'react-native-datepicker';
import {PieChart} from 'react-native-chart-kit';
import Ionicons from 'react-native-vector-icons/Ionicons';
import vars from '../../shared/globalVars';
import {firebase} from '../../firebase/config';

const screenWidth = Dimensions.get('window').width;

const chartConfig = {
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  color: () => vars.colors.red,
  strokeWidth: 2, // optional, default 3
  barPercentage: 0.5,
  decimalPlaces: 0,
};

export default function Stats({navigation}) {
  const datePickerRef = useRef(null);
  const [date, setDate] = useState();
  const [mode, setMode] = useState();
  const [datePickerText, setDatePickerText] = useState();
  const [transactions, setTransactions] = useState();
  const [categories, setCategories] = useState();
  const [data, setData] = useState([
    {
      name: 'No Data',
      amount: 0,
    },
  ]);

  useEffect(() => {
    const subscriber = vars.docRef
      .doc(firebase.auth().currentUser.uid)
      .onSnapshot(getUserTransactions);
    return subscriber;
  }, []);
  // watch mode and date for changes and call function accordingly
  useEffect(() => {
    formatChartData();
    if (!date) {
      setDatePickerText('Tap to select date');
    } else {
      if (!mode) {
        setMode('Year');
      } else if (mode === 'Year') {
        setDatePickerText(new Date(date).getFullYear());
      } else if (mode === 'Month') {
        setDatePickerText(new Date(date).getMonth());
      } else if (mode === 'Day') {
        setDatePickerText(new Date(date).getDate());
      }
    }
  }, [mode, date]);
  const getUserTransactions = () => {
    vars.docRef
      .doc(firebase.auth().currentUser.uid)
      .get()
      .then((doc) => {
        setTransactions(doc.data().transactions);
        const allCategories = vars.defaultCategories.concat(
          doc.data().userCategories,
        );
        setCategories(allCategories);
        formatChartData();
      });
  };

  const formatChartData = () => {
    console.log(mode);
    var dateObj = new Date(date);
    var filteredTransactions = [];
    if (mode === 'Year') {
      filteredTransactions = transactions.filter((i) => {
        let tmpDateObj = new Date(i.date);
        return tmpDateObj.getFullYear() === dateObj.getFullYear();
      });
    } else if (mode === 'Month') {
      filteredTransactions = transactions.filter((i) => {
        let tmpDateObj = new Date(i.date);
        return tmpDateObj.getMonth() === dateObj.getMonth();
      });
    } else if (mode === 'Day') {
      filteredTransactions = transactions.filter((i) => {
        let tmpDateObj = new Date(i.date);
        return tmpDateObj.getDate() === dateObj.getDate();
      });
    }
    formatPieChartData(filteredTransactions);
  };
  const formatPieChartData = (filteredTransactions) => {
    var formattedData = [];
    if (filteredTransactions.length === 0) {
      setData([
        {
          name: 'No transactions',
          amount: 1,
          color: vars.colors.ltGray,
          legendFontColor: vars.colors.dkGray,
        },
      ]);
      return;
    }
    filteredTransactions.forEach((transaction) => {
      if (transaction.type === 'spent') {
        var doesCategoryExist = false;
        for (let i = 0; i < formattedData.length; i++) {
          if (formattedData[i].name === transaction.category) {
            doesCategoryExist = true;
            formattedData[i].amount =
              parseFloat(formattedData[i].amount) +
              parseFloat(transaction.amount);
            break;
          }
        }
        if (!doesCategoryExist) {
          const category = categories.find(
            (el) => el.name == transaction.category,
          );
          formattedData.push({
            name: transaction.category,
            amount: parseFloat(transaction.amount),
            color: category.color,
            legendFontColor: category.color,
          });
        }
      }
    });
    setData(formattedData);
  };
  const renderItem = ({item, index}) => {
    return (
      <Text
        style={{
          color: item.legendFontColor,
          paddingHorizontal: 5,
          paddingBottom: 10,
        }}>
        ・{item.name} [{item.amount}]
      </Text>
    );
  };
  return (
    <View style={styles.container}>
      <Text style={styles.screenHeader}>Stats</Text>
      <DatePicker
        style={{width: 200}}
        date={date}
        mode="date"
        placeholder="select date"
        format="YYYY-MM-DD"
        minDate="2016-05-01"
        maxDate={new Date(Date.now())}
        confirmBtnText="Confirm"
        cancelBtnText="Cancel"
        customStyles={{
          dateIcon: {
            position: 'absolute',
            left: 0,
            top: 4,
            marginLeft: 0,
          },
          dateInput: {
            marginLeft: 36,
          },
          // ... You can check the source to find the other keys.
        }}
        hideText={true}
        showIcon={false}
        onDateChange={(date) => setDate(date)}
        ref={datePickerRef}
      />
      <TouchableOpacity onPress={() => datePickerRef.current.onPressDate()}>
        <Text style={styles.datePickerText}>
          {mode === 'Month' && date ? vars.getMonthName(date) : datePickerText}{' '}
          <Ionicons
            name="caret-down-circle-outline"
            style={styles.datePickerText}
          />
        </Text>
      </TouchableOpacity>
      <View style={styles.actionButtonsContainer}>
        <Text style={styles.actionButtonWrapper}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor:
                  mode === 'Year' ? vars.colors.highlight : '#fff',
              },
            ]}
            onPress={() => setMode('Year')}>
            <Text
              style={[
                styles.actionButtonTitle,
                {
                  color: mode === 'Year' ? '#fff' : vars.colors.dkGray,
                },
              ]}>
              Year
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor:
                  mode === 'Month' ? vars.colors.highlight : '#fff',
              },
            ]}
            onPress={() => setMode('Month')}>
            <Text
              style={[
                styles.actionButtonTitle,
                {
                  color: mode === 'Month' ? '#fff' : vars.colors.dkGray,
                },
              ]}>
              Month
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor:
                  mode === 'Day' ? vars.colors.highlight : '#fff',
              },
            ]}
            onPress={() => setMode('Day')}>
            <Text
              style={[
                styles.actionButtonTitle,
                {
                  color: mode === 'Day' ? '#fff' : vars.colors.dkGray,
                },
              ]}>
              Day
            </Text>
          </TouchableOpacity>
        </Text>
      </View>

      <PieChart
        data={data}
        width={screenWidth}
        height={300}
        chartConfig={chartConfig}
        accessor={'amount'}
        backgroundColor={'transparent'}
        center={[screenWidth / 4, 0]}
        avoidFalseZero={true}
        hasLegend={false}
      />
      <FlatList
        horizontal={true}
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{flexGrow: 1, justifyContent: 'center'}}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    height: '100%',
    padding: 30,
    alignItems: 'center',
    paddingBottom: 0,
    backgroundColor: '#ffffff',
  },
  screenHeader: {
    marginBottom: 0,
    paddingBottom: 0,
    fontSize: 25,
    fontWeight: 'bold',
    color: vars.colors.primary,
    alignSelf: 'flex-start',
  },
  actionButtonsContainer: {
    marginTop: 20,
    alignSelf: 'center',
  },
  actionButton: {
    marginVertical: 15,
    paddingHorizontal: 15,
    paddingVertical: 5,
    alignItems: 'center',
    borderRadius: 100,
  },
  actionButtonTitle: {
    color: vars.colors.dkGray,
  },
  datePickerText: {
    fontSize: 20,
    color: vars.colors.highlight,
  },
});
