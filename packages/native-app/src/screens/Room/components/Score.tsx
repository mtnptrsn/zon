import React, {FC} from 'react';
import {StyleSheet} from 'react-native';
// import {Text} from 'react-native-elements';
import {Text, View} from 'react-native-ui-lib';
import {getSpacing} from '../../../theme/utils';

interface IScoreProps {
  score: number;
  penalty?: number;
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
      <View
        row
        style={{
          justifyContent: 'flex-end',
          alignItems: 'flex-end',
        }}>
        <Text text50L>{props.score}</Text>
        {typeof props.penalty === 'number' && (
          <Text text65L marginB-2 grey30 marginL-3>
            (-{props.penalty})
          </Text>
        )}
      </View>
    </View>
  );
};

export default Score;
