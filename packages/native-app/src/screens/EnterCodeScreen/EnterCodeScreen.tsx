import {useRoute} from '@react-navigation/native';
import React, {FC} from 'react';
import {Button, TextField, View} from 'react-native-ui-lib';

interface IEnterCodeScreenParams {
  onSubmit: (data: string) => void;
}

const EnterCodeScreen: FC = props => {
  const route = useRoute();
  const params = route.params! as IEnterCodeScreenParams;
  const [code, setCode] = React.useState('');

  const onSubmit = () => {
    params.onSubmit(code);
  };

  return (
    <View padding-12 flex>
      <TextField
        placeholder="Enter your code"
        value={code}
        onChangeText={setCode}
        title="Code"
      />

      <Button onPress={onSubmit} style={{marginTop: 'auto'}} label="Join" />
    </View>
  );
};

export default EnterCodeScreen;
