import differenceInMilliseconds from 'date-fns/differenceInMilliseconds';
import {getDistance} from 'geolib';
import React, {FC} from 'react';
import {getUniqueId} from 'react-native-device-info';
import {IPoint} from '../../types';
import {View, Text, Button} from 'react-native-ui-lib';

interface IStatsScreenProps {
  room: any;
  player: any;
  onPressLeave: () => void;
  onPressEndGame: () => void;
  onPressReplay: () => void;
}

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

const addTrailingZero = (string: string) =>
  string.length === 1 ? `${string}0` : string;

const getPace = (duration: number, distance: number) => {
  if (!distance || !duration) return `0:00`;
  const minutes = duration / 60 / 1000 / (distance / 1000);
  return `${Math.floor(minutes)}:${addTrailingZero(
    String(Math.round((minutes % 1) * 60)),
  )}`;
};

const StatsScreen: FC<IStatsScreenProps> = props => {
  const duration = differenceInMilliseconds(
    new Date(props.room.finishedAt),
    new Date(props.room.startedAt),
  );

  const renderPlayers = () => {
    return props.room.players
      .sort((a: any, b: any) => b.score - a.score)
      .map((player: any) => {
        const playerPositions = (props.room.playerPositions || []).filter(
          (pp: any) => pp.playerId === player._id,
        );
        const isCurrentPlayer = player._id === getUniqueId();
        const distance = getDistanceTravelled(
          playerPositions.map((pp: any) => pp.location.coordinates),
        );
        const pace = getPace(duration, distance);
        const scorePerMinute = props.room.map.points.reduce(
          (acc: number, point: any) => {
            return point.collectedBy?._id === player._id
              ? acc + point.weight
              : acc;
          },
          0,
        );

        return (
          <View key={player._id} marginB-6>
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
                {isCurrentPlayer ? 'You' : player.name}
                {!player.isWithinHome && props.room.status === 'FINISHED'
                  ? ' (disqualified)'
                  : ''}
              </Text>
            </View>
            <View marginL-46 style={{marginTop: -3}}>
              {Boolean(
                props.room.flags.includes('CONTROL') &&
                  props.room.status === 'PLAYING',
              ) && <Text grey30>Score/min: {scorePerMinute}</Text>}
              {props.room.status === 'FINISHED' && (
                <>
                  <Text grey30>
                    Distance: {Math.round((distance / 1000) * 10) / 10} km
                  </Text>
                  <Text grey30>Pace: {pace} min/km</Text>
                </>
              )}
            </View>
          </View>
        );
      });
  };

  return (
    <View paddingB-56 flex absF backgroundColor="white" padding-12>
      <Text text50L>Players</Text>
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
