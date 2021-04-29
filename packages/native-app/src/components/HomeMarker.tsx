import React, {FC} from 'react';
import {StyleSheet, View} from 'react-native';

interface IHomeMarkerProps {
  color: string;
  size: number;
}

const styles = StyleSheet.create({
  marker: {
    opacity: 0.75,
    borderRadius: 3,
    borderWidth: 3,
    borderStyle: 'solid',
    borderColor: 'white',
  },
});

const HomeMarker: FC<IHomeMarkerProps> = props => {
  return (
    <View
      pointerEvents="none"
      style={[
        styles.marker,
        {
          backgroundColor: props.color,
          width: props.size,
          height: props.size,
        },
      ]}
    />
  );
};

export default HomeMarker;
