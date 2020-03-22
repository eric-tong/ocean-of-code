export function getOppCells(map: CellMap) {
  const oppCells = new Set<Cell>();
  map.forEach(column =>
    column.forEach(cell => {
      if (cell) oppCells.add(cell);
    })
  );
  return oppCells;
}
