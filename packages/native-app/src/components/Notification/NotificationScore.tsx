import {speak} from 'expo-speech';
import React, {FC, useEffect} from 'react';
import {StyleSheet} from 'react-native';
import Sound from 'react-native-sound';
import {Text, View} from 'react-native-ui-lib';

const successSound = new Sound(require('../../../assets/sounds/success.mp3'));
const alertSound = new Sound(require('../../../assets/sounds/alert.mp3'));

interface INotificationScoreProps {
  score: number;
  color: string;
  message: string;
  sound: 'success' | 'alert';
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
      <View height={'100%'} padding-14 backgroundColor={props.color} center>
        <Text center white text60L>
          {props.score}
        </Text>
      </View>

      <Text marginH-16 marginV-8 text65L style={{flex: 1}}>
        {props.message}
      </Text>
    </View>
  );
};

export default NotificationScore;
