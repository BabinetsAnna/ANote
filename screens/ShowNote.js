import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image } from "react-native";
import * as SQLite from "expo-sqlite";
import Icon from 'react-native-vector-icons/FontAwesome';
const db = SQLite.openDatabase("db.notes");

export default function ShowNote({ route, navigation }) {
  const { idNote, titleNote, textNote, idUser } = route.params;
  const [textAlignment, setTextAlignment] = useState('left');
  const [selectedImages, setSelectedImages] = useState([]);

  const getImage = () => {
    if (!idNote) {
      return;
    }
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM image WHERE note_id = ?',
        [idNote],
        (_, { rows: { _array } }) => {
          if (_array.length > 0) {
            const imageUrls = _array.map((image) => image.image_uri); // Отримати тільки URL-адреси зображень
            setSelectedImages(imageUrls);
          } else {
            setSelectedImages([]);
          }
        }
      );
    });
  };
  

  useEffect(() => {
    getImage();
  }, [idNote]);

  const handleDelete = () => {
    db.transaction((tx) => {
      tx.executeSql(`DELETE FROM notes WHERE id = ?;`, [idNote], (tx, results) => {
        console.log('Results', results.rowsAffected);
        if (results.rowsAffected > 0) {
          delImages();
          console.log('Data deleted Successfully.... ');
        } else {
          console.log('Failed removing....');
        }
      });
    });
    navigation.navigate('ANote');
  };

  const delImages = () => {
    db.transaction((tx) => {
      tx.executeSql(`DELETE FROM image WHERE note_id = ?;`, [idNote], (tx, results) => {
        console.log('Results', results.rowsAffected);
        if (results.rowsAffected > 0) {
          console.log('Images deleted Successfully.... ');
        } else {
          console.log('Failed removing img....');
        }
      });
    });
    navigation.navigate('ANote');
  };



  const handleEdit = () => {
    navigation.navigate('Form', {
      initialValues: { title: titleNote, text: textNote },
      idNote: idNote,
      idUser: idUser,
      selectedImages: selectedImages,
    });
  };

  const alignLeftFunc = () => {
    setTextAlignment('left');
  };

  const alignCentFunc = () => {
    setTextAlignment('center');
  };

  const alignRightFunc = () => {
    setTextAlignment('right');
  };

  const alignJustifFunc = () => {
    setTextAlignment('justify');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
            <Icon name="angle-left" size={25} color='#F5E9DC' />
          </TouchableOpacity>
          <Text style={styles.headerText}>ANote</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={handleDelete}>
            <Text style={styles.bText}>Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleEdit}>
            <Text style={styles.bText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bAlign}>
        <TouchableOpacity style={styles.headerButton} onPress={alignLeftFunc}>
          <Icon name="align-left" size={25} color='#769CA8' />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton} onPress={alignCentFunc}>
          <Icon name="align-center" size={25} color='#769CA8' />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton} onPress={alignRightFunc}>
          <Icon name="align-right" size={25} color='#769CA8' />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton} onPress={alignJustifFunc}>
          <Icon name="align-justify" size={25} color='#769CA8' />
        </TouchableOpacity>
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.title}>{titleNote}</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.text, { textAlign: textAlignment }]}>{textNote}</Text>
      </View>

      {selectedImages.length > 0 && (
        <ScrollView contentContainerStyle={styles.imagesContainer}>
          {selectedImages.map((image, index) => (
            <TouchableOpacity key={index} style={styles.imageCont}>
              <Image source={{ uri: image }} style={styles.image} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </ScrollView>
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
    headerLeft:{
      justifyContent: 'flex-start',
      flexDirection: 'row',
    },
    headerRight:{
      justifyContent: 'flex-end',
      flexDirection: 'row',
    },
  headerText:{
    paddingLeft: 20,
    fontSize: 30,
    fontWeight: 'bold',
    color: '#F5E9DC',
  },
  headerButton:{
  paddingTop: 5,
  paddingLeft: 20,
  },
bText:{
  paddingRight: 20,
  fontSize: 20,
  color: '#F5E9DC',
},
bAlign: {
flexDirection: 'row',
justifyContent: 'space-around'
},
  title: {
  
    fontSize: 24,
    textAlign: 'center',
    padding: 20,
    color: '#827568',

  },
 text: {
  
    fontSize: 20,
    color: '#827568',
    padding: 20,
    marginLeft: 10,
    marginRight: 10,
    lineHeight: 30,
  },
  imagesContainer: {
    flexGrow: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageCont: {
    backgroundColor: '#A89787',
    marginBottom: '10%',
    elevation: 8,
    borderRadius: 10,
    padding: 20,
  
  },
 
  image: {
    width: 200,
    height: 200,
  },
});