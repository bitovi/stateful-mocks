export const deepEqual = (
  firstObject: object,
  secondObject: object
): boolean => {
  const objectKeys = Object.keys;
  const firstObjectType = typeof firstObject;
  const secondObjectType = typeof secondObject;

  return firstObject &&
    secondObject &&
    firstObjectType === "object" &&
    firstObjectType === secondObjectType
    ? objectKeys(firstObject).length === objectKeys(secondObject).length &&
        objectKeys(firstObject).every((key) =>
          deepEqual(firstObject[key], secondObject[key])
        )
    : firstObject === secondObject;
};
