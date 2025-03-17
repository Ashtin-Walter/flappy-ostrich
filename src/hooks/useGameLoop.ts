// filepath: flappy-ostrich/src/hooks/useGameLoop.ts
import { useEffect, useRef } from 'react';

const useGameLoop = (callback: () => void) => {
  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number>(0);

  const loop = (time: number) => {
    if (previousTimeRef.current !== 0) {
      const deltaTime = time - previousTimeRef.current;
      callback(deltaTime);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);
};

export default useGameLoop;