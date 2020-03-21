export function decideActions(
  directionErrors: { direction: Direction; errors: Errors }[]
) {
  const actions: Action[] = [];
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
  return actions;
}

function getMinErrorDirection(
  directionErrors: { direction: Direction; errors: Errors }[]
) {
  let minError = Number.MAX_SAFE_INTEGER;
  let minErrorDirection: Direction | undefined;
  for (const {
    direction,
    errors: { mse }
  } of directionErrors) {
    const error = mse;
    if (error < minError) {
      minError = error;
      minErrorDirection = direction;
    }
  }
  return minErrorDirection;
}
