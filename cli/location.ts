/*
  A B
  D C
*/
// -900, 900
const A = { y: 289101, x: -255066 };
// 900, 900
const B = { y: 289341, x: 570891 };
// 900, -900
const C = { y: -537059, x: 570981 };
// -900, -900
const D = { y: -536918, x: -254946 };

const xunit =
  ((Math.abs(A.x) + Math.abs(B.x)) / 1800 +
    (Math.abs(D.x) + Math.abs(C.x)) / 1800) /
  2;

const yunit =
  ((Math.abs(A.y) + Math.abs(D.y)) / 1800 +
    (Math.abs(B.y) + Math.abs(C.y)) / 1800) /
  2;

const internalOrigin = {
  x: A.x + xunit * 900,
  y: A.y - yunit * 900,
};

const swapXAndY = (point: { x: number; y: number }) => {
  return { x: point.y, y: point.x };
};

export const fromHumanReadableToInternalData = (humanReadable: {
  x: number;
  y: number;
}) => {
  return swapXAndY({
    x: humanReadable.x * xunit + internalOrigin.x,
    y: humanReadable.y * yunit + internalOrigin.y,
  });
};

export const fromInternalDataToHumanReadable = (_internalData: {
  x: number;
  y: number;
}) => {
  const internalData = swapXAndY(_internalData);

  return {
    x: (internalData.x - internalOrigin.x) / xunit,
    y: (internalData.y - internalOrigin.y) / yunit,
  };
};
