import { useRef, useEffect, useCallback } from 'react';

const useGameLoop = (callback: (deltaTime: number) => void) => {
  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number>(0);
  const isRunningRef = useRef<boolean>(true);
  const debounceRef = useRef<number | null>(null);
  
  // Use a high precision timestamp for better timing
  const getTimestamp = () => performance.now();
  
  // Debounce function to limit rapid inputs
  const debounce = (callback: () => void, delay: number) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = window.setTimeout(() => {
      callback();
      debounceRef.current = null;
    }, delay);
  };

  // Optimize the loop function for better performance
  const loop = useCallback((time: number) => {
    if (!isRunningRef.current) return;
    
    // For first frame, just set the time and request next frame
    if (previousTimeRef.current === 0) {
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(loop);
      return;
    }
    
    // Calculate how much time has passed since last frame
    const deltaTime = time - previousTimeRef.current;
    previousTimeRef.current = time;
    
    // Call the callback with the delta time
    // Only process if we have a reasonable delta (prevent large jumps after tab switch)
    if (deltaTime > 0 && deltaTime < 100) {
      callback(deltaTime);
    }
    
    // Use requestAnimationFrame for optimal timing with the browser's render cycle
    requestRef.current = requestAnimationFrame(loop);
  }, [callback]);
  
  useEffect(() => {
    isRunningRef.current = true;
    // Start the game loop immediately
    requestRef.current = requestAnimationFrame(loop);
    
    return () => {
      // Make sure to clean up properly
      isRunningRef.current = false;
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [loop]);
};

export default useGameLoop;