import MoveAction from "./MoveAction";
import SilenceAction from "./SilenceAction";
import SonarAction from "./SonarAction";
import SurfaceAction from "./SurfaceAction";
import TorpedoAction from "./TorpedoAction";
import TriggerAction from "./TriggerAction";

const ACTIONS: Action[] = [
  // @ts-ignore
  new MoveAction(),
  new SilenceAction(),
  // @ts-ignore
  new SonarAction(),
  // @ts-ignore
  new SurfaceAction(),
  // @ts-ignore
  new TorpedoAction(),
  new TriggerAction()
];
const TYPE_TO_ACTION = new Map<String, Action>(
  ACTIONS.map(action => [action.type, action])
);

export function getAllValidActions(params: GetValidActionsParams) {
  const validActions = [];
  for (const action of ACTIONS) {
    validActions.push(...action.getValidActions(params));
  }
  return validActions;
}

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

function parseActionFromString(
  actionString: string,
  map: CellMap,
  prevCell: Cell
): Action | undefined {
  const [type, ...params] = actionString.split(" ");
  const action = TYPE_TO_ACTION.get(type);
  if (action) return action.fromActionString(params, map, prevCell);
}

export function executeActions(actions: Action[]) {
  const actionStrings = actions.map(action => action.toActionString());
  console.log(actionStrings.join("|"));
}
