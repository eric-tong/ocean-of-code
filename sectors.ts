import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from "./constants";

import { getCoords } from "./map";

export function getSector(
  cell: Cell,
  width: number = DEFAULT_WIDTH,
  height: number = DEFAULT_HEIGHT
) {
  const coords = getCoords(cell);
  const sectorWidth = width / 3;
  const sectorHeight = height / 3;

  const sectorCoords = {
    x: Math.floor(coords.x / sectorWidth),
    y: Math.floor(coords.y / sectorHeight)
  };
  return 1 + sectorCoords.x + sectorCoords.y * 3;
}

export function getCellsInSector(sector: number, map: CellMap) {
  const sectorWidth = map.length / 3;
  const sectorHeight = map[0].length / 3;

  const cellsInSector = new Set<Cell>();
  const sectorCoords = { x: (sector - 1) % 3, y: Math.floor((sector - 1) / 3) };
  const sectorLeftTopCoords = {
    x: sectorCoords.x * sectorWidth,
    y: sectorCoords.y * sectorHeight
  };

  for (
    let x = sectorLeftTopCoords.x;
    x < sectorLeftTopCoords.x + sectorWidth;
    x++
  ) {
    for (
      let y = sectorLeftTopCoords.y;
      y < sectorLeftTopCoords.y + sectorHeight;
      y++
    ) {
      const cell = map[x][y];
      if (cell) cellsInSector.add(cell);
    }
  }
  return cellsInSector;
}
