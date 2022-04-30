import MapBoxGL from '@rnmapbox/maps';
import React, {FC} from 'react';

const mapboxBlue = 'rgba(51, 181, 229, 100)';

const layerStyles = {
  normal: {
    pluse: {
      circleRadius: 15,
      circleColor: mapboxBlue,
      circleOpacity: 0.2,
      circlePitchAlignment: 'map',
    },
    background: {
      circleRadius: 9,
      circleColor: '#fff',
      circlePitchAlignment: 'map',
    },
    foreground: {
      circleRadius: 6,
      circleColor: mapboxBlue,
      circlePitchAlignment: 'map',
    },
  },
};

export const normalIcon = () => [];

interface IMockLocationProps {
  position: [number, number];
}

const MockUserLocation: FC<IMockLocationProps> = props => {
  return (
    <MapBoxGL.ShapeSource
      id="mapBoxUserLocationShapeSource"
      shape={{
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Point',
              coordinates: props.position,
            },
          },
        ],
      }}>
      <MapBoxGL.CircleLayer
        key="mapboxUserLocationPluseCircle"
        id="mapboxUserLocationPluseCircle"
        // @ts-ignore
        style={layerStyles.normal.pluse}
      />
      <MapBoxGL.CircleLayer
        key="mapboxUserLocationWhiteCircle"
        id="mapboxUserLocationWhiteCircle"
        // @ts-ignore
        style={layerStyles.normal.background}
      />
      <MapBoxGL.CircleLayer
        key="mapboxUserLocationBlueCicle"
        id="mapboxUserLocationBlueCicle"
        aboveLayerID="mapboxUserLocationWhiteCircle"
        // @ts-ignore
        style={layerStyles.normal.foreground}
      />
    </MapBoxGL.ShapeSource>
  );
};

export default MockUserLocation;
