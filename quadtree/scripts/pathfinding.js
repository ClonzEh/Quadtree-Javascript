/*
F = G + H; //a* algorithm finds absolute shortest path but is costly for preformance.
f(score = g(calculated distance from start) + h(estimated distance to end)

1. lowest f score grid from open list

2. find adjacent squares & add to openlist. (if a square exists in open already, try to change parent node.
   (remove cur grid from open and add to closed), loop back to 1.

adjusting search patterns to follow:
x-axis first
y-axis first
bresenham line towards end

adjusting final path:
use raycast to reduce pathlist and get only necessary grids to avoid obstacles
apply bresenham line to the minimized list to "Smooth the grid" as opposed to regular prefering patterns(see above)
issues: raycast will have unique situational bugs when diagnally skipping blocks to give an incorrect path.
 */


/*
jagged array grid[x][y] /  start & end = {x: gridPos.x, y: gridPos.y};
adjust pathfind.draw() { } to use this code.
 */

function pathFind(grid, start, end) {

    this.drawOpen = false; //adjust draw method before using these
    this.drawClosed = false;
    this.drawPath = true;
    this.showText = false;
    this.realFinish = 1; //0 includes endpoint in path, 1 doesn't...

    this.startTime = Date.now();
    this.grid = grid;
    this.startPos = { pos: { x: start.x, y: start.y }, f: 0, g: 0 + this.grid[start.x][start.y].pathPenalty, h: 0};
    this.endPos = { pos: { x: end.x, y: end.y } };
    this.totalDistance = this.distance(this.startPos.pos, this.endPos.pos);
    this.startPos.h = this.totalDistance;
    this.startPos.f = this.startPos.g + this.startPos.h;

    this.togglePath = false;


    this.openList = [this.startPos];
    this.closedList = [];
    this.lastEvalGrid = this.startPos;
    this.pathList = [];
    this.found = false;

    //find a path!
    this.start();
    return this.end();
    //return path list.

    // false if no path was found,

    // true: returns the list: array

    // ex: array[0].pos will return x & y coordinates for the end location. use array.reverse() to change [0] to start.
}

pathFind.prototype.end = function () {

    if (this.found == true) {

        //create path list
        var spot = this.closedList[this.closedList.length - 1];
        while (spot.parent != undefined) {
            this.pathList.push(spot);
            spot = spot.parent;
        }
        this.pathList.push(this.closedList[0]); //add the starting square to the path list
        this.closedList.splice(0, 1);
    }
    this.endTime = Date.now();
    var elapsed = (this.endTime - this.startTime);
    console.log("time: " + elapsed + ' milliseconds', 'distance: ' + this.totalDistance, ', openlength: ' + this.openList.length, ', closedlength: ' + this.closedList.length, ', pathfound: '+this.found);
    //draw stuff

    if (this.drawOpen) { this.draw(this.openList, 'rgba(90,90,0,1)'); }
    if (this.drawClosed) { this.draw(this.closedList, 'rgba(80,0,0,1)'); }
    if (this.drawPath) { this.draw(this.pathList, 'rgba(0,200,0,1)'); }

    if (this.found == true) { return this.pathList; } else { return false; }
};

pathFind.prototype.start = function() {

    while(this.lastEvalGrid != null) {
        this.lastEvalGrid = this.findLowestScore();
        this.getNeighbors(this.lastEvalGrid);
    }
};

pathFind.prototype.step = function() {

    if (this.lastEvalGrid != null) {

        this.lastEvalGrid = this.findLowestScore();
        this.getNeighbors(this.lastEvalGrid);
    } else {

        //start stepping the path creation
    }
    clonazia.game.pathContainer.removeAllChildren();
    this.draw(this.openList, 'rgba(100,100,0,1)');
    this.draw(this.closedList, 'rgba(100,0,0,1)');
    //this.draw(this.pathList, 'rgba(0,255,0,1)');
};

pathFind.prototype.getNeighbors = function() {

    if (this.lastEvalGrid == null) { return; }

    var adjacent = this.getAdjacentSquares();
    for (var i = adjacent.length; i--;) {

        var check = this.check(adjacent[i].pos.x, adjacent[i].pos.y);
        if (check) {
            if (check !== true) {
                if (check.h + this.lastEvalGrid.g + adjacent[i].pathPenalty + 1 < check.f) {
                    check.g = this.lastEvalGrid.g + adjacent[i].pathPenalty + 1;
                    check.f = check.h + check.g;
                    check.parent = this.lastEvalGrid;
                }
            }
            else {

                var pos = {x: adjacent[i].pos.x, y: adjacent[i].pos.y};
                var dist = this.distance(pos, this.endPos.pos);
                this.openList.push({ g: this.lastEvalGrid.g + adjacent[i].pathPenalty + 1, h: dist, f: this.lastEvalGrid.g + adjacent[i].pathPenalty + dist + 1, pos: pos, parent: this.lastEvalGrid });
            }
        }
    }

    //remove gridSpot from open list
    for (var i = this.openList.length; i--;) {

        if (this.lastEvalGrid === this.openList[i]) {

            this.openList.splice(i, 1); break;
        }
    }

    //add gridSpot to closed list
    this.closedList.push(this.lastEvalGrid);

};

