import * as React from "react";
import Auth from "./Authform"
import Main from "./screens/MainDB";
import Form from "./screens/Form"
import ShowNote from "./screens/ShowNote";
import Search from "./screens/Search";


import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from  '@react-navigation/native';
import { enableScreens } from 'react-native-screens';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
const Stack = createStackNavigator();



export default function Navigate() {
    enableScreens();
    return <GestureHandlerRootView style={{ flex: 1 }} >
        <NavigationContainer>
        <Stack.Navigator >
        <Stack.Screen
            name="SignUp"
            component={Auth}
            options  = {{
                headerShown: false
            }}
            />
            <Stack.Screen
            name="ANote"
            component={Main}
            options  = {{
                headerShown: false
            }}
            />
             <Stack.Screen
            name="Form"
            component={Form}
            options  = {{
                headerShown: false
            }}
            />
           <Stack.Screen 
            name="Note"
            component={ShowNote}
            options  = {{
                headerShown: false
            }}
           />
           <Stack.Screen 
            name="Search"
            component={Search}
            options  = {{
                headerShown: false
            }}
           />
            
        </Stack.Navigator>
        </NavigationContainer>
    </GestureHandlerRootView>  
}

