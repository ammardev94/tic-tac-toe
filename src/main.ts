import './style.css';

type Mark = 'X' | 'O';
type Cell = Mark | null;
interface Scores { X: number; O: number; draws: number; }

const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
] as const;

const board = document.querySelector<HTMLElement>('#board')!;
const status = document.querySelector<HTMLElement>('#game-status')!;
const scoreElements = {
  X: document.querySelector<HTMLElement>('#x-score')!,
  O: document.querySelector<HTMLElement>('#o-score')!,
  draws: document.querySelector<HTMLElement>('#draw-score')!,
};
const newRoundButton = document.querySelector<HTMLButtonElement>('#new-round')!;
const resetScoresButton = document.querySelector<HTMLButtonElement>('#reset-scores')!;

let cells: Cell[] = Array(9).fill(null);
let currentPlayer: Mark = 'X';
let gameOver = false;
let scores: Scores = { X: 0, O: 0, draws: 0 };

function winner(): { mark: Mark; line: readonly number[] } | null {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) return { mark: cells[a], line };
  }
  return null;
}

function render(): void {
  board.innerHTML = '';
  const winningLine = winner()?.line ?? [];
  cells.forEach((cell, index) => {
    const button = document.createElement('button');
    button.className = 'cell ' + (cell ? 'mark-' + cell.toLowerCase() : '') + ' ' + (winningLine.includes(index) ? 'winning-cell' : '');
    button.type = 'button';
    button.dataset.index = String(index);
    button.setAttribute('aria-label', cell ? 'Cell ' + (index + 1) + ': ' + cell : 'Cell ' + (index + 1) + ': empty');
    button.disabled = gameOver || cell !== null;
    button.textContent = cell ?? '';
    board.append(button);
  });
  scoreElements.X.textContent = String(scores.X);
  scoreElements.O.textContent = String(scores.O);
  scoreElements.draws.textContent = String(scores.draws);
}

function endRound(): void {
  const result = winner();
  gameOver = true;
  if (result) { scores[result.mark] += 1; status.textContent = 'Player ' + result.mark + ' wins this round!'; }
  else { scores.draws += 1; status.textContent = "It's a draw!"; }
  render();
}

function play(index: number): void {
  if (gameOver || cells[index]) return;
  cells[index] = currentPlayer;
  if (winner() || cells.every(Boolean)) { endRound(); return; }
  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  status.textContent = 'Player ' + currentPlayer + ', your turn';
  render();
}

function newRound(): void {
  cells = Array(9).fill(null); currentPlayer = 'X'; gameOver = false;
  status.textContent = 'Player X, your turn'; render();
}

board.addEventListener('click', (event) => {
  const target = event.target as HTMLButtonElement;
  if (target.matches('.cell')) play(Number(target.dataset.index));
});
newRoundButton.addEventListener('click', newRound);
resetScoresButton.addEventListener('click', () => { scores = { X: 0, O: 0, draws: 0 }; newRound(); });
render();
