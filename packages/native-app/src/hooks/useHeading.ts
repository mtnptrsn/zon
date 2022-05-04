import {useEffect, useState} from 'react';
import CompassHeading from 'react-native-compass-heading';

export const useHeading = () => {
  const [heading, setHeading] = useState(0);

  useEffect(() => {
    const updateRate = 3;

    CompassHeading.start(updateRate, ({heading}) => {
      setHeading(heading);
    });

    return () => {
      CompassHeading.stop();
    };
  }, []);

  return heading;
};
