import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import React, {FC, useEffect, useState} from 'react';
import {io, Socket} from 'socket.io-client';
import {SocketContext} from './src/socket/context';
import IndexScreen from './src/screens/Index/IndexScreen';
import ScanQRScreen from './src/screens/ScanQR/ScanQRScreen';
import RoomScreen from './src/screens/Room/RoomScreen';
import ShowQRScreen from './src/screens/ShowQR/ShowQRScreen';
import Toast from 'react-native-toast-message';
import LoadingScreen from './src/screens/Room/screens/LoadingScreen';
import ConnectionWarning from './src/components/ConnectionWarning';
import CreateMapScreen from './src/screens/CreateMapScreen/CreateMapScreen';
import {SERVER_URL} from 'react-native-dotenv';

const Stack = createStackNavigator();

const App: FC = () => {
  console.log(SERVER_URL);
  const [socket, setSocket] = useState<null | Socket>(null);
  const [isConnected, setIsConnected] = useState(false);
  useEffect(() => {
    const socket = io(SERVER_URL);
    setSocket(socket);
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
  }, []);
  if (!socket) return <LoadingScreen />;

  return (
    <>
      {!isConnected && <ConnectionWarning />}
      <SocketContext.Provider value={socket}>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen
              options={{headerShown: false}}
              name="Index"
              component={IndexScreen}
            />
            <Stack.Screen
              options={{headerTitle: 'Scan QR'}}
              name="ScanQR"
              component={ScanQRScreen}
            />
            <Stack.Screen
              options={{headerShown: false}}
              name="Room"
              component={RoomScreen}
            />
            <Stack.Screen name="ShowQR" component={ShowQRScreen} />
            <Stack.Screen
              options={{headerTitle: 'Create Custom Map'}}
              name="CreateMap"
              component={CreateMapScreen}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SocketContext.Provider>
      <Toast position="bottom" ref={Toast.setRef} />
    </>
  );
};

export default App;
