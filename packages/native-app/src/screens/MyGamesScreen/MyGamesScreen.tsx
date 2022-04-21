import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {format} from 'date-fns';
import React, {FC, useContext, useEffect, useState} from 'react';
import {Alert, ScrollView} from 'react-native';
import DeviceInfo, {getUniqueId} from 'react-native-device-info';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {Colors, Text, View} from 'react-native-ui-lib';
import {RoomController} from 'socket-server/src/controllers/RoomController';
import useStoredState from '../../hooks/useAsyncStorage';
import {SocketContext} from '../../socket/context';
import LoadingScreen from '../Room/screens/LoadingScreen';

const HorizontalLine: FC = () => {
  return <View height={1} width="100%" backgroundColor={Colors.grey50} />;
};

const Player: FC<{player: any}> = props => {
  return (
    <View row centerV>
      <View
        marginR-6
        height={30}
        width={30}
        backgroundColor={props.player.color}
        style={{borderRadius: 99}}
        center>
        <Text text90L white>
          {props.player.score}
        </Text>
      </View>

      <Text text80L>{props.player.name}</Text>
    </View>
  );
};

const Room: FC<{room: any}> = props => {
  return (
    <View>
      <Text>
        {format(new Date(props.room.createdAt), 'dd MMM yyyy - HH:mm')}
      </Text>

      <View row marginT-6>
        <View flexG>
          {props.room.players.map((player: any) => (
            <>
              <Player key={player._id} player={player} />
              <View marginB-6 />
            </>
          ))}
        </View>
        <View flexG>
          <Text grey30>Duration</Text>
          <Text>{props.room.duration / 1000 / 60} minutes</Text>

          <Text grey30 marginT-3>
            Map Size
          </Text>
          <Text>{props.room.map.radius} meters</Text>
        </View>
      </View>
    </View>
  );
};

const MyGamesScreen: FC = () => {
  const socket = useContext(SocketContext)!;
  const playerId = getUniqueId();
  const [name] = useStoredState('name', '');
  const navigation = useNavigation();

  const [rooms, setRooms] = useState<null | any[]>(null);

  useEffect(() => {
    socket.emit('rooms:get', {playerId, status: 'FINISHED'}, (rooms: any) =>
      setRooms(rooms),
    );
  }, []);

  const createGame = (room: any) => {
    if (!name)
      return Alert.alert('Empty field', 'You must enter a name to continue.');
    socket!.emit(
      'room:create',
      {
        player: {id: playerId, name},
        challengeRoomId: room.shortId,
      } as RoomController.ICreate,
      (room: any) => {
        AsyncStorage.setItem('roomId', room._id);
        navigation.navigate('Room', {roomId: room._id});
      },
    );
  };

  const onPressRoom = (room: any) => {
    Alert.alert(
      '',
      'What do you want to do?',
      [{text: 'Cancel'}, {text: 'Challenge', onPress: () => createGame(room)}],
      {cancelable: true},
    );
  };

  if (!rooms) return <LoadingScreen />;
  if (rooms.length === 0)
    return (
      <View center flex>
        <Text>No games yet.</Text>
      </View>
    );

  return (
    <ScrollView>
      <View padding-12>
        {rooms.map((room: any, index) => {
          const isLast = index === rooms.length - 1;

          return (
            <View key={room._id}>
              <View paddingV-16>
                <TouchableOpacity onPress={() => onPressRoom(room)}>
                  <Room room={room} />
                </TouchableOpacity>
              </View>
              {!isLast && <HorizontalLine />}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

export default MyGamesScreen;
