import { executeAction, parseActionsFromString } from "./action";
import { getCoords, getMap } from "./map";

import { decideActions } from "./decider";
import { getData } from "./data";
import { getDirectionErrors } from "./direction";
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

  const directionErrors = getDirectionErrors(
    myCell,
    Array.from(oppCells.values()),
    visited
  );

  console.error(
    "OppCells",
    Array.from(oppCells).map(cell => getCoords(cell))
  );

  const actions = decideActions({ directionErrors });
  if (actions.find(({ type }) => type === "SURFACE")) visited.clear();
  actions.forEach(executeAction);
}
