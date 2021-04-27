import React, {FC, useContext, useEffect, useState} from 'react';
import {Alert, StyleSheet, Vibration, View} from 'react-native';
import {Coordinate, IPoint} from '../../types';
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
    const leave = () => navigation.dispatch(StackActions.popToTop());
    Alert.alert('Confirmation', 'Are you sure you want to leave the game?', [
      {text: 'No', onPress: () => {}},
      {text: 'Yes', onPress: leave},
    ]);
  };

  const onPressEndGame = () => {
    const endGame = () =>
      socket!.emit('room:update:end', {roomId: props.room._id}, () => {});
    Alert.alert('Confirmation', 'Are you sure you want to end the game?', [
      {text: 'No', onPress: () => {}},
      {text: 'Yes', onPress: endGame},
    ]);
  };

  return (
    <View style={styles.container}>
      <MapScreen room={props.room} player={player} position={props.position} />
      {activeScreen === 1 && (
        <StatsScreen
          player={player}
          onPressEndGame={onPressEndGame}
          onPressLeave={onPressLeave}
          room={props.room}
        />
      )}
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
