import useInterval from '@use-it/interval';
import differenceInSeconds from 'date-fns/differenceInSeconds';
import React, {FC, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-elements';
import {getSpacing} from '../../../theme/utils';

interface IScoreProps {
  score: number;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: getSpacing(1) + 6,
    left: getSpacing(1),
    backgroundColor: 'white',
    paddingHorizontal: getSpacing(1),
    paddingVertical: getSpacing(0.5),
    borderRadius: 3,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(0,0,0,.8)',
  },
  text: {},
});

const Score: FC<IScoreProps> = props => {
  return (
    <View style={styles.container}>
      <Text h4 style={styles.text}>
        {props.score}
      </Text>
    </View>
  );
};

export default Score;
