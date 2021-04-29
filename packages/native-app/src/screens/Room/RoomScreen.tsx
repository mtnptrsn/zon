import {useNavigation, useRoute} from '@react-navigation/core';
import React, {FC, useEffect} from 'react';
import {Text} from 'react-native-elements';
import subscribeToRoom from '../../socket/subscribeToRoom';
import CancelledScreen from './screens/CancelledScreen';
import GameScreen from './screens/GameScreen/GameScreen';
import LobbyScreen from './screens/LobbyScreen';
import FinishedScreen from './screens/FinishedScreen';
import CountdownScreen from './screens/CountdownScreen';
import {Alert} from 'react-native';
import LoadingScreen from './screens/LoadingScreen';
import {useKeepAwake} from 'expo-keep-awake';
import {usePosition} from '../../hooks/usePosition';

interface IRoomScreenRouteParams {
  roomId: string;
}

const RoomScreen: FC = () => {
  useKeepAwake();
  const route = useRoute();
  const params = route.params! as IRoomScreenRouteParams;
  const room = subscribeToRoom(params.roomId);
  const navigation = useNavigation();
  const position = usePosition({enableHighAccuracy: true, distanceFilter: 5});

  const onClickAndroidArrowBack = () => {
    Alert.alert('Confirmation', 'Are you sure you want to leave the game?', [
      {text: 'No', onPress: () => {}},
      {text: 'Yes', onPress: () => navigation.goBack()},
    ]);
  };

  useEffect(() => {
    navigation.addListener('beforeRemove', e => {
      const hasSource = Boolean(e.data.action.source);
      if (!hasSource) {
        e.preventDefault();
        onClickAndroidArrowBack();
      }
    });
  }, []);

  if (!room) return <LoadingScreen />;
  if (room.status === 'COUNTDOWN')
    return <CountdownScreen position={position} room={room} />;
  if (room.status === 'ARRANGING')
    return <LobbyScreen position={position} room={room} />;
  if (room.status === 'CANCELLED')
    return <CancelledScreen position={position} room={room} />;
  return <GameScreen position={position} room={room} />;
};

export default RoomScreen;
