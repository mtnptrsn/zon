import React, {FC} from 'react';
import {StyleSheet} from 'react-native';
import {getSpacing} from '../theme/utils';
import {Text, View, Colors} from 'react-native-ui-lib';

const styles = StyleSheet.create({
  connectionWarning: {
    padding: getSpacing(1),
  },
  connectionWarningText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
});

const ConnectionWarning: FC = () => {
  return (
    <View padding-12 backgroundColor={Colors.red30}>
      <Text text70 center white>
        You are not connected to the server
      </Text>
    </View>
  );
};

export default ConnectionWarning;
