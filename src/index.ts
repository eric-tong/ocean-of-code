import {
  executeActions,
  getAllValidActions,
  parseActionsFromString
} from "./utils/action-utils";
import { getCoords, getMap } from "./utils/map";

import { MAX_CHARGE } from "./mechanics/constants";
import MoveAction from "./actions/MoveAction";
import SonarAction from "./actions/SonarAction";
import { decideActions } from "./strategy/decider";
import { getData } from "./utils/data";
import { getErrors } from "./strategy/errors";
import { getOppCells } from "./utils/opponent";
import { getPossibleCells } from "./strategy/possible-cells";
import { getStartPosition } from "./strategy/start-position";
import { getValidDirections } from "./mechanics/direction";
import { parseBase10 } from "./utils/math-utils";

// @ts-ignore
const [width, height, myId]: number[] = readline()
  .split(" ")
  .map(parseBase10);
const map = getMap(width, height);
let oppCells = getOppCells(map);
let myCells = getOppCells(map);

const startPosition = getStartPosition(map);
console.log(`${startPosition.x} ${startPosition.y}`);

const charges: Charges = { TORPEDO: 0, SONAR: 0, SILENCE: 0 };
const record: MovementRecord = {
  lastSonarSector: -1,
  prevCell: undefined,
  visited: new Set<Cell>()
};

while (true) {
  const data = getData();
  const myCell = map[data.x][data.y];
  if (!myCell) throw new Error("My cell is empty");
  record.visited.add(myCell);

  if (data.sonarResult !== "NA") {
    oppCells = getPossibleCells(
      oppCells,
      new SonarAction(record.lastSonarSector, data.sonarResult === "Y")
    );
  }

  const oppActions = parseActionsFromString(data.oppOrders, map);
  oppActions.forEach(action => {
    if (action.type === "SONAR") {
      myCells = action.getNewPossibleCells(myCells);
    } else {
      oppCells = getPossibleCells(oppCells, action);
    }
  });

  const validDirections = getValidDirections(myCell, record.visited);
  const validActions = getAllValidActions({
    validDirections,
    charges,
    myCell,
    prevCell: record.prevCell,
    oppCells
  });
  const params = { myCell, myCells, oppCells, map };
  const actionErrors = validActions.map(action => ({
    action,
    errors: getErrors(action, params)
  }));
  const actions = decideActions(actionErrors);

  actions.forEach(action => action.updateCounts(charges, record));
  actions.forEach(action => {
    if (action.type !== "SONAR") myCells = getPossibleCells(myCells, action);
  });
  record.prevCell = myCell;

  console.error(
    Array.from(oppCells).map(cell => getCoords(cell)),
    Array.from(myCells).map(cell => getCoords(cell)),
    actionErrors,
    charges
  );
  if (!myCells.has(myCell)) throw new Error("MyCells prediction failure");

  executeActions(actions);
}
