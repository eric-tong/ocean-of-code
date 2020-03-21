import { DIRECTIONS } from "./constants";
import { getMeanSquaredError } from "./cell-utils";

export function getDirectionErrors(
  origin: (Cell | undefined)[],
  testCells: Cell[],
  invalidCells: Set<Cell>
) {
  const directionErrors: DirectionError[] = [];
  origin.forEach((neighbor, directionIndex) => {
    if (!neighbor || invalidCells.has(neighbor)) return;
    const error = getMeanSquaredError(neighbor, testCells);
    const direction = DIRECTIONS[directionIndex];
    directionErrors.push({ direction, error });
  });
  return directionErrors;
}
