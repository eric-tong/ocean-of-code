export function decideActions(
  actionErrors: { action: Action; errors: Errors }[]
) {
  const actionTotalErrors = actionErrors
    .map(({ action, errors }) => ({
      action,
      totalError: getTotalError(errors)
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

function getTotalError({
  mse = Number.MAX_SAFE_INTEGER,
  mseGain = 0,
  oppHealth = 0,
  myDamage = 0,
  oppKnowledgeGain = 0,
  myKnowledgeLoss = 0
}: Errors) {
  const IDEAL_MSE = 9;
  const idealMseError = mse < IDEAL_MSE ? IDEAL_MSE - mse : 0;
  return (
    idealMseError +
    mseGain +
    oppHealth * 30 +
    myDamage * 30 +
    oppKnowledgeGain +
    myKnowledgeLoss
  );
}
