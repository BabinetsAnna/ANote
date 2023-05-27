import React, { useState } from "react";
import { Formik } from 'formik';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, Image, KeyboardAvoidingView, ScrollView } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as ImagePicker from 'expo-image-picker';
import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabase("db.notes");

export default function Form({ navigation, route }) {
  const [selectedImages, setSelectedImages] = useState(route.params?.selectedImages || []);

  const initialValues = route.params?.initialValues || { title: '', text: '' };

  const idNote = route.params?.idNote;
  const userId = route.params.userId;

  const addNote = (title, text) => {
    const createdAt = new Date().getTime();
    db.transaction((tx) => {
      tx.executeSql(
        'INSERT INTO notes (title, content, created_at, user_id) VALUES (?, ?, ?, ?)',
        [title, text, createdAt, userId],
        (tx, results) => {
          if (results.rowsAffected > 0) {
            const noteId = results.insertId;
            saveNoteImages(noteId); // Зберігаємо зображення, передаючи ідентифікатор нотатки
            console.log('Data Inserted Successfully.... id note: ', noteId);
          } else {
            console.log('Failed adding....');
          }
        }
      );
    });
  };

  const saveNoteImages = (noteId) => {
    selectedImages.forEach((imageUri) => {
      db.transaction((tx) => {
        tx.executeSql(
          'INSERT INTO image (note_id, image_uri) VALUES (?, ?)',
          [noteId, imageUri],
          (_, results) => {
            if (results.rowsAffected > 0) {
              console.log('Image Inserted Successfully for note:', noteId);
            } else {
              console.log('Failed inserting image for note:', noteId);
            }
          }
        );
      });
    });
  };

  const editNote = (title, text) => {
    const createdAt = new Date().getTime();
    db.transaction((tx) => {
      tx.executeSql(
        'UPDATE notes SET title = ?, content = ?, created_at = ? WHERE id = ?',
        [title, text, createdAt, idNote],
        (tx, results) => {
          console.log('Results', results.rowsAffected);
          if (results.rowsAffected > 0) {
            
            updateNoteImages(idNote);
            console.log('Data Updated Successfully...');
          } else {
            console.log('Failed updating....');
          }
        }
      );
    });
  };


  const updateNoteImages = (noteId) => {
    // Видаляємо всі зображення пов'язані з нотаткою
    db.transaction((tx) => {
      tx.executeSql(`DELETE FROM image WHERE note_id = ?;`, [noteId], (tx, results) => {
        console.log('Results', results.rowsAffected);
        if (results.rowsAffected > 0) {
          console.log('Images deleted Successfully.... ');
          // Зберігаємо зображення знову
          saveNoteImages(noteId);
        } else {
          console.log('Failed removing img....');
          saveNoteImages(noteId);
        }
      });
    });
  };


  const handleImagePicker = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert('Permission to access media library is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync();
    if (!result.canceled) {
      setSelectedImages((prevImages) => [...prevImages, result.assets[0].uri]);
    }
  };

  const handleResetImg = (index) => {
    setSelectedImages((prevImages) => {
      const updatedImages = [...prevImages];
      updatedImages.splice(index, 1);
      return updatedImages;
    });
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="height">
      <Formik
        initialValues={initialValues}
        onSubmit={(values) => {
          if (idNote) {
            editNote(values.title, values.text);
          } else {
            addNote(values.title, values.text);
          }
          navigation.navigate('ANote');
        }}
      >
        {(props) => (
          <KeyboardAwareScrollView style={styles.scrollView}>
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
                  <Icon name="angle-left" size={25} color='#F5E9DC' />
                </TouchableOpacity>
                <Text style={styles.headerText}>ANote</Text>
              </View>
              <View style={styles.headerRight}>
                {props.values.title || props.values.text ? (
                  <TouchableOpacity onPress={() => props.resetForm()}>
                    <Text style={styles.bText}>Clear</Text>
                  </TouchableOpacity>
                ) : null}
                {props.values.title || props.values.text ? (
                  <TouchableOpacity onPress={props.handleSubmit}>
                    <Text style={styles.bText}>Save</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
            <TextInput
              value={props.values.title}
              placeholder='Title...'
              placeholderTextColor={'#CCB7A3'}
              onChangeText={props.handleChange('title')}
              style={styles.title}
            />
            <TextInput
              value={props.values.text}
              multiline
              placeholder='...'
              placeholderTextColor={'#CCB7A3'}
              onChangeText={props.handleChange('text')}
              style={styles.text}
            />
          </KeyboardAwareScrollView>
        )}
      </Formik>
      {selectedImages.length > 0 && (
        <ScrollView contentContainerStyle={styles.imagesContainer}>
          {selectedImages.map((imageUri, index) => (
            <TouchableOpacity key={index} style={styles.imageCont}>
              <TouchableOpacity
                style={styles.resetImg}
                onPress={() => handleResetImg(index)}
              >
                <Icon name="times" size={18} color="#F5E9DC" />
              </TouchableOpacity>
              <Image source={{ uri: imageUri }} style={styles.image} />
            </TouchableOpacity>
          ))}
          
        </ScrollView>
      )}
            <TouchableOpacity onPress={handleImagePicker} style={styles.imgButton}>
            <Icon name="file-image-o" size={25} color='#F5E9DC' />
          </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5E9DC',
  },
  scrollView: {
    flex: 1,
    marginBottom: '30%',
  },
  header: {
    paddingTop: 50,
    backgroundColor: '#A89787',
    paddingBottom: 10,
    marginBottom: 10,
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  headerLeft: {
    justifyContent: 'flex-start',
    flexDirection: 'row',
  },
  headerRight: {
    justifyContent: 'flex-end',
    flexDirection: 'row',
  },
  headerText: {
    paddingLeft: 20,
    fontSize: 30,
    fontWeight: 'bold',
    color: '#F5E9DC',
  },
  headerButton: {
    paddingTop: 5,
    paddingLeft: 20,
  },
  bText: {
    paddingRight: 20,
    fontSize: 20,
    color: '#F5E9DC',
  },
  title: {
    backgroundColor: '#F5E9DC',
    fontSize: 28,
    textAlign: 'left',
    padding: 20,
    color: '#827568',
    width: '100%',
    marginLeft: 20,
    paddingTop: 10,
  },
  text: {
    fontSize: 20,
    color: '#827568',
    padding: 20,
    marginLeft: 25,
  },
  imagesContainer: {
    position: 'absolute',
    flexGrow: 1,
    display: 'flex',
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: '8%',
    
    
  },
  imageCont: {
    backgroundColor: '#A89787',
    marginBottom: '10%',
    elevation: 8,
    borderRadius: 10,
    padding: 20,
    paddingRight: 40,
  },
  resetImg: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  imgButton: {
    position: 'absolute',
    right: 30,
    bottom: 30,
    backgroundColor: '#769CA8',
    borderRadius: 50,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  image: {
    width: 200,
    height: 200,
  },
});
