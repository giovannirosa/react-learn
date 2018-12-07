import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';

function Square(props) {
	return (
		<button 
			className={props.winner ? "square-highlight" : "square"}
			onClick={() => props.onClick()}
		>
			{props.value}
		</button>
	);
}

class Board extends React.Component {
	renderSquare(i) {
		let win = this.props.winners && this.props.winners.includes(i);
		return (
			<Square 
				index={i}
				winner={win}
				value={this.props.squares[i]} 
				onClick={() => this.props.onClick(i)}
			/>
		);
	}

	createRow(cols) {
		let row = [];
		cols.forEach((c) => {
			row.push(<span key={c}>{this.renderSquare(c)}</span>);
		});
		return row;
	}

	createBoard() {
		let board = [];
		let cols = [0,1,2];
		for (let i = 0; i < 3; ++i) {
			board.push(
			<div key={i} className="board-row">
				{this.createRow(cols)}
			</div>
			);
			cols = cols.map(c => c + 3);
		}
		return board;
	}

	render() {
		return (
			<div>
				{this.createBoard()}
			</div>
		);
	}
}

class Game extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			history: [{
				squares: Array(9).fill(null),
			}],
			stepNumber: 0,
			xIsNext: true,
			bold: -1,
			ascending: true,
		}	
	}

	handleClick(i) {
		const history = this.state.history.slice(0, this.state.stepNumber + 1);
		const current = history[history.length - 1];
		const squares = current.squares.slice();
		if (calculateWinner(squares) || squares[i]) {
			return;
		}
		squares[i] = this.state.xIsNext ? 'X' : 'O';
		this.setState({
			history: history.concat([{
				squares: squares,
			}]),
			stepNumber: history.length,
			xIsNext: !this.state.xIsNext,
			bold: -1,
		});
	}

	jumpTo(step) {
		this.setState({
			stepNumber: step,
			xIsNext: (step % 2) === 0,
			bold: step,
		});
	}

	render() {
		const history = this.state.history;
		const current = history[this.state.stepNumber];
		const winner = calculateWinner(current.squares);

		let moves = history.map((step,move) => {
			let colRow = [];
			if (move > 0) {
				let previous = history[move - 1].squares;
				let actual = history[move].squares;
				let diff = findDiffIndex(actual,previous);
				let row = Math.floor(diff/3);
				let col = diff-3*row;
				colRow = [col,row];
			}
			const desc = move ?
				'Go to move #' + move + " (" + colRow + ")":
				'Go to game start';
			let weight = "normal";
			if (move===this.state.bold) {
				weight = "bold";
			}
			return (
				<li key={move}>
					<button style={{fontWeight: weight}} onClick={() => this.jumpTo(move)}>{desc}</button>
				</li>
			);
		});

		let sort = "Ascending";
		if (!this.state.ascending) {
			moves = moves.reverse();
			sort = "Descending";
		}
		
		let status;
		if (winner) {
			status = 'Winner: ' + current.squares[winner[0]];
		} else if (isAllSquaresFilled(current.squares) && !winner) {
			status = 'Draw!';
		} else {
			status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
		}

		return (
			<div className="game">
				<div className="game-board">
					<Board 
						winners={winner}
						squares={current.squares}
						onClick={(i) => this.handleClick(i)}
					/>
				</div>
				<div className="game-info">
					<div>{status}</div>
					<div><button onClick={() => this.setState({ascending: !this.state.ascending})}>{sort}</button></div>
					<ol>{moves}</ol>
				</div>
			</div>
		);
	}
}

function findDiffIndex(actual,previous) {
	let diff;
	for (let i = 0; i < actual.length; ++i) {
		if (actual[i] !== previous[i]) {
			diff = i;
		}
	}
	return diff;
}

function isAllSquaresFilled(squares) {
	for (let i = 0; i < squares.length; ++i) {
		if (!squares[i]) {
			return false;
		}
	}
	return true;
}

function calculateWinner(squares) {
	const lines = [
		[0, 1, 2],
		[3, 4, 5],
		[6, 7, 8],
		[0, 3, 6],
		[1, 4, 7],
		[2, 5, 8],
		[0, 4, 8],
		[2, 4, 6],
	];
	for (let i = 0; i < lines.length; ++i) {
		const [a, b, c] = lines[i];
		if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
			return [a,b,c];
		}
	}
	return null;
}

// ========================================

ReactDOM.render(
	<Game />,
	document.getElementById('root')
);
