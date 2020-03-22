import { getSector } from "../mechanics/sectors";

export default class SonarAction implements Action {
  readonly type = "SONAR";
  sector: number;
  inSector: boolean;

  constructor(sector: number, inSector: boolean) {
    this.sector = sector;
    this.inSector = inSector;
  }

  toActionString() {
    return `SONAR ${this.sector}`;
  }

  getErrors({ oppCells }: GetErrorsParams) {
    let sectorCount = 0;
    let totalCount = 0;
    for (const cell of oppCells.values()) {
      const sector = getSector(cell);
      if (sector === this.sector) {
        sectorCount++;
      }
      totalCount++;
    }
    const myKnowledgeAfterSonar =
      (sectorCount / totalCount) * sectorCount +
      (1 - sectorCount / totalCount) * (totalCount - sectorCount);
    const myKnowledgeLoss = myKnowledgeAfterSonar - oppCells.size;
    return { myKnowledgeLoss };
  }

  getNewPossibleCells(oldCells: Set<Cell>): Set<Cell> {
    const newCells = new Set<Cell>();
    let inSector = this.inSector;

    for (const cell of oldCells) {
      const cellInSector = getSector(cell) === this.sector;
      if (inSector === cellInSector) {
        newCells.add(cell);
      }
    }
    return newCells;
  }
}
