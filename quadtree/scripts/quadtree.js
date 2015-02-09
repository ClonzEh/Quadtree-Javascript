function quadTree(pLevel, pBounds) {

    this.maxObjects = 13; // 15 for <1000?   150 for 2000
    this.maxLevels = 10;

    this.level = pLevel;
    this.bounds = pBounds;

    this.objects = [];
    this.nodes = [];
}

quadTree.prototype.clear = function() {


    this.objects = [];
    for (var i = 0;  i < this.nodes.length; i++) {

        if (this.nodes[i] != null) {

            //this.nodes[i].clear();
            this.nodes[i] = null;
        }
    }
};

quadTree.prototype.split = function() {

    var subWidth = this.bounds.width * 0.5;
    var subHeight = this.bounds.height * 0.5;
    var x = this.bounds.x;
    var y = this.bounds.y;

    this.nodes[0] = new quadTree(this.level + 1, new rect(x, y, subWidth, subHeight)); //northwest
    this.nodes[1] = new quadTree(this.level + 1, new rect(x + subWidth, y, subWidth, subHeight)); //northeast
    this.nodes[2] = new quadTree(this.level + 1, new rect(x, y + subHeight, subWidth, subHeight)); //southwest
    this.nodes[3] = new quadTree(this.level + 1, new rect(x + subWidth, y + subHeight, subWidth, subHeight)); //southeast
};

//hitbox is based off of top left pixel of a shape or image container..
quadTree.prototype.getIndex = function(pRect) { //where does object belong in quad tree

    var index = -1;
    var xMid = this.bounds.x + this.bounds.width * 0.5;
    var yMid = this.bounds.y + this.bounds.height * 0.5;

    var topLeft = pRect.topLeft();
    var topQuad = (topLeft.y < yMid && topLeft.y + pRect.height < yMid);
    var botQuad = (topLeft.y > yMid);

    if (topLeft.x < xMid && topLeft.x + pRect.width < xMid) { //left side

        if (topQuad) {

            index = 0;
        }
        else if (botQuad) {

            index = 2;
        }
    }
    else if (topLeft.x > xMid) { //right side

        if (topQuad) {

            index = 1;
        }
        else if (botQuad) {

            index = 3;
        }
    }

    return index;
};

quadTree.prototype.insert = function(pRect) {

    if (this.nodes[0] != null) {

        var index = this.getIndex(pRect);

        if (index != -1) {

            this.nodes[index].insert(pRect);

            return;
        }
    }

    this.objects.push(pRect);

    if (this.objects.length > this.maxObjects && this.level < this.maxLevels) {

        if (this.nodes[0] == null) {

            this.split();
        }
        var i = 0;
        while (i < this.objects.length) {

            var index = this.getIndex(this.objects[i]);
            if (index != -1) {

                this.nodes[index].insert(this.objects[i]);
                this.objects.splice(i, 1)
            }
            else {

                i++;
            }
        }
    }

};

quadTree.prototype.retrieve = function(returnObjects, pRect) {

    var index = this.getIndex(pRect);
    if (index != -1 && this.nodes.length != 0) {

        this.nodes[index].retrieve(returnObjects, pRect);
    }

    returnObjects.push.apply(returnObjects, this.objects);

    return returnObjects;
};

quadTree.prototype.draw = function(addClear) {

    //draw rect
    var ctx = clonazia.game.stage.canvas.getContext('2d');
    if (addClear) {

        ctx.clearRect(0, 0, clonazia.game.width, clonazia.game.height);
    }
    ctx.strokeStyle = clonazia.game.mainColors.quads;
    ctx.beginPath();
    ctx.lineTo(this.bounds.x, this.bounds.y);
    ctx.lineTo(this.bounds.x + this.bounds.width, this.bounds.y);
    ctx.lineTo(this.bounds.x + this.bounds.width, this.bounds.y + this.bounds.height);
    ctx.lineTo(this.bounds.x, this.bounds.y + this.bounds.height);
    ctx.lineTo(this.bounds.x, this.bounds.y);
    ctx.stroke();
    ctx.closePath();

    for (var i = 0; i < this.nodes.length; i++) {

        if (this.nodes[i] != null) { this.nodes[i].draw(); }
    }
};