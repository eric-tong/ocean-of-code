import { DIRECTIONS, SILENCE_RANGE, TORPEDO_RANGE } from "./constants";
import { getCellsInSector, getSector } from "./sectors";

import { getCellsWithinRange } from "./cell-utils";

export function getPossibleCells(
  prevSet: Set<Cell>,
  action: Action,
  map: CellMap,
  prevCell?: Cell
) {
  const newCells = new Set<Cell>();
  const oldCells = Array.from(prevSet.values());
  switch (action.type) {
    case "MOVE":
      const directionIndex = DIRECTIONS.indexOf(action.direction);
      oldCells.forEach(cell => {
        const newCell = cell[directionIndex];
        if (newCell) newCells.add(newCell);
      });
      break;
    case "TORPEDO":
      const cellsWithinRange = new Set(
        getCellsWithinRange(action.cell, TORPEDO_RANGE)
      );
      oldCells.forEach(cell => {
        if (cellsWithinRange.has(cell)) newCells.add(cell);
      });
      break;
    case "SURFACE":
      if (!action.sector) throw new Error("No sector provided");

      const cellsInSector = getCellsInSector(action.sector, map);
      oldCells.forEach(cell => {
        if (cellsInSector.has(cell)) newCells.add(cell);
      });
      break;
    case "SILENCE":
      oldCells.forEach(origin => {
        newCells.add(origin);
        for (
          let directionIndex = 0;
          directionIndex < DIRECTIONS.length;
          directionIndex++
        ) {
          let cell = origin;
          for (let distance = 1; distance < SILENCE_RANGE; distance++) {
            const newCell = cell[directionIndex];
            if (newCell) {
              newCells.add(newCell);
            } else {
              break;
            }
          }
        }
      });
      break;
    case "SONAR":
      let inSector = action.inSector;
      if (typeof inSector === "undefined") {
        if (!prevCell) throw new Error("No previous cell provided");
        inSector = action.sector === getSector(prevCell);
      }

      const sectorCells = getCellsInSector(action.sector, map);
      for (const cell of oldCells) {
        if (
          (inSector && sectorCells.has(cell)) ||
          (!inSector && !sectorCells.has(cell))
        ) {
          newCells.add(cell);
        }
      }
      break;
    default:
      console.error(action);
      throw new Error("Invalid action to update possible cells");
  }
  return newCells;
}
