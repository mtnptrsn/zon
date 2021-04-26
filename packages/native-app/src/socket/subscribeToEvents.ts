import {useContext, useEffect, useState} from 'react';
import {getUniqueId} from 'react-native-device-info';
import {SocketContext} from './context';

const subscribeToEvents = (
  roomId: string,
  onNewEvent: (event: any) => void,
) => {
  const socket = useContext(SocketContext);

  useEffect(() => {
    socket!.on(`room:${roomId}:onEvent`, onNewEvent);

    return () => {
      socket!.off(`room:${roomId}:onEvent`, onNewEvent);
    };
  }, []);

  return null;
};

export default subscribeToEvents;
