import { executeAction, parseActionsFromString } from "./action";
import { getCoords, getMap } from "./map";

import { MAX_CHARGE } from "./constants";
import { decideActions } from "./decider";
import { getData } from "./data";
import { getErrors } from "./errors";
import { getOppCells } from "./opponent";
import { getStartPosition } from "./start-position";
import { getValidDirections } from "./direction";
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
const charges = { TORPEDO: 0 };

while (true) {
  const data = getData();
  const myCell = map[data.x][data.y];
  if (!myCell) throw new Error("My cell is empty");
  visited.add(myCell);

  const oppActions = parseActionsFromString(data.oppOrders, map);
  oppActions.forEach(action => updatePossibleCells(oppCells, action));

  const validDirections = getValidDirections(myCell, visited);
  const params = { myCell, oppCells };
  const directionErrors = validDirections.map(direction => ({
    direction,
    errors: getErrors(direction, params)
  }));
  const actions = decideActions(directionErrors);

  console.error(
    "OppCells",
    Array.from(oppCells).map(cell => getCoords(cell)),
    directionErrors,
    charges
  );

  actions.forEach(updateCounts);
  actions.forEach(executeAction);
}

function updateCounts(action: Action) {
  switch (action.type) {
    case "SURFACE":
      visited.clear();
      break;
    case "MOVE":
      if (action.charge) {
        const chargeAmount = Math.min(MAX_CHARGE, charges[action.charge] + 1);
        charges[action.charge] = chargeAmount;
      }
      break;
    case "TORPEDO":
      charges.TORPEDO = 0;
      break;
  }
}
