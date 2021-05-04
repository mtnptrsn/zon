import React, {FC} from 'react';
import {StyleSheet} from 'react-native';
import {Text, View} from 'react-native-ui-lib';

interface INotificationScoreProps {
  current: number;
  name: string;
  color: string;
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
      <View backgroundColor={props.color} padding-14>
        <Text center white text60L>
          {props.current}
        </Text>
      </View>

      <Text text65L marginL-16>
        {props.name} collected a point
      </Text>
    </View>
  );
};

export default NotificationScore;
