import React, { useState} from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, Image } from 'react-native';
import * as Crypto from 'expo-crypto';


import * as SQLite from 'expo-sqlite'


const db = SQLite.openDatabase('db.notes');

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

const validateForm = ({ username, password, confirmPassword }, isRegistration) => {
  const errors = [];

  if (!username.trim()) {
    errors.push(`Username cannot be empty!`);
  }

  if (!password.trim() && isRegistration) {
    errors.push(`Pasword cannot be empty!`);
  }

  if (confirmPassword && password !== confirmPassword) {
    errors.push('Passwords do not match!');
  }

  if (password.length < 8 && isRegistration) {
    errors.push('The password must contain at least 8 characters!');
  }

  if (errors.length > 0) {
    throw new Error(errors.join('\n'));
  }
};


const hashPassword = async (password) => {
  try {
    const digest = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      password
    );

    return digest;
  } catch (error) {
    console.log('Error hashing password:', error);
    throw error;
  }
};

const AuthForm = ({ onSubmit, isRegistration, navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');


  const handleSubmit = async () => {
    try {
      validateForm({ username, password, confirmPassword }, isRegistration);

      await onSubmit({ username, password });

    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.imgContainer}>
      <Image source={require('./assets/logo.png')} style={styles.image} /></View>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
      />
      {isRegistration && (
        <TextInput
          style={styles.input}
          placeholder="Confirm password"
          value={confirmPassword}
          secureTextEntry
          onChangeText={setConfirmPassword}
        />
     ) }
     <View style={styles.buttonContainer}>
  <TouchableOpacity
    style={styles.button}
    onPress={handleSubmit}
  >
    <Text style={[styles.buttonText, { color: '#769CA8' }]}>
      {isRegistration ? 'Sign Up' : 'Sign In'}
    </Text>
  </TouchableOpacity>
  </View>
    </View>
  );
};

const AuthStorage = {
  // функція для збереження користувача
  async saveUser(username, password) {
    try {
      // виконуємо транзакцію збереження в БД
      await db.transaction((tx) => {
        tx.executeSql('INSERT INTO users (username, password) VALUES (?, ?)', [username, password]);
      });
    } catch (error) {
      console.log('Saving user error in AuthStorage:', error);
      throw new Error('Error saving user');
    }
  },

  // функція для отримання користувача за ім'ям та паролем
  async getUser(username, password) {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM users WHERE username = ? AND password = ?',
          [username, password],
          (_, { rows: { _array } }) => {
            if (_array.length > 0) {
              resolve(_array[0]); // Повернення першого знайденого запису користувача
            } else {
              resolve(null);
            }

          }
        );
      });
    });
  }
};

const AuthService = {
  // функція для авторизації користувача
  async login({ username, password }) {
    try {
      const hashedPassword = await hashPassword(password);
      
      const user = await AuthStorage.getUser(username, hashedPassword);
     
     

      if (!user) {
        throw new Error('Invalid username or password!');
      }
      console.log(`Logged in: ${username}`);
      return user;
    } catch (error) {
      console.log('Authorization error:', error);
      throw error;
    }
  },

  async register({ username, password, confirmPassword }) {
    // валідація форми
    validateForm({ username, password, confirmPassword });
  
    try {
      const hashedPassword = await hashPassword(password);
      const existingUser = await AuthStorage.getUser(username, hashedPassword);
  
      if (existingUser !== null) {
        throw new Error('This username already exists! ');
      }
  
      await AuthStorage.saveUser(username, hashedPassword);
  
      console.log(`Created new user: ${username} `);
      return { username, hashedPassword };
    } catch (error) {
      console.log('Registration error:', error);
      throw error;
    }
  }
}

const AuthScreen = ({ navigation }) => {
  const [isRegistration, setIsRegistration] = useState(false);

  // функція для обробки форми авторизації
  const handleLogin = async ({ username, password }) => {
      try {
        
        const user = await AuthService.login({ username, password });
        
        Alert.alert('Congratulations!', 'User signed in successfully.');
        console.log(`id user: ${user.id} `);
        navigation.navigate("ANote", { userId: user.id });
      } catch (error) {
        Alert.alert('Error', error.message);
      }
    };

    const handleRegistration = async ({ username, password, confirmPassword }) => {
      try {
        const hashedPassword = await hashPassword(password);
       

        const existingUser = await AuthStorage.getUser(username, hashedPassword);
        if (existingUser) {
          throw new Error('This username already exists! ');
        }
        const user = await AuthService.register({ username, password, confirmPassword });
        Alert.alert('Congratulations!', 'User created successfully.');
        console.log(`id user: ${user.id} `);
        navigation.navigate("ANote", { userId: user.id });
        setIsRegistration(false);
      } catch (error) {
        Alert.alert('Error', error.message);
      }
    };

return (
  <View style={styles.screen}>
    <AuthForm onSubmit={isRegistration ? handleRegistration : handleLogin} isRegistration={isRegistration} />
    <View style={styles.buttonContainer}>
  <TouchableOpacity
    style={[styles.button]}
    onPress={() => setIsRegistration(!isRegistration)}
  >
    <Text style={[styles.buttonText, { color: '#769CA8' }]}>
      {isRegistration ? 'Sign In ' : 'Sign Up '}
    </Text>
  </TouchableOpacity>
</View>
  </View>
);
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5E9DC',
  },
  container: {
    width: '75%',
    maxWidth: 500,
    alignItems: 'center',
    paddingTop: '-20%',
  },
  imgContainer: {
    justifyContent: 'center',
    margin: 40,
  },
  image: {
    width: '100%',
    height: 'auto',
    aspectRatio: 1,
    marginTop: '-100%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#827568',
    padding: 10,
    marginVertical: 10,
    width: '100%',
  },
  buttonContainer: {
   
    marginTop: 10,
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
   
  },
  buttonText: {
    fontSize: 16,
  },
});

export default AuthScreen;


