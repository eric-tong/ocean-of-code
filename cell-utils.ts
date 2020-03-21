import { getCoords } from "./map";

export function getMeanSquaredError(origin: Cell, testCells: Cell[]) {
  const originCoords = getCoords(origin);

  let error = 0;
  let count = 0;
  for (const testCell of testCells) {
    const testCoords = getCoords(testCell);
    const dx = testCoords.x - originCoords.x;
    const dy = testCoords.y - originCoords.y;
    error += dx * dx + dy * dy;
    count++;
  }
  return error / count;
}
