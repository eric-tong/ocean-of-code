type Params = {
  directionErrors: DirectionError[];
};

export function decideActions(params: Params) {
  const actions: Action[] = [];

  const minError = Math.min(
    ...params.directionErrors.map(({ error }) => error)
  );
  const minDirectionError = params.directionErrors.find(
    ({ error }) => error === minError
  );

  if (minDirectionError) {
    actions.push({
      type: "MOVE",
      direction: minDirectionError.direction,
      charge: "TORPEDO"
    });
  } else {
    actions.push({ type: "SURFACE" });
  }

  return actions;
}
