import React, {FC} from 'react';
import {Text, View, Colors} from 'react-native-ui-lib';

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
