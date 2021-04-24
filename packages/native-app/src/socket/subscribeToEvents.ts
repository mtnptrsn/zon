import {useContext, useEffect, useState} from 'react';
import {getUniqueId} from 'react-native-device-info';
import {SocketContext} from './context';

const subscribeToEvents = (
  roomId: string,
  onNewEvent: (event: any) => void,
) => {
  const socket = useContext(SocketContext);

  useEffect(() => {
    socket!.emit('subscribe:events', {roomId}, () => {});
    socket!.on('update:events', onNewEvent);

    return () => {
      socket!.emit('unsubscribe:events', {roomId}, () => {});
      socket!.off('update:events', onNewEvent);
    };
  }, []);

  return null;
};

export default subscribeToEvents;
