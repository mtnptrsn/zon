import React, {FC, useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text, useTheme} from 'react-native-elements';
import {getSpacing} from '../../theme/utils';
import AnimatedNumbers from 'react-native-animated-numbers';
import Feather from 'react-native-vector-icons/Feather';

interface INotificationInfoProps {
  message: string;
  color?: string;
  icon?: string;
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
  infoIconContainer: {
    padding: getSpacing(0.8),
  },
  text: {
    fontSize: 18,
    marginLeft: getSpacing(1.5),
  },
});

const NotificationInfo: FC<INotificationInfoProps> = props => {
  const theme = useTheme();

  return (
    <View style={[styles.container]}>
      <View
        style={[
          styles.infoIconContainer,
          {backgroundColor: props.color || theme.theme.colors!.primary},
        ]}>
        <Feather color="white" size={30} name={props.icon || 'info'} />
      </View>

      <Text style={styles.text}>{props.message}</Text>
    </View>
  );
};

export default NotificationInfo;
