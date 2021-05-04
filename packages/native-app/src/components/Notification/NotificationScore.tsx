import React, {FC} from 'react';
import {StyleSheet} from 'react-native';
import {Text, View} from 'react-native-ui-lib';
import Score from '../../screens/Room/components/Score';

interface INotificationScoreProps {
  score: number;
  scoreGrowth?: number;
  color: string;
  message: string;
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(0,0,0,.1)',
  },
});

const NotificationScore: FC<INotificationScoreProps> = props => {
  return (
    <View br10 row centerV backgroundColor="white" style={[styles.container]}>
      <View
        backgroundColor={props.color}
        padding-10={Boolean(props.scoreGrowth)}
        padding-14={!props.scoreGrowth}>
        <Text center white text60L>
          {props.score}
        </Text>
        {typeof props.scoreGrowth === 'number' && (
          <Text white text90L style={{marginTop: -2}}>
            {props.scoreGrowth}/min
          </Text>
        )}
      </View>

      <Text text65L marginL-16>
        {props.message}
      </Text>
    </View>
  );
};

export default NotificationScore;
