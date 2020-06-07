import * as _ from 'underscore';
//Recursive back-tracker
// Algo: https://en.wikipedia.org/wiki/Maze_generation_algorithm
 
let current; // Current cell
let stack = []; //keeps track of the path followed to create the maze
let gridSize=10;
let grid = [gridSize];

function setup() {
    for (let x = 0; x < gridSize; x++) { 
        grid[x] = new Array(gridSize); 
    }
    console.log(grid);
    for(let i=0;i<grid.length;i++) {
        for(let j=0;j<grid[i].length;j++) {
            grid[i][j] = new Cell(i,j);
        }
    }
    current = grid[Math.floor(_.random(0, gridSize-1))][Math.floor(_.random(0, gridSize-1))]; //select random start location for the maze
    console.log(grid);
}

function mazify() {
    current.visited=true;
    let next = current.checkNeighbours();
    if(next) {
        stack.push(current);
        removeWall(current, next);
        current = next;   
    }
    else if(!stack.length<=0) {
        current = stack.pop();
    }
}

// removes wall between two cells
function removeWall(a, b) {
    if(a.xcoord-b.xcoord>0) { // a is to the right of b 
        a.walls[3] = false;
        b.walls[1]=false;
    }
    else if(a.xcoord-b.xcoord<0) { // a is to the left of b
        a.walls[1] = false;
        b.walls[3]=false;
    }
    else if(a.zcoord-b.zcoord>0) { // a is below b
        a.walls[0] = false;
        b.walls[2]=false;
    }
    else if(a.zcoord-b.zcoord<0) { // a is above b
        a.walls[2] = false;
        b.walls[0]=false;
    }
}

// Cell constructor/definition/everything 
function Cell(xcoord,zcoord) {

    this.xcoord = xcoord;
    this.zcoord = zcoord;
    this.walls = [true, true, true, true]; // top, right, bottom, left
    this.visited=false;

    // returns random neighbour
    this.checkNeighbours = function() {
        let neighbours = [];
        let above = undefined;
        let right = undefined;
        let below = undefined;
        let left = undefined;
        if(current.xcoord!==0) {
            above = grid[current.xcoord-1][current.zcoord]; // cell above
        }
        if(current.zcoord!==gridSize-1) {
            right = grid[current.xcoord][current.zcoord+1]; // cell to right
        }
        if(current.xcoord!==gridSize-1) {
            below = grid[current.xcoord+1][current.zcoord]; // cell below
        }
        if(current.zcoord!==0) {
            left = grid[current.xcoord][current.zcoord-1]; //cell to left
        }

        // If the neighbour exists (not outside the range of the grid) and has not been visited,
        // add to the array

        if(above && !above.visited) {
            neighbours.push(above);
        }
        if(right && !right.visited) {
            neighbours.push(right);
        }
        if(below && !below.visited) {
            neighbours.push(below);
        }
        if(left && !left.visited) {
            neighbours.push(left);
        }

        if(neighbours.length>0) {
            return neighbours[Math.floor(_.random(0,neighbours.length-1))];
        }
        else {
            return undefined;
        }
    }
}

function main() {
    setup();
    do{
        mazify();
    }while(stack.length!==0);
    return grid;
}

export default main;
