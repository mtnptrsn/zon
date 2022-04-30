import {add} from 'date-fns';

export const getTutorialRoom = () => ({
  map: {
    radius: 1000,
    points: [
      {
        location: {
          coordinates: [16.340454150761573, 56.66146475135582],
          type: 'Point',
        },
        weight: 3,
        _id: '626b97577a376b7df2e93db6',
        captures: [],
      },
      {
        location: {
          coordinates: [16.34237630990437, 56.66754053522099],
          type: 'Point',
        },
        weight: 3,
        _id: '626b97577a376b7df2e93db7',
        captures: [],
      },
      {
        location: {coordinates: [16.3430669, 56.66617569999998], type: 'Point'},
        weight: 3,
        _id: '626b97577a376b7df2e93db8',
        captures: [],
      },
      {
        location: {
          coordinates: [16.356388203900497, 56.67137074516886],
          type: 'Point',
        },
        weight: 3,
        _id: '626b97577a376b7df2e93db9',
        captures: [],
      },
      {
        location: {coordinates: [16.3713063, 56.6635125], type: 'Point'},
        weight: 3,
        _id: '626b97577a376b7df2e93dba',
        captures: [],
      },
      {
        location: {coordinates: [16.3411343, 56.6596221], type: 'Point'},
        weight: 3,
        _id: '626b97577a376b7df2e93dbb',
        captures: [],
      },
      {
        location: {coordinates: [16.3458468, 56.6597293], type: 'Point'},
        weight: 3,
        _id: '626b97577a376b7df2e93dbc',
        captures: [],
      },
      {
        location: {coordinates: [16.3630817, 56.6608887], type: 'Point'},
        weight: 2,
        _id: '626b97577a376b7df2e93dbd',
        captures: [],
      },
      {
        location: {
          coordinates: [16.366526956713766, 56.664164504352534],
          type: 'Point',
        },
        weight: 3,
        _id: '626b97577a376b7df2e93dbe',
        captures: [],
      },
      {
        location: {
          coordinates: [16.345221945136487, 56.663133418100934],
          type: 'Point',
        },
        weight: 2,
        _id: '626b97577a376b7df2e93dbf',
        captures: [],
      },
      {
        location: {
          coordinates: [16.359213490330358, 56.666955715546074],
          type: 'Point',
        },
        weight: 2,
        _id: '626b97577a376b7df2e93dc0',
        captures: [],
      },
      {
        location: {coordinates: [16.3555817, 56.6670702], type: 'Point'},
        weight: 2,
        _id: '626b97577a376b7df2e93dc1',
        captures: [],
      },
      {
        location: {coordinates: [16.3516677, 56.6670878], type: 'Point'},
        weight: 2,
        _id: '626b97577a376b7df2e93dc2',
        captures: [],
      },
      {
        location: {coordinates: [16.3696116, 56.6659696], type: 'Point'},
        weight: 3,
        _id: '626b97577a376b7df2e93dc3',
        captures: [],
      },
      {
        location: {coordinates: [16.3606937, 56.6626707], type: 'Point'},
        weight: 1,
        _id: '626b97577a376b7df2e93dc4',
        captures: [],
      },
      {
        location: {coordinates: [16.3494023, 56.6586214], type: 'Point'},
        weight: 2,
        _id: '626b97577a376b7df2e93dc5',
        captures: [],
      },
      {
        location: {coordinates: [16.3515623, 56.6684022], type: 'Point'},
        weight: 2,
        _id: '626b97577a376b7df2e93dc6',
        captures: [],
      },
      {
        location: {coordinates: [16.3499285, 56.6605021], type: 'Point'},
        weight: 2,
        _id: '626b97577a376b7df2e93dc7',
        captures: [],
      },
      {
        location: {coordinates: [16.3512152, 56.6705044], type: 'Point'},
        weight: 3,
        _id: '626b97577a376b7df2e93dc8',
        captures: [],
      },
      {
        location: {coordinates: [16.3484775, 56.6671334], type: 'Point'},
        weight: 2,
        _id: '626b97577a376b7df2e93dc9',
        captures: [],
      },
      {
        location: {
          coordinates: [16.368208974929086, 56.66198478704607],
          type: 'Point',
        },
        weight: 3,
        _id: '626b97577a376b7df2e93dca',
        captures: [],
      },
      {
        location: {coordinates: [16.3476317, 56.6640691], type: 'Point'},
        weight: 2,
        _id: '626b97577a376b7df2e93dcb',
        captures: [],
      },
      {
        location: {
          coordinates: [16.364366763223433, 56.66373335410219],
          type: 'Point',
        },
        weight: 2,
        _id: '626b97577a376b7df2e93dcc',
        captures: [],
      },
      {
        location: {coordinates: [16.3432223, 56.66247529999999], type: 'Point'},
        weight: 3,
        _id: '626b97577a376b7df2e93dcd',
        captures: [],
      },
    ],
    homes: [
      {
        location: {
          coordinates: [16.355283737182617, 56.66285705566406],
          type: 'Point',
        },
        weight: null,
        _id: '626b97577a376b7df2e93dce',
        captures: [],
      },
    ],
  },
  flags: {},
  duration: 180000,
  _id: '626b97477a376b7df2e93db5',
  status: 'PLAYING',
  players: [getTutorialPlayer(false), getTutorialPlayer(true)],
  challengeRoom: null,
  shortId: 'E9nwyby0a',
  createdAt: '2022-04-29T07:44:07.353Z',
  updatedAt: '2022-04-29T07:44:29.150Z',
  __v: 1,
  finishedAt: add(new Date(), {seconds: 66}),
  startedAt: '2022-04-29T07:44:28.019Z',
});

export const getTutorialPlayer = (isFoe: boolean) => ({
  location: {
    type: 'Point',
    coordinates: [16.355283737182617, 56.66285705566406],
  },
  startLocation: {
    type: 'Point',
    coordinates: [16.355283737182617, 56.66285705566406],
  },
  isWithinHome: true,
  score: 0,
  _id: isFoe ? '2' : '1',
  name: isFoe ? 'Joe' : 'You',
  isHost: true,
  color: isFoe ? '#34495E' : '#FFB600',
});
