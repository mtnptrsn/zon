import React, {FC, useEffect} from 'react';
import {StyleSheet} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {View, Text, Colors} from 'react-native-ui-lib';
import {speak} from 'expo-speech';
import Sound from 'react-native-sound';

interface INotificationInfoProps {
  message: string;
  color?: string;
  icon?: string;
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(0,0,0,.1)',
  },
});

const NotificationInfo: FC<INotificationInfoProps> = props => {
  return (
    <View backgroundColor="white" centerV br10 row style={styles.container}>
      <View
        height={'100%'}
        padding-10
        backgroundColor={props.color || Colors.primary}
        center>
        <Feather color="white" size={30} name={props.icon || 'info'} />
      </View>

      <Text marginH-16 marginV-8 text65L style={{flex: 1}}>
        {props.message}
      </Text>
    </View>
  );
};

export default NotificationInfo;
