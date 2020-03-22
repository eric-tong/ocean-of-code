import {
  executeActions,
  getAllValidActions,
  parseActionsFromString
} from "./actions/Actions";
import { getCoords, getMap, getSet } from "./utils/map";

import SonarAction from "./actions/SonarAction";
import { decideActions } from "./strategy/decider";
import { getData } from "./utils/data";
import { getStartPosition } from "./strategy/start-position";
import { getValidDirections } from "./mechanics/direction";
import { parseBase10 } from "./utils/math-utils";

// @ts-ignore
const [width, height, myId]: number[] = readline()
  .split(" ")
  .map(parseBase10);
const map = getMap(width, height);
let oppCells = getSet(map);
let myCells = getSet(map);

const startPosition = getStartPosition(map);
console.log(`${startPosition.x} ${startPosition.y}`);

const charges: Charges = { TORPEDO: 0, SONAR: 0, SILENCE: 0 };
const record: MovementRecord = {
  lastSonarSector: -1,
  prevCell: [undefined, undefined, undefined, undefined],
  visited: new Set<Cell>()
};

while (true) {
  const data = getData();
  const myCell = map[data.x][data.y];
  if (!myCell) throw new Error("My cell is empty");
  record.visited.add(myCell);

  if (data.sonarResult !== "NA") {
    oppCells = new SonarAction(
      record.lastSonarSector,
      data.sonarResult === "Y"
    ).getNewPossibleCells(oppCells);
  }

  const oppActions = parseActionsFromString(
    data.oppOrders,
    map,
    record.prevCell
  );
  oppActions.forEach(action => {
    if (action.type === "SONAR") {
      myCells = action.getNewPossibleCells(myCells);
    } else {
      oppCells = action.getNewPossibleCells(oppCells);
    }
  });

  const validDirections = getValidDirections(myCell, record.visited);
  const validActions = getAllValidActions({
    validDirections,
    charges,
    myCell,
    prevCell: record.prevCell,
    visited: record.visited,
    oppCells
  });
  const actionErrors = validActions.map(action => ({
    action,
    errors: action.getErrors({ myCell, myCells, oppCells, map })
  }));
  const actions = decideActions(actionErrors);

  if (!myCells.has(myCell)) throw new Error("MyCells prediction failure");
  actions.forEach(action => action.updateCounts(charges, record, myCell));
  actions.forEach(action => {
    if (action.type !== "SONAR") myCells = action.getNewPossibleCells(myCells);
  });
  record.prevCell = myCell;

  console.error(
    Array.from(oppCells).map(cell => getCoords(cell)),
    Array.from(myCells).map(cell => getCoords(cell)),
    actionErrors,
    charges
  );
  executeActions(actions);
}
