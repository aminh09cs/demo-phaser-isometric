declare interface EasyStar {
  setGrid(grid: number[][], callback?: () => void): void;
  setAcceptableTiles(acceptableTiles: number[]): void;
  findPath(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    callback: (path: { x: number; y: number }[]) => void
  ): void;
  calculate(): void;
  avoidAdditionalPoint(x: number, y: number): void;
}
