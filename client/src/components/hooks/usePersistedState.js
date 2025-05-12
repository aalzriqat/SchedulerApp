import { useState, useEffect } from 'react';

function usePersistedState(key, defaultValue) {
  const [state, setState] = useState(() => {
    const storedValue = localStorage.getItem(key);
    try {
      return storedValue ? JSON.parse(storedValue) : defaultValue;
    } catch (e) {
      return storedValue || defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {
      localStorage.setItem(key, state);
    }
  }, [key, state]);

  return [state, setState];
}

export default usePersistedState;