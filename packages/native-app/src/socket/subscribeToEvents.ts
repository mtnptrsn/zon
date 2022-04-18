import {useContext, useEffect, useState} from 'react';
import {getUniqueId} from 'react-native-device-info';
import {SocketContext} from './context';

const subscribeToEvents = (
  roomId: string,
  playerId: string,
  onNewEvent: (event: any) => void,
  deps?: any[],
) => {
  const socket = useContext(SocketContext);

  useEffect(() => {
    socket!.on(`room:${roomId}:onEvent`, onNewEvent);
    socket!.on(`player:${playerId}:onEvent`, onNewEvent);

    return () => {
      socket!.off(`room:${roomId}:onEvent`, onNewEvent);
      socket!.off(`player:${playerId}:onEvent`, onNewEvent);
    };
  }, deps || []);

  return null;
};

export default subscribeToEvents;
