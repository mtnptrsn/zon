import {GeolocationResponse} from '@react-native-community/geolocation';
import {getDistance} from 'geolib';
import React, {FC, useEffect, useRef, useState} from 'react';
import {ScrollView, Vibration} from 'react-native';
import {Text, View} from 'react-native-ui-lib';
import DirectionArrow from '../../components/DirectionArrow';

interface IMainGameScreenProps {
  room: any;
  position: GeolocationResponse;
  player: any;
  distance: number;
}

const MainGameScreen: FC<IMainGameScreenProps> = props => {
  const showDirecton = !!props.room.flags['ASSIST_1'];

  const currentPosition: [number, number] = [
    props.position.coords.longitude,
    props.position.coords.latitude,
  ];

  const targetPosition = props.room.points[0].location.coordinates;

  return (
    <View flex backgroundColor="black" center>
      {showDirecton && (
        <>
          <DirectionArrow
            currentPosition={currentPosition}
            targetPosition={targetPosition}
          />
          <View marginB-24 />
        </>
      )}
      <Text color="white" text10>
        {props.distance}
      </Text>
    </View>
  );
};

export default MainGameScreen;
