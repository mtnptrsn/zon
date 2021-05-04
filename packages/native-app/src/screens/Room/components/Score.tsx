import React, {FC} from 'react';
import {StyleSheet} from 'react-native';
// import {Text} from 'react-native-elements';
import {Text, View} from 'react-native-ui-lib';
import {getSpacing} from '../../../theme/utils';

interface IScoreProps {
  score: number;
  scoreGrowth?: number;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: getSpacing(1),
    left: getSpacing(1),
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(0,0,0,.1)',
  },
  text: {},
});

const Score: FC<IScoreProps> = props => {
  return (
    <View
      backgroundColor="white"
      height={46}
      paddingH-16
      center
      br10
      style={styles.container}>
      <Text text50L>{props.score}</Text>

      {typeof props.scoreGrowth === 'number' && (
        <Text grey30 text90L style={{marginTop: -4}}>
          {props.scoreGrowth}/min
        </Text>
      )}
    </View>
  );
};

export default Score;
