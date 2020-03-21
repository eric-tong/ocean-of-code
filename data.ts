import { parseBase10 } from "./math-utils";

export function getData() {
  // @ts-ignore
  const numericalData: number[] = readline()
    .split(" ")
    .map(parseBase10);
  const [
    x,
    y,
    myLife,
    oppLife,
    torpedoCooldown,
    sonarCooldown,
    silenceCooldown,
    mineCooldown
  ] = numericalData;
  // @ts-ignore
  const sonarResult: string = readline();
  // @ts-ignore
  const oppOrders: string = readline();

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
