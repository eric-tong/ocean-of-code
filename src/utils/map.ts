const cellToCoords = new Map<Cell, Coords>();

export function getMap(width: number, height: number) {
  const map: CellMap = Array.from({ length: width }, () =>
    Array.from({ length: height }, () => undefined)
  );
  for (let y = 0; y < height; y++) {
    // @ts-ignore
    readline()
      .split("")
      .forEach((char: string, x: number) => {
        if (char === ".") {
          const cell: Cell = [undefined, undefined, undefined, undefined];
          map[x][y] = cell;
          cellToCoords.set(cell, { x, y });
        }
      });
  }

  map.forEach((column, x) =>
    column.forEach((cell, y) => {
      if (!cell) return;
      if (y > 0 && map[x][y - 1]) cell[0] = map[x][y - 1];
      if (x < width - 1 && map[x + 1][y]) cell[1] = map[x + 1][y];
      if (y < height - 1 && map[x][y + 1]) cell[2] = map[x][y + 1];
      if (x > 0 && map[x - 1][y]) cell[3] = map[x - 1][y];
    })
  );
  return map;
}

export function getCoords(cell: Cell) {
  const coords = cellToCoords.get(cell);
  if (!coords) throw new Error("No coords found");
  return coords;
}
