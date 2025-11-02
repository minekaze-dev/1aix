
import React, { useState, useEffect } from 'react';

// FIX: The return type signature was using `React.Dispatch` and `React.SetStateAction` without importing `React`.
// FIX: Updated the function signature and implementation to correctly handle a lazy initializer function for `initialValue`.
// This resolves the root cause of numerous type errors where a function was being treated as a string value.
export function useLocalStorage<T>(key: string, initialValue: T | (() => T)): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue instanceof Function ? initialValue() : initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      // If item exists, parse it. Otherwise, compute initial value by calling it if it's a function.
      if (item) {
        return JSON.parse(item);
      }
      return initialValue instanceof Function ? initialValue() : initialValue;
    } catch (error) {
      console.error(error);
      // On error, fallback to initial value.
      return initialValue instanceof Function ? initialValue() : initialValue;
    }
  });

  useEffect(() => {
    try {
      // FIX: The previous logic for determining `valueToStore` was incorrect and could fail if the stored state was a function.
      // The logic is simplified to correctly persist the state value to local storage.
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
