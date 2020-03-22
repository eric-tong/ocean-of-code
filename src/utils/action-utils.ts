import { DEVICES, MAX_CHARGE, TORPEDO_RANGE } from "../mechanics/constants";
import { getSector, uniqueSectors } from "../mechanics/sectors";

import MoveAction from "../actions/MoveAction";
import SilenceAction from "../actions/SilenceAction";
import SonarAction from "../actions/SonarAction";
import SurfaceAction from "../actions/SurfaceAction";
import TorpedoAction from "../actions/TorpedoAction";
import { getCellsWithinRange } from "./cell-utils";
import { parseActionFromString } from "../actions/Actions";

type Params = {
  validDirections: Direction[];
  charges: Charges;
  myCell: Cell;
  prevCell?: Cell;
  oppCells: Set<Cell>;
};

export function parseActionsFromString(
  actionsString: string,
  map: CellMap,
  prevCell: Cell
) {
  const actions = [];
  for (const actionString of actionsString.split("|")) {
    const action = parseActionFromString(actionString, map, prevCell);
    if (action) actions.push(action);
  }
  return actions;
}

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
  const actionStrings = actions.map(action => action.toActionString());
  console.log(actionStrings.join("|"));
}
