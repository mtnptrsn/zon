import React, {FC, useRef, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import MapBoxGL from '@react-native-mapbox-gl/maps';
import {Coordinate, IPoint} from '../../types';
import {Button, useTheme} from 'react-native-elements';
import TimeLeft from '../../components/TimeLeft';
import Score from '../../components/Score';
import HomeIndicator from '../../components/HomeIndicator';
import Marker from '../../../../components/Marker';
import {GeolocationResponse} from '@react-native-community/geolocation';
import HomeMarker from '../../../../components/HomeMarker';
import {getMarkerSize} from '../../../../utils/map';
import TinyColor from 'tinycolor2';
import {getSpacing} from '../../../../theme/utils';
import Feather from 'react-native-vector-icons/Feather';

interface IMapScreenProps {
  room: any;
  position: GeolocationResponse;
  player: any;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerButtonContainer: {
    position: 'absolute',
    right: getSpacing(1),
    bottom: getSpacing(5),
    backgroundColor: 'white',
  },
});

const coordinateToString = ([lat, long]: Coordinate) => `${lat};${long}`;

const MapScreen: FC<IMapScreenProps> = props => {
  const theme = useTheme();
  const mapRef = useRef(null);
  const cameraRef = useRef(null);
  const [zoom, setZoom] = useState(14);
  const homeMarkerSize = getMarkerSize(
    props.room.map.start.location.coordinates[1],
    zoom,
    60,
    20,
  );

  const score = props.room.map.points.reduce((acc: number, point: IPoint) => {
    if (point.collectedBy?._id === props.player._id) return acc + point.weight;
    return acc;
  }, 0);

  const onTouchEndMap = () => {
    (mapRef.current as any).getZoom().then(setZoom);
  };

  const onPressCenter = () => {
    (cameraRef.current as any).setCamera({
      centerCoordinate: [
        props.position.coords.longitude,
        props.position.coords.latitude,
      ],
    });
  };

  return (
    <View style={styles.container}>
      <MapBoxGL.MapView
        onTouchEnd={onTouchEndMap}
        ref={mapRef}
        logoEnabled={false}
        style={{flex: 1}}
        pitchEnabled={false}
        rotateEnabled={false}>
        <MapBoxGL.Camera
          ref={cameraRef}
          defaultSettings={{
            centerCoordinate: props.room.map.start.location.coordinates,
            zoomLevel: 14,
          }}
          zoomLevel={14}
          animationDuration={0}
        />

        {props.room.map.points.map((point: IPoint) => {
          return (
            <MapBoxGL.MarkerView
              id={coordinateToString(point.location.coordinates)}
              key={coordinateToString(point.location.coordinates)}
              coordinate={point.location.coordinates}>
              <Marker
                size={getMarkerSize(
                  point.location.coordinates[1],
                  zoom,
                  60,
                  20,
                )}
                weight={point.weight}
                color={
                  point.collectedBy?.color
                    ? new TinyColor(point.collectedBy!.color)
                        .setAlpha(0.75)
                        .toRgbString()
                    : 'rgba(244, 67, 54, .75)'
                }
              />
            </MapBoxGL.MarkerView>
          );
        })}
        <MapBoxGL.MarkerView
          id={coordinateToString(props.room.map.start.location.coordinates)}
          key={coordinateToString(props.room.map.start.location.coordinates)}
          coordinate={props.room.map.start.location.coordinates}>
          <HomeMarker
            size={homeMarkerSize}
            color={new TinyColor(theme.theme.colors!.primary!)
              .setAlpha(0.75)
              .toRgbString()}
          />
        </MapBoxGL.MarkerView>
        <MapBoxGL.UserLocation />
      </MapBoxGL.MapView>

      <Button
        onPress={onPressCenter}
        type="outline"
        containerStyle={styles.centerButtonContainer}
        buttonStyle={{padding: 12}}
        icon={<Feather color="black" size={24} name="map-pin" />}
      />

      <TimeLeft finishedAt={new Date(props.room.finishedAt)} />
      <Score score={score} />
      {props.player.isWithinHome && <HomeIndicator />}
    </View>
  );
};

export default MapScreen;
