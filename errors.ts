import { DIRECTIONS } from "./constants";
import { getMeanSquaredError } from "./cell-utils";
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
  const newMyCells = getPossibleCells(myCells, action, map);
  const oppKnowledgeGain = myCells.size - newMyCells.size;
  switch (action.type) {
    case "MOVE":
      const directionIndex = DIRECTIONS.indexOf(action.direction);
      const testCell = myCell[directionIndex];
      if (!testCell) throw new Error("Invalid test cell");

      const mse = getMeanSquaredError(testCell, Array.from(oppCells.values()));
      return {
        mse,
        mseGain: mse - currentMse,
        oppKnowledgeGain
      };
    case "TORPEDO":
      return {
        mseGain: 0,
        oppHealth: getMeanOppDamage(action.cell, oppCells) * -1,
        myDamage: getMyDamage(action.cell, myCell),
        oppKnowledgeGain
      };
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

function getMeanOppDamage(torpedoCell: Cell, oppCells: Set<Cell>) {
  let totalDamage = 0;
  let count = 0;
  for (const oppCell of oppCells) {
    if (torpedoCell === oppCell) totalDamage += 2;
    else if (torpedoCell.indexOf(oppCell) > -1) totalDamage += 1;
    count++;
  }
  return totalDamage / count;
}

function getMyDamage(torpedoCell: Cell, myCell: Cell) {
  if (torpedoCell === myCell) return 2;
  else if (torpedoCell.indexOf(myCell) > -1) return 1;
  else return 0;
}
