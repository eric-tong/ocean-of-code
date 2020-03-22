import { DIRECTIONS, MAX_CHARGE } from "../mechanics/constants";

import { getMeanSquaredError } from "../utils/cell-utils";
import { getPossibleCells } from "../strategy/possible-cells";
import { uniqueSectors } from "../mechanics/sectors";

export default class MoveAction implements Action {
  readonly type = "MOVE";
  direction: Direction;
  charge?: Device;

  constructor(direction: Direction, charge?: Device) {
    this.direction = direction;
    this.charge = charge;
  }

  toActionString(): string {
    return `MOVE ${this.direction} ${this.charge ? this.charge : ""}`;
  }
  getErrors({ myCell, myCells, oppCells, map }: GetErrorsParams): Errors {
    const currentMse = getMeanSquaredError(
      myCell,
      Array.from(oppCells.values())
    );
    const newMyCells = this.getNewPossibleCells(myCells);
    const oppKnowledgeGain = myCells.size - newMyCells.size;

    const directionIndex = DIRECTIONS.indexOf(this.direction);
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
    switch (this.charge) {
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
  }

  getNewPossibleCells(oldCells: Set<Cell>): Set<Cell> {
    const newCells = new Set<Cell>();
    const directionIndex = DIRECTIONS.indexOf(this.direction);
    oldCells.forEach(cell => {
      const newCell = cell[directionIndex];
      if (newCell) newCells.add(newCell);
    });
    return newCells;
  }
}
