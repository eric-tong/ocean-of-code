import {
  executeActions,
  getAllValidActions,
  parseActionsFromString
} from "./actions/Actions";
import { getCoords, getMap, getSet } from "./utils/map";

import { MAX_LIFE } from "./mechanics/constants";
import SonarAction from "./actions/SonarAction";
import TorpedoAction from "./actions/TorpedoAction";
import TriggerAction from "./actions/TriggerAction";
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

  const oppActions = parseActionsFromString(
    data.oppOrders,
    map,
    record.prevCell
  );

  const torpedoActions = [...oppActions, ...record.lastMyActions].filter(
    action => action.type === "TORPEDO"
  ) as TorpedoAction[];
  const triggerActions = [...oppActions, ...record.lastMyActions].filter(
    action => action.type === "TRIGGER"
  ) as TriggerAction[];
  const surfaceAction = oppActions.find(action => action.type === "SURFACE");

  let oppDamage = record.lastOppLife - data.oppLife;
  if (surfaceAction) oppDamage--;

  if (triggerActions.length === 0) {
    if (
      torpedoActions.length === 1 &&
      record.lastMyActions.indexOf(torpedoActions[0]) > 0
    ) {
      const torpedoAction = torpedoActions[0];
      if (oppDamage === 2) {
        oppCells = new Set([torpedoAction.cell]);
      } else if (oppDamage === 1) {
        oppCells = torpedoAction.getCellsInOneDamageZone(oppCells);
      } else if (oppDamage === 0) {
        oppCells = torpedoAction.getCellsNotInDamageZone(oppCells);
      } else {
        throw new Error("Invalid damage");
      }
    }
  }

  oppActions.forEach(action => {
    if (action.type === "SONAR") {
      myCells = action.getNewPossibleCells(myCells);
    } else if (action.type === "TORPEDO") {
      if (triggerActions.length === 0) {
        if (torpedoActions.length === 1) {
          const torpedoAction = action as TorpedoAction;
          if (oppDamage === 2) {
            oppCells = new Set([torpedoAction.cell]);
          } else if (oppDamage === 1) {
            oppCells = torpedoAction.getCellsInOneDamageZone(oppCells);
          } else if (oppDamage === 0) {
            oppCells = torpedoAction.getCellsNotInDamageZone(oppCells);
          } else {
            throw new Error("Invalid damage");
          }
        }
      }
      oppCells = action.getNewPossibleCells(oppCells);
    } else {
      oppCells = action.getNewPossibleCells(oppCells);
    }
  });

  console.error("OPPCELLS", Array.from(oppCells).map(getCoords));
  console.error("MYCELLS", Array.from(myCells).map(getCoords));

  if (!oppCells.size) throw new Error("Lost opponent position");

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
    errors: action.getErrors({
      myCell,
      myCells,
      oppCells,
      map,
      visited: record.visited
    })
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

  console.error("ACTIONS", actionErrors);

  record.prevCell = myCell;
  record.lastOppLife = data.oppLife;
  record.lastMyLife = data.myLife;
  record.lastMyActions = [...actions];

  executeActions(actions);
}
