import React, {FC} from 'react';

import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import MainScreen from './src/screens/MainScreen';
import QRScanScreen from './src/screens/QRScanScreen';

const Tab = createBottomTabNavigator();

const App: FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="QR" component={QRScanScreen} />
        <Stack.Screen name="Main" component={MainScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
