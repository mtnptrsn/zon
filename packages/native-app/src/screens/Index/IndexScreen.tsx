import AsyncStorage from '@react-native-async-storage/async-storage';
import {useIsFocused, useNavigation} from '@react-navigation/core';
import React, {FC, useContext, useEffect, useReducer} from 'react';
import {Alert, Dimensions, KeyboardAvoidingView, Platform} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import {Button, Text, TextField, View} from 'react-native-ui-lib';
import {RoomController} from 'socket-server/src/controllers/RoomController';
import {Socket} from 'socket.io-client';
import {DefaultEventsMap} from 'socket.io-client/build/typed-events';
// @ts-ignore
import packageJson from '../../../package.json';
import useStoredState from '../../hooks/useAsyncStorage';
import {SocketContext} from '../../socket/context';
import {IEnterTextScreenParams} from '../EnterTextScreen/EnterTextScreen';
import * as Speech from 'expo-speech';
import auth from '@react-native-firebase/auth';
import {useUser} from '../../hooks/useUser';

const findOngoingRoom = async (
  socket: Socket<DefaultEventsMap, DefaultEventsMap>,
) => {
  const roomId = await AsyncStorage.getItem('roomId');
  if (!roomId) return null;
  const room: any = await new Promise((resolve, reject) => {
    socket!.emit('room:get', {roomId}, (room: any) => {
      resolve(room);
    });
  });
  if (!['PLAYING', 'COUNTDOWN'].includes(room?.status)) return null;
  return room;
};

const IndexScreen: FC = () => {
  const socket = useContext(SocketContext);
  const navigation = useNavigation();
  // const [name, setName] = useStoredState('name', '');
  const user = useUser();
  const isFocused = useIsFocused();

  useEffect(() => {
    (async () => {
      const ongoingRoom = await findOngoingRoom(socket!);
      if (ongoingRoom)
        Alert.alert(
          'Still playing',
          'You are still in a game that is ongoing. Do you want to rejoin?',
          [
            {text: 'No', onPress: () => {}},
            {
              text: 'Yes',
              onPress: () => {
                navigation.navigate('Room', {roomId: ongoingRoom._id});
              },
            },
          ],
        );
    })();
  }, []);

  useEffect(() => {
    if (isFocused) Speech.stop();
  }, [isFocused]);

  const joinRoom = (roomId: string) => {
    socket!.emit(
      'room:join',
      {roomId, player: {id: user!.uid, name: user!.displayName}},
      (room: any) => {
        if (!room)
          return Alert.alert(
            'Invalid code / QR',
            'The codde / QR code you scanned is invalid.',
          );
        // if (ENV === 'production') analytics().logEvent('join_room');
        AsyncStorage.setItem('roomId', room._id);
        navigation.navigate('Room', {roomId: room._id});
      },
    );
  };

  const onPressJoinGame = () => {
    Alert.alert('Join game', 'How do you want to join the game?', [
      {
        text: 'Cancel',
        onPress: () => {},
      },
      {
        text: 'Enter Code',
        onPress: () => {
          navigation.navigate('EnterText', {
            onSubmit: (code: string) => joinRoom(code),
            buttonLabel: 'Join',
            headerTitle: 'Enter Code',
            inputPlaceholder: 'Enter your code',
            inputTitle: 'Code',
          } as IEnterTextScreenParams);
        },
      },
      {
        text: 'Scan QR',
        onPress: () => {
          navigation.navigate('ScanQR', {onRead: joinRoom});
        },
      },
    ]);
  };

  const onPressMyGames = () => {
    navigation.navigate('MyGames');
  };

  const createRoom = (challengeRoomId?: string) => {
    // if (ENV === 'production') analytics().logEvent('create_room');
    socket!.emit(
      'room:create',
      {
        player: {id: user!.uid, name: user!.displayName},
        challengeRoomId,
      } as RoomController.ICreate,
      (room: any) => {
        AsyncStorage.setItem('roomId', room._id);
        navigation.navigate('Room', {roomId: room._id});
      },
    );
  };

  const navigateToTutorial = () => navigation.navigate('Tutorial');

  const content = (
    <View flex>
      <View center flex>
        <Text black text20 center>
          Zon
        </Text>
        <Text grey30>Version {packageJson.version}</Text>
      </View>
      <View padding-12>
        <Button label="Create Game" marginB-6 onPress={() => createRoom()} />
        <Button label="Join Game" marginB-6 onPress={onPressJoinGame} />
        <Button label="My Games" outline onPress={onPressMyGames} />
        <Button
          label="Watch Tutorial"
          outline
          marginT-6
          onPress={navigateToTutorial}
        />
        <Button
          marginT-6
          label="Log Out"
          outline
          onPress={() => auth().signOut()}
        />
      </View>
    </View>
  );

  if (Platform.OS === 'ios')
    return (
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior="height"
        keyboardVerticalOffset={36}>
        {content}
      </KeyboardAvoidingView>
    );

  return content;
};

export default IndexScreen;
