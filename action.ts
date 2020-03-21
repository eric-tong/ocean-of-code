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
