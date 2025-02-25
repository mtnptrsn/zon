import {add} from 'date-fns';
import differenceInMilliseconds from 'date-fns/differenceInMilliseconds';
import {getDistance} from 'geolib';
import React, {FC} from 'react';
import {Button, Text, View} from 'react-native-ui-lib';
import useStoredState from '../../../../hooks/useAsyncStorage';
import {round} from '../../../../utils/round';
import {metersToMiles} from '../../../../utils/units';

interface IStatsScreenProps {
  room: any;
  player: any;
  onPressLeave: () => void;
  onPressEndGame: () => void;
  onPressReplay: () => void;
}

const getDistanceText = (
  distance: number,
  measurementSystem: 'imperial' | 'metric',
) => {
  if (measurementSystem === 'imperial')
    return `${round(metersToMiles(distance), 2)} miles`;

  return `${round(distance / 1000, 2)} km`;
};

const getDistanceTravelled = (coordinates: [number, number][]) => {
  return coordinates.slice(1).reduce(
    (
      acc: {sum: number; previous: [number, number]},
      coordinate: [number, number],
    ) => {
      return {
        sum:
          acc.sum +
          getDistance(
            {longitude: coordinate[0], latitude: coordinate[1]},
            {longitude: acc.previous[0], latitude: acc.previous[1]},
          ),
        previous: coordinate,
      };
    },
    {sum: 0, previous: coordinates[0]},
  ).sum;
};

const addLeadingZero = (string: string) =>
  string.length === 1 ? `0${string}` : string;

const getPace = (
  duration: number,
  distance: number,
  measurementSystem: 'imperial' | 'metric',
) => {
  if (!distance || !duration) return `0:00`;

  const convertedDistance =
    measurementSystem === 'imperial'
      ? metersToMiles(distance)
      : distance / 1000;

  const minutes = duration / 60 / 1000 / convertedDistance;
  return `${Math.floor(minutes)}:${addLeadingZero(
    String(Math.round((minutes % 1) * 60)),
  )} ${measurementSystem === 'imperial' ? 'min/miles' : 'min/km'}`;
};

const StatsScreen: FC<IStatsScreenProps> = props => {
  const [measurementSystem] = useStoredState<'metric' | 'imperial'>(
    'measurementSystem',
    'metric',
  );

  const duration = differenceInMilliseconds(
    new Date(props.room.finishedAt),
    new Date(props.room.startedAt),
  );

  const renderPlayers = () => {
    const ghosts = props.room.challengeRoom?.players?.map?.((player: any) => {
      const elapsedTime = differenceInMilliseconds(
        new Date(),
        new Date(props.room.startedAt),
      );

      const challengeRoomDate = add(
        new Date(props.room.challengeRoom.startedAt),
        {
          seconds: elapsedTime / 1000,
        },
      );
      const playerScore =
        props.room.status === 'FINISHED'
          ? player.score
          : props.room.challengeRoom.map.points.reduce(
              (acc: any, point: any) => {
                if (point.captures.length === 0) return acc;

                const captures = point.captures.filter(
                  (capture: any) =>
                    new Date(capture.createdAt) < challengeRoomDate,
                );

                const lastCapture = captures[captures.length - 1];

                if (lastCapture?.playerId === player._id) {
                  return acc + point.weight;
                }

                return acc;
              },
              0,
            );

      return {
        ...player,
        score: playerScore,
        name: `Ghost ${player.name}`,
        isGhost: true,
      };
    });

    return [...(ghosts || []), ...props.room.players]
      .sort((a: any, b: any) => b.score - a.score)
      .map((player: any) => {
        const playerPositions = (props.room.playerPositions || []).filter(
          (pp: any) =>
            pp.playerId === player._id &&
            Boolean(pp.isGhost) === Boolean(player.isGhost),
        );
        const distance = getDistanceTravelled(
          playerPositions.map((pp: any) => pp.location.coordinates),
        );
        const pace = getPace(duration, distance, measurementSystem);
        const key = `${player._id}${player.isGhost ? '_ghost' : ''}`;

        return (
          <View key={key} marginB-8>
            <View row centerV>
              <View
                center
                backgroundColor={player.color}
                height={37}
                width={37}
                br100>
                <Text
                  style={{
                    textShadowColor: 'rgba(0,0,0,.5)',
                    textShadowOffset: {width: 0, height: 0},
                    textShadowRadius: 3,
                  }}
                  text70L
                  white>
                  {player.score}
                </Text>
              </View>
              <Text text65L marginL-8>
                {player.name}
              </Text>
            </View>
            <View marginL-46 style={{marginTop: -3}}>
              {props.room.status === 'FINISHED' && (
                <>
                  <Text grey30>
                    Distance: {getDistanceText(distance, measurementSystem)}
                  </Text>
                  <Text grey30>Pace: {pace}</Text>
                </>
              )}
            </View>
          </View>
        );
      });
  };

  return (
    <View paddingB-56 flex absF backgroundColor="white" padding-12>
      <Text text60L>Players</Text>
      <View marginT-6 height={1} width="100%" backgroundColor="#e3e3e3" />
      <View marginT-12 flex>
        {renderPlayers()}
      </View>
      <View>
        {props.room.status === 'FINISHED' && (
          <Button onPress={props.onPressReplay} outline label="Replay" />
        )}
        {props.player.isHost && props.room.status === 'PLAYING' && (
          <Button
            onPress={props.onPressEndGame}
            outline
            label="End Game"
            marginT-6
          />
        )}
        <Button marginT-6 onPress={props.onPressLeave} outline label="Leave" />
      </View>
    </View>
  );
};

export default StatsScreen;
