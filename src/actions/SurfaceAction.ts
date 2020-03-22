import { getCellsInSector, getSector } from "../mechanics/sectors";

export default class SurfaceAction implements Action {
  readonly type = "SURFACE";
  sector: number;

  constructor(sector: number) {
    this.sector = sector;
  }

  toActionString() {
    return "SURFACE";
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
