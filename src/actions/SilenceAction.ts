import { DIRECTIONS, MAX_CHARGE, SILENCE_RANGE } from "../mechanics/constants";

import { getMeanSquaredError } from "../utils/cell-utils";

export default class SilenceAction implements Action {
  readonly type = "SILENCE";
  direction?: Direction;
  distance?: number;

  constructor(direction?: Direction, distance?: number) {
    this.direction = direction;
    this.distance = distance;
  }

  toActionString(): string {
    throw new Error("Method not implemented.");
  }

  fromActionString() {
    return new SilenceAction();
  }

  getErrors({ myCell, myCells, oppCells }: GetErrorsParams): Errors {
    if (!this.direction || !this.distance)
      throw new Error("Undefined direction or distance");

    const currentMse = getMeanSquaredError(
      myCell,
      Array.from(oppCells.values())
    );
    const newMyCells = this.getNewPossibleCells(myCells);
    const oppKnowledgeGain = myCells.size - newMyCells.size;

    const directionIndex = DIRECTIONS.indexOf(this.direction);
    let testCell = myCell;
    for (let distance = 0; distance < this.distance; distance++) {
      const neighbor = myCell[directionIndex];
      if (!neighbor) throw new Error("Invalid Silence distance");
      testCell = neighbor;
    }
    const mse = getMeanSquaredError(testCell, Array.from(oppCells.values()));
    const errors = {
      mse,
      mseGain: mse - currentMse,
      oppKnowledgeGain
    };

    const cellsAfterSilence = new SilenceAction().getNewPossibleCells(myCells);
    const oppKnowledgeGainAfterSilence =
      newMyCells.size - cellsAfterSilence.size;
    errors.oppKnowledgeGain += oppKnowledgeGainAfterSilence;

    return errors;
  }

  getNewPossibleCells(oldCells: Set<Cell>): Set<Cell> {
    const newCells = new Set<Cell>();
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
    return newCells;
  }

  getValidActions({ charges, myCell }: GetValidActionsParams) {
    if (charges.SILENCE < MAX_CHARGE.SILENCE) return [];

    const validActions: SilenceAction[] = [new SilenceAction("N", 0)];
    new SilenceAction("N", 0);
    for (
      let directionIndex = 0;
      directionIndex < DIRECTIONS.length;
      directionIndex++
    ) {
      let cell: Cell | undefined = myCell;
      for (let distance = 1; distance <= SILENCE_RANGE; distance++) {
        cell = cell[directionIndex];
        if (cell) {
          validActions.push(
            new SilenceAction(DIRECTIONS[directionIndex], distance)
          );
        } else {
          break;
        }
      }
    }
    return validActions;
  }

  updateCounts(charges: Charges): void {
    charges.SILENCE = 0;
  }
}
