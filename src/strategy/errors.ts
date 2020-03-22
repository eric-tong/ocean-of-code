import { DIRECTIONS, MAX_CHARGE } from ".././mechanics/constants";
import { getSector, uniqueSectors } from "../mechanics/sectors";

import { getMeanSquaredError } from "../utils/cell-utils";
import { getPossibleCells } from "./possible-cells";

type Params = {
  myCell: Cell;
  myCells: Set<Cell>;
  oppCells: Set<Cell>;
  map: CellMap;
};

export function getErrors(
  action: Action,
  { myCell, myCells, oppCells, map }: Params
): Errors {
  const params = { myCell, myCells, oppCells, map };
  switch (action.type) {
    case "MOVE":
    case "TORPEDO":
    case "SURFACE":
    case "SONAR":
      return action.getErrors(params);

    default:
      throw new Error("Invalid action for finding error");
  }
}
