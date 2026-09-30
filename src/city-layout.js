// A compressed city-wide layout. These are artistic scene coordinates, not GIS.
export const shoreline = [
  [240, -3], [229, 18], [209, 20], [193, 5], [174, 14], [151, 20],
  [131, 0], [116, 13], [96, 19], [77, 22], [60, 18], [40, 24],
  [23, 27], [5, 22], [-13, 29], [-30, 28], [-47, 18], [-58, 8],
  [-72, 3], [-86, 8], [-97, 19], [-104, 29], [-120, 35], [-165, 33],
];
export const coast = [
  [-168, -137], [-128, -143], [-115, -182], [-51, -180], [-32, -163],
  [32, -169], [51, -132], [140, -134], [188, -111], [197, -62], [224, -40],
  ...shoreline,
];
export const overviewTarget = [31, 3, -53];
export const overviewOffset = [200, 230, 320];
export const sceneHalfWidth = 255;
export const bantianRoads = [
  ['坂田_五和大道_示意', -14, -117, 2.4, 88],
  ['坂田_坂雪岗大道_示意', 31, -117, 2.4, 88],
  ['坂田_冲之大道_示意', 9, -125, 48, 2.4],
];

export function isLand(x, z) {
  let inside = false;
  for (let i = 0, j = coast.length - 1; i < coast.length; j = i++) {
    const [xi, zi] = coast[i], [xj, zj] = coast[j];
    if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) inside = !inside;
  }
  return inside;
}
