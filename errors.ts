import { DIRECTIONS } from "./constants";
import { getMeanSquaredError } from "./cell-utils";

type Params = {
  myCell: Cell;
  oppCells: Set<Cell>;
};

export function getErrors(
  action: Action,
  { myCell, oppCells }: Params
): Errors {
  switch (action.type) {
    case "MOVE":
      const directionIndex = DIRECTIONS.indexOf(action.direction);
      const testCell = myCell[directionIndex];
      if (!testCell) throw new Error("Invalid test cell");

      const mse = getMeanSquaredError(testCell, Array.from(oppCells.values()));
      return { mse, oppKnowledge: 0 };
    case "SURFACE":
      return { mse: 0, oppKnowledge: 1000 };
    default:
      throw new Error("Invalid action for finding error");
  }
}
