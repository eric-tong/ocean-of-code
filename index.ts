import { executeAction } from "./action";
import { getData } from "./data";
import { getMap } from "./map";
import { getMeanSquaredError } from "./cell-utils";
import { getOppCells } from "./opponent";
import { getStartPosition } from "./start-position";
import { parseBase10 } from "./math-utils";

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
    | { type: "SURFACE" };
}
const DIRECTIONS: Direction[] = ["N", "E", "S", "W"];

// @ts-ignore
const [width, height, myId]: number[] = readline()
  .split(" ")
  .map(parseBase10);
const map = getMap(width, height);
const oppCells = getOppCells(map);

const startPosition = getStartPosition(map);
console.log(`${startPosition.x} ${startPosition.y}`);

while (true) {
  const data = getData();
  const myCell = map[data.x][data.y];
  if (!myCell) throw new Error("My cell is empty");

  let minError = Number.MAX_SAFE_INTEGER;
  let minErrorDirection: Direction | undefined;
  myCell.forEach((neighbor, directionIndex) => {
    if (!neighbor) return;
    const error = getMeanSquaredError(neighbor, oppCells.values());
    if (error < minError) {
      minError = error;
      minErrorDirection = DIRECTIONS[directionIndex];
    }
  });

  let action: Action | undefined;
  if (minErrorDirection)
    action = { type: "MOVE", direction: "N", charge: "TORPEDO" };
  else {
    action = { type: "SURFACE" };
  }
  executeAction(action);
}
