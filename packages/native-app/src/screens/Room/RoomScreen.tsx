import {StackActions, useNavigation, useRoute} from '@react-navigation/core';
import React, {FC, useEffect, useState} from 'react';
import subscribeToRoom from '../../socket/subscribeToRoom';
import CancelledScreen from './screens/CancelledScreen';
import GameScreen from './screens/GameScreen/GameScreen';
import LobbyScreen from './screens/LobbyScreen';
import CountdownScreen from './screens/CountdownScreen';
import {Alert} from 'react-native';
import {useKeepAwake} from 'expo-keep-awake';
import {getInitialPosition, usePosition} from '../../hooks/usePosition';
import {LoaderScreen} from 'react-native-ui-lib';
import {PRESS_TO_MOVE} from 'react-native-dotenv';

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
  const [mockPosition, setMockPosition] = useState(getInitialPosition());

  const onClickAndroidArrowBack = () => {
    const leave = () => {
      navigation.dispatch(StackActions.popToTop());
    };

    Alert.alert('Confirmation', 'Are you sure you want to leave the game?', [
      {text: 'No', onPress: () => {}},
      {text: 'Yes', onPress: leave},
    ]);
  };

  const onPressMap = (coordinate: [number, number]) => {
    if (!PRESS_TO_MOVE) return;

    Alert.alert(
      'Mock position',
      `Do you want to move to ${coordinate.join(', ')}?`,
      [
        {text: 'Cancel', onPress: () => {}},
        {
          text: 'Turn off mock location',
          onPress: () => setMockPosition(getInitialPosition()),
        },
        {
          text: 'Confirm',
          onPress: () => {
            setMockPosition({
              ...mockPosition,
              coords: {
                ...mockPosition.coords,
                accuracy: 1,
                longitude: coordinate[0],
                latitude: coordinate[1],
              },
            });
          },
        },
      ],
    );
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

  if (!room) return <LoaderScreen />;
  if (room.status === 'COUNTDOWN') return <CountdownScreen />;
  if (room.status === 'ARRANGING')
    return <LobbyScreen position={position} room={room} />;
  if (room.status === 'CANCELLED')
    return <CancelledScreen position={position} room={room} />;
  return (
    <GameScreen
      onPressMap={onPressMap}
      position={mockPosition.coords.accuracy ? mockPosition : position}
      room={room}
    />
  );
};

export default RoomScreen;
