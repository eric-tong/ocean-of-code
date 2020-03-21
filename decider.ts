export function decideActions(
  actionErrors: { action: Action; errors: Errors }[]
) {
  const actions: Action[] = [];
  const minErrorAction = getMinErrorAction(actionErrors);

  if (minErrorAction) {
    actions.push(minErrorAction);
  } else {
    actions.push({ type: "SURFACE" });
  }
  return actions;
}

function getMinErrorAction(actionErrors: { action: Action; errors: Errors }[]) {
  let minError = Number.MAX_SAFE_INTEGER;
  let minErrorAction: Action | undefined;
  for (const {
    action,
    errors: { mse }
  } of actionErrors) {
    const error = mse;
    if (error < minError) {
      minError = error;
      minErrorAction = action;
    }
  }
  return minErrorAction;
}
