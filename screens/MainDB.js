import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, FlatList } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';
import { useIsFocused} from '@react-navigation/native';
import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabase("db.notes");


export default function Main({ route, navigation }) {
  const [notes, setNotes] = useState([]);
  const [userId, setUserId] = useState(null);
  const isFocused = useIsFocused();
 


  const handleAddNote = () => {
    console.log('main add note: ', {userId});
    navigation.navigate("Form", {
      userId: userId,
    });
  };

  const getNotes = () => {
    if (!userId) {
      return;
    }
    db.transaction((tx) => {
      tx.executeSql(
       'SELECT * FROM notes WHERE user_id = ? ORDER BY created_at DESC',
        [userId, navigation],
        (_, { rows: { _array } }) => {
          if (_array.length > 0) {
            setNotes(_array);
          } else {
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

  useEffect(() => {
    if (isFocused) {
    getNotes();
    }
  }, [userId, isFocused, navigation]);

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
       <Text style={styles.headerText}>Note</Text>
<View style={styles.headerRight}>
       <TouchableOpacity 
         style={styles.headerButton}
         onPress={() => navigation.navigate('Search', {userId: userId})}>
       <Icon name="search" size={30} color='#F5E9DC' />
       </TouchableOpacity>
      <TouchableOpacity 
         style={styles.headerButton}
         onPress={() => navigation.navigate('SignUp')}>
       <Icon name="power-off" size={30} color='#F5E9DC' />
       </TouchableOpacity>
       </View>
       </View>
      <FlatList
        data={notes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
      />

      <TouchableOpacity style={styles.addButton} onPress={handleAddNote}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
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
    justifyContent: 'space-between',
    flexDirection: 'row'
    },
  headerText:{
    paddingLeft: 20,
    fontSize: 35,
    fontWeight: 'bold',
    color: '#F5E9DC',
  },
  headerRight:{
    justifyContent: 'flex-end',
    flexDirection: 'row',
  },
  headerButton:{
    paddingTop: 5,
    paddingRight: 20,
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
  addButton: {
    position: "absolute",
    right: 30,
    bottom: 30,
    backgroundColor: '#769CA8',
    borderRadius: 50,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 24,
  },
});