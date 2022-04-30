import MapboxGL from '@rnmapbox/maps';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import React, {FC, useEffect, useRef, useState} from 'react';
import {SafeAreaView} from 'react-native';
import {SERVER_URL} from 'react-native-dotenv';
import {LoaderScreen, View} from 'react-native-ui-lib';
import {satisfies} from 'semver';
import {io, Socket} from 'socket.io-client';
//@ts-ignore
import packageJson from './package.json';
import ConnectionWarning from './src/components/ConnectionWarning';
import EnterTextScreen from './src/screens/EnterTextScreen/EnterTextScreen';
import IndexScreen from './src/screens/Index/IndexScreen';
import MyGamesScreen from './src/screens/MyGamesScreen/MyGamesScreen';
import ReplayScreen from './src/screens/ReplayScreen/ReplayScreen';
import RoomScreen from './src/screens/Room/RoomScreen';
import ScanQRScreen from './src/screens/ScanQR/ScanQRScreen';
import ShowQRScreen from './src/screens/ShowQR/ShowQRScreen';
import UpdateScreen from './src/screens/UpdateScreen';
import {SocketContext} from './src/socket/context';
import {requestLocationPermission} from './src/utils/location';
import TutorialScreen from './src/screens/TutorialScreen/TutorialScreen';
import WelcomePrompt from './src/screens/WelcomePrompt/WelcomePrompt';
import useStoredState from './src/hooks/useAsyncStorage';
const clientVersion = packageJson.version;

// have to set is a empty string otherwise getting "Using Mapview required calling Mapbox.getInstance" on Android
MapboxGL.setAccessToken('');
const Stack = createStackNavigator();

const App: FC = () => {
  const [serverVersion, setServerVersion] = useState<string | null>(null);
  const [socket, setSocket] = useState<null | Socket>(null);
  const [connectionStatus, setConnectionStatus] = useState('CONNECTING');
  const [
    welcomeIsVisible,
    setWelcomeIsVisible,
    welcomeIsHydrated,
  ] = useStoredState('welcomeIsVisible@1', true);
  const navigationRef = useRef(null);

  const onMount = async () => {
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

  const closeWelcomePrompt = async () => {
    setWelcomeIsVisible(false);
  };

  const showTutorial = () => {
    (navigationRef.current as any)?.navigate('Tutorial');
  };

  const onPressTutorial = () => {
    closeWelcomePrompt();
    showTutorial();
  };

  useEffect(() => {
    onMount();
  }, []);

  if (!socket || !welcomeIsHydrated) return <LoaderScreen />;
  if (connectionStatus === 'CONNECTING')
    return <LoaderScreen message="Connecting to server" />;
  const versionIsAllowed = satisfies(serverVersion || '', `~${clientVersion}`);
  if (!versionIsAllowed && serverVersion)
    return (
      <UpdateScreen version={clientVersion} latestVersion={serverVersion} />
    );
  return (
    <View flex>
      {connectionStatus !== 'CONNECTED' && <ConnectionWarning />}
      <SocketContext.Provider value={socket}>
        <SafeAreaView style={{flex: 1}}>
          <NavigationContainer ref={navigationRef as any}>
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
                options={{headerBackTitle: 'Back'}}
                name="EnterText"
                component={EnterTextScreen}
              />
              <Stack.Screen
                options={{headerShown: false}}
                name="Room"
                component={RoomScreen}
              />
              <Stack.Screen name="ShowQR" component={ShowQRScreen} />
              <Stack.Screen
                options={{headerTitle: 'Replay'}}
                name="Replay"
                component={ReplayScreen}
              />
              <Stack.Screen
                options={{headerTitle: 'My Games'}}
                name="MyGames"
                component={MyGamesScreen}
              />
              <Stack.Screen name="Tutorial" component={TutorialScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaView>
      </SocketContext.Provider>

      {welcomeIsVisible && (
        <View
          style={{position: 'absolute', top: 0, right: 0, left: 0, bottom: 0}}>
          <WelcomePrompt
            onPressClose={closeWelcomePrompt}
            onPressTutorial={onPressTutorial}
          />
        </View>
      )}
    </View>
  );
};

export default App;
