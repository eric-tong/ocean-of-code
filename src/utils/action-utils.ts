import { DEVICES, MAX_CHARGE, TORPEDO_RANGE } from "../mechanics/constants";
import { getSector, uniqueSectors } from "../mechanics/sectors";

import MoveAction from "../actions/MoveAction";
import SilenceAction from "../actions/SilenceAction";
import SonarAction from "../actions/SonarAction";
import SurfaceAction from "../actions/SurfaceAction";
import TorpedoAction from "../actions/TorpedoAction";
import { getCellsWithinRange } from "./cell-utils";
import { parseBase10 } from "./math-utils";

type Params = {
  validDirections: Direction[];
  charges: Charges;
  myCell: Cell;
  prevCell?: Cell;
  oppCells: Set<Cell>;
};

export function getAllValidActions({
  validDirections,
  charges,
  oppCells,
  myCell,
  prevCell
}: Params) {
  const actions: Action[] = [];
  const unchargedDevices = DEVICES.filter(
    device => charges[device] < MAX_CHARGE[device]
  );
  for (const device of [...unchargedDevices, undefined]) {
    const moveActions: Action[] = validDirections.map(
      direction => new MoveAction(direction, device)
    );
    actions.push(...moveActions);
  }

  actions.push(new SurfaceAction(getSector(myCell)));

  if (charges.TORPEDO >= MAX_CHARGE.TORPEDO) {
    const cellsInRange = getCellsWithinRange(myCell, TORPEDO_RANGE);
    for (const cell of cellsInRange.values()) {
      if (oppCells.has(cell)) {
        actions.push(new TorpedoAction(cell));
      }
    }
  }

  if (charges.SONAR >= MAX_CHARGE.SONAR) {
    const sectors = uniqueSectors(oppCells);
    sectors.forEach(sector =>
      actions.push(
        new SonarAction(sector, !!prevCell && sector === getSector(prevCell))
      )
    );
  }

  return actions;
}

export function executeActions(actions: Action[]) {
  const actionStrings = [];
  for (const action of actions)
    switch (action.type) {
      case "MOVE":
      case "TORPEDO":
      case "SURFACE":
      case "SONAR":
        actionStrings.push(action.toActionString());
        break;
      default:
        throw new Error("Cannot excute action");
    }
  console.log(actionStrings.join("|"));
}

export function parseActionsFromString(actionsString: string, map: CellMap) {
  const actions = [];
  for (const actionString of actionsString.split("|")) {
    const action = parseActionFromString(actionString, map);
    if (action) actions.push(action);
  }
  return actions;
}

function parseActionFromString(
  actionString: string,
  map: CellMap
): Action | undefined {
  const [type, ...payload] = actionString.split(" ");
  switch (type) {
    case "MOVE":
      // @ts-ignore
      const [direction, charge]: [Direction, Device] = payload;
      return new MoveAction(direction, charge);
    case "TORPEDO":
      const [x, y] = payload.map(parseBase10);
      const cell = map[x][y];
      if (!cell) throw new Error("Torpedoed cell does not exist");
      return new TorpedoAction(cell);
    case "SURFACE":
      const sector = parseBase10(payload[0]);
      return new SurfaceAction(sector);
    case "SONAR":
      // TODO Handle sonar
      return;
    case "SILENCE":
      return new SilenceAction();
    case "MINE":
      // TODO Handle mines
      return;
    case "TRIGGER":
      // TODO Handle trigger
      return;
    case "NA":
      return;
    default:
      throw new Error(`Invalid action string ${actionString}`);
  }
}
