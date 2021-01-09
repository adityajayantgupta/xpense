import {firebase} from '../firebase/config';
const vars = {
  colors: {
    primary: '#416EEE',
    highlight: '#FBBA57',
    ltGray: '#f5f5f5',
    dkGray: '#aaaaaa',
    green: '#A0D380',
    red: '#E39098',
  },
  defaultCategories: [
    {
      name: 'Shopping',
      iconName: 'basket',
      color: '#E39098',
    },
    {
      name: 'Housing',
      iconName: 'home',
      color: '#72A7DB',
    },
    {
      name: 'Transportation',
      iconName: 'bus',
      color: '#E17283',
    },
    {
      name: 'Food',
      iconName: 'fast-food',
      color: '#81CBB2',
    },
    {
      name: 'Utilities',
      iconName: 'flash',
      color: '#93B8DE',
    },
    {
      name: 'Insurance',
      iconName: 'shield-checkmark',
      color: '#A5DE8D',
    },
    {
      name: 'Healthcare',
      color: '#A0D380',
      iconName: 'medkit',
    },
    {
      name: 'Finance',
      color: '#F6BC8A',
      iconName: 'cash',
    },
    {
      name: 'Entertainment',
      color: '#8777B9',
      iconName: 'film',
    },
    {
      name: 'Miscellaneous',
      iconName: 'bookmark',
      color: '#FAE180',
    },
  ],
  truncate: (str, n) => {
    return str.length > n ? str.substr(0, n - 1) + '…' : str;
  },
  hexToRGBA: (hex, alpha) => {
    if (!hex) return '#000000';
    hex = hex.split('').slice(1, hex.length).join('');
    var RgbHex = hex.match(/.{1,2}/g);
    var rgb = [
      parseInt(RgbHex[0], 16),
      parseInt(RgbHex[1], 16),
      parseInt(RgbHex[2], 16),
      parseInt(alpha),
    ];
    var RGBA = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
    return RGBA;
  },
  getMonthName: (UTCString) => {
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
    const month = months[dateObj.getMonth()];
    return `${month}`;
  },
  docRef: firebase.firestore().collection('users'),
};

export default vars;
