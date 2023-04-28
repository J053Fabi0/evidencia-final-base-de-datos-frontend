import { useEffect, useRef } from "react";

export default function useEventListener(eventType: string, callback: Function, element = window) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    if (typeof element !== "object" || element === null) return;
    const handler = (e: Event) => callbackRef.current(e);
    element.addEventListener(eventType, handler);

    return () => element.removeEventListener(eventType, handler);
  }, [eventType, element]);
}
