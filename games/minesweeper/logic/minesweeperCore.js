// 난이도는 지뢰 밀도(비율)만 정의 - 그리드 크기는 화면에 맞춰 동적 계산
export const DIFFICULTY_PRESETS = {
  EASY:   { density: 0.10, label: '초급', mines: null }, // 10% 지뢰
  MEDIUM: { density: 0.24, label: '중급', mines: null }, // 24% 지뢰
  HARD:   { density: 0.40, label: '상급', mines: null }, // 40% 지뢰
};

export class MinesweeperGame {
  constructor(difficulty = DIFFICULTY_PRESETS.EASY) {
    this.rows = 9;
    this.cols = 9;
    this.totalMines = 8;
    this.density = difficulty.density;
    this.reset();
  }

  // 실제 화면 공간을 받아 자동으로 업데이트
  applyGrid(cols, rows) {
    this.cols = cols;
    this.rows = rows;
    this.totalMines = Math.max(1, Math.floor(cols * rows * this.density));
  }

  setDifficulty(preset) {
    this.density = preset.density;
    // rows/cols/mines는 applyGrid()로 설정되므로 여기선 density만 저장
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
