export default function deleteExtraSpacesInBetween(str: string) {
  return str.replace(/\s+/g, " ");
}
