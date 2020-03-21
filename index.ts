import { executeAction, parseActionsFromString } from "./action";
import { getCoords, getMap } from "./map";

import { getData } from "./data";
import { getMinErrorDirection } from "./direction";
import { getOppCells } from "./opponent";
import { getStartPosition } from "./start-position";
import { parseBase10 } from "./math-utils";
import { updatePossibleCells } from "./possible-cells";

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

  const oppActions = parseActionsFromString(data.oppOrders, map);
  oppActions.forEach(action => updatePossibleCells(oppCells, action));

  const minErrorDirection = getMinErrorDirection(
    myCell,
    Array.from(oppCells.values()),
    visited
  );
  let action: Action | undefined;
  if (minErrorDirection)
    action = { type: "MOVE", direction: minErrorDirection, charge: "TORPEDO" };
  else {
    action = { type: "SURFACE" };
    visited.clear();
  }

  console.error(
    "OppCells",
    Array.from(oppCells).map(cell => getCoords(cell))
  );

  executeAction(action);
}
