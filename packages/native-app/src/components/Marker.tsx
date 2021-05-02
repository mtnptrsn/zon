import React, {FC} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-elements';

interface IMarkerProps {
  color: string;
  onPress?: () => void;
  size: number;
}

const styles = StyleSheet.create({
  marker: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: 'white',
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
  },
});

const Marker: FC<IMarkerProps> = props => {
  return (
    <View
      pointerEvents={props.onPress ? 'auto' : 'none'}
      onTouchStart={props.onPress}
      style={[
        styles.marker,
        {
          backgroundColor: props.color,
          width: props.size,
          height: props.size,
          borderRadius: props.size,
        },
      ]}>
      {props.children}
    </View>
  );
};

export default Marker;
