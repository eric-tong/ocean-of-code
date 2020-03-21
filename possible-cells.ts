import { DIRECTIONS, TORPEDO_RANGE } from "./constants";

import { getCellsWithinRange } from "./cell-utils";

export function updatePossibleCells(set: Set<Cell>, action: Action) {
  const newCells: Cell[] = [];
  const oldCells = Array.from(set.values());
  switch (action.type) {
    case "MOVE":
      const directionIndex = DIRECTIONS.indexOf(action.direction);
      oldCells.forEach(cell => {
        const newCell = cell[directionIndex];
        if (newCell) newCells.push(newCell);
      });
      break;
    case "TORPEDO":
      const cellsWithinRange = new Set(
        getCellsWithinRange(action.cell, TORPEDO_RANGE)
      );
      oldCells.forEach(cell => {
        if (cellsWithinRange.has(cell)) newCells.push(cell);
      });
      break;
    case "SURFACE":
      return;
    default:
      console.error(action);
      throw new Error("Invalid action to update possible cells");
  }
  set.clear();
  newCells.forEach(cell => set.add(cell));
}
