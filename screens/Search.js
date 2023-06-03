import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, FlatList, TextInput } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';
import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabase("db.notes");


export default function Search({ route, navigation }) {
    const [notes, setNotes] = useState([]);
    const [userId, setUserId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

const handleSearchTermChange = (text) => {
  setSearchTerm(text);
};

const searchNotes = () => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM notes WHERE user_id = ? AND title LIKE ? ORDER BY created_at DESC",
        [userId, `%${searchTerm}%`],
        (_, { rows: { _array } }) => {
          if (_array.length > 0) {
            console.log(" Found count of notes: ", _array.length)
            setNotes(_array);
          } else {
            console.log('Find nothing')
            setNotes([]);
          }
        }
      );
    });
  };
  

  useEffect(() => {
    if (route.params && route.params.userId) {
      setUserId(route.params.userId);
    }
  }, [route.params]);

 
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() =>
        navigation.navigate("Note", {
          idNote: item.id,
          titleNote: item.title,
          textNote: item.content,
          idUser: item.user_id,
        })
      }
    >
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.date}>
        {new Date(item.created_at).toLocaleString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
      <View style={styles.headerLeft}> 
          <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Icon name="angle-left" size={25} color='#F5E9DC' />
          </TouchableOpacity>  
           <Text style={styles.headerText}>ANote</Text>
           </View>
      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchBarInput}
          placeholder="Search notes"
          placeholderTextColor={'#CCB7A3'}
          value={searchTerm}
          onChangeText={handleSearchTermChange}
        />
        <TouchableOpacity 
          style={styles.searchBarButton}
          onPress={searchNotes}>
          <Icon name="search" size={30} color="#F5E9DC" />
        </TouchableOpacity>
      </View>
      </View>
      <FlatList
        data={notes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
      />
  
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5E9DC',
  },
  header:{
    paddingTop: 50,
    backgroundColor: '#A89787',
    paddingBottom: 10,
    marginBottom: 10,
    paddingRight: 20,
    justifyContent: 'space-between',
    flexDirection: 'row'
    },
  headerText:{
    paddingLeft: 20,
    fontSize: 35,
    fontWeight: 'bold',
    color: '#F5E9DC',
  },
    headerLeft:{
      justifyContent: 'flex-start',
      flexDirection: 'row',
    },
    headerRight:{
      justifyContent: 'flex-end',
      flexDirection: 'row',
      marginRight: 20,
    },
 
  headerButton:{
  paddingTop: 5,
  paddingLeft: 20,
  },
  item: {
    borderRadius: 2,
    backgroundColor: '#DCEFF5',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#769CA8',
  },
  title: {
    fontSize: 24,
  },
  date: {
    fontSize: 12,
    marginTop: 5,
  },
 searchBarContainer:{
    justifyContent: 'flex-end',
    flexDirection: 'row',
    width: '70%',
    marginRight: 10,
 },
 searchBarInput: {
    justifyContent: 'flex-end',
    width: "60%",
    paddingVertical: 5,
    paddingHorizontal: 7,
    fontSize: 18,
    marginRight: 10,
    backgroundColor: '#F5E9DC',
    borderRadius: 6,
 },
 searchBarButton: {
    paddingRight: 25,
 }
});