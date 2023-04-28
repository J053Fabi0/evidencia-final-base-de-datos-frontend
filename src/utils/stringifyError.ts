export default function stringifyError(obj: Error, indent = 2) {
  return stringifyError_(obj, 0, indent);
}

function stringifyError_(obj: Error, prevIndent = 0, indent: number) {
  const isObject = typeof obj === "object" && !Array.isArray(obj) && obj !== null;
  if (!isObject) return JSON.stringify(obj);

  const keysSet = new Set<keyof Error>();
  // Object.getOwnPropertyNames doesn't work with XMLHttpRequest, so I use the in operator
  for (const key in obj) keysSet.add(key as keyof Error);
  for (const key of Object.getOwnPropertyNames(obj)) keysSet.add(key as keyof Error);

  // Functions and undefined are filtered out
  const keys: (keyof Error)[] = Array.from(keysSet).filter(
    (key) => typeof obj[key] !== "function" && obj[key] !== undefined
  );

  if (keys.length === 0) return "{}";

  let str = "{\n";

  // For some REALLY weird reason, normal fors don't work. I had to do this
  let i = 0;
  for (const key of keys)
    str +=
      `${" ".repeat(prevIndent + indent)}"${key}": ${stringifyError_(
        obj[key] as Error,
        prevIndent + indent,
        indent
      )}` + (++i === keys.length ? "" : ",\n");

  return `${str}\n${" ".repeat(prevIndent)}}`;
}
