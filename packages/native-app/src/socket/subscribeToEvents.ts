import {useContext, useEffect, useState} from 'react';
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
    socket!.on(`player:${playerId}:${roomId}:onEvent`, onNewEvent);

    return () => {
      socket!.off(`room:${roomId}:onEvent`, onNewEvent);
      socket!.off(`player:${playerId}:${roomId}:onEvent`, onNewEvent);
    };
  }, deps || []);

  return null;
};

export default subscribeToEvents;
