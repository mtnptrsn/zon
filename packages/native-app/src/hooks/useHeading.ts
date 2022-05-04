import {useEffect, useState} from 'react';
import CompassHeading from 'react-native-compass-heading';

export const useHeading = (onChange: (heading: number) => void) => {
  useEffect(() => {
    const updateRate = 1;

    CompassHeading.start(updateRate, ({heading}) => {
      onChange(heading);
    });

    return () => {
      CompassHeading.stop();
    };
  }, []);
};
