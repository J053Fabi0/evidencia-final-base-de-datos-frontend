import { useState } from "react";

export default function useArray<T>(defaultValue: any[] = []) {
  const [array, setArray] = useState<T[]>(defaultValue);

  const push = (...elements: T[]) => void setArray((a) => [...a, ...elements]);
  const unshift = (...elements: T[]) => void setArray((a) => [...elements, ...a]);
  const shift = () => void setArray((a) => a.slice(1));
  const pop = () => void setArray((a) => a.slice(0, -1));

  const filter = (callback: (value: T, index: number, array: T[]) => value is T, thisArg?: any) =>
    void setArray((a) => a.filter(callback, thisArg));

  const clear = () => void setArray([]);

  function update(index: number, newElement: T) {
    setArray((a) => {
      const copy = [...a];
      copy[index] = newElement;
      return copy;
    });
  }

  const remove = (index: number) => void setArray((a) => [...a.slice(0, index), ...a.slice(index + 1)]);

  return [array, { set: setArray, push, unshift, shift, pop, filter, update, remove, clear }] as const;
}
