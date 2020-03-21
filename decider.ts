export function decideActions(
  actionErrors: { action: Action; errors: Errors }[]
) {
  const actions: Action[] = [];
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
  for (const {
    action,
    errors: { mse, oppKnowledge }
  } of actionErrors) {
    const error = mse + oppKnowledge;
    if (error < minError) {
      minError = error;
      minErrorAction = action;
    }
  }
  return minErrorAction;
}
