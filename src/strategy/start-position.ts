export function getStartPosition(map: CellMap): Coords {
  const x = Math.floor(Math.random() * map[0].length);
  const y = Math.floor(Math.random() * map.length);
  if (!map[x][y]) return getStartPosition(map);
  else return { x, y };
}
