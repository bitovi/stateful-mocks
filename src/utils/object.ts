export const deepEqual = (
  firstObject: object,
  secondObject: object
): boolean => {
  const objectKeys = Object.keys;
  const firstObjectType = typeof firstObject;
  const secondObjectType = typeof secondObject;

  return firstObject &&
    secondObject &&
    firstObjectType === 'object' &&
    firstObjectType === secondObjectType
    ? objectKeys(firstObject).length === objectKeys(secondObject).length &&
        objectKeys(firstObject).every((key) =>
          deepEqual(firstObject[key], secondObject[key])
        )
    : firstObject === secondObject;
};

/**
 * Performs a deep merge of objects and returns new object. Does not modify
 * objects (immutable) and merges arrays via concatenation.
 *
 * @param {...object} objects - Objects to merge
 * @returns {object} New object with merged key/values
 */
export const mergeDeep = (...objects) => {
  const isObject = (obj) => obj && typeof obj === 'object';

  return objects.reduce((prev, obj) => {
    Object.keys(obj).forEach((key) => {
      const pVal = prev[key];
      const oVal = obj[key];

      if (Array.isArray(pVal) && Array.isArray(oVal)) {
        prev[key] = pVal.concat(...oVal);
      } else if (isObject(pVal) && isObject(oVal)) {
        prev[key] = mergeDeep(pVal, oVal);
      } else {
        prev[key] = oVal;
      }
    });

    return prev;
  }, {});
};
