document.addEventListener('DOMContentLoaded', () => {
    const baseUrl = 'https://sugoku.onrender.com/board';
    const sudokuGrid = document.querySelector('.sudoku_grid');
    const solveButton = document.getElementById('SolvePuzzle');
    const trySolvingButton = document.getElementById('TrySolving');
    const timerDisplay = document.getElementById('timer');
    let timerInterval;
    let startTime;
    let isSolving = false;

    let solvebuttonclick = false;
    let initialBoard = []; // To keep track of initial puzzle

    let globalintial = [];
   
    // Prewarm the API when the page loads
    const prewarmApi = () => {
        fetch(`${baseUrl}?difficulty=easy`)
            .then(response => response.json())
            .then(data => {
               //console.log('API warmed up', data);
               
            })
            .catch(err => console.log('Error warming up API:', err));
    };

    const startTimer = () => {
        startTime = Date.now();
        timerInterval = setInterval(() => {
            const elapsedTime = Date.now() - startTime;
            const minutes = String(Math.floor(elapsedTime / 60000)).padStart(2, '0');
            const seconds = String(Math.floor((elapsedTime % 60000) / 1000)).padStart(2, '0');
            timerDisplay.textContent = `${minutes}:${seconds}`;
        }, 1000);
    };

    const stopTimer = () => {
        clearInterval(timerInterval);
    };

    const resetTimer = () => {
        stopTimer();
        timerDisplay.textContent = '00:00';
    };

    const celebrateCompletion = () => {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        confetti.textContent = 'Puzzle is Solved!';
        document.body.appendChild(confetti);

        setTimeout(() => {
            document.body.removeChild(confetti);
        }, 3000);
    };

    const fetchSudoku = (difficulty) => {
        let url = `${baseUrl}?difficulty=${difficulty}`;
        fetch(url)
            .then(response => response.json())
            .then(data => {
                initialBoard = data.board;
                
                globalintial = initialBoard;
                populateGrid(initialBoard);
            })
            .catch(error => console.error('Error fetching Sudoku puzzle:', error));
    };
   
    
    const populateGrid = (board) => {
        sudokuGrid.innerHTML = '';

        board.forEach((row, rowIndex) => {
            row.forEach((cell, cellIndex) => {
                const boxClass = `box${Math.floor(rowIndex / 3) * 3 + Math.floor(cellIndex / 3) + 1}`;
                const cellDiv = document.createElement('div');
                cellDiv.classList.add(boxClass);

                if (rowIndex % 3 === 0) cellDiv.classList.add('bt');
                if (cellIndex % 3 === 0) cellDiv.classList.add('bl');
                if (rowIndex % 3 === 2) cellDiv.classList.add('bb');
                if (cellIndex % 3 === 2) cellDiv.classList.add('br');

                cellDiv.textContent = cell !== 0 ? cell : '';

                if (cell !== 0 && !globalintial[rowIndex][cellIndex] == 0) {
                    cellDiv.classList.add('pre-filled');
                    cellDiv.style.color = 'blue';
                } else {
                    cellDiv.setAttribute('contenteditable', 'true');
                    cellDiv.classList.add('editable');
                    cellDiv.addEventListener('input', () => validateInput(cellDiv, rowIndex, cellIndex, board));
                }

                sudokuGrid.appendChild(cellDiv);
            });
        });
    };
    //inital configuration before setting difficulty
    initialBoard = [[0,1,0,0,0,0,6,0,0],[0,0,0,0,0,0,3,0,8],[0,8,0,3,4,0,1,0,5],[0,0,3,0,5,7,0,6,9],[4,0,0,0,9,0,0,1,3],[8,0,0,6,0,0,0,5,4],[5,3,0,7,0,4,0,0,2],[6,4,0,9,0,2,5,0,1],[0,7,0,0,8,0,4,0,0]];
                
    globalintial = initialBoard;
    populateGrid(initialBoard);
    const checkIfPuzzleIsSolved = (board) => {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (board[row][col] === 0 || !isboardSafe(board, row, col, board[row][col])) {
                    return false;
                }
            }
        }
        return true;
    };

    const validateInput = (cellDiv, rowIndex, cellIndex, board) => {
        const value = cellDiv.textContent.trim();

        if (!isSolving) {
            cellDiv.textContent = '';
            cellDiv.style.backgroundColor = '';
            return;
        }

        if (value === '') {
            cellDiv.style.backgroundColor = '';
            board[rowIndex][cellIndex] = 0;
            return;
        }

        const num = parseInt(value, 10);
        board[rowIndex][cellIndex] = num;

        if (isNaN(num) || num < 1 || num > 9) {
            cellDiv.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
        } else {
            const isValid = isboardSafe(board, rowIndex, cellIndex, num);
            if (isValid) {
                cellDiv.style.backgroundColor = '';
                if (checkIfPuzzleIsSolved(board)) {
                    stopTimer();
                    celebrateCompletion();
                    isSolving = false;
                }
            } else {
                cellDiv.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
            }
        }
    };

    const isSafe = (board, row, col, num) => {
        for (let x = 0; x < 9; x++) {
            if (board[row][x] === num) return false;
        }

        for (let x = 0; x < 9; x++) {
            if (board[x][col] === num) return false;
        }

        const startRow = row - row % 3;
        const startCol = col - col % 3;
        for (let r = startRow; r < startRow + 3; r++) {
            for (let d = startCol; d < startCol + 3; d++) {
                if (board[r][d] === num) return false;
            }
        }
        return true;
    };

    const isboardSafe = (board, row, col, num) => {
        for (let x = 0; x < 9; x++) {
            if (board[row][x] === num && x !== col) return false;
        }

        for (let x = 0; x < 9; x++) {
            if (board[x][col] === num && x !== row) return false;
        }

        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;
        for (let r = startRow; r < startRow + 3; r++) {
            for (let d = startCol; d < startCol + 3; d++) {
                if (board[r][d] === num && !(r === row && d === col)) return false;
            }
        }
        return true;
    };

    const solveSudoku = (board) => {
        const solve = () => {
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    if (board[row][col] === 0) {
                        for (let num = 1; num <= 9; num++) {
                            if (isSafe(board, row, col, num)) {
                                board[row][col] = num;
                                if (solve()) return true;
                                board[row][col] = 0;
                            }
                        }
                        return false;
                    }
                }
            }
            return true;
        };

        return solve();
    };

    const handleSolveClick = () => {
        const board = [];
        solvebuttonclick = true;
        let cells = Array.from(sudokuGrid.children);

        for (let i = 0; i < 9; i++) {
            let row = [];
            for (let j = 0; j < 9; j++) {
                const cell = cells[i * 9 + j];
                const value = parseInt(cell.textContent.trim(), 10);
                row.push(isNaN(value) ? 0 : value);
            }
            board.push(row);
        }

        if (solveSudoku(board)) {
            populateGrid(board);
            stopTimer();
            celebrateCompletion();
        } else {
            alert('No solution exists');
        }
    };

    const handleTrySolvingClick = () => {
        resetTimer();
        startTimer();
        isSolving = true;
    };

    const handleDifficultyClick = (difficulty) => {
        fetchSudoku(difficulty);
        resetTimer();
        isSolving = false;
        solvebuttonclick = false;
    };

    document.getElementById('easy').addEventListener('click', () => handleDifficultyClick('easy'));
    document.getElementById('medium').addEventListener('click', () => handleDifficultyClick('medium'));
    document.getElementById('hard').addEventListener('click', () => handleDifficultyClick('hard'));
    document.getElementById('random').addEventListener('click', () => handleDifficultyClick('random'));

    solveButton.addEventListener('click', handleSolveClick);
    trySolvingButton.addEventListener('click', handleTrySolvingClick);

    prewarmApi(); // Call the prewarm function when the page loads
});

function navigateToDescription() {
    window.location.href = 'description.html';
}








  
  
  

  
  