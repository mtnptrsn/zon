import React, {FC, useEffect, useState} from 'react';
import {Text} from 'react-native-elements';
import {io, Socket} from 'socket.io-client';
import {SocketContext} from './src/socket/context';

const App: FC = () => {
  const [socket, setSocket] = useState<null | Socket>(null);
  const [isConnected, setIsConnected] = useState(false);
  useEffect(() => {
    // TODO: Use environment variable for this
    const socket = io('http://192.168.86.20:3000');
    setSocket(socket);
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
  }, []);
  if (!socket || !isConnected) return <Text>Connecting...</Text>;
  return (
    <SocketContext.Provider value={socket}>
      <Text>In progress</Text>
    </SocketContext.Provider>
  );
};

export default App;
