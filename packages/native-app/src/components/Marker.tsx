import React, {FC} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-elements';
import {TouchableOpacity} from 'react-native-gesture-handler';

interface IMarkerProps {
  color: string;
  weight?: number;
  onPress?: () => void;
}

const styles = StyleSheet.create({
  marker: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    borderWidth: 3,
    borderRadius: 99,
    borderStyle: 'solid',
    borderColor: 'white',
  },
  text: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
});

const Marker: FC<IMarkerProps> = props => {
  return (
    <View
      pointerEvents={props.onPress ? 'auto' : 'none'}
      onTouchStart={props.onPress}
      style={[styles.marker, {backgroundColor: props.color}]}>
      {Boolean(props.weight) && (
        <Text style={styles.text}>{String(props.weight)}</Text>
      )}
    </View>
  );
};

export default Marker;
