export function decideActions(
  actionErrors: { action: Action; errors: Errors }[]
) {
  const actions: Action[] = [];

  // TODO Allow action combinations if beneficial
  const minErrorAction = getMinErrorAction(actionErrors);
  if (!minErrorAction) throw Error("No action returned");

  if (minErrorAction) {
    actions.push(minErrorAction);
  }
  return actions;
}

function getMinErrorAction(actionErrors: { action: Action; errors: Errors }[]) {
  let minError = Number.MAX_SAFE_INTEGER;
  let minErrorAction: Action | undefined;
  for (const { action, errors } of actionErrors) {
    const totalError = getTotalError(errors);
    if (totalError < minError) {
      minError = totalError;
      minErrorAction = action;
    }
  }
  return minErrorAction;
}

function getTotalError({
  mseGain = 0,
  oppHealth = 0,
  myDamage = 0,
  oppKnowledgeGain = 0
}: Errors) {
  return mseGain + oppHealth * 10 + myDamage * 10 + oppKnowledgeGain;
}
