const SOCIETY_ROUTE_PREFIX = "soc";

export function encodeSocietyId(id: number) {
  return `${SOCIETY_ROUTE_PREFIX}${id.toString(36)}`;
}

export function decodeSocietyId(value: string) {
  const numericId = Number.parseInt(value, 10);
  if (/^\d+$/.test(value) && Number.isSafeInteger(numericId) && numericId > 0) {
    return numericId;
  }

  if (!value.startsWith(SOCIETY_ROUTE_PREFIX)) {
    return null;
  }

  const rawId = value.slice(SOCIETY_ROUTE_PREFIX.length);
  const id = Number.parseInt(rawId, 36);

  return Number.isSafeInteger(id) && id > 0 ? id : null;
}
