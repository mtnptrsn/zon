import {GeolocationResponse} from '@react-native-community/geolocation';
import {StackActions, useNavigation} from '@react-navigation/native';
import {speak} from 'expo-speech';
import React, {FC, useContext, useEffect, useState} from 'react';
import {Alert, Vibration} from 'react-native';
import Sound from 'react-native-sound';
import {TabBar, View} from 'react-native-ui-lib';
import Notification from '../../../../components/Notification/Notification';
import NotificationInfo from '../../../../components/Notification/NotificationInfo';
import NotificationScore from '../../../../components/Notification/NotificationScore';
import useStoredState from '../../../../hooks/useAsyncStorage';
import {useEventQueue} from '../../../../hooks/useEventQueue';
import {useUser} from '../../../../hooks/useUser';
import {SocketContext} from '../../../../socket/context';
import subscribeToEvents from '../../../../socket/subscribeToEvents';
import {getSpacing} from '../../../../theme/utils';
import {vibrationDurations} from '../../../../utils/vibration';
import MapScreen from './MapScreen';
import StatsScreen from './StatsScreen';

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
  const user = useUser();
  const player = props.room.players.find(
    (player: any) => player._id === user.uid,
  );

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
      const message = 'The game has started. Go capture your first zone!';
      addToQueue(
        {
          message,
          type: 'info',
        },
        () => speakP(message),
      );
    }
  }, [tutorialHydrated]);

  useEffect(() => {
    if (props.room.status === 'PLAYING')
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
        playerId: user.uid,
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
      <MapScreen
        zoomEnabled
        usePositionAsCenter={false}
        onPressMap={props.onPressMap}
        room={props.room}
        player={player}
        position={props.position}
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
          label="Map"></TabBar.Item>
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
