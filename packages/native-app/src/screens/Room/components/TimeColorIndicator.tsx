import useInterval from '@use-it/interval';
import differenceInSeconds from 'date-fns/differenceInSeconds';
import React, {FC, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-elements';
import {getSpacing} from '../../../theme/utils';
import Icon from 'react-native-vector-icons/FontAwesome';

interface ITimeColorIndicatorProps {
  room: any;
  player: any;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: getSpacing(1),
    right: getSpacing(1),
    padding: getSpacing(1),
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    borderRadius: 100,
    borderWidth: 4,
    borderColor: 'white',
    borderStyle: 'solid',
  },
  icon: {
    marginRight: getSpacing(0.5),
  },
});

const useForceUpdate = () => {
  const [_, setValue] = useState(0); // integer state
  return () => setValue(value => value + 1); // update the state to force render
};

const addLeadingZero = (number: number) => {
  if (number < 10) return `0${number}`;
  return number;
};

const getTimeLeft = (finishedAt: Date) => {
  const timeLeft = Math.max(differenceInSeconds(finishedAt, new Date()), 0);
  if (timeLeft <= 60) return timeLeft;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  return `${minutes}:${addLeadingZero(seconds)}`;
};

const TimeColorIndicator: FC<ITimeColorIndicatorProps> = props => {
  const forceUpdate = useForceUpdate();
  useInterval(() => {
    forceUpdate();
  }, 500);

  return (
    <View style={[styles.container, {backgroundColor: props.player.color}]}>
      {props.player.isWithinHome && (
        <Icon color="white" size={16} style={styles.icon} name="home" />
      )}
      <Text style={{color: 'white', fontSize: 20, fontWeight: 'bold'}}>
        {getTimeLeft(new Date(props.room.finishedAt))}
      </Text>
    </View>
  );
};

export default TimeColorIndicator;
