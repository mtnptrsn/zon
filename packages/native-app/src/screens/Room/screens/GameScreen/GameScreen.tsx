import React, {FC, useContext, useEffect, useState} from 'react';
import {StyleSheet, Vibration, View} from 'react-native';
import MapBoxGL from '@react-native-mapbox-gl/maps';
import {Coordinate} from '../../types';
import {SocketContext} from '../../../../socket/context';
import {getUniqueId} from 'react-native-device-info';
import subscribeToEvents from '../../../../socket/subscribeToEvents';
import Toast from 'react-native-toast-message';
import {vibrationDurations} from '../../../../utils/vibration';
import {MAPBOX_ACCESS_TOKEN} from 'react-native-dotenv';
import {GeolocationResponse} from '@react-native-community/geolocation';
import MapScreen from './MapScreen';
import StatsScreen from './StatsScreen';
import {ButtonGroup} from 'react-native-elements';
import {getSpacing} from '../../../../theme/utils';
import {
  NavigationContainer,
  StackActions,
  useNavigation,
} from '@react-navigation/native';

const coordinateToString = ([lat, long]: Coordinate) => `${lat};${long}`;
const translateEventMessage = (
  translateMap: {[key: string]: string},
  message: string,
) => {
  return Object.entries(translateMap).reduce((acc, [key, value]) => {
    const keyFound = acc.includes(`{${key}}`);
    if (keyFound) return acc.replace(`{${key}}`, value);
    return acc;
  }, message);
};

interface IGameScreenProps {
  room: any;
  position: GeolocationResponse;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navigation: {
    position: 'absolute',
    bottom: getSpacing(1),
    left: getSpacing(1),
    right: getSpacing(1),
  },
});

const GameScreen: FC<IGameScreenProps> = props => {
  const navigation = useNavigation();
  const [activeScreen, setActiveScreen] = useState(0);
  const socket = useContext(SocketContext);
  const player = props.room.players.find(
    (player: any) => player._id === getUniqueId(),
  );
  const score = props.room.map.points.reduce((acc: number, point: any) => {
    if (point.collectedBy?._id === player._id) return acc + 1;
    return acc;
  }, 0);

  const onEvent = (event: any) => {
    const eventBelongsToCurrentPlayer = event.player?._id === getUniqueId();
    const vibrateDuration = eventBelongsToCurrentPlayer
      ? vibrationDurations.long
      : vibrationDurations.short;
    Vibration.vibrate(vibrateDuration);
    Toast.show({
      text2: translateEventMessage(
        {
          player: eventBelongsToCurrentPlayer
            ? 'You'
            : event.player?.name || '',
        },
        event.message,
      ),
      type: eventBelongsToCurrentPlayer ? 'success' : 'info',
    });
  };

  subscribeToEvents(props.room._id, onEvent);

  useEffect(() => Vibration.vibrate(vibrationDurations.long), []);

  useEffect(() => {
    const {longitude, latitude} = props.position.coords;
    if (longitude === 0 && latitude === 0) return;
    socket!.emit(
      'user:updatePosition',
      {
        roomId: props.room._id,
        playerId: getUniqueId(),
        coordinate: [longitude, latitude],
      },
      () => {},
    );
  }, [props.position]);

  const onPressLeave = () => {
    navigation.dispatch(StackActions.popToTop());
  };

  const renderActiveScreen = () => {
    if (activeScreen === 1)
      return <StatsScreen onPressLeave={onPressLeave} room={props.room} />;
    return (
      <MapScreen room={props.room} player={player} position={props.position} />
    );
  };

  return (
    <View style={styles.container}>
      {renderActiveScreen()}
      <ButtonGroup
        containerStyle={styles.navigation}
        onPress={setActiveScreen}
        selectedIndex={activeScreen}
        buttons={['Map', 'Stats']}
      />
    </View>
  );
};

export default GameScreen;
