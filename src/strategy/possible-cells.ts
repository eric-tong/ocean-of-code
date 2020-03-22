import {
  DIRECTIONS,
  SILENCE_RANGE,
  TORPEDO_RANGE
} from "../mechanics/constants";
import { getCellsInSector, getSector } from "../mechanics/sectors";

import { getCellsWithinRange } from "../utils/cell-utils";

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
    case "TORPEDO":
    case "SURFACE":
      return action.getNewPossibleCells(prevSet);

    case "SILENCE":
      oldCells.forEach(origin => {
        newCells.add(origin);
        for (
          let directionIndex = 0;
          directionIndex < DIRECTIONS.length;
          directionIndex++
        ) {
          let cell: Cell | undefined = origin;
          for (let distance = 1; distance <= SILENCE_RANGE; distance++) {
            cell = cell[directionIndex];
            if (cell) {
              newCells.add(cell);
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
