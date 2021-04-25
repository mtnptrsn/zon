import React, {FC} from 'react';
import {StyleSheet, View} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';

interface IMarkerProps {
  color: string;
  onPress?: () => void;
}

const styles = StyleSheet.create({
  marker: {
    borderRadius: 99,
    width: 20,
    height: 20,
    borderWidth: 3,
    borderStyle: 'solid',
    borderColor: 'white',
  },
});

const Marker: FC<IMarkerProps> = props => {
  return (
    <View
      onTouchStart={props.onPress}
      style={[styles.marker, {backgroundColor: props.color}]}
    />
  );
};

export default Marker;
