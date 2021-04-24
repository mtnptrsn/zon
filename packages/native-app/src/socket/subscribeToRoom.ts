import {useContext, useEffect, useState} from 'react';
import {getUniqueId} from 'react-native-device-info';
import {SocketContext} from './context';

const subscribeToRoom = (roomId: string) => {
  const socket = useContext(SocketContext);
  const [room, setRoom] = useState<null | any>(null);

  const onRoomUpdate = (room: any) => {
    setRoom(room);
  };

  useEffect(() => {
    socket!.emit('get:room', {roomId}, (room: any) => setRoom(room));
    socket!.emit('subscribe:room', {roomId}, () => {});
    socket!.on('update:room', onRoomUpdate);

    return () => {
      socket!.emit('unsubscribe:room', {roomId}, () => {});
      socket!.emit('leave:room', {roomId, userId: getUniqueId()});
      socket!.off('update:room', onRoomUpdate);
    };
  }, []);

  return room;
};

export default subscribeToRoom;
