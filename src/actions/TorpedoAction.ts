import { MAX_CHARGE, TORPEDO_RANGE } from "../mechanics/constants";
import { areNeighbors, getCellsWithinRange } from "../utils/cell-utils";

import { getCoords } from "../utils/map";
import { parseBase10 } from "../utils/math-utils";

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

  fromActionString(params: string[], map: CellMap) {
    const [x, y] = params.map(parseBase10);
    const cell = map[x][y];
    if (!cell) throw new Error("Torpedoed cell does not exist");
    return new TorpedoAction(cell);
  }

  getErrors({ myCell, myCells, oppCells }: GetErrorsParams) {
    const newMyCells = this.getNewPossibleCells(myCells);
    const oppKnowledgeGain = myCells.size - newMyCells.size;

    const notWithinRangeCount = this.getCellsNotInDamageZone(oppCells).size;
    const withinRangeCount = oppCells.size - notWithinRangeCount;
    const myKnowledgeAfterTorpedo =
      (withinRangeCount * withinRangeCount) / oppCells.size +
      (notWithinRangeCount * notWithinRangeCount) / oppCells.size;
    const myKnowledgeLoss = myKnowledgeAfterTorpedo - oppCells.size;
    return {
      mseGain: 0,
      oppHealth: getMeanOppDamage(this.cell, oppCells) * -1,
      myDamage: getMyDamage(this.cell, myCell),
      oppKnowledgeGain,
      myKnowledgeLoss
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

  getCellsInOneDamageZone(oldCells: Set<Cell>) {
    const newCells = new Set<Cell>();
    oldCells.forEach(cell => {
      if (areNeighbors(cell, this.cell)) newCells.add(cell);
    });
    return newCells;
  }

  getCellsNotInDamageZone(oldCells: Set<Cell>) {
    const newCells = new Set<Cell>();
    const oneDamageZone = this.getCellsInOneDamageZone(oldCells);
    oldCells.forEach(cell => {
      if (!oneDamageZone.has(cell) && cell !== this.cell) newCells.add(cell);
    });
    return newCells;
  }

  getValidActions({ charges, oppCells, myCell }: GetValidActionsParams) {
    const validActions = [];
    if (charges.TORPEDO >= MAX_CHARGE.TORPEDO) {
      const cellsInRange = getCellsWithinRange(myCell, TORPEDO_RANGE);
      for (const cell of cellsInRange.values()) {
        if (oppCells.has(cell)) {
          validActions.push(new TorpedoAction(cell));
        }
      }
    }
    return validActions;
  }

  updateCounts(charges: Charges, _: any): void {
    charges.TORPEDO = 0;
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
