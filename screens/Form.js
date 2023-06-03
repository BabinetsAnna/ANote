import React, { useState } from "react";
import { Formik } from 'formik';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, Image,  Keyboard, ScrollView } from 'react-native';
import { CheckBox } from 'react-native-elements';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as ImagePicker from 'expo-image-picker';
import { addNote, editNote,  } from './database';


export default function Form({ navigation, route }) {
  const [selectedImages, setSelectedImages] = useState(route.params?.selectedImages || []);
  const [checkboxes, setCheckboxes] = useState(route.params?.checkboxes || []);

  const initialValues = route.params?.initialValues || { title: '', text: '' };

  const idNote = route.params?.idNote;
  const userId = route.params.userId;


  const addCheckbox = () => {
    setCheckboxes([...checkboxes, { checked: false, text: '' }]);
  };

  const removeCheckbox = (index) => {
    const updatedCheckboxes = [...checkboxes];
    updatedCheckboxes.splice(index, 1);
    setCheckboxes(updatedCheckboxes);
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
    <View style={styles.container} >
      <Formik
        initialValues={initialValues}
        onSubmit={(values) => {
          if (idNote) {
            editNote(values.title, values.text, idNote, selectedImages, checkboxes);
          } else {
            addNote(values.title, values.text, userId, selectedImages, checkboxes);
          }
          navigation.navigate('ANote');
        }}
      >
        {(props) => (
          <View style={styles.scrollView}>
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
            <KeyboardAwareScrollView>
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
            {checkboxes.map((checkbox, index) => (
              <View style={styles.checkboxContainer} key={index}>
               <CheckBox
          checked={checkbox.checked}
          checkedColor='#769CA8'
          onPress={() => {
          const updatedCheckboxes = [...checkboxes];
          updatedCheckboxes[index].checked = !updatedCheckboxes[index].checked;
          setCheckboxes(updatedCheckboxes);
          }}

               />
                <TextInput
                  value={checkbox.text}
                  placeholder='Checkbox text...'
                  placeholderTextColor={'#CCB7A3'}
                  onChangeText={(text) => {
                    const updatedCheckboxes = [...checkboxes];
                    updatedCheckboxes[index].text = text;
                    setCheckboxes(updatedCheckboxes);
                  }}
                  style={styles.checkboxText}
                />
                <TouchableOpacity
                  style={styles.removeCheckboxButton}
                  onPress={() => removeCheckbox(index)}
                >
                  <Icon name="times" size={18} color='#769CA8'/>
                </TouchableOpacity>
                
              </View>  
             
            ))}
           
            </KeyboardAwareScrollView>
            {  !Keyboard.isKeyboardShown  ? (
                  <View style={styles.divCheckbox}>
                   
                  </View>
                ) : null}
          </View>
        )}
      </Formik>
      {selectedImages.length > 0 && !Keyboard.isKeyboardShown && (
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
      { !Keyboard.isKeyboardShown && (
      <View style={styles.buttons}>
        <TouchableOpacity onPress={handleImagePicker} style={styles.imgButton}>
          <Icon name="file-image-o" size={25} color='#F5E9DC' />
        </TouchableOpacity>
        <TouchableOpacity onPress={addCheckbox} style={styles.imgButton}>
          <Icon name="th-list" size={25} color='#F5E9DC' />
        </TouchableOpacity>
      </View>
     )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5E9DC',
  },
  scrollView: {
    flex: 1,
    marginBottom: '3%',
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
  headerLeft: {
    justifyContent: 'flex-start',
    flexDirection: 'row',
  },
  headerRight: {
    justifyContent: 'flex-end',
    flexDirection: 'row',
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
    lineHeight: 30,
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
  buttons: {
    position: 'absolute',
    right: 30,
    bottom: 30,
    elevation: 8,
    
    flexDirection: 'column',
  },
  imgButton: {
    
    backgroundColor: '#769CA8',
    borderRadius: 50,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    
  },
  image: {
    width: 200,
    height: 200,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginLeft: 20,
  },
  checkboxText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#827568',
  },
  removeCheckboxButton: {
    marginRight: 20,
  },
  divCheckbox: {
    height: '18%',
  }
});
