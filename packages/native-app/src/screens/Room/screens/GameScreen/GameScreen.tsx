import {GeolocationResponse} from '@react-native-community/geolocation';
import {StackActions, useNavigation} from '@react-navigation/native';
import {speak} from 'expo-speech';
import {getDistance} from 'geolib';
import React, {FC, useContext, useEffect, useMemo, useState} from 'react';
import {Alert, Vibration} from 'react-native';
import {getUniqueId} from 'react-native-device-info';
import Sound from 'react-native-sound';
import {TabBar, View, Text} from 'react-native-ui-lib';
import Notification from '../../../../components/Notification/Notification';
import NotificationInfo from '../../../../components/Notification/NotificationInfo';
import NotificationScore from '../../../../components/Notification/NotificationScore';
import useStoredState from '../../../../hooks/useAsyncStorage';
import {useEventQueue} from '../../../../hooks/useEventQueue';
import {SocketContext} from '../../../../socket/context';
import subscribeToEvents from '../../../../socket/subscribeToEvents';
import {getSpacing} from '../../../../theme/utils';
import {vibrationDurations} from '../../../../utils/vibration';
import MainGameScreen from './MainGameScreen';
import MapScreen from './MapScreen';
import StatsScreen from './StatsScreen';
import {useUpdateEffect} from 'react-use';
import {current} from 'immer';

const speakP = (message: string) => {
  return new Promise(resolve => {
    speak(message, {onDone: () => resolve(true), language: 'en'});
  });
};

const sounds: any = {
  success: new Sound(require('../../../../../assets/sounds/success.mp3')),
  alert: new Sound(require('../../../../../assets/sounds/alert.mp3')),
  info: new Sound(require('../../../../../assets/sounds/info.mp3')),
};

interface IGameScreenProps {
  room: any;
  position: GeolocationResponse;

  onPressMap: (coordinate: [number, number]) => void;
}

const tutorialAnnouncements = [
  `You captured your first zone! A zone is marked with a number which tells you how many points you earn for capturing it. The further away a zone is from the starting zone, the more valuable it tends to be.`,
  `You can see your total score in the top left corner. The negative number is your current distance penalty. The further away you are from the starting zone when the game ends, the higher the penalty.`,
  `When you capture a zone it's locked for 3 minutes. After that, it's open for anyone to capture.`,
];

const GameScreen: FC<IGameScreenProps> = props => {
  const [event, setEvent] = useState<any>(null);
  const [tutorialNotifications, setTutorialNotifications] = useState(0);
  const [tutorial, _, tutorialHydrated] = useStoredState('tutorial', false);
  const navigation = useNavigation();
  const [activeScreen, setActiveScreen] = useState(0);
  const socket = useContext(SocketContext);
  const player = props.room.players.find(
    (player: any) => player._id === getUniqueId(),
  );
  const currentPosition: [number, number] = [
    props.position.coords.longitude,
    props.position.coords.latitude,
  ];

  const pointPosition: [number, number] =
    props.room.points[0].location.coordinates;

  const currentDistance = useMemo(
    () => getDistance(currentPosition, pointPosition),
    [currentPosition, pointPosition],
  );

  const [renderDistance, setRenderDistance] = useState(currentDistance);

  useUpdateEffect(() => {
    const distanceFilter = 25;

    const isHigher = currentDistance - distanceFilter > renderDistance;
    const isLower = currentDistance + distanceFilter < renderDistance;

    if (isHigher || isLower) {
      const message = `You are ${currentDistance} meters away.`;
      Vibration.vibrate(400);
      if (isHigher) sounds.alert.play();
      else sounds.info.play();
      speakP(message);
      setRenderDistance(currentDistance);
    }
  }, [currentDistance, renderDistance]);

  const notify = (event: any) => {
    const {payload} = event;

    if (payload.vibrate) {
      Vibration.vibrate(
        payload.vibrate === 'long'
          ? vibrationDurations.long
          : vibrationDurations.short,
      );
    }
    if (payload.sound && sounds[payload.sound]) sounds[payload.sound].play();
    if (!payload.sound) sounds.info.play();

    setEvent(null);
    setEvent(event);
  };

  const onEventEnd = (_event: any) => {
    setEvent((event: any) => {
      if (event?.nonce === _event.nonce) {
        return null;
      }
      return event;
    });
  };

  const addToQueue = useEventQueue(notify, onEventEnd);

  const onEvent = (event: any) => {
    addToQueue(event, () => speakP(event.message));
    const isCurrentPlayer = player._id === event.player?._id;
    const isGhost = event.player?.isGhost;

    if (tutorial && isCurrentPlayer && !isGhost && event.type === 'capture') {
      const message = tutorialAnnouncements[tutorialNotifications];

      if (message) {
        addToQueue({message, type: 'info'}, () => speakP(message));
        setTutorialNotifications(x => x + 1);
      }
    }
  };

  subscribeToEvents(props.room._id, player._id, onEvent, [
    tutorialNotifications,
    tutorial,
  ]);

  useEffect(() => {
    if (player.score === 0 && tutorial && tutorialHydrated) {
      // const message = 'The game has started. Go capture your first zone!';
      // addToQueue(
      //   {
      //     message,
      //     type: 'info',
      //   },
      //   () => speakP(message),
      // );
    }
  }, [tutorialHydrated]);

  useEffect(() => {
    Vibration.vibrate(vibrationDurations.long);
  }, []);

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
    const {payload} = event;

    if (payload.type === 'capture') {
      return (
        <NotificationScore
          color={payload.player.color}
          message={payload.message}
          score={payload.player.score}
          sound="success"
        />
      );
    }

    return <NotificationInfo message={payload.message} />;
  };

  const onPressLeave = () => {
    const leave = () => {
      // if (ENV === 'production') analytics().logEvent('leave_game');
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
      player,
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
      <MainGameScreen
        room={props.room}
        player={player}
        position={props.position}
        distance={renderDistance}
      />
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
          label="Game"></TabBar.Item>
        <TabBar.Item
          key={1}
          onPress={() => setActiveScreen(1)}
          label="Stats"></TabBar.Item>
      </TabBar>

      <Notification
        isVisible={Boolean(event)}
        top={getSpacing(activeScreen === 0 ? 5.5 : 1)}>
        {renderNotification()}
      </Notification>
    </View>
  );
};

export default GameScreen;
