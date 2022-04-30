import React, {FC, Fragment, useEffect, useRef, useState} from 'react';
import {Text, View} from 'react-native-ui-lib';
import MapScreen from '../Room/screens/GameScreen/MapScreen';
import {getInitialPosition} from '../../hooks/usePosition';
import {getTutorialPlayer, getTutorialRoom} from './tutorialData';
import useInterval from '@use-it/interval';
import {
  computeDestinationPoint,
  getDistance,
  getRhumbLineBearing,
} from 'geolib';
import Notification from '../../components/Notification/Notification';
import {getSpacing} from '../../theme/utils';
import NotificationScore from '../../components/Notification/NotificationScore';
import NotificationInfo from '../../components/Notification/NotificationInfo';
import {speak} from 'expo-speech';
import produce from 'immer';
import {
  NavigationRouteContext,
  useNavigation,
  useNavigationState,
} from '@react-navigation/native';
import Sound from 'react-native-sound';
import {Vibration} from 'react-native';

const sounds = {
  success: new Sound(require('../../../assets/sounds/success.mp3')),
  alert: new Sound(require('../../../assets/sounds/alert.mp3')),
  info: new Sound(require('../../../assets/sounds/info.mp3')),
};

const speakP = (message: string) => {
  return new Promise(resolve => {
    speak(message, {onDone: () => resolve(true), language: 'en'});
  });
};

const generateNodesBetween = (way: [number, number][], margin: number) => {
  let points: [number, number][] = [];
  way.forEach((point, index) => {
    const isLast = index === way.length - 1;
    if (isLast) points = [...points, point];
    else {
      points = [...points, point];
      const nextPoint = way[index + 1];
      const distance = getDistance(
        {lng: point[0], lat: point[1]},
        {lng: nextPoint[0], lat: nextPoint[1]},
      );
      const bearing = getRhumbLineBearing(
        {lon: point[0], lat: point[1]},
        {lon: nextPoint[0], lat: nextPoint[1]},
      );
      const numberOfNewPoints = Math.floor(distance / margin);

      for (let i = 0; i < numberOfNewPoints; i++) {
        const generatedPoint = computeDestinationPoint(
          {lon: point[0], lat: point[1]},
          margin * i,
          bearing,
        );
        points = [
          ...points,
          [generatedPoint.longitude, generatedPoint.latitude],
        ];
      }
    }
  });
  return points;
};

const getPath = (paths: [number, number][]) => {
  return paths.reduce<[number, number][]>((acc, coordinate, index) => {
    const next = paths[index + 1];
    if (!next) return [...acc, coordinate];
    const coordinates = generateNodesBetween([coordinate, next], 5);
    return [...acc, ...coordinates];
  }, []);
};

const PATH_1: [number, number][] = getPath([
  [16.35529067457346, 56.66286734170829],
  [16.355355136851777, 56.662016766652684],
  [16.35528947679232, 56.66176598099024],
  [16.35493877222013, 56.66187976797843],
  [16.353265533161245, 56.66172649856982],
  [16.35107233776264, 56.6610331986728],
  [16.35007791808731, 56.660847315792346],
  [16.349896903320253, 56.66070080293501],
]);

const PATH_2: [number, number][] = getPath([
  [16.349896903320253, 56.66070080293501],
  [16.348546423516662, 56.66057231947587],
  [16.346807396147177, 56.6599296703727],
  [16.3458138302401, 56.65974490873262],
]);

