import React, {FC} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-elements';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const LoadingScreen: FC = () => {
  return (
    <View style={styles.container}>
      <Text>Loading...</Text>
    </View>
  );
};

export default LoadingScreen;
