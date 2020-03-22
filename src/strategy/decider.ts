import { MAX_LIFE } from "../mechanics/constants";

type Params = {
  oppCells: Set<Cell>;
  myCells: Set<Cell>;
  oppLife: number;
  myLife: number;
};

export function decideActions(
  actionErrors: { action: Action; errors: Errors }[],
  params: Params
) {
  const actionTotalErrors = actionErrors
    .map(({ action, errors }) => ({
      action,
      totalError: getTotalError(errors, params)
    }))
    .sort((a, b) => a.totalError - b.totalError);
  console.error(actionTotalErrors);

  const firstActionError = actionTotalErrors.shift();
  if (!firstActionError) throw new Error("No available actions");

  // TODO Allow SILENCE and move
  const actions: Action[] = [firstActionError.action];
  if (actionTotalErrors.length > 1) {
    const secondActionTotalError = actionTotalErrors.find(
      ({ action, totalError }) => {
        if (firstActionError.action.type !== "SILENCE") {
          return action.type !== firstActionError.action.type && totalError < 0;
        } else {
          action.type !== firstActionError.action.type &&
            totalError < 0 &&
            action.type !== "MOVE";
        }
      }
    );
    if (secondActionTotalError) actions.push(secondActionTotalError.action);
  }

  return actions;
}

function getTotalError(
  {
    mse = Number.MAX_SAFE_INTEGER,
    mseGain = 0,
    oppHealth = 0,
    myDamage = 0,
    oppKnowledgeGain = 0,
    myKnowledgeLoss = 0
  }: Errors,
  { myCells, oppCells, oppLife, myLife }: Params
) {
  const IDEAL_MSE = 9;
  const idealMseError = mse < IDEAL_MSE ? IDEAL_MSE - mse : 0;

  const oppKnowledgeGainMultiplier = myCells.size < 20 ? 1 : 1 / myCells.size;
  const oppHealthMultiplier =
    MAX_LIFE - oppLife + 1 + (oppCells.size < 5 ? 10 : 0);
  const myHealthMultiplier = MAX_LIFE - myLife + 1;
  return (
    idealMseError +
    mseGain +
    oppHealth * oppHealthMultiplier * 10 +
    myDamage * myHealthMultiplier * 10 +
    oppKnowledgeGain * oppKnowledgeGainMultiplier +
    myKnowledgeLoss
  );
}
