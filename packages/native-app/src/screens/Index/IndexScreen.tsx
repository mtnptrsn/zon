import {useNavigation} from '@react-navigation/core';
import React, {FC, useContext, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {Text, Button, Input} from 'react-native-elements';
import {SocketContext} from '../../socket/context';
import {getSpacing} from '../../theme/utils';
import {RoomController} from 'socket-server/src/controllers/RoomController';
import DeviceInfo from 'react-native-device-info';

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

const IndexScreen: FC = () => {
  const navigation = useNavigation();
  const socket = useContext(SocketContext);
  const [name, setName] = useState('');
  const onReadQR = (data: string) => {
    socket!.emit(
      'join:room',
      {roomId: data, player: {id: DeviceInfo.getUniqueId(), name: name}},
      () => {
        navigation.navigate('Room', {roomId: data});
      },
    );
  };
  const onPressJoinGame = () => {
    if (!name) return alert('You must enter a name to continue.');
    navigation.navigate('ScanQR', {onRead: onReadQR});
  };
  const onPressCreateGame = () => {
    if (!name) return alert('You must enter a name to continue.');

    socket!.emit(
      'create:room',
      {
        player: {id: DeviceInfo.getUniqueId(), name: name},
      } as RoomController.ICreate,
      (room: any) => {
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
