export default class TriggerAction implements Action {
  readonly type = "TRIGGER";
  toActionString(): string {
    throw new Error("Method not implemented.");
  }
  fromActionString(params: string[], map: CellMap, prevCell: Cell): Action {
    return new TriggerAction();
  }
  getErrors(params: GetErrorsParams): Errors {
    throw new Error("Method not implemented.");
  }
  getNewPossibleCells(oldCells: Set<Cell>): Set<Cell> {
    return oldCells;
  }
  getValidActions(params: GetValidActionsParams): Action[] {
    return [];
  }
  updateCounts(charges: Charges, record: MovementRecord, myCell: Cell): void {
    throw new Error("Method not implemented.");
  }
}
