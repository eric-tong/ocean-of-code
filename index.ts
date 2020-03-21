import {
  executeActions,
  getAllValidActions,
  parseActionsFromString
} from "./action";
import { getCoords, getMap } from "./map";

import { MAX_CHARGE } from "./constants";
import { decideActions } from "./decider";
import { getData } from "./data";
import { getErrors } from "./errors";
import { getOppCells } from "./opponent";
import { getPossibleCells } from "./possible-cells";
import { getStartPosition } from "./start-position";
import { getValidDirections } from "./direction";
import { parseBase10 } from "./math-utils";

// @ts-ignore
const [width, height, myId]: number[] = readline()
  .split(" ")
  .map(parseBase10);
const map = getMap(width, height);
let oppCells = getOppCells(map);
let myCells = getOppCells(map);

const startPosition = getStartPosition(map);
console.log(`${startPosition.x} ${startPosition.y}`);

const visited = new Set<Cell>();
const charges: Charges = { TORPEDO: 0, SONAR: 0, SILENCE: 0 };

let lastSonarSector = -1;
let lastCell: Cell | undefined = undefined;

while (true) {
  const data = getData();
  const myCell = map[data.x][data.y];
  if (!myCell) throw new Error("My cell is empty");
  visited.add(myCell);

  if (data.sonarResult !== "NA") {
    oppCells = getPossibleCells(
      oppCells,
      {
        type: "SONAR",
        sector: lastSonarSector,
        inSector: data.sonarResult === "Y"
      },
      map
    );
  }

  const oppActions = parseActionsFromString(data.oppOrders, map);
  oppActions.forEach(action => {
    if (action.type === "SONAR") {
      myCells = getPossibleCells(myCells, action, map, lastCell);
    } else {
      oppCells = getPossibleCells(oppCells, action, map);
    }
  });

  const validDirections = getValidDirections(myCell, visited);
  const validActions = getAllValidActions({
    validDirections,
    charges,
    myCell,
    oppCells
  });
  const params = { myCell, myCells, oppCells, map };
  const actionErrors = validActions.map(action => ({
    action,
    errors: getErrors(action, params)
  }));
  const actions = decideActions(actionErrors);

  actions.forEach(updateCounts);
  actions.forEach(action => {
    if (action.type !== "SONAR")
      myCells = getPossibleCells(myCells, action, map);
  });
  lastCell = myCell;

  console.error(
    Array.from(oppCells).map(cell => getCoords(cell)),
    Array.from(myCells).map(cell => getCoords(cell)),
    actionErrors,
    charges
  );
  executeActions(actions);
}

function updateCounts(action: Action) {
  switch (action.type) {
    case "SURFACE":
      visited.clear();
      break;
    case "MOVE":
      if (action.charge) {
        const chargeAmount = Math.min(
          MAX_CHARGE[action.charge],
          charges[action.charge] + 1
        );
        charges[action.charge] = chargeAmount;
      }
      break;
    case "TORPEDO":
      charges.TORPEDO = 0;
      break;
    case "SONAR":
      lastSonarSector = action.sector;
      charges.SONAR = 0;
      break;
  }
}
