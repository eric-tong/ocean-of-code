import {
  executeActions,
  getAllValidActions,
  parseActionsFromString
} from "./actions/Actions";
import { getCoords, getMap, getSet } from "./utils/map";

import { MAX_LIFE } from "./mechanics/constants";
import SonarAction from "./actions/SonarAction";
import TorpedoAction from "./actions/TorpedoAction";
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
  lastOppLife: MAX_LIFE,
  lastMyLife: MAX_LIFE,
  lastOppActions: [],
  lastMyActions: [],
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

  let oppDamage = record.lastOppLife - data.oppLife;
  const surfaceAction = record.lastOppActions.find(
    action => action.type === "SURFACE"
  );
  if (surfaceAction) oppDamage--;

  // TODO handle mines
  const triggerActions = [
    ...record.lastOppActions,
    ...record.lastMyActions
  ].filter(action => action.type === "TRIGGER");

  if (triggerActions.length === 0) {
    const torpedoActions = [
      ...record.lastOppActions,
      ...record.lastMyActions
    ].filter(action => action.type === "TORPEDO") as TorpedoAction[];
    for (const action of torpedoActions) {
      oppCells = action.getNewPossibleCellsWithHitOrMiss(
        oppCells,
        record.lastOppLife - data.oppLife,
        map
      );
    }
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
  const actions = decideActions(actionErrors, {
    myCells,
    oppCells,
    oppLife: data.oppLife,
    myLife: data.myLife
  });

  actions.forEach(action => action.updateCounts(charges, record, myCell));
  actions.forEach(action => {
    if (action.type !== "SONAR") myCells = action.getNewPossibleCells(myCells);
  });

  record.prevCell = myCell;
  record.lastOppLife = data.oppLife;
  record.lastMyLife = data.myLife;
  record.lastOppActions = [...oppActions];
  record.lastMyActions = [...actions];

  console.error(
    Array.from(oppCells).map(cell => getCoords(cell)),
    Array.from(myCells).map(cell => getCoords(cell)),
    actionErrors,
    charges
  );
  executeActions(actions);
}
