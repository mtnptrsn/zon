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
      .map((player: any) => {
        const score = props.room.map.points.reduce(
          (acc: number, point: IPoint) => {
            if (point.collectedBy?._id === player._id)
              return acc + point.weight;
            return acc;
          },
          0,
        );

        return {score, player};
      })
      .sort((a: any, b: any) => b.score - a.score)
      .map(({score, player}: {score: number; player: any}) => {
        const playerPositions = (props.room.playerPositions || []).filter(
          (pp: any) => pp.playerId === player._id,
        );
        const isCurrentPlayer = player._id === getUniqueId();
        const distance = getDistanceTravelled(
          playerPositions.map((pp: any) => pp.location.coordinates),
        );
        const pace = getPace(duration, distance);

        return (
          <View key={player._id} marginB-6>
            <View row centerV>
              <View
                backgroundColor={player.color}
                height={25}
                width={25}
                br100
              />
              <Text text70 marginL-8>
                {isCurrentPlayer ? 'You' : player.name} - {score} point(s){' '}
                {!player.isWithinHome && props.room.status === 'FINISHED'
                  ? '(disqualified)'
                  : ''}
              </Text>
            </View>
            {props.room.status === 'FINISHED' && (
              <View marginL-34 marginT-3>
                <Text grey30>
                  Distance: {Math.round((distance / 1000) * 10) / 10} km
                </Text>
                <Text grey30>Pace: {pace} min/km</Text>
              </View>
            )}
          </View>
        );
      });
  };

  return (
    <View paddingB-56 flex absF backgroundColor="white" padding-12>
      <Text text50L>Leaderboard</Text>
      <View flex marginT-12>
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
