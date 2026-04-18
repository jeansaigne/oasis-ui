export interface MazeCell {
  x: number
  y: number
  walls: { top: boolean; right: boolean; bottom: boolean; left: boolean }
  visited: boolean
}

export interface MazeData {
  width: number
  height: number
  grid: MazeCell[][]
  start: { x: number; y: number }
  exit: { x: number; y: number }
  key: { x: number; y: number }
}

function createGrid(w: number, h: number): MazeCell[][] {
  const grid: MazeCell[][] = []
  for (let y = 0; y < h; y++) {
    const row: MazeCell[] = []
    for (let x = 0; x < w; x++) {
      row.push({ x, y, walls: { top: true, right: true, bottom: true, left: true }, visited: false })
    }
    grid.push(row)
  }
  return grid
}

function getNeighbors(cell: MazeCell, grid: MazeCell[][], w: number, h: number): MazeCell[] {
  const { x, y } = cell
  const neighbors: MazeCell[] = []
  if (y > 0) neighbors.push(grid[y - 1]![x]!)
  if (x < w - 1) neighbors.push(grid[y]![x + 1]!)
  if (y < h - 1) neighbors.push(grid[y + 1]![x]!)
  if (x > 0) neighbors.push(grid[y]![x - 1]!)
  return neighbors
}

function removeWalls(a: MazeCell, b: MazeCell) {
  const dx = b.x - a.x
  const dy = b.y - a.y
  if (dx === 1) { a.walls.right = false; b.walls.left = false }
  if (dx === -1) { a.walls.left = false; b.walls.right = false }
  if (dy === 1) { a.walls.bottom = false; b.walls.top = false }
  if (dy === -1) { a.walls.top = false; b.walls.bottom = false }
}

function manhattan(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
}

export function generateMaze(w: number, h: number): MazeData {
  const grid = createGrid(w, h)

  // Recursive backtracker
  const stack: MazeCell[] = []
  const start = grid[0]![0]!
  start.visited = true
  stack.push(start)

  while (stack.length > 0) {
    const current = stack[stack.length - 1]!
    const unvisited = getNeighbors(current, grid, w, h).filter(n => !n.visited)

    if (unvisited.length > 0) {
      const next = unvisited[Math.floor(Math.random() * unvisited.length)]!
      removeWalls(current, next)
      next.visited = true
      stack.push(next)
    } else {
      stack.pop()
    }
  }

  const startPos = { x: 0, y: 0 }
  const exitPos = { x: w - 1, y: h - 1 }

  // Place key far enough from start (at least 40% of max distance)
  const minKeyDist = Math.floor((w + h) * 0.4)
  let keyPos = { x: Math.floor(w / 2), y: Math.floor(h / 2) }
  const candidates: { x: number; y: number }[] = []
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (manhattan({ x, y }, startPos) >= minKeyDist && !(x === exitPos.x && y === exitPos.y)) {
        candidates.push({ x, y })
      }
    }
  }
  if (candidates.length > 0) {
    keyPos = candidates[Math.floor(Math.random() * candidates.length)]!
  }

  return { width: w, height: h, grid, start: startPos, exit: exitPos, key: keyPos }
}

export function canMove(maze: MazeData, from: { x: number; y: number }, dir: 'up' | 'down' | 'left' | 'right'): boolean {
  const cell = maze.grid[from.y]?.[from.x]
  if (!cell) return false
  return !cell.walls[dir === 'up' ? 'top' : dir === 'down' ? 'bottom' : dir]
}

export function movePos(pos: { x: number; y: number }, dir: 'up' | 'down' | 'left' | 'right'): { x: number; y: number } {
  switch (dir) {
    case 'up': return { x: pos.x, y: pos.y - 1 }
    case 'down': return { x: pos.x, y: pos.y + 1 }
    case 'left': return { x: pos.x - 1, y: pos.y }
    case 'right': return { x: pos.x + 1, y: pos.y }
  }
}

