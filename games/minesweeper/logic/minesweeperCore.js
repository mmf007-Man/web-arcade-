export const DIFFICULTY_PRESETS = {
  EASY: { rows: 9, cols: 9, mines: 10, label: '초급' },
  MEDIUM: { rows: 16, cols: 16, mines: 40, label: '중급' },
  HARD: { rows: 16, cols: 30, mines: 99, label: '상급' }
};

export class MinesweeperGame {
  constructor(difficulty = DIFFICULTY_PRESETS.EASY) {
    this.setDifficulty(difficulty);
  }

  setDifficulty(preset) {
    this.rows = preset.rows;
    this.cols = preset.cols;
    this.totalMines = preset.mines;
    this.reset();
  }

  reset() {
    this.board = Array.from({ length: this.rows }, () =>
      Array.from({ length: this.cols }, () => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0
      }))
    );
    this.isFirstClick = true;
    this.isGameOver = false;
    this.isWin = false;
    this.flagCount = 0;
    this.revealedCount = 0;
  }

  generateMines(startRow, startCol) {
    let minesPlaced = 0;
    while (minesPlaced < this.totalMines) {
      const r = Math.floor(Math.random() * this.rows);
      const c = Math.floor(Math.random() * this.cols);

      const isStartArea = Math.abs(r - startRow) <= 1 && Math.abs(c - startCol) <= 1;

      if (!this.board[r][c].isMine && !isStartArea) {
        this.board[r][c].isMine = true;
        minesPlaced++;
      }
    }

    this.calculateNeighbors();
  }

  calculateNeighbors() {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.board[r][c].isMine) continue;
        let count = 0;
        this.getNeighbors(r, c).forEach(([nr, nc]) => {
          if (this.board[nr][nc].isMine) count++;
        });
        this.board[r][c].neighborMines = count;
      }
    }
  }

  getNeighbors(r, c) {
    const neighbors = [];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
          neighbors.push([nr, nc]);
        }
      }
    }
    return neighbors;
  }

  revealCell(r, c) {
    if (this.isGameOver || this.board[r][c].isFlagged || this.board[r][c].isRevealed) {
      return false;
    }

    if (this.isFirstClick) {
      this.generateMines(r, c);
      this.isFirstClick = false;
    }

    const cell = this.board[r][c];
    cell.isRevealed = true;
    this.revealedCount++;

    if (cell.isMine) {
      this.isGameOver = true;
      this.isWin = false;
      this.revealAllMines();
      return true;
    }

    if (cell.neighborMines === 0) {
      const queue = [[r, c]];
      while (queue.length > 0) {
        const [cr, cc] = queue.shift();
        this.getNeighbors(cr, cc).forEach(([nr, nc]) => {
          const neighbor = this.board[nr][nc];
          if (!neighbor.isRevealed && !neighbor.isFlagged) {
            neighbor.isRevealed = true;
            this.revealedCount++;
            if (neighbor.neighborMines === 0) {
              queue.push([nr, nc]);
            }
          }
        });
      }
    }

    this.checkWinCondition();
    return true;
  }

  toggleFlag(r, c) {
    if (this.isGameOver || this.board[r][c].isRevealed) return;

    const cell = this.board[r][c];
    if (!cell.isFlagged && this.flagCount >= this.totalMines) return;

    cell.isFlagged = !cell.isFlagged;
    this.flagCount += cell.isFlagged ? 1 : -1;
  }

  revealAllMines() {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.board[r][c].isMine) {
          this.board[r][c].isRevealed = true;
        }
      }
    }
  }

  checkWinCondition() {
    const totalNonMineCells = this.rows * this.cols - this.totalMines;
    if (this.revealedCount === totalNonMineCells) {
      this.isGameOver = true;
      this.isWin = true;
    }
  }
}
