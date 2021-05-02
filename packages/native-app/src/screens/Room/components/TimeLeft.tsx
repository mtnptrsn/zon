import useInterval from '@use-it/interval';
import differenceInSeconds from 'date-fns/differenceInSeconds';
import React, {FC, useState} from 'react';
import {StyleSheet} from 'react-native';
import {getSpacing} from '../../../theme/utils';
import {View, Text} from 'react-native-ui-lib';

interface ITimeIndicatorProps {
  finishedAt: Date;
  now?: Date;
}

const useForceUpdate = () => {
  const [_, setValue] = useState(0); // integer state
  return () => setValue(value => value + 1); // update the state to force render
};

const addLeadingZero = (number: number) => {
  if (number < 10) return `0${number}`;
  return number;
};

const getTimeLeft = (finishedAt: Date, now?: Date) => {
  const timeLeft = Math.max(
    differenceInSeconds(finishedAt, now || new Date()),
    0,
  );
  if (timeLeft <= 60) return String(timeLeft);
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  return `${minutes}:${addLeadingZero(seconds)}`;
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: getSpacing(1),
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(0,0,0,.1)',
    alignSelf: 'center',
  },
});

const TimeLeft: FC<ITimeIndicatorProps> = props => {
  const forceUpdate = useForceUpdate();
  useInterval(() => {
    forceUpdate();
  }, 1000);

  const timeLeft = getTimeLeft(props.finishedAt, props.now);

  return (
    <View
      backgroundColor="white"
      height={46}
      paddingH-16
      center
      br10
      style={styles.container}>
      <Text text50BL>{timeLeft}</Text>
    </View>
  );
};

export default TimeLeft;
