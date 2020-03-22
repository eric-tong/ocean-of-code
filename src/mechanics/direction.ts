import { DIRECTIONS } from "./constants";

export function getValidDirections(origin: Cell, invalidCells: Set<Cell>) {
  const directions: Direction[] = [];
  origin.forEach((neighbor, directionIndex) => {
    if (!neighbor || invalidCells.has(neighbor)) return;

    const direction = DIRECTIONS[directionIndex];
    directions.push(direction);
  });
  return directions;
}
