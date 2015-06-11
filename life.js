/* global console */
(function(){

var CONST, Check, canvas, ctx, oldModel, newModel, update, draw, render, setup, row, col, calc,
    getArr, collectArr, handleInput;

CONST = {
	SIZE    : 10,
	// Auto calculated based on window size
	// WIDTH   : 200,
	// HEIGHT  : 100,
	SCALE   : window.devicePixelRatio,
	COLOR   : 'rgba(255,255,255,1)',
	STROKE  : 'rgba(37,37,37,1)',
	BGCOLOR : 'rgba(37,37,37,1)',
	ARRS    : []
};

CONST.WIDTH = (window.innerWidth   - (window.innerWidth % CONST.SIZE)) / CONST.SIZE;
CONST.HEIGHT = (window.innerHeight - (window.innerHeight % CONST.SIZE)) / CONST.SIZE;

canvas = document.createElement('canvas');
document.body.appendChild(canvas);
canvas.width  = CONST.WIDTH  * CONST.SIZE * CONST.SCALE;
canvas.height = CONST.HEIGHT * CONST.SIZE * CONST.SCALE;
canvas.style.width  = CONST.WIDTH  * CONST.SIZE + 'px';
canvas.style.height = CONST.HEIGHT * CONST.SIZE + 'px';
ctx = canvas.getContext('2d');

oldModel = new Array(CONST.HEIGHT);

for (row = 0; row < CONST.HEIGHT; row++) {
	oldModel[row] = new Array(CONST.WIDTH);
}

getArr = function(){
	if (CONST.ARRS.length) {
		return CONST.ARRS.pop();
	} else {
		return [];
	}
};

collectArr = function(arr){
	var x;
	for (x = 0; x < arr.length; x++) {
		if (arr[x] && arr[x].length || arr[x].length === 0) {
			collectArr(arr[x]);
		}
	}
	arr.length = 0;
	CONST.ARRS.push(arr);
};

setup = function(){
	ctx.strokeStyle = CONST.STROKE;
	ctx.lineWidth   = CONST.SCALE;

	for (row = 0; row < CONST.HEIGHT; row++) {
		for (col = 0; col < CONST.WIDTH; col++) {
			if (Math.random() > 0.6) {
				oldModel[row][col] = 1;
			} else {
				oldModel[row][col] = 0;
			}
		}
	}
};

update = function(){
	newModel = getArr();
	for (row = 0; row < CONST.HEIGHT; row++) {
		newModel[row] = getArr();
		for (col = 0; col < CONST.WIDTH; col++) {
			newModel[row][col] = calc(oldModel[row][col], row, col, oldModel);
		}
	}
	collectArr(oldModel);
	oldModel = newModel;
};

Check = {
	Up: function(row, col, model){
		if (row === 0) {
			row = model.length;
		}

		if (model[row - 1][col]) {
			return true;
		} else {
			return false;
		}
	},

	UpRight: function(row, col, model){
		if (col === model[row].length - 1) {
			col = -1;
		}
		if (row === 0) {
			row = model.length;
		}

		if (model[row - 1][col + 1]) {
			return true;
		} else {
			return false;
		}
	},

	Right: function(row, col, model){
		if (col === model[row].length - 1) {
			col = -1;
		}

		if (model[row][col + 1]) {
			return true;
		} else {
			return false;
		}
	},

	RightDown: function(row, col, model){
		if (col === model[row].length - 1) {
			col = -1;
		}
		if (row === model.length - 1) {
			row = -1;
		}

		if (model[row + 1][col + 1]) {
			return true;
		} else {
			return false;
		}
	},

	Down: function(row, col, model){
		if (row === model.length - 1) {
			row = -1;
		}

		if (model[row + 1][col]) {
			return true;
		} else {
			return false;
		}
	},

	DownLeft: function(row, col, model){
		if (col === 0) {
			col = model[row].length;
		}
		if (row === model.length - 1) {
			row = -1;
		}

		if (model[row + 1][col - 1]) {
			return true;
		} else {
			return false;
		}
	},

	Left: function(row, col, model){
		if (col === -1) {
			col = model[row].length;
		}

		if (model[row][col - 1]) {
			return true;
		} else {
			return false;
		}
	},

	LeftUp: function(row, col, model){
		if (col === 0) {
			col = model[row].length;
		}
		if (row === 0) {
			row = model.length;
		}

		if (model[row - 1][col - 1]) {
			return true;
		} else {
			return false;
		}
	}
};

calc = function(base, row, col, model){
	var adj = 0;

	if (Check.Up(row, col, model)) {
		adj++;
	}
	if (Check.UpRight(row, col, model)) {
		adj++;
	}
	if (Check.Right(row, col, model)) {
		adj++;
	}
	if (Check.RightDown(row, col, model)) {
		adj++;
	}
	if (Check.Down(row, col, model)) {
		adj++;
	}
	if (Check.DownLeft(row, col, model)) {
		adj++;
	}
	if (Check.Left(row, col, model)) {
		adj++;
	}
	if (Check.LeftUp(row, col, model)) {
		adj++;
	}

	if (base && adj < 2) {
		return 0;
	}
	if (base && adj >= 2 && adj <= 3) {
		return base += 1;
	}
	if (base && adj > 3) {
		return 0;
	}
	if (!base && adj === 3) {
		return 1;
	}

	return 0;
};

draw = function(){
	var mag, style;
	ctx.fillStyle = CONST.BGCOLOR;
	ctx.fillRect(
		0,
		0,
		CONST.WIDTH  * CONST.SIZE * CONST.SCALE,
		CONST.HEIGHT * CONST.SIZE * CONST.SCALE
	);

	for (row = 0; row < CONST.HEIGHT; row++) {
		for (col = 0; col < CONST.WIDTH; col++) {
			if (!newModel[row][col]) {
				continue;
			}
			mag = Math.min(newModel[row][col] / 100, 1);
			style = 'rgba(' +
				(((1 - mag) * 255) >> 0) + ',' +
				'0,' +
				'0,' +
				'1)';
			ctx.fillStyle = style;
			ctx.fillRect(
				col * CONST.SIZE * CONST.SCALE,
				row * CONST.SIZE * CONST.SCALE,
				CONST.SIZE * CONST.SCALE,
				CONST.SIZE * CONST.SCALE
			);
			ctx.strokeRect(
				col * CONST.SIZE * CONST.SCALE,
				row * CONST.SIZE * CONST.SCALE,
				CONST.SIZE * CONST.SCALE,
				CONST.SIZE * CONST.SCALE
			);
		}
	}
};

render = function(){
	update();
	draw();
	window.requestAnimationFrame(render);
};

setup();
render();

handleInput = function(event) {
	var x, y;

	x = (event.clientX - (event.clientX % CONST.SIZE)) / CONST.SIZE;
	y = (event.clientY - (event.clientY % CONST.SIZE)) / CONST.SIZE;

	if (oldModel[y] && x < oldModel[y].length) {
		oldModel[y][x] = 1;
	}
};

canvas.addEventListener('mousemove', function(event){
	event.preventDefault();
	handleInput(event);
}, false);

canvas.addEventListener('touchmove', function(event){
	var x;
	event.preventDefault();
	if (!event.touches) {
		return;
	}
	for (x = 0; x < event.touches.length; x++) {
		handleInput(event.touches[x]);
	}
}, false);

})();
