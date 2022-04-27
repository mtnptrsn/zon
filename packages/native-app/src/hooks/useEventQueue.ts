import {useCallback, useEffect, useRef, useState} from 'react';

export const useEventQueue = (
  onEvent: (event: any) => void,
  onEventEnd: (event: any) => void,
) => {
  let {current: queueNonce} = useRef<number>(0);
  const {current: queue} = useRef<any[]>([]);
  const enqueue = useCallback((payload: any, promiseFn: () => Promise<any>) => {
    queue.push({payload, promiseFn, nonce: queueNonce});
    queueNonce++;
  }, []);
  const dequeue = useCallback(() => {
    if (queue.length > 0) {
      queue.shift();
    }
  }, [queue]);

  const handleFirstEventInQueue = () => {
    if (queue.length === 0) return;

    const event = queue[0];
    const promise = event.promiseFn();

    onEvent(event);
    promise.then(() => {
      dequeue();
      onEventEnd(event);
      if (queue.length > 0) {
        handleFirstEventInQueue();
      }
    });
  };

  const addToQueue = (payload: any, promiseFn: () => Promise<any>) => {
    let queueLength = queue.length;
    enqueue(payload, promiseFn);

    if (queueLength === 0) {
      handleFirstEventInQueue();
    }
  };

  return addToQueue;
};
