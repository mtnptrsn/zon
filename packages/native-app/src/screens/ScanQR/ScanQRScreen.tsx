import React, {FC} from 'react';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {BarCodeReadEvent} from 'react-native-camera';
import {useNavigation, useRoute} from '@react-navigation/native';
import {StyleSheet, View} from 'react-native';

interface IScanQRScreenRouteParams {
  onRead: (data: string) => void;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
});

const ScanQRScreen: FC = props => {
  const route = useRoute();
  const params = route.params! as IScanQRScreenRouteParams;

  const onRead = (event: BarCodeReadEvent) => {
    params.onRead(event.data);
  };

  return (
    <View style={styles.container}>
      <QRCodeScanner onRead={onRead} />
    </View>
  );
};

export default ScanQRScreen;
