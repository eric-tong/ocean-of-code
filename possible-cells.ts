import { DIRECTIONS } from "./constants";

export function updatePossibleCells(set: Set<Cell>, action: Action) {
  const newCells: Cell[] = [];
  const oldCells = Array.from(set.values());
  switch (action.type) {
    case "MOVE":
      const directionIndex = DIRECTIONS.indexOf(action.direction);
      oldCells.forEach(cell => {
        const newCell = cell[directionIndex];
        if (newCell) newCells.push(newCell);
      });
      break;
  }
  set.clear();
  newCells.forEach(cell => set.add(cell));
}
