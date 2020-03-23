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

  getNewPossibleCellsWithHitOrMiss(
    oldCells: Set<Cell>,
    damage: number
  ): Set<Cell> {
    if (!this.cell) {
      throw new Error("Undefined torpedo cell");
    }

    const newCells = new Set<Cell>();
    switch (damage) {
      case 2:
        newCells.add(this.cell);
      case 1:
        oldCells.forEach(cell => {
          if (areNeighbors(cell, this.cell)) newCells.add(cell);
        });
        break;
      case 0:
        oldCells.forEach(cell => {
          if (!areNeighbors(cell, this.cell) && cell !== this.cell)
            newCells.add(cell);
        });
        break;
      default:
        throw new Error(`Invalid damage: ${damage}`);
    }
    console.error(
      Array.from(oldCells).map(cell => getCoords(cell)),
      Array.from(newCells).map(cell => getCoords(cell))
    );
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
