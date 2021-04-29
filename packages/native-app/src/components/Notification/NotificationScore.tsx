import React, {FC, useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text, useTheme} from 'react-native-elements';
import {getSpacing} from '../../theme/utils';
import AnimatedNumbers from 'react-native-animated-numbers';
// import AnimatedNumber from 'react-native-animated-number';

interface INotificationScoreProps {
  previous: number;
  current: number;
  name: string;
  color: string;
}

const styles = StyleSheet.create({
  container: {
    // padding: getSpacing(2),
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 3,
    backgroundColor: 'white',
    overflow: 'hidden',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(0,0,0,.1)',
  },
  scoreContainer: {
    paddingHorizontal: getSpacing(1.75),
    paddingVertical: getSpacing(0.75),
  },
  text: {
    fontSize: 20,
    marginLeft: getSpacing(1.5),
  },
});

const NotificationScore: FC<INotificationScoreProps> = props => {
  const [score, setScore] = useState(props.previous);

  useEffect(() => {
    setScore(props.previous);

    setTimeout(() => {
      setScore(props.current);
    }, 50);
  }, [props.current]);

  return (
    <View style={[styles.container]}>
      <View style={[styles.scoreContainer, {backgroundColor: props.color}]}>
        <AnimatedNumbers
          animationDuration={2000}
          animateToNumber={score}
          fontStyle={{
            fontSize: 24,
            fontWeight: 'bold',
            color: 'white',
          }}
        />
      </View>

      <Text style={styles.text}>{props.name} collected a point</Text>
    </View>
  );
};

export default NotificationScore;
