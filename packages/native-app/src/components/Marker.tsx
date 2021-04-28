import React, {FC} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-elements';
import {TouchableOpacity} from 'react-native-gesture-handler';

interface IMarkerProps {
  color: string;
  weight?: number;
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
  const fontMaxSize = 24;
  const fontSize = Math.min(fontMaxSize, props.size / 1.75);

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
      {Boolean(props.weight) && (
        <Text style={[styles.text, {fontSize}]}>{String(props.weight)}</Text>
      )}
    </View>
  );
};

export default Marker;
