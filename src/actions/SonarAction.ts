import { getSector, uniqueSectors } from "../mechanics/sectors";

import { MAX_CHARGE } from "../mechanics/constants";
import { parseBase10 } from "../utils/math-utils";

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

  fromActionString(params: string[], _: CellMap, prevCell: Cell) {
    const sector = parseBase10(params[0]);
    return new SonarAction(sector, sector === getSector(prevCell));
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

  getValidActions({ charges, oppCells, prevCell }: GetValidActionsParams) {
    if (charges.SONAR >= MAX_CHARGE.SONAR) {
      const sectors = uniqueSectors(oppCells);
      return sectors.map(
        sector =>
          new SonarAction(sector, !!prevCell && sector === getSector(prevCell))
      );
    }
    return [];
  }

  updateCounts(charges: Charges, record: any): void {
    record.lastSonarSector = this.sector;
    charges.SONAR = 0;
  }
}
