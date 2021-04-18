import React, {FC} from 'react';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {BarCodeReadEvent} from 'react-native-camera';
import {useNavigation} from '@react-navigation/native';

const QRScanScreen: FC = () => {
  const navigation = useNavigation();

  const onRead = (event: BarCodeReadEvent) => {
    navigation.navigate('Main', {scan: event.data});
  };

  return <QRCodeScanner onRead={onRead} />;
};

export default QRScanScreen;
