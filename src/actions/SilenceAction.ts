import { DIRECTIONS, SILENCE_RANGE } from "../mechanics/constants";

export default class SilenceAction implements Action {
  readonly type = "SILENCE";

  toActionString(): string {
    throw new Error("Method not implemented.");
  }

  getErrors(params: GetErrorsParams): Errors {
    throw new Error("Method not implemented.");
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

  updateCounts(charges: Charges, record: any): void {
    record.visited.clear();
  }
}
