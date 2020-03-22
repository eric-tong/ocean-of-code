import {
  DIRECTIONS,
  SILENCE_RANGE,
  TORPEDO_RANGE
} from "../mechanics/constants";
import { getCellsInSector, getSector } from "../mechanics/sectors";

import { getCellsWithinRange } from "../utils/cell-utils";

export function getPossibleCells(prevSet: Set<Cell>, action: Action) {
  const newCells = new Set<Cell>();
  const oldCells = Array.from(prevSet.values());
  switch (action.type) {
    case "MOVE":
    case "TORPEDO":
    case "SURFACE":
    case "SONAR":
    case "SILENCE":
      return action.getNewPossibleCells(prevSet);
    default:
      console.error(action);
      throw new Error("Invalid action to update possible cells");
  }
  return newCells;
}
