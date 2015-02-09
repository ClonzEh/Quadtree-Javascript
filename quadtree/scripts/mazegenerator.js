/**
 * Created by Travis on 1/16/2015.
 */


function mazeGenerator(grid, start) {

    this.grid = grid;
    this.mazeList = [];
    this.selectedList = [];
    this.lastGrid = grid[start.pos.x][start.pos.y];
    this.lastSelected = this.lastGrid;
    this.lastGrid.pathblock = false;

    this.selectedList.push(this.lastSelected);
    this.mazeList.push(this.lastGrid);

    while (true) {

        this.lastSelected = this.pickRandom(this.checkNeighbors(this.lastSelected));

        if (this.lastSelected == undefined) {

            while (true) {

                this.selectedList.pop();

                if (this.selectedList.length == 0) { this.draw(); return; /*maze done*/ }


                var temp = this.selectedList[this.selectedList.length - 1];
                if (this.checkNeighbors(temp).length > 0) {

                    this.lastSelected = this.pickRandom(this.checkNeighbors(temp));
                    break;
                }

                if (this.selectedList.length == 0) { this.draw(); return; }

            }
        }
        this.lastSelected.pathblock = false;
        this.lastGrid = this.inBetween(this.lastSelected);
        this.lastGrid.pathblock = false;


        this.mazeList.push(this.lastGrid);
        this.mazeList.push(this.lastSelected);
        this.selectedList.push(this.lastSelected);
    }
}

mazeGenerator.prototype.checkNeighbors = function(gridSpot) {

    var array = [
        [gridSpot.pos.x - 2, gridSpot.pos.y, 'left'],
        [gridSpot.pos.x + 2, gridSpot.pos.y, 'right'],
        [gridSpot.pos.x, gridSpot.pos.y + 2, 'down'],
        [gridSpot.pos.x, gridSpot.pos.y - 2, 'up']
    ];

    var list = [];
    for (var i = array.length; i--;) {

        if (this.grid[array[i][0]] != undefined && this.grid[array[i][0]][array[i][1]] != undefined
            && this.grid[array[i][0]][array[i][1]].pathblock == true) {

            /*if () {*/

                this.grid[array[i][0]][array[i][1]].direction = array[i][2];

                list.push(this.grid[array[i][0]][array[i][1]]);
            /*}*/
        }
    }

    return list;
};

mazeGenerator.prototype.pickRandom = function (list) {

    var howManyNeighbors = list.length;
    return list[~~(howManyNeighbors * Math.random())];
};

mazeGenerator.prototype.inBetween = function(chosen) {

    var grid;
    switch (chosen.direction) {

        case 'left':
            grid = {x: chosen.pos.x + 1, y: chosen.pos.y };
        break;
        case 'right':
            grid = {x: chosen.pos.x - 1, y: chosen.pos.y };
            break;
        case 'up':
            grid = {x: chosen.pos.x, y: chosen.pos.y + 1 };
            break;
        case 'down':
            grid = {x: chosen.pos.x, y: chosen.pos.y - 1};
            break;

    }

    return this.grid[grid.x][grid.y];
};

mazeGenerator.prototype.draw = function() {

    return;

    var w = this.grid[0][0].rect.width;
    var h = this.grid[0][0].rect.height;

    for (var i = 0; i < this.mazeList.length; i++) {

        var x = this.mazeList[i].x - w / 2;
        var y = this.mazeList[i].y - w / 2;

        var shape = createShape({x: x, y: y, width: w, height: h },clonazia.game.mainColors.open,'maze', clonazia.game.layers.maze);
    }
};

