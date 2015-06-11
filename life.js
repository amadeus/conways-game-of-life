/* global console */
(function(){

var CONST, Check, canvas, ctx, oldModel, newModel, update, draw, render, setup, row, col, calc,
    getArr, collectArr, handleInput;

// Various variables and constants used throughout the code
CONST = {
	// Determines the size of each block
	SIZE    : 10,
	// Used to support retina resolutions
	SCALE   : window.devicePixelRatio,
	// Deprecated
	COLOR   : 'rgba(255,255,255,1)',
	// All blocks are stroked with the background
	// color to create a slight separation
	STROKE  : 'rgba(37,37,37,1)',
	// Color used for the background
	BGCOLOR : 'rgba(37,37,37,1)',
	// An array to use for array pooling
	// Probably a premature optimization
	ARRS    : []
};

// Width and height are dynamically calculated based on the
// browser window size and block size
CONST.WIDTH  = (window.innerWidth   - (window.innerWidth % CONST.SIZE)) / CONST.SIZE;
CONST.HEIGHT = (window.innerHeight - (window.innerHeight % CONST.SIZE)) / CONST.SIZE;

// Create the canvas element, set a proper retina supported resolution
// and a display resolution. Save the context for later
canvas = document.createElement('canvas');
document.body.appendChild(canvas);
canvas.width  = CONST.WIDTH  * CONST.SIZE * CONST.SCALE;
canvas.height = CONST.HEIGHT * CONST.SIZE * CONST.SCALE;
canvas.style.width  = CONST.WIDTH  * CONST.SIZE + 'px';
canvas.style.height = CONST.HEIGHT * CONST.SIZE + 'px';
ctx = canvas.getContext('2d');

// Create an empty array model
oldModel = new Array(CONST.HEIGHT);
for (row = 0; row < CONST.HEIGHT; row++) {
	oldModel[row] = new Array(CONST.WIDTH);
}

// Returns a re-used array if available, otherwise
// creates a new one.  We do this since every frame
// we have to duplicate the entire data model, so it helps
// to optimize array instantiations.  Could probably be better
// optimized, but this makes the update function simpler
getArr = function(){
	if (CONST.ARRS.length) {
		return CONST.ARRS.pop();
	} else {
		return [];
	}
};

// Collect old arrays and set them up for re-use
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

// Create a randomized distribution of alive and dead cells
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

// Called once every frame. Iterates over all cells and
// calculates whether it should be alive or dead
update = function(){
	// Create a new model to copy over updated values
	// We cannot manipulate the old method or the entire algo
	// breaks down.
	newModel = getArr();
	for (row = 0; row < CONST.HEIGHT; row++) {
		newModel[row] = getArr();
		for (col = 0; col < CONST.WIDTH; col++) {
			newModel[row][col] = calc(oldModel[row][col], row, col, oldModel);
		}
	}
	// Garbage collect last frame's model
	collectArr(oldModel);
	// Backup oldModel for next frame
	oldModel = newModel;
};

// Methods to check adjacent cells. All support the ability
// to wrap around if at the edge of the screen
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

// Calculate number of adjacent live cells using
// the afore mentioned check methods. Then return the
// state of the cell based on the findings
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

// Iterated through the newModel and draw each cell
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

// Used to trigger changes on mouse move, to excite
// the system when it stagnates
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
