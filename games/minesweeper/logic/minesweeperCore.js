export const DIFFICULTY_PRESETS = {
  EASY:   { cols: 9,  rows: 9,  mines: 15, label: '초급' },
  MEDIUM: { cols: 12, rows: 12, mines: 25, label: '중급' },
  HARD:   { cols: 15, rows: 15, mines: 45, label: '상급' },
};

export class MinesweeperGame {
  constructor(difficulty = DIFFICULTY_PRESETS.EASY) {
    this.setDifficulty(difficulty);
  }

  setDifficulty(preset) {
    this.cols = preset.cols;
    this.rows = preset.rows;
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

  // 100% 정통 지뢰찾기 생성 알고리즘:
  // 첫 클릭 셀 주변 3x3은 지뢰 제외 (neighborMines === 0 보장하여 1개 타일만 파이는 현상 방지)
  // 나머지 지뢰는 판 전체에 넓고 고르게 무작위 분산 배치
  generateMines(startRow, startCol) {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        this.board[r][c].isMine = false;
      }
    }

    const startAreaSet = new Set();
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = startRow + dr;
        const nc = startCol + dc;
        if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
          startAreaSet.add(`${nr},${nc}`);
        }
      }
    }

    const validPositions = [];
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (!startAreaSet.has(`${r},${c}`)) {
          validPositions.push([r, c]);
        }
      }
    }

    // 셔플 알고리즘으로 지뢰를 보드 전체에 넓고 고르게 분산
    for (let i = validPositions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [validPositions[i], validPositions[j]] = [validPositions[j], validPositions[i]];
    }

    for (let i = 0; i < this.totalMines && i < validPositions.length; i++) {
      const [r, c] = validPositions[i];
      this.board[r][c].isMine = true;
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

  // 100% 정통 지뢰찾기 표준 연쇄 오픈 로직 (인위적인 파기 조작 코드 완전 제거)
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

    // 0 연쇄 터짐 (자연스러운 0 탐색 및 주변 숫자가 경계를 형성하며 멈춤)
    if (cell.neighborMines === 0) {
      const queue = [[r, c]];
      while (queue.length > 0) {
        const [cr, cc] = queue.shift();
        const neighbors = this.getNeighbors(cr, cc);

        for (const [nr, nc] of neighbors) {
          const neighbor = this.board[nr][nc];
          if (!neighbor.isRevealed && !neighbor.isFlagged) {
            neighbor.isRevealed = true;
            this.revealedCount++;

            if (neighbor.neighborMines === 0) {
              queue.push([nr, nc]);
            }
          }
        }
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
