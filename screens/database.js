import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabase("db.notes");


export function createTables() {
   db.transaction((tx) => {
        try {
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS users (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              username TEXT UNIQUE,
              password TEXT
            );`,
            [],
            (_, result) => {
              console.log('Users table created successfully!', result);
            }
          );
        } catch (error) {
          console.log('Error creating users table:', error);
        }
      });
      
      db.transaction((tx) => {
        try {
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS notes (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              title TEXT,
              content TEXT,
              created_at INTEGER,
              user_id INTEGER,
              FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
            );`,
            [],
            (_, result) => {
              console.log('Notes table created successfully!', result);
            }
          );
        } catch (error) {
          console.log('Error creating notes table:', error);
        }
      });
      
      db.transaction((tx) => {
        try {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS image (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          note_id INTEGER,
          image_uri TEXT,
          FOREIGN KEY (note_id) REFERENCES notes (id) ON DELETE CASCADE ON UPDATE CASCADE
        );`,
        [],
        (_, result) => {
          console.log('Note Images table created successfully!', result);
        }
      );
      } catch (error) {
      console.log('Error creating tables:', error);
      }
      });
      
      db.transaction((tx) => {
        try {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS checkbox (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          note_id INTEGER,
          checked INTEGER,
          textCheckbox TEXT,
          FOREIGN KEY (note_id) REFERENCES notes (id) ON DELETE CASCADE ON UPDATE CASCADE
        );`,
        [],
        (_, result) => {
          console.log('Note checkbox table created successfully!', result);
        }
      );
      } catch (error) {
      console.log('Error creating tables:', error);
      }
      });
}


export function addNote(title, text, userId, selectedImages, checkboxes) {
    const createdAt = new Date().getTime();

    db.transaction((tx) => {
      tx.executeSql(
        'INSERT INTO notes (title, content, created_at, user_id) VALUES (?, ?, ?, ?)',
        [title, text, createdAt, userId],
        (_, results) => {
          if (results.rowsAffected > 0) {
            const noteId = results.insertId;
            if (selectedImages && selectedImages.length > 0) {
              saveNoteImages(noteId, selectedImages);
            }
            if (checkboxes && checkboxes.length > 0) {
              saveCheckboxes(noteId, checkboxes);
            }
            console.log('Data Inserted Successfully.... id note: ', noteId);
          } else {
            console.log('Failed adding....');
          }
        }
      );
    });
}

export function saveNoteImages(noteId, selectedImages) {
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
}

export function saveCheckboxes(noteId, checkboxes) {
    checkboxes.forEach((checkbox) => {
        db.transaction((tx) => {
          tx.executeSql(
            'INSERT INTO checkbox (note_id, checked, textCheckbox) VALUES (?, ?, ?)',
            [noteId, checkbox.checked, checkbox.text],
            (_, results) => {
              if (results.rowsAffected > 0) {
                console.log('Checkboxes Inserted Successfully for note:', noteId);
              } else {
                console.log('Failed inserting checkboxes for note:', noteId);
              }
            }
          );
        });
      });
}
export function editNote(title, text, idNote, selectedImages, checkboxes) {
    const createdAt = new Date().getTime();
    db.transaction((tx) => {
      tx.executeSql(
        'UPDATE notes SET title = ?, content = ?, created_at = ? WHERE id = ?',
        [title, text, createdAt, idNote],
        (_, results) => {
          console.log('Results', results.rowsAffected);
          if (results.rowsAffected > 0) {
            if (selectedImages && selectedImages.length > 0) {
              updateNoteImages(idNote, selectedImages);
            }
            if (checkboxes && checkboxes.length > 0) {
              updateCheckboxes(idNote, checkboxes); 
            }
            console.log('Data Updated Successfully...');
          } else {
            console.log('Failed updating....');
          }
        }
      );
    });
  }
  

  export function updateCheckboxes(noteId, checkboxes) {
    db.transaction((tx) => {
      try{
      tx.executeSql(
        'DELETE FROM checkbox WHERE note_id=?',
        [noteId],
        (_, results) => {
          if (results.rowsAffected > 0) {
            console.log('Checkboxes Deleted Successfully for note:', noteId);
            if (checkboxes.length > 0) {
            saveCheckboxes(noteId, checkboxes); 
            }
          } else {
            console.log('Has no checkboxes');
            if (checkboxes.length > 0) {
              saveCheckboxes(noteId, checkboxes); 
              }
          }
        }
      );
      }
      catch(error){
        console.log('Failed deleting checkboxes for note:', error);
      }
    });
}



export function updateNoteImages(noteId, selectedImages) {
 
    db.transaction((tx) => {
        try{
        tx.executeSql(`DELETE FROM image WHERE note_id = ?;`, [noteId], (_, results) => {
          console.log('Results', results.rowsAffected);
          if (results.rowsAffected > 0) {
            console.log('Images deleted Successfully.... ');
            // Save images again
            if (selectedImages.length > 0) {
            saveNoteImages(noteId, selectedImages);
            }
          } else {
            console.log('Note has not any image');
            if (selectedImages.length > 0) {
              saveNoteImages(noteId, selectedImages);
              }
          }
        });
      }
      catch(error){
        console.log('Failed deleting images for note:', error);
      }
      });
    
}
