import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import MapboxGL from '@rnmapbox/maps';
import React, {FC, useEffect, useRef, useState} from 'react';
import {SafeAreaView} from 'react-native';
import {SERVER_URL} from 'react-native-dotenv';
import {Colors, LoaderScreen, View} from 'react-native-ui-lib';
import {satisfies} from 'semver';
import {io, Socket} from 'socket.io-client';
//@ts-ignore
import packageJson from './package.json';
import ConnectionWarning from './src/components/ConnectionWarning';
import useStoredState from './src/hooks/useAsyncStorage';
import {useAuthStateChanged} from './src/hooks/useAuthStateChanged';
import {UserContext} from './src/hooks/useUser';
import AuthScreen from './src/screens/AuthScreen/AuthScreen';
import EnterTextScreen from './src/screens/EnterTextScreen/EnterTextScreen';
import IndexScreen from './src/screens/Index/IndexScreen';
import MyGamesScreen from './src/screens/MyGamesScreen/MyGamesScreen';
import ReplayScreen from './src/screens/ReplayScreen/ReplayScreen';
import RoomScreen from './src/screens/Room/RoomScreen';
import ScanQRScreen from './src/screens/ScanQR/ScanQRScreen';
import ShowQRScreen from './src/screens/ShowQR/ShowQRScreen';
import TutorialScreen from './src/screens/TutorialScreen/TutorialScreen';
import UpdateScreen from './src/screens/UpdateScreen';
import WelcomePrompt from './src/screens/WelcomePrompt/WelcomePrompt';
import {SocketContext} from './src/socket/context';
import {requestLocationPermission} from './src/utils/location';
const clientVersion = packageJson.version;

// firebase.initializeApp(firebaseConfig);
GoogleSignin.configure({
  webClientId: '38111540538-dui8dl4b6e17mpj5nv3ts0ipn1i8a3nc',
});

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
  const [authIsLoading, user] = useAuthStateChanged();

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

  if (!socket || !welcomeIsHydrated || authIsLoading) return <LoaderScreen />;
  if (connectionStatus === 'CONNECTING')
    return <LoaderScreen message="Connecting to server" />;
  const versionIsAllowed = satisfies(serverVersion || '', `~${clientVersion}`);
  if (!versionIsAllowed && serverVersion)
    return (
      <UpdateScreen version={clientVersion} latestVersion={serverVersion} />
    );

  if (!user) return <AuthScreen />;

  return (
    <View flex backgroundColor={Colors.grey80}>
      <UserContext.Provider value={user}>
        <SocketContext.Provider value={socket}>
          <SafeAreaView style={{flex: 1}}>
            {connectionStatus !== 'CONNECTED' && <ConnectionWarning />}
            <NavigationContainer ref={navigationRef as any}>
              <Stack.Navigator
                screenOptions={{
                  gestureEnabled: false,
                  headerBackTitle: 'Back',
                }}>
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
                <Stack.Screen name="EnterText" component={EnterTextScreen} />
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
      </UserContext.Provider>

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
