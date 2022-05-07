import {useContext, useEffect, useState} from 'react';
import {SocketContext} from './context';

const subscribeToRoom = (roomId: string, userId: string) => {
  const socket = useContext(SocketContext);
  const [room, setRoom] = useState<null | any>(null);

  useEffect(() => {
    socket!.on('connect', () => socket!.emit('get:room', {roomId}, setRoom));
    socket!.emit('room:get', {roomId}, setRoom);
    socket!.on(`room:${roomId}:onUpdate`, setRoom);

    return () => {
      socket!.emit('room:leave', {roomId, userId});
      socket!.off('connect', setRoom);
    };
  }, []);

  return room;
};

export default subscribeToRoom;
