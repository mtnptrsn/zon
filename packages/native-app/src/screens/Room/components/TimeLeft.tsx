import useInterval from '@use-it/interval';
import differenceInSeconds from 'date-fns/differenceInSeconds';
import React, {FC, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-elements';
import {getSpacing} from '../../../theme/utils';

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
    backgroundColor: 'white',
    paddingHorizontal: getSpacing(1),
    paddingVertical: getSpacing(0.5),
    borderRadius: 3,
    alignSelf: 'center',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(0,0,0,.1)',
  },
  text: {},
});

const TimeLeft: FC<ITimeIndicatorProps> = props => {
  const forceUpdate = useForceUpdate();
  useInterval(() => {
    forceUpdate();
  }, 1000);

  const timeLeft = getTimeLeft(props.finishedAt, props.now);

  return (
    <View style={styles.container}>
      <Text h4 style={styles.text}>
        {timeLeft}
      </Text>
    </View>
  );
};

export default TimeLeft;
