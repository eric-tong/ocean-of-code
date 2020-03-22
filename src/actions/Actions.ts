import MoveAction from "./MoveAction";
import SilenceAction from "./SilenceAction";
import SonarAction from "./SonarAction";
import SurfaceAction from "./SurfaceAction";
import TorpedoAction from "./TorpedoAction";

const ACTIONS: Action[] = [
  // @ts-ignore
  new MoveAction(),
  new SilenceAction(),
  // @ts-ignore
  new SonarAction(),
  // @ts-ignore
  new SurfaceAction(),
  // @ts-ignore
  new TorpedoAction()
];
const TYPE_TO_ACTION = new Map<String, Action>(
  ACTIONS.map(action => [action.type, action])
);

export function parseActionFromString(
  actionString: string,
  map: CellMap,
  prevCell: Cell
): Action | undefined {
  const [type, ...params] = actionString.split(" ");
  const action = TYPE_TO_ACTION.get(type);
  if (action) return action.fromActionString(params, map, prevCell);
}
