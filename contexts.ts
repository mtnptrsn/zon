import {createContext} from 'react';

export const GlobalStateContext = createContext<{
  logs: {get: () => string[]; set: (val: string[]) => void};
  showCurrentLocation: {
    get: () => boolean;
    set: (val: boolean) => void;
  };
}>({
  logs: {
    get: () => [],
    set: () => {},
  },
  showCurrentLocation: {
    get: () => false,
    set: () => {},
  },
});
