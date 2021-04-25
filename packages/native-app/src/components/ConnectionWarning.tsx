import React, {FC} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text, useTheme} from 'react-native-elements';
import {getSpacing} from '../theme/utils';

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
  const theme = useTheme();

  return (
    <View
      style={[
        styles.connectionWarning,
        {
          backgroundColor: theme.theme.colors!.error,
        },
      ]}>
      <Text style={styles.connectionWarningText}>
        You are not connected to the server
      </Text>
    </View>
  );
};

export default ConnectionWarning;
