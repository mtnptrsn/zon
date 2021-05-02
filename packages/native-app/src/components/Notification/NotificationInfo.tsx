import React, {FC} from 'react';
import {StyleSheet} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {View, Text, Colors} from 'react-native-ui-lib';

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
      <View padding-10 backgroundColor={props.color || Colors.primary}>
        <Feather color="white" size={30} name={props.icon || 'info'} />
      </View>

      <Text marginL-16 text65>
        {props.message}
      </Text>
    </View>
  );
};

export default NotificationInfo;
