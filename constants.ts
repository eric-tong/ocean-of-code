declare global {
  // @ts-ignore
  type Cell = [Cell?, Cell?, Cell?, Cell?];
  type Coords = { x: number; y: number };
  type CellMap = (Cell | undefined)[][];
  type Direction = "N" | "E" | "S" | "W";
  type Device = "TORPEDO";
  type Action =
    | {
        type: "MOVE";
        direction: Direction;
        charge?: Device;
      }
    | { type: "TORPEDO"; cell: Cell }
    | { type: "SURFACE"; sector: number }
    | { type: "SILENCE"; direction?: Direction; distance?: number };
  type Errors = {
    mseGain: number;
    oppHealth: number;
    myDamage: number;
    oppKnowledgeGain: number;
  };
  type Charges = { TORPEDO: number };
}

export const DIRECTIONS: Direction[] = ["N", "E", "S", "W"];
export const DEFAULT_WIDTH = 15;
export const DEFAULT_HEIGHT = 15;
export const SILENCE_RANGE = 4;
export const TORPEDO_RANGE = 4;
export const MAX_CHARGE = 3;
