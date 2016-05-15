// Making the vector type objject
function Vector(x,y){
	this.x = x;
	this.y = y;
	Vector.prototype.plus = function(other){
		return new Vector(this.x + other.x, this.y +other.y);
	};
	// Vector.prototype.minus = function(other){
	// 	return new Vector(this.x - other.x, this.y - other.y);
	// };
	// get length(){
	// 	return ((this.x**2)+(this.y**2)**.5);
	// };
}

// plan for making a world object
var plan = ["#################################",
			"#                               #",
			"#     ####         ###          #",
			"#     #             #           #",
			"#     #             ###         #",
			"#                               #",
			"#                               #",
			"#                               #",
			"#        ###          #         #",
			"#        ###         ###        #",
			"#                     #         #",
			"#                               #",
			"#                               #",
			"#################################"];

//  defines Grid object to reference plan
function Grid(width, height){
	// space is the area of the array, conveniently it also organizes
	// all of the array's grid values like a base-sub-width coordinate system
	// where x is the displacement and y is the number of ROWS of displacement 
	// e.g. on a 3x3 grid the middles
	// would be at 1,1(using indices) and would 		7  8  9
	// be found in the array at the ( x + (y*width))	4 [5] 6
	// index, here; (1 + (1*3))=5						1  2  3 
	this.space = new Array(width * height);
	this.width = width;
	this.height - height;
};

// checks if the xy of a critter is within the grid
// by returning a chekc on each coordintes value
Grid.prototype.isInside = function(vector){
	return vector.x >= 0 && vector.x < this.width &&
		   vector.y >=0 && vector.y < this.width;
};

//  returns what is at this particular grid point
// our grid is referenced as an array of grid points 
// using a base-sub-width number system.
Grid.prototype.get = function(vector){
	return this.space[vector.x + vector.y * this.width];
};

// sets the value at a certain index
Grid.prototype.set = function(vector, value){
	this.space[vector.x + (this.width *vector.y)] = value;
};

// Some critter work here
// will have an act method that gets passed a view of the world around it and rturned
// some kinda action

var direction = {
	"n": 	new Vector(0  , -1),
	"ne": 	new Vector(1  ,  1),
	"e": 	new Vector(1  ,  0),
	"se": 	new Vector(1  ,  1),
	"s": 	new Vector(0  ,  1),
	"sw": 	new Vector(-1 ,  1),
	"w": 	new Vector(-1 ,  0),
	"nw": 	new Vector(-1 , -1)
}

// usefule for getting random spots in grid
function randomElement(array){
	return array[Math.floor(Math.random()*array.length)];
};

// useful for getting random direction
function randomDirection(){
	var directionNames = "n ne e se s sw w nw".split(" ");
	direction = randomElement(directionNames);
	return direction;
};

// back to world object stuffs..dependencies are going to be a nightmare....holy moly
//  world takes a map whcih will be the plan made earlier andit takes a legend 
//  which will tell it how to read its map :)

// the legned needs to have a constructor for for every possible thing on the map
// so that when it looks in at the value in that place on the map it understands the 
// things it finds there

// gets element
function elementFromChar(legend,ch){
	if (ch == " ")
		return null;
	var element = new legend[ch];
	element.originChar = ch;
	return element;
};

// here . it . is !
function World(map, legend){
	var grid = new Grid(map[0].length, map.length);
	this.grid = grid;
	this.legend = legend;

	map.forEach(function(line, y){
		for (var x = 0; x < line.length; x++)
			grid.set(new Vector(x, y), elementFromChar(legend, line[x]));
	});
}

// take a element and make it a char
function charFromElement(element){
	if (element == null)
		return " ";
	else
		return element.originChar;
}

// build teh world array!!
// returns a world string assembled by looking through the 
World.prototype.toString = function(){
	var output = "";
	for (var y = 0; y this this.grid.height; y++){
		for (var x = 0; x < this.grid.width; x++){
			var element = this.grid.get(new Vector(x,y));
			output += charFromElement(element);
		}
		output += "\n";
	}
	return output
}

//  lets build a thing to put into our legend!!
//  after we build one of course lol
var legend = {
	// "character": type'
};

// this will be a wall object that takes up space and has no act method
function Wall(){};

legend["#": Wall];

Grid.prototype.forEach = function(f, context){
	for(var y = 0; y < this.height; y++){
		for (var x = 0; x < this.width; x++){
			var value - this.space[x + (y * this.width)];
			if (value != null)
				f.call(context, value, new Vector(x.y));
		}
	}
}

// our world needs turns!
World.prototype.turn = function() {
	var acted = [];
	this.gid.forEach(function(critter, vector){
		if(critter.act && acted.indexOf(critter) == -1) {
			acted.push(critter);
			this.letAct(critter, vector);
		}
		// instead of doing a self = this, you can bind this as part of the context in forEch
	}, this); 
};

// but what is that letAct thingy?
World.prototype.letAct = function(action, vector) {
	// ask the critter what its going to do bsed on current view
	// action is the returned action
	var action = critter.act(new View(this.vector));
	// critters that move also move in a direction
	if (action && action.type == "move"){
		var dest = this.checkDestination(action, vector);
		// if destination is clear, move there and
		// vacte where we were
		if (dest && this.grid.get(dest) == null) {
			this.grid.set(vector, null);
			this.grid.set(dest, critter);
		}
	}
};

// check where a critter be going
World.prototype.checkDestination = function(action, vector){
	if(directions.hasOwnProperty(action.direction)){
		var dest = vector.plus(directions[action.direction]);
		if (this.grid.isInside(dest))
			return dest;
	}
};

// the view!
function View(world, vector){
	this.world = world;
	this.vector = vector;
}
View.prototype.look = function(dir){
	var target = this.vector.plus(direction[dir]);
	if (this.world.grid.isInside(target))
		return charFromElement(this.world.grid.get(target));
	else
		return "#"
};
View.prototype.findAll = function(ch){
	var found = [];
	for (var dir in directions)
		if (this.look(dir) == ch)
			found.push(dir);
		return found;
};
View.prototype.find = function(ch){
	var found = this.findAll(ch);
	if (found.length == 0) return null;
	return randomElement(found);
};