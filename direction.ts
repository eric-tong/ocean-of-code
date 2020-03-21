import { DIRECTIONS } from "./constants";
import { getMeanSquaredError } from "./cell-utils";

export function getMinErrorDirection(
  origin: (Cell | undefined)[],
  testCells: Cell[],
  invalidCells: Set<Cell>
) {
  let minError = Number.MAX_SAFE_INTEGER;
  let minErrorDirection: Direction | undefined;
  origin.forEach((neighbor, directionIndex) => {
    if (!neighbor || invalidCells.has(neighbor)) return;
    const error = getMeanSquaredError(neighbor, testCells);
    if (error < minError) {
      minError = error;
      minErrorDirection = DIRECTIONS[directionIndex];
    }
  });
  return minErrorDirection;
}
