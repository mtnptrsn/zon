import AsyncStorage from '@react-native-async-storage/async-storage';
import MapboxGL from '@react-native-mapbox-gl/maps';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import React, {FC, useEffect, useState} from 'react';
import {SafeAreaView} from 'react-native';
import {MAPBOX_ACCESS_TOKEN, SERVER_URL} from 'react-native-dotenv';
import {LoaderScreen, View} from 'react-native-ui-lib';
import {satisfies} from 'semver';
import {io, Socket} from 'socket.io-client';
//@ts-ignore
import packageJson from './package.json';
import ConnectionWarning from './src/components/ConnectionWarning';
import CreateMapScreen from './src/screens/CreateMapScreen/CreateMapScreen';
import IndexScreen from './src/screens/Index/IndexScreen';
import ReplayScreen from './src/screens/ReplayScreen/ReplayScreen';
import RoomScreen from './src/screens/Room/RoomScreen';
import ScanQRScreen from './src/screens/ScanQR/ScanQRScreen';
import ShowQRScreen from './src/screens/ShowQR/ShowQRScreen';
import UpdateScreen from './src/screens/UpdateScreen';
import Walkthrough from './src/screens/WalkthroughScreen/WalkthroughScreen';
import {SocketContext} from './src/socket/context';
import {requestLocationPermission} from './src/utils/location';
const clientVersion = packageJson.version;

MapboxGL.setAccessToken(MAPBOX_ACCESS_TOKEN);

const Stack = createStackNavigator();

const App: FC = () => {
  const [serverVersion, setServerVersion] = useState<string | null>(null);
  const [socket, setSocket] = useState<null | Socket>(null);
  const [connectionStatus, setConnectionStatus] = useState('CONNECTING');
  // const [walkthroughIsVisible, setWalkthroughIsVisible] = useState(false);

  const onMount = async () => {
    // Check if the user has already seen the walkthrough
    // const hasSeenWalkthrough = await AsyncStorage.getItem('hasSeenTutorial@1');
    // Show the user the walkthrough if they haven't
    // if (!hasSeenWalkthrough) setWalkthroughIsVisible(true);

    requestLocationPermission();
    const socket = io(SERVER_URL, {transports: ['websocket']});
    setSocket(socket);
    socket!.emit('version:get', null, (version: string) =>
      setServerVersion(version),
    );
    socket.on('connect', () => setConnectionStatus('CONNECTED'));
    socket.on('disconnect', () => setConnectionStatus('DISCONNECTED'));
    socket.on('connect_error', () => setConnectionStatus('ERROR_CONNECTING'));
  };

  // const onPressCloseWalkthrough = async () => {
  //   await AsyncStorage.setItem('hasSeenTutorial@1', '1');
  //   setWalkthroughIsVisible(false);
  // };

  useEffect(() => {
    onMount();
  }, []);

  if (!socket) return <LoaderScreen />;
  if (connectionStatus === 'CONNECTING')
    return <LoaderScreen message="Connecting to server" />;
  const versionIsAllowed = satisfies(serverVersion || '', `~${clientVersion}`);
  if (!versionIsAllowed && serverVersion)
    return (
      <UpdateScreen version={clientVersion} latestVersion={serverVersion} />
    );
  // if (walkthroughIsVisible)
  //   return <Walkthrough showPrompt onPressClose={onPressCloseWalkthrough} />;
  return (
    <View flex>
      {connectionStatus !== 'CONNECTED' && <ConnectionWarning />}
      <SocketContext.Provider value={socket}>
        <SafeAreaView style={{flex: 1}}>
          <NavigationContainer>
            <Stack.Navigator screenOptions={{gestureEnabled: false}}>
              <Stack.Screen
                options={{headerShown: false}}
                name="Index"
                component={IndexScreen}
              />
              <Stack.Screen
                options={{headerTitle: 'Scan QR', headerBackTitle: 'Back'}}
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
              <Stack.Screen
                options={{headerTitle: 'Replay'}}
                name="Replay"
                component={ReplayScreen}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaView>
      </SocketContext.Provider>
    </View>
  );
};

export default App;
