import {useNavigation} from '@react-navigation/core';
import React, {FC, useContext, useEffect, useState} from 'react';
import {View, StyleSheet, Alert} from 'react-native';
import {Text, Button, Input} from 'react-native-elements';
import {SocketContext} from '../../socket/context';
import {getSpacing} from '../../theme/utils';
import {RoomController} from 'socket-server/src/controllers/RoomController';
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Socket} from 'socket.io-client';
import {DefaultEventsMap} from 'socket.io-client/build/typed-events';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: getSpacing(1),
    justifyContent: 'space-between',
  },
  logoText: {
    alignSelf: 'center',
    marginTop: getSpacing(3),
  },
  createGameButton: {
    marginBottom: getSpacing(0.5),
  },
});

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
  const navigation = useNavigation();
  const socket = useContext(SocketContext);
  const [name, setName] = useState('');
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
      () => {
        AsyncStorage.setItem('roomId', data);
        navigation.navigate('Room', {roomId: data});
      },
    );
  };
  const onPressJoinGame = () => {
    if (!name) return Alert.alert('You must enter a name to continue.');
    navigation.navigate('ScanQR', {onRead: onReadQR});
  };
  const onPressCreateGame = () => {
    if (!name) return Alert.alert('You must enter a name to continue.');

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

  return (
    <View style={styles.container}>
      <Text style={styles.logoText} h1>
        Orient
      </Text>
      <View>
        <Input
          onChangeText={setName}
          value={name}
          label="Name"
          placeholder="Your Name"
        />
        <Button
          onPress={onPressCreateGame}
          containerStyle={styles.createGameButton}
          title="Create game"
        />
        <Button onPress={onPressJoinGame} title="Join game" />
      </View>
    </View>
  );
};

export default IndexScreen;