const chapters = [
  {
    type: 'event',
    payload: {
      type: 'info',
      message: `Welcome to Zon! Let's learn how to play.`,
    },
  },
  {
    type: 'event',
    payload: {
      type: 'info',
      message: `Zon isn't your typical game. In order to play, you need to go out in the real world.`,
    },
  },
  {
    type: 'event',
    payload: {
      type: 'info',
      message: `The aim of the game is to capture zones. You do this by simply going through them.`,
    },
  },
  {
    type: 'event',
    payload: {
      type: 'info',
      message: `Let me show you.`,
    },
  },
  {type: 'path', payload: PATH_1},
  {
    type: 'capture',
    payload: {
      pointId: '626b97577a376b7df2e93dc7',
    },
  },
  {
    type: 'event',
    payload: {
      type: 'info',
      message: `You captured your first zone which gave you 2 points.`,
    },
  },
  {
    type: 'event',
    payload: {
      type: 'info',
      message: `A zone is marked with a number which tells you how many points you earn for capturing it. The further away a zone is from the starting zone, the more valuable it tends to be.`,
    },
  },
  {
    type: 'event',
    payload: {
      type: 'info',
      message: `Let's capture a zone a little further away.`,
    },
  },
  {
    type: 'path',
    payload: PATH_2,
  },
  {type: 'capture', payload: {pointId: '626b97577a376b7df2e93dbc'}},
  {
    type: 'event',
    payload: {
      type: 'info',
      message: `You captured another zone which gave you 3 points. `,
    },
  },
  {
    type: 'event',
    payload: {
      type: 'info',
      message: `You can see your total score in the top left corner. The negative number is your current distance penalty. The further away you are from the starting zone when the game ends, the higher the penalty.`,
    },
  },
  {
    type: 'capture',
    payload: {
      pointId: '626b97577a376b7df2e93dc7',
      player: getTutorialPlayer(true),
    },
  },
  {
    type: 'event',
    payload: {
      type: 'info',
      message: 'Oh no! Another player just stole your zone.',
    },
  },
  {
    type: 'event',
    payload: {
      type: 'info',
      message: `When you capture a zone it's locked for 3 minutes. After that, it's open for anyone to capture.`,
    },
  },
  {
    type: 'event',
    payload: {
      type: 'info',
      message: `The time is running out! Let's get back to the starting zone.`,
    },
  },
  {
    type: 'path',
    payload: [...PATH_2.slice().reverse(), ...PATH_1.slice().reverse()],
  },
  {
    type: 'event',
    payload: {
      type: 'info',
      message: `The game has ended and you got no distance penalty since you were back in time.`,
    },
  },
  {
    type: 'event',
    payload: {
      type: 'info',
      message: `You are now ready to play the game. Good luck!`,
    },
  },
  {
    type: 'end',
  },
];

const TutorialScreen: FC = () => {
  const [currentPath, setCurrentPath] = useState<any[] | null>(null);
  const frame = useRef(0);
  const [event, setEvent] = useState<any>(null);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [currentLocation, setCurrentLocation] = useState(PATH_1[0]);
  const [room, setRoom] = useState(getTutorialRoom());
  const [player, setPlayer] = useState(getTutorialPlayer(false));
  const navigation = useNavigation();

  const simulateCapture = (pointId: string, _player?: any) => {
    Vibration.vibrate(400);

    if (_player) sounds.alert.play();
    else sounds.success.play();

    const pointIndex = room.map.points.findIndex(
      point => point._id === pointId,
    );

    const point = room.map.points[pointIndex];

    const newRoom = produce(room, draft => {
      (draft.map.points[pointIndex].captures as any).push({
        playerId: _player?._id || player._id,
        flags: {},
        createdAt: new Date(),
      });
    });

    const newPlayer = produce(player, (draftPlayer: any) => {
      draftPlayer.score += _player ? -point.weight : point.weight;
    });
    setPlayer(newPlayer as any);

    setRoom(newRoom);
  };

  useEffect(() => {
    const currentChapter = chapters?.[currentChapterIndex];
    if (!currentChapter) return;

    switch (currentChapter.type) {
      case 'event': {
        speakP((currentChapter.payload as any).message).then(() => {
          setEvent(null);
          setCurrentChapterIndex(x => x + 1);
        });
        return setEvent({payload: currentChapter.payload});
      }

      case 'path': {
        frame.current = 0;
        return setCurrentPath(currentChapter.payload as any);
      }

      case 'capture': {
        if ((currentChapter.payload as any).player) {
          simulateCapture(
            (currentChapter.payload as any).pointId,
            (currentChapter.payload as any).player,
          );
        } else {
          simulateCapture((currentChapter.payload as any).pointId);
        }

        return setCurrentChapterIndex(x => x + 1);
      }

      case 'end': {
        return navigation.goBack();
      }
    }
  }, [currentChapterIndex]);

  useInterval(() => {
    if (!currentPath) return;

    if (frame.current > (currentPath?.length || 0) - 1) {
      setCurrentPath(null);
      setCurrentChapterIndex(x => x + 1);
      return;
    }

    setCurrentLocation(currentPath[frame.current]);
    frame.current++;
  }, 10);

  const renderNotification = () => {
    if (!event) return null;
    const {payload} = event;
    return <NotificationInfo message={payload.message} />;
  };

  return (
    <View flex>
      <MapScreen
        zoomEnabled={false}
        usePositionAsCenter={true}
        onPressMap={() => {}}
        position={getInitialPosition(currentLocation)}
        room={room}
        player={{
          ...player,
          location: {type: 'Point', coordinates: currentLocation},
        }}
      />

      <Notification isVisible={Boolean(event)} top={getSpacing(5.5)}>
        {renderNotification()}
      </Notification>
    </View>
  );
};

export default TutorialScreen;
