import { DIRECTIONS } from "./constants";
import { getMeanSquaredError } from "./cell-utils";

type Params = {
  myCell: Cell;
  oppCells: Set<Cell>;
  validDirections: Direction[];
};
type Error = { mse: number };
type DirectionError = { direction: Direction; error: Error };

export function decideActions({ myCell, oppCells, validDirections }: Params) {
  const actions: Action[] = [];

  const directionErrors = validDirections.map(direction => ({
    direction,
    error: getError(direction)
  }));
  const minErrorDirection = getMinErrorDirection(directionErrors);

  if (minErrorDirection) {
    actions.push({
      type: "MOVE",
      direction: minErrorDirection,
      charge: "TORPEDO"
    });
  } else {
    actions.push({ type: "SURFACE" });
  }

  console.error(directionErrors);
  return actions;

  function getError(direction: Direction) {
    const directionIndex = DIRECTIONS.indexOf(direction);
    const testCell = myCell[directionIndex];
    if (!testCell) throw new Error("Invalid test cell");

    const mse = getMeanSquaredError(testCell, Array.from(oppCells.values()));
    return { mse };
  }
}

function getMinErrorDirection(directionErrors: DirectionError[]) {
  let minError = Number.MAX_SAFE_INTEGER;
  let minErrorDirection: Direction | undefined;
  for (const {
    direction,
    error: { mse }
  } of directionErrors) {
    const error = mse;
    if (error < minError) {
      minErrorDirection = direction;
    }
  }
  return minErrorDirection;
}
