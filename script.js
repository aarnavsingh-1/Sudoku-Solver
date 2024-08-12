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
let globalintial=[];
    const fetchSudoku = (difficulty) => {
        let url = `${baseUrl}?difficulty=${difficulty}`;
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                initialBoard = data.board;
                 // Store the initial puzzle
               globalintial=initialBoard;
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

                // Apply styling based on whether the cell was pre-filled or a solution
                if (cell !== 0 && !globalintial[rowIndex][cellIndex]==0) {
                    cellDiv.classList.add('pre-filled');
                     // Add a class for pre-filled cells
                    cellDiv.style.color = 'blue'; // Change color for pre-filled cells
                } else {
                    cellDiv.setAttribute('contenteditable', 'true');
                    cellDiv.classList.add('editable');
                    cellDiv.addEventListener('input', () => validateInput(cellDiv, rowIndex, cellIndex, board));
                }

                sudokuGrid.appendChild(cellDiv);
            });
        });
    };
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
        
        // Check if solving mode is enabled
        if (!isSolving) {
            cellDiv.textContent = '';
            cellDiv.style.backgroundColor = ''; 
            // Reset color when editing is disabled
            
            return;
        }

        // Check if the input is empty
        if (value === '') {
            cellDiv.style.backgroundColor = '';
            board[rowIndex][cellIndex]=0;
            
            return;
        }

        // Validate numeric input
        const num = parseInt(value, 10);
        board[rowIndex][cellIndex]=num;
       // console.log(board[rowIndex][cellIndex]);
        
        if (isNaN(num) || num < 1 || num > 9) {
            cellDiv.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
            
        } else {
            const isValid = isboardSafe(board, rowIndex, cellIndex, num);
            if (isValid) {
                cellDiv.style.backgroundColor = '';
                if (checkIfPuzzleIsSolved(board)) {
                    stopTimer();  // Stop the timer
                    celebrateCompletion();  // Trigger celebration
                    isSolving = false;  // Disable further editing
                }
                
                
            } else {
                cellDiv.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
            }
        }
        
        
    };

    const isSafe = (board, row, col, num) => {
        for (let x = 0; x < 9; x++) {
            if (board[row][x] === num ) return false;
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
            if (board[row][x] === num && x!==col ) return false;
        }

        for (let x = 0; x < 9; x++) {
            if (board[x][col] === num && x!==row) return false;
        }

        const startRow = Math.floor(row/3)*3;
        const startCol = Math.floor(col/3)*3;
        for (let r = startRow; r < (startRow + 3); r++) {
            for (let d = startCol; d < (startCol + 3); d++) {
                if (board[r][d] === num && !(r===row && d===col)) return false;
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
            populateGrid(board); // Ensure grid is populated with correct colors
            stopTimer(); // Ensure timer stops when solved
            celebrateCompletion(); 
          // if(isboardSafe)console.log('done');
           
            
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
       
        solvebuttonclick = false; // Reset flag for new puzzle
    };

    document.getElementById('easy').addEventListener('click', () => handleDifficultyClick('easy'));
    document.getElementById('medium').addEventListener('click', () => handleDifficultyClick('medium'));
    document.getElementById('hard').addEventListener('click', () => handleDifficultyClick('hard'));
    document.getElementById('random').addEventListener('click', () => handleDifficultyClick('random'));

    if (solveButton) {
        solveButton.addEventListener('click', handleSolveClick);
    }

    if (trySolvingButton) {
        trySolvingButton.addEventListener('click', handleTrySolvingClick);
    }
});

function navigateToDescription() {
    window.location.href = 'description.html';
}









  
  
  

  
  