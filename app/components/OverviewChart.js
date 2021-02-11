import React, {useState, useEffect} from 'react';
import {StyleSheet, View, Dimensions} from 'react-native';
import {LineChart} from 'react-native-chart-kit';
import {firebase} from '../firebase/config';
import vars from '../shared/globalVars';
import {useNavigation} from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;
const chartConfig = {
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  color: () => vars.colors.red,
  strokeWidth: 2, // optional, default 3
  barPercentage: 0.5,
  decimalPlaces: 0,
};

export default function OverviewChart() {
  const navigation = useNavigation();

  const [data, setData] = useState({
    labels: [],
    datasets: [
      {
        data: [0],
      },
    ],
  });

  useEffect(() => {
    let isSubscribed = true;
    formatChartData();
    return () => (isSubscribed = false); // unsubscribe on unmount
  }, []);

  // subscribe to data updates
  useEffect(() => {
    const subscriber = vars.docRef
      .doc(firebase.auth().currentUser.uid)
      .onSnapshot(formatChartData);
    return subscriber;
  }, []);

  const formatChartData = () => {
    if (!firebase.auth().currentUser) {
      return navigation.navigate('Login');
    }
    vars.docRef
      .doc(firebase.auth().currentUser.uid)
      .get()
      .then((doc) => {
        var userData = doc.data();
        var formattedUserData = {
          labels: [],
          datasets: [
            {
              data: [],
              color: () => vars.colors.red,
            },
            {
              data: [],
              color: () => vars.colors.green,
            },
          ],
        };
        const ONE_DAY = 86400000;
        const ONE_MONTH = ONE_DAY * 28;
        const CURRENT_MONTH = new Date(Date.now()).getMonth();
        const MONTHS = [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ];

        // run for past 6 months
        const FIRST_DATE = userData.transactions.reduce((prev, curr) =>
          prev.date < curr.date ? prev : curr,
        );
        for (
          let i = 0, date = Date.now();
          i < 6 && date >= FIRST_DATE.date;
          i++, date = parseInt(date) - parseInt(ONE_MONTH)
        ) {
          var month = new Date(date).getMonth();
          var totalMonthlyExpenditure = 0,
            totalMonthlyEarnings = 0;
          for (let transaction of userData.transactions) {
            var transactionMonth = new Date(transaction.date).getMonth();
            if (transactionMonth === month) {
              if (transaction.type === 'spent') {
                totalMonthlyExpenditure += parseFloat(transaction.amount);
              } else {
                totalMonthlyEarnings += parseFloat(transaction.amount);
              }
            }
          }
          formattedUserData.datasets[0].data.push(totalMonthlyExpenditure);
          formattedUserData.datasets[1].data.push(totalMonthlyEarnings);
          formattedUserData.labels.push(MONTHS[month]);
        }
        formattedUserData.datasets[0].data = formattedUserData.datasets[0].data.reverse();
        formattedUserData.datasets[1].data = formattedUserData.datasets[1].data.reverse();
        formattedUserData.labels = formattedUserData.labels.reverse();
        setData(formattedUserData);
      })
      .catch((err) => console.log(err));
  };
  return (
    <View>
      <LineChart
        data={data}
        width={screenWidth}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={{paddingRight: 40}}
      />
    </View>
  );
}

const styles = StyleSheet.create({});
