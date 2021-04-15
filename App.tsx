import React, {FC, useState, useRef} from 'react';
import MapScreen from './MapScreen';
import {View, Text, Switch, ScrollView} from 'react-native';
import {GlobalStateContext} from './contexts';
import {ButtonGroup} from 'react-native-elements';
import CompassScreen from './CompassScreen';

const showDevTools = true;

const App: FC = () => {
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const [showLogs, setShowLogs] = useState(false);
  const [showCurrentLocation, setShowCurrentLocation] = useState(false);
  const [logs, setLogs] = useState<string[]>(['Initial']);
  const scrollViewRef = useRef(null);

  return (
    <GlobalStateContext.Provider
      value={{
        logs: {get: () => logs, set: setLogs},
        showCurrentLocation: {
          set: setShowCurrentLocation,
          get: () => showCurrentLocation,
        },
      }}>
      <View style={{flex: 1}}>
        {selectedPageIndex === 0 && <MapScreen />}
        {selectedPageIndex === 1 && <CompassScreen />}

        <ButtonGroup
          buttons={['Map', 'Compass']}
          selectedIndex={selectedPageIndex}
          onPress={index => setSelectedPageIndex(index)}
        />

        {showLogs && (
          <View style={{height: 200}}>
            <ScrollView
              ref={scrollViewRef}
              contentContainerStyle={{padding: 12}}
              onContentSizeChange={() =>
                (scrollViewRef as any).current.scrollToEnd({animated: false})
              }>
              {logs.map((log, index) => {
                return <Text key={index}>{log}</Text>;
              })}
            </ScrollView>
          </View>
        )}
        {showDevTools && (
          <View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 12,
              }}>
              <Text>Show logs</Text>
              <Switch
                value={showLogs}
                onValueChange={checked => setShowLogs(checked)}
              />
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 12,
              }}>
              <Text>Show current location</Text>
              <Switch
                value={showCurrentLocation}
                onValueChange={checked => setShowCurrentLocation(checked)}
              />
            </View>
          </View>
        )}
      </View>
    </GlobalStateContext.Provider>
  );
};

export default App;
