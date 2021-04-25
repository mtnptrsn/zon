import {useContext, useEffect, useState} from 'react';
import {getUniqueId} from 'react-native-device-info';
import {SocketContext} from './context';

const subscribeToRoom = (roomId: string) => {
  const socket = useContext(SocketContext);
  const [room, setRoom] = useState<null | any>(null);

  useEffect(() => {
    socket!.on('connect', () => socket!.emit('get:room', {roomId}, setRoom));
    socket!.emit('get:room', {roomId}, setRoom);
    socket!.emit('subscribe:room', {roomId}, () => {});
    socket!.on('update:room', setRoom);

    return () => {
      socket!.emit('unsubscribe:room', {roomId}, () => {});
      socket!.emit('leave:room', {roomId, userId: getUniqueId()});
      socket!.off('update:room', setRoom);
      socket!.off('connect', setRoom);
    };
  }, []);

  return room;
};

export default subscribeToRoom;
