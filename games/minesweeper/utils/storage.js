const STORAGE_KEY = 'minesweeper_best_scores';

export function getBestScores() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : { EASY: null, MEDIUM: null, HARD: null };
}

export function saveBestScore(difficultyKey, seconds) {
  const scores = getBestScores();
  if (scores[difficultyKey] === null || seconds < scores[difficultyKey]) {
    scores[difficultyKey] = seconds;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
    return true;
  }
  return false;
}
