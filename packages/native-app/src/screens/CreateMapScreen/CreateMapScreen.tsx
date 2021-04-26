import React, {FC, useEffect, useState} from 'react';
import MapBoxGL from '@react-native-mapbox-gl/maps';
import {useNavigation, useRoute} from '@react-navigation/core';
import {StyleSheet, View} from 'react-native';
import {Text, Button} from 'react-native-elements';
import {usePosition} from '../../hooks/usePosition';
import LoadingScreen from '../Room/screens/LoadingScreen';
import Marker from '../../components/Marker';
import {getSpacing} from '../../theme/utils';
import {GeolocationResponse} from '@react-native-community/geolocation';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonsContainer: {
    position: 'absolute',
    bottom: getSpacing(1),
    left: getSpacing(1),
    right: getSpacing(1),
  },
  clearButton: {},
  doneButton: {marginTop: getSpacing(0.5)},
});

const CreateMapScreen: FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  // TODO: Use proper typing
  const state = (route.params! as any).state;
  const position = (route.params! as any).position as GeolocationResponse;
  const [map, setMap] = useState(state.get());

  const onPressMap = (context: any) => {
    const newMap = [...map, context.geometry.coordinates];
    setMap(newMap);
    state.set(newMap);
  };

  const onPressMarker = (point: [number, number]) => {
    const newMap = map.filter(
      (p: [number, number]) => p.join() !== point.join(),
    );
    setMap(newMap);
    state.set(newMap);
  };

  const onPressDone = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <MapBoxGL.MapView
        onPress={onPressMap}
        style={{flex: 1}}
        pitchEnabled={false}
        rotateEnabled={false}>
        <MapBoxGL.Camera
          defaultSettings={{
            centerCoordinate: [
              position.coords.longitude,
              position.coords.latitude,
            ],
            zoomLevel: 14,
          }}
          animationDuration={0}
        />
        <MapBoxGL.UserLocation />

        {map.map((point: any) => {
          return (
            <MapBoxGL.MarkerView
              key={point.join()}
              id={point.join()}
              coordinate={point}>
              <Marker onPress={() => onPressMarker(point)} color="#f44336" />
            </MapBoxGL.MarkerView>
          );
        })}
      </MapBoxGL.MapView>
      <View style={styles.buttonsContainer}>
        <Button
          containerStyle={styles.doneButton}
          title="Done"
          onPress={onPressDone}
        />
      </View>
    </View>
  );
};

export default CreateMapScreen;
