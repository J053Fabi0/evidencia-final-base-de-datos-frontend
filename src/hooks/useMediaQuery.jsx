import { useState, useEffect } from "react";
import useEventListener from "./useEventListener";

export default function useMediaQuery(mediaQuery: string, defaultMatch = false) {
  const [isMatch, setIsMatch] = useState(defaultMatch);
  const [mediaQueryList, setMediaQueryList] = useState<MediaQueryList | null>(null);

  useEffect(() => {
    const list = window.matchMedia(mediaQuery);
    setMediaQueryList(list);
    setIsMatch(list.matches);
  }, [mediaQuery]);

  useEventListener("change", (e: MediaQueryList) => setIsMatch(e.matches), mediaQueryList as any);

  return isMatch;
}
