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

export function getCellsWithinRange(
  origin: Cell | undefined,
  range: number,
  visited: Set<Cell> = new Set<Cell>()
): Cell[] {
  if (!origin || visited.has(origin)) return [];
  visited.add(origin);

  if (range <= 0) return [origin];

  const cells: Cell[] = [];
  origin.forEach(neighbor => {
    cells.push(...getCellsWithinRange(neighbor, range - 1, visited));
  });
  return cells;
}
