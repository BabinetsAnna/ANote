import * as React from "react";
import { StyleSheet } from 'react-native';

import MainScreen from  './navigate'


export default function App() {
  return (
  <MainScreen/>
  
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5E9DC',
    alignItems: 'center',
    justifyContent: 'center',
  },
});