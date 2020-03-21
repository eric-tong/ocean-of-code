import { parseBase10 } from "./math-utils";

export function executeActions(actions: Action[]) {
  const actionStrings = [];
  for (const action of actions)
    switch (action.type) {
      case "MOVE":
        actionStrings.push(
          `MOVE ${action.direction} ${action.charge ? action.charge : ""}`
        );
        break;
      case "SURFACE":
        actionStrings.push("SURFACE");
        break;
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
      return { type, direction, charge };
    case "TORPEDO":
      const [x, y] = payload.map(parseBase10);
      const cell = map[x][y];
      if (!cell) throw new Error("Torpedoed cell does not exist");
      return { type, cell };
    case "SURFACE":
      const sector = parseBase10(payload[0]);
      return { type, sector };
    case "NA":
      return;
    default:
      throw new Error(`Invalid action string ${actionString}`);
  }
}
