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
  const currentMse = getMeanSquaredError(myCell, Array.from(oppCells.values()));
  const newMyCells =
    action.type === "SONAR" ? myCells : getPossibleCells(myCells, action, map);
  const oppKnowledgeGain = myCells.size - newMyCells.size;
  const params = { myCell, myCells, oppCells, map };
  switch (action.type) {
    case "MOVE":
      const directionIndex = DIRECTIONS.indexOf(action.direction);
      const testCell = myCell[directionIndex];
      if (!testCell) throw new Error("Invalid test cell");
      const mse = getMeanSquaredError(testCell, Array.from(oppCells.values()));
      const errors = {
        mse,
        mseGain: mse - currentMse,
        oppKnowledgeGain,
        myKnowledgeLoss: 0,
        oppHealth: 0
      };
      switch (action.charge) {
        case "TORPEDO":
          const meanDamage = 5 / oppCells.size;
          errors.oppHealth -= meanDamage / MAX_CHARGE.TORPEDO;
          break;
        case "SILENCE":
          const cellsAfterSilence = getPossibleCells(
            newMyCells,
            { type: "SILENCE" },
            map
          );
          const oppKnowledgeGain = newMyCells.size - cellsAfterSilence.size;
          errors.oppKnowledgeGain += oppKnowledgeGain / MAX_CHARGE.SILENCE;
          break;
        case "SONAR":
          const sectorCount = uniqueSectors(oppCells).length;
          if (sectorCount < 2 || oppCells.size < 10) break;
          const myKnowledgeAfterSonar =
            (oppCells.size * (sectorCount * sectorCount - sectorCount + 2)) /
            sectorCount /
            sectorCount;
          const myKnowledgeLoss = myKnowledgeAfterSonar - oppCells.size;
          errors.myKnowledgeLoss += myKnowledgeLoss / MAX_CHARGE.SONAR;
          break;
      }
      return errors;
    case "TORPEDO":
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
    case "SURFACE":
      return {
        mseGain: 0,
        oppHealth: 0,
        myDamage: 1,
        oppKnowledgeGain
      };
    default:
      throw new Error("Invalid action for finding error");
  }
}
