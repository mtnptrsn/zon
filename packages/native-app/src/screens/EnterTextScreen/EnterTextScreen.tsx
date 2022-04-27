import {useNavigation, useRoute} from '@react-navigation/native';
import React, {FC, useEffect} from 'react';
import {Button, TextField, View} from 'react-native-ui-lib';

export interface IEnterTextScreenParams {
  inputTitle: string;
  inputPlaceholder: string;
  buttonLabel: string;
  headerTitle: string;

  onSubmit: (text: string) => void;
}

const EnterTextScreen: FC = props => {
  const route = useRoute();
  const params = route.params! as IEnterTextScreenParams;
  const [text, setText] = React.useState('');
  const navigation = useNavigation();

  const onSubmit = () => params.onSubmit(text);

  useEffect(() => {
    navigation.setOptions({headerTitle: params.headerTitle});
  }, []);

  return (
    <View padding-12 flex>
      <TextField
        placeholder={params.inputPlaceholder}
        value={text}
        onChangeText={setText}
        title={params.inputTitle}
      />

      <Button
        onPress={onSubmit}
        style={{marginTop: 'auto'}}
        label={params.buttonLabel}
      />
    </View>
  );
};

export default EnterTextScreen;
