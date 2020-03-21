import { DIRECTIONS } from "./constants";

export function executeAction(action: Action) {
  switch (action.type) {
    case "MOVE":
      console.log(
        `MOVE ${action.direction} ${action.charge ? action.charge : ""}`
      );
      break;
    case "SURFACE":
      console.log("SURFACE");
      break;
  }
}

export function parseActionFromString(actionString: string): Action {
  const [type, payload] = actionString.split(" ", 2);
  switch (type) {
    case "MOVE":
      // @ts-ignore
      const [direction, charge]: [Direction, Device] = payload.split(" ");
      return { type, direction, charge };
    default:
      throw new Error("Invalid action string");
  }
}
