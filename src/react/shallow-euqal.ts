
const hasOwnProperty = Object.prototype.hasOwnProperty;

export function shallowEqual(objA: unknown, objB: unknown) {
  if (objA === objB) {
    return true;
  }

  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
    return false;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  } // Test for A's keys different from B.

  for (let i = 0; i < keysA.length; i++) {
    const currentKey = keysA[i];

    if (!hasOwnProperty.call(objB, currentKey) || !((objA as any)[currentKey] === (objB as any)[currentKey])) {
      return false;
    }
  }

  return true;
}
