import { DIRECTIONS, MAX_CHARGE } from ".././mechanics/constants";
import { getSector, uniqueSectors } from "../mechanics/sectors";

import { getMeanSquaredError } from "../utils/cell-utils";
import { getPossibleCells } from "./possible-cells";

type Params = {
  myCell: Cell;
  myCells: Set<Cell>;
  oppCells: Set<Cell>;
  map: CellMap;
};

export function getErrors(
  action: Action,
  { myCell, myCells, oppCells, map }: Params
): Errors {
  const newMyCells =
    action.type === "SONAR" ? myCells : getPossibleCells(myCells, action, map);
  const oppKnowledgeGain = myCells.size - newMyCells.size;
  const params = { myCell, myCells, oppCells, map };
  switch (action.type) {
    case "MOVE":
    case "TORPEDO":
    case "SURFACE":
      return action.getErrors(params);
    case "SONAR":
      let sectorCount = 0;
      let totalCount = 0;
      for (const cell of oppCells.values()) {
        const sector = getSector(cell);
        if (sector === action.sector) {
          sectorCount++;
        }
        totalCount++;
      }
      const myKnowledgeAfterSonar =
        (sectorCount / totalCount) * sectorCount +
        (1 - sectorCount / totalCount) * (totalCount - sectorCount);
      const myKnowledgeLoss = myKnowledgeAfterSonar - oppCells.size;
      return { myKnowledgeLoss };

    default:
      throw new Error("Invalid action for finding error");
  }
}
