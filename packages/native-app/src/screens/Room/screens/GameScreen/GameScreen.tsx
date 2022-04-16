import React, {FC, useContext, useEffect, useState} from 'react';
import {Alert, Vibration} from 'react-native';
import {SocketContext} from '../../../../socket/context';
import {getUniqueId} from 'react-native-device-info';
import subscribeToEvents from '../../../../socket/subscribeToEvents';
import {vibrationDurations} from '../../../../utils/vibration';
import {GeolocationResponse} from '@react-native-community/geolocation';
import MapScreen from './MapScreen';
import StatsScreen from './StatsScreen';
import {TabBar, View} from 'react-native-ui-lib';
import {getSpacing} from '../../../../theme/utils';
import {StackActions, useNavigation} from '@react-navigation/native';
import Notification from '../../../../components/Notification/Notification';
import NotificationScore from '../../../../components/Notification/NotificationScore';
import NotificationInfo from '../../../../components/Notification/NotificationInfo';
import analytics from '@react-native-firebase/analytics';
import {ENV} from 'react-native-dotenv';

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

const GameScreen: FC<IGameScreenProps> = props => {
  const [event, setEvent] = useState<any>(null);
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

    // TODO: Create queue
    setEvent(null);
    setEvent(event);
  };

  subscribeToEvents(props.room._id, onEvent);

  useEffect(() => Vibration.vibrate(vibrationDurations.long), []);

  useEffect(() => {
    if (props.room.status !== 'PLAYING') return;
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

  const renderNotification = () => {
    if (!event) return null;
    const currentIsPlayer = event?.player?._id === getUniqueId();
    const currentIsVictim = event?.victim?._id === getUniqueId();

    const scoreGrowth = props.room.map.points.reduce(
      (acc: number, point: any) => {
        return point.collectedBy?._id === player._id ? acc + point.weight : acc;
      },
      0,
    );

    if (event?.type === 'scoreDistribution' && scoreGrowth > 0) {
      return (
        <NotificationScore
          isVictim={false}
          score={player.score}
          scoreGrowth={scoreGrowth}
          color={player.color}
          message={`You gained ${scoreGrowth} ${
            scoreGrowth > 1 ? 'points' : 'point'
          }`}
        />
      );
    }

    if (event.type === 'capture' && event.mode === 'NORMAL') {
      return (
        <NotificationScore
          isVictim={!currentIsPlayer}
          score={event.player.score}
          message={`${
            currentIsPlayer ? 'You' : event.player.name
          } captured a zone`}
          color={event.player.color}
        />
      );
    }
    if (event.type === 'capture' && event.mode === 'CONTROL') {
      const message = Boolean(event.victim)
        ? `${currentIsPlayer ? 'You' : event.player.name} stole a zone from ${
            currentIsVictim ? 'you' : event.victim.name
          } worth ${event.weight} ${event.weight > 1 ? 'points' : 'point'}`
        : `${
            currentIsPlayer ? 'You' : event.player.name
          } captured a zone worth ${event.weight} ${
            event.weight > 1 ? 'points' : 'point'
          }`;
      return (
        <NotificationScore
          isVictim={!currentIsPlayer}
          scoreGrowth={scoreGrowth}
          score={event.player.score}
          message={message}
          color={event.player.color}
        />
      );
    }
    if (event.type === 'info-player')
      return (
        <NotificationInfo
          icon={event.icon}
          message={translateEventMessage(
            {player: currentIsPlayer ? 'You' : event.player.name},
            event.message,
          )}
        />
      );

    return <NotificationInfo message={event.message} />;
  };

  const onPressLeave = () => {
    const leave = () => {
      if (ENV === 'production') analytics().logEvent('leave_game');
      navigation.dispatch(StackActions.popToTop());
    };
    Alert.alert('Confirmation', 'Are you sure you want to leave the game?', [
      {text: 'No', onPress: () => {}},
      {text: 'Yes', onPress: leave},
    ]);
  };

  const onPressReplay = () => {
    navigation.navigate('Replay', {
      room: props.room,
    });
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
    <View flex>
      <MapScreen room={props.room} player={player} position={props.position} />
      {activeScreen === 1 && (
        <StatsScreen
          player={player}
          onPressEndGame={onPressEndGame}
          onPressLeave={onPressLeave}
          onPressReplay={onPressReplay}
          room={props.room}
        />
      )}

      <TabBar enableShadow selectedIndex={activeScreen}>
        <TabBar.Item
          key={0}
          onPress={() => setActiveScreen(0)}
          label="Map"></TabBar.Item>
        <TabBar.Item
          key={1}
          onPress={() => setActiveScreen(1)}
          label="Stats"></TabBar.Item>
      </TabBar>

      {Boolean(event) && (
        <Notification top={getSpacing(activeScreen === 0 ? 5.5 : 1)}>
          {renderNotification()}
        </Notification>
      )}
    </View>
  );
};

export default GameScreen;
