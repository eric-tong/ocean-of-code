import { TORPEDO_RANGE } from "../mechanics/constants";
import { getCellsWithinRange } from "../utils/cell-utils";
import { getCoords } from "../utils/map";
import { getPossibleCells } from "../strategy/possible-cells";

export default class TorpedoAction implements Action {
  readonly type = "TORPEDO";
  cell: Cell;

  constructor(cell: Cell) {
    this.cell = cell;
  }

  toActionString() {
    const { x, y } = getCoords(this.cell);
    return `TORPEDO ${x} ${y}`;
  }

  getErrors({ myCell, myCells, oppCells }: GetErrorsParams) {
    const newMyCells = this.getNewPossibleCells(myCells);
    const oppKnowledgeGain = myCells.size - newMyCells.size;
    return {
      mseGain: 0,
      oppHealth: getMeanOppDamage(this.cell, oppCells) * -1,
      myDamage: getMyDamage(this.cell, myCell),
      oppKnowledgeGain
    };
  }

  getNewPossibleCells(oldCells: Set<Cell>): Set<Cell> {
    const newCells = new Set<Cell>();
    const cellsWithinRange = new Set(
      getCellsWithinRange(this.cell, TORPEDO_RANGE)
    );
    oldCells.forEach(cell => {
      if (cellsWithinRange.has(cell)) newCells.add(cell);
    });
    return newCells;
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
