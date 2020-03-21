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
    | { type: "TORPEDO"; x: number; y: number }
    | { type: "SURFACE" };
}

export const DIRECTIONS: Direction[] = ["N", "E", "S", "W"];
