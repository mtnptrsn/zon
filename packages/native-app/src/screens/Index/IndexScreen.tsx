import {useNavigation} from '@react-navigation/core';
import React, {FC, useContext, useEffect, useState} from 'react';
import {Alert, Dimensions, KeyboardAvoidingView, Platform} from 'react-native';
import {View, Text, Button, TextField} from 'react-native-ui-lib';
import {SocketContext} from '../../socket/context';
import {RoomController} from 'socket-server/src/controllers/RoomController';
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Socket} from 'socket.io-client';
import {DefaultEventsMap} from 'socket.io-client/build/typed-events';
// @ts-ignore
import packageJson from '../../../package.json';

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
  const [name, setName] = useState('');

  // useEffect(() => {
  //   socket!.emit(
  //     'room:get',
  //     {roomId: '608ec270005a19c2a893779c'},
  //     (room: any) => navigation.navigate('Replay', {room}),
  //   );
  // }, []);

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

  const onReadQR = (data: string) => {
    socket!.emit(
      'room:join',
      {roomId: data, player: {id: DeviceInfo.getUniqueId(), name: name}},
      (room: any) => {
        if (!room)
          return Alert.alert(
            'Invalid QR',
            'The QR code you scanned is invalid.',
          );

        AsyncStorage.setItem('roomId', data);
        navigation.navigate('Room', {roomId: data});
      },
    );
  };

  const onPressJoinGame = () => {
    if (!name)
      return Alert.alert('Empty field', 'You must enter a name to continue.');
    navigation.navigate('ScanQR', {onRead: onReadQR});
  };

  const onPressCreateGame = () => {
    if (!name)
      return Alert.alert('Empty field', 'You must enter a name to continue.');

    socket!.emit(
      'room:create',
      {
        player: {id: DeviceInfo.getUniqueId(), name: name},
      } as RoomController.ICreate,
      (room: any) => {
        AsyncStorage.setItem('roomId', room._id);
        navigation.navigate('Room', {roomId: room._id});
      },
    );
  };

  const content = (
    <View flex height={Dimensions.get('screen').height}>
      <View center flex>
        <Text text20 center>
          Zon
        </Text>
        <Text grey30>Version {packageJson.version}</Text>
      </View>
      <View padding-12>
        <View marginH-12>
          <TextField
            placeholder="Your name"
            value={name}
            onChangeText={setName}
            title="Name"
          />
        </View>
        <Button label="Create Game" marginB-6 onPress={onPressCreateGame} />
        <Button label="Join Game" onPress={onPressJoinGame} />
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
