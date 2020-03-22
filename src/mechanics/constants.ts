declare global {
  // @ts-ignore
  type Cell = [Cell?, Cell?, Cell?, Cell?];
  type Coords = { x: number; y: number };
  type CellMap = (Cell | undefined)[][];
  type Direction = "N" | "E" | "S" | "W";
  type Device = "TORPEDO" | "SONAR" | "SILENCE";
  type Errors = {
    mse?: number;
    mseGain?: number;
    oppHealth?: number;
    myDamage?: number;
    oppKnowledgeGain?: number;
    myKnowledgeLoss?: number;
  };
  type Charges = { TORPEDO: number; SONAR: number; SILENCE: number };

  type GetErrorsParams = {
    myCell: Cell;
    myCells: Set<Cell>;
    oppCells: Set<Cell>;
    map: CellMap;
  };
  interface Action {
    type: Device;
    toActionString(): string;
    getErrors(params: GetErrorsParams): Errors;
    getNewPossibleCells(oldCells: Cell[]): Set<Cell>;
  }
}

export const DIRECTIONS: Direction[] = ["N", "E", "S", "W"];
export const DEVICES: Device[] = ["TORPEDO", "SONAR"];
export const MAX_CHARGE: Charges = { TORPEDO: 3, SONAR: 4, SILENCE: 6 };
export const DEFAULT_WIDTH = 15;
export const DEFAULT_HEIGHT = 15;
export const SILENCE_RANGE = 4;
export const TORPEDO_RANGE = 4;
