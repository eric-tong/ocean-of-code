import { DIRECTIONS } from "./constants";
import { getMeanSquaredError } from "./cell-utils";

type Params = {
  myCell: Cell;
  oppCells: Set<Cell>;
};

export function getErrors(direction: Direction, { myCell, oppCells }: Params) {
  const directionIndex = DIRECTIONS.indexOf(direction);
  const testCell = myCell[directionIndex];
  if (!testCell) throw new Error("Invalid test cell");

  const mse = getMeanSquaredError(testCell, Array.from(oppCells.values()));
  return { mse };
}
