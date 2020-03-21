import { DIRECTIONS, TORPEDO_RANGE } from "./constants";

import { getCellsInSector } from "./sectors";
import { getCellsWithinRange } from "./cell-utils";

export function updatePossibleCells(
  set: Set<Cell>,
  action: Action,
  map: CellMap
) {
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
      if (!action.sector) throw new Error("No sector provided");

      const cellsInSector = getCellsInSector(action.sector, map);
      oldCells.forEach(cell => {
        if (cellsInSector.has(cell)) newCells.push(cell);
      });
      return;
    default:
      console.error(action);
      throw new Error("Invalid action to update possible cells");
  }
  set.clear();
  newCells.forEach(cell => set.add(cell));
}
