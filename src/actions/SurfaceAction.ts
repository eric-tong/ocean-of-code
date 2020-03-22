import { getCellsInSector, getSector } from "../mechanics/sectors";

import { parseBase10 } from "../utils/math-utils";

export default class SurfaceAction implements Action {
  readonly type = "SURFACE";
  sector: number;

  constructor(sector: number) {
    this.sector = sector;
  }

  toActionString() {
    return "SURFACE";
  }

  fromActionString(params: string[]) {
    const sector = parseBase10(params[0]);
    return new SurfaceAction(sector);
  }

  getErrors({ myCells }: GetErrorsParams) {
    const newMyCells = this.getNewPossibleCells(myCells);
    const oppKnowledgeGain = myCells.size - newMyCells.size;
    return {
      mseGain: 0,
      oppHealth: 0,
      myDamage: 1,
      oppKnowledgeGain
    };
  }

  getNewPossibleCells(oldCells: Set<Cell>): Set<Cell> {
    const newCells = new Set<Cell>();
    if (!this.sector) throw new Error("No sector provided");

    oldCells.forEach(cell => {
      if (getSector(cell) === this.sector) newCells.add(cell);
    });
    return newCells;
  }

  updateCounts(_: Charges, record: any): void {
    record.visited.clear();
  }
}
