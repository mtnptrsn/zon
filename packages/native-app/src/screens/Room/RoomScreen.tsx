import {useNavigation, useRoute} from '@react-navigation/core';
import React, {FC, useEffect} from 'react';
import {Text} from 'react-native-elements';
import subscribeToRoom from '../../socket/subscribeToRoom';
import CancelledScreen from './screens/CancelledScreen';
import GameScreen from './screens/GameScreen';
import LobbyScreen from './screens/LobbyScreen';
import FinishedScreen from './screens/FinishedScreen';
import CountdownScreen from './screens/CountdownScreen';
import {Alert} from 'react-native';
import LoadingScreen from './screens/LoadingScreen';

interface IRoomScreenRouteParams {
  roomId: string;
}

const RoomScreen: FC = () => {
  const route = useRoute();
  const params = route.params! as IRoomScreenRouteParams;
  const room = subscribeToRoom(params.roomId);
  const navigation = useNavigation();

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
  if (room.status === 'COUNTDOWN') return <CountdownScreen room={room} />;
  if (room.status === 'ARRANGING') return <LobbyScreen room={room} />;
  if (room.status === 'FINISHED') return <FinishedScreen room={room} />;
  if (room.status === 'CANCELLED') return <CancelledScreen room={room} />;
  return <GameScreen room={room} />;
};

export default RoomScreen;