pathFind.prototype.getAdjacentSquares = function() {

    //change the order based on bresenham's line
    var array;
    if (this.togglePath == false) {

        array = [
            [this.lastEvalGrid.pos.x - 1, this.lastEvalGrid.pos.y],
            [this.lastEvalGrid.pos.x + 1, this.lastEvalGrid.pos.y],
            [this.lastEvalGrid.pos.x, this.lastEvalGrid.pos.y + 1],
            [this.lastEvalGrid.pos.x, this.lastEvalGrid.pos.y - 1]
        ];
        this.togglePath = true;

    } else {

        array = [

            [this.lastEvalGrid.pos.x, this.lastEvalGrid.pos.y + 1],
            [this.lastEvalGrid.pos.x, this.lastEvalGrid.pos.y - 1],
            [this.lastEvalGrid.pos.x - 1, this.lastEvalGrid.pos.y],
            [this.lastEvalGrid.pos.x + 1, this.lastEvalGrid.pos.y]
        ];
        this.togglePath = false;
    }

    var list = [];
    for (var i = array.length; i--;) {

        if (this.grid[array[i][0]] != undefined && this.grid[array[i][0]][array[i][1]] != undefined &&
            this.grid[array[i][0]][array[i][1]].pathblock == false) {

            list.push(this.grid[array[i][0]][array[i][1]])
        }
    }

    return list;
};

pathFind.prototype.findLowestScore = function() {

    if (this.lastEvalGrid.h == this.realFinish) { this.found = true; return null; }
    var closest = null;
    for (var i = this.openList.length; i--;) {

        closest = this.openList[i];

        if (closest.f <= this.lastEvalGrid.f) {

            return closest;
        }
    }
    return closest;
};

pathFind.prototype.check = function(x, y) {

     //make sure location is not already inside any lists...

     for (var i = 0; i < this.closedList.length; i++) {

         if (x == this.closedList[i].pos.x && y == this.closedList[i].pos.y) { return false; }
     }

     for (var i = 0; i < this.openList.length; i++) {

         if (x == this.openList[i].pos.x && y == this.openList[i].pos.y) { return this.openList[i]; }
     }

     //give the OKAY to add in openList
     return true;
 };

pathFind.prototype.distance = function (pos1, pos2) {

    var x = Math.abs(pos1.x - pos2.x);
    var y = Math.abs(pos1.y - pos2.y);
    return (x + y);
};

pathFind.prototype.draw = function (list, color) {

    var w = this.grid[0][0].rect.width;
    var h = this.grid[0][0].rect.height;

    for (var i = 0; i < list.length; i++) {
        var t = list[i].pos;
        var s = 0.4;
        var width = w * s;
        var height = h * s;

        var x = this.grid[t.x][t.y].x - w * (s / 2);
        var y = this.grid[t.x][t.y].y - h * (s / 2);

        var shape = new createShape({x: x, y: y, width: width, height: height}, color, 'path', clonazia.game.pathContainer);

        if (this.showText) {

             var v = this.grid[t.x][t.y];
             var a = { x: v.x - width, y: v.y - height, width: v.rect.width, height: v.rect.height};
             var smallText = h * 0.28;
             var largeText = h * 0.33;


            var text = new createjs.Text(list[i].g, 'bold ' + smallText + 'px Arial', 'rgb(0,255,0)');
             text.x = a.x; text.y = a.y + a.height - smallText * 1.1;
             clonazia.game.pathContainer.addChild(text);

             var text = new createjs.Text(list[i].h, 'bold ' + smallText + 'px Arial', 'rgb(255,0,0)');
             text.x = a.x + a.width - 0; text.y = a.y + a.height - smallText * 1.1;
             text.textAlign = "right";
             clonazia.game.pathContainer.addChild(text);

             var text = new createjs.Text(list[i].f, 'bold ' + largeText + 'px Arial', 'rgb(255,255,255)');
             text.x = a.x; text.y = a.y;
             clonazia.game.pathContainer.addChild(text);
        }
    }
    clonazia.game.foreground.update();
};