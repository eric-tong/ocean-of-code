import { parseBase10 } from "./math-utils";

export function getData() {
  const [
    x,
    y,
    myLife,
    oppLife,
    torpedoCooldown,
    sonarCooldown,
    silenceCooldown,
    mineCooldown
    // @ts-ignore
  ] = readline()
    .split(" ")
    .map(parseBase10);
  // @ts-ignore
  const sonarResult = readline();
  // @ts-ignore
  const oppOrders = readline();

  return {
    x,
    y,
    myLife,
    oppLife,
    torpedoCooldown,
    sonarCooldown,
    silenceCooldown,
    mineCooldown,
    sonarResult,
    oppOrders
  };
}
