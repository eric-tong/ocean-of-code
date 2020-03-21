import { executeAction, parseActionFromString } from "./action";

import { getData } from "./data";
import { getMap } from "./map";
import { getMinErrorDirection } from "./direction";
import { getOppCells } from "./opponent";
import { getStartPosition } from "./start-position";
import { parseBase10 } from "./math-utils";

// @ts-ignore
const [width, height, myId]: number[] = readline()
  .split(" ")
  .map(parseBase10);
const map = getMap(width, height);
const oppCells = getOppCells(map);

const startPosition = getStartPosition(map);
console.log(`${startPosition.x} ${startPosition.y}`);

const visited = new Set<Cell>();

while (true) {
  const data = getData();
  const myCell = map[data.x][data.y];
  if (!myCell) throw new Error("My cell is empty");
  visited.add(myCell);

  const oppActions = data.oppOrders.split("|").map(parseActionFromString);

  const minErrorDirection = getMinErrorDirection(
    myCell,
    oppCells.values(),
    visited
  );
  let action: Action | undefined;
  if (minErrorDirection)
    action = { type: "MOVE", direction: minErrorDirection, charge: "TORPEDO" };
  else {
    action = { type: "SURFACE" };
    visited.clear();
  }
  executeAction(action);
}
