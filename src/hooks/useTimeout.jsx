import { useCallback, useEffect, useRef } from "react";

export default function useTimeout(callback: Function, delay: number) {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<number>();

  const set = useCallback(() => {
    timeoutRef.current = setTimeout(callbackRef.current, delay);
  }, [delay]);

  const clear = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  useEffect(() => {
    set();
    return clear;
  }, [set, clear]);

  const reset = useCallback(() => {
    clear();
    set();
  }, [clear, set]);

  return { reset, clear };
}
