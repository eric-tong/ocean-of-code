import { getCoords } from "./map";

type TestUnit = { distance: number; cell: Cell };

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

export function getCellsWithinRange(origin: Cell, range: number): Set<Cell> {
  const visited = new Set<Cell>();
  const queue: TestUnit[] = [{ distance: 0, cell: origin }];

  while (queue.length) {
    const testUnit = queue.shift();
    if (!testUnit || visited.has(testUnit.cell)) continue;

    visited.add(testUnit.cell);
    const newDistance = testUnit.distance + 1;
    if (newDistance <= range)
      testUnit.cell.forEach(neighbor => {
        if (neighbor) queue.push({ distance: newDistance, cell: neighbor });
      });
  }
  return visited;
}

export function getGraphSize(origin: Cell, untraversableCells: Set<Cell>) {
  const visited = new Set<Cell>();
  const queue = [...origin];

  while (queue.length) {
    const testCell = queue.shift();
    if (!testCell || visited.has(testCell) || untraversableCells.has(testCell))
      continue;

    visited.add(testCell);
    queue.push(...testCell);
  }
  return visited.size;
}

export function areNeighbors(a: Cell, b: Cell) {
  const coordsA = getCoords(a);
  const coordsB = getCoords(b);
  const dx = Math.abs(coordsA.x - coordsB.x);
  const dy = Math.abs(coordsA.y - coordsB.y);
  return (
    (dx === 1 && dy === 1) || (dx === 1 && dy === 0) || (dx === 0 && dy === 1)
  );
}
