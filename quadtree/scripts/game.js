console.rlog = function(obj) { console.log(JSON.parse(JSON.stringify(obj))); };

//Start game code...
function game() {

    if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1) { console.clear(); }
    console.log('Starting game...');

    //Quick reference for resolution
    this.width = display.resolution.x;
    this.height = display.resolution.y;
    this.fpsTimer = 0;
    //document.body.addEventListener('touchmove', function(e){ e.preventDefault(); });
    this.frameRate = 60;

    /**
     *SETTING CANVAS PIXEL DENSITY
     */
    {

        var cct = document.getElementById("gameCanvas");
        var cct1 = document.getElementById("backgroundCanvas");
        var cct2 = document.getElementById("foregroundCanvas");

        cct.style.left = 0 + 'px';
        cct.width = this.width;
        cct.height = this.height;

        cct1.width = this.width;
        cct1.height = this.height;

        cct2.width = this.width;
        cct2.height = this.height;
    }

    this.stage = new createjs.Stage("gameCanvas");
    this.background = new createjs.Stage("backgroundCanvas");
    this.foreground = new createjs.Stage("foregroundCanvas");

    var update = function(e) { this.tick(e); };
    createjs.Ticker.setFPS(this.frameRate);
    createjs.Ticker.addEventListener("tick", update.bind(this));
    createjs.Touch.enable(this.stage);
    this.stage.enableMouseOver(60); //low number takes more time to respond (mouseover event listener)


    this.background.update();
}
game.prototype.resize = function () {

    var width = $('#gameView').width();
    var height = $('#gameView').height();
};

game.prototype.controller = function () {

    // SCENE COLOR SCHEME
    this.mainColors = {

        normal: 'red',
        collision: 'blue',
        quads: 'rgba(160,160,160,1)'
    };
    // ADD LAYERS [See Draw Order for Add/Remove/Order]
    this.layers = {

        quadTree: new createjs.Container(),
        objects:  new createjs.Container()

    };

    // DISPLAY ORDER OF THE LAYERS
    this.drawOrder = [

        this.layers.quadTree,
        this.layers.objects

    ];

    // ADJUST GRID POSITION (automatic but changeable)
    $('#wrapper').css('background', 'rgba(18,18,18,1');

};

game.prototype.begin = function () {

    this.controller(); //quick control
    this.quadIsOn = true;
    this.render = true;
    this.motion = true;
    this.renderQuads = true;
    this.notRendering = false;

    this.quadBounds = {x: 0, y: 0, width: this.width, height: this.height * 0.8};
    this.objectsToSpawn = 150;


    //Properties

    //Deal with layers & containers...
    for (var i = 0; i < this.drawOrder.length; i++){ this.stage.addChild(this.drawOrder[i]); }
    createUserInterface();


    //run events
    this.events();

    for (var i = this.objectsToSpawn; i--;) {
        this.addCircle();
    }

    this.myQuadTree = createQuadTree(this.layers.objects.children, this.quadBounds);


    //this.quadTreeDemo.clear();



    //console.log(testttt, 'total object checks', this.layers.objects.children.length, 'total objects');

};

function createQuadTree(objects, bounds) {

    var quad = new quadTree(0, new rect(bounds.x, bounds.y, bounds.width, bounds.height));
    for (var i = 0; i < objects.length; i++) {

        quad.insert(objects[i]);
    }

    var returnObjects = [];
   // var testttt = 0;
    for (var i = 0; i < objects.length; i++) {

        returnObjects = [];
        quad.retrieve(returnObjects, objects[i]);

        for (var x = 0; x < returnObjects.length; x++) {
            // Run collision detection algorithm between objects

            if (objects[i] !== returnObjects[x] && aCollision(objects[i], returnObjects[x])) {

                returnObjects[x].graphics._fill.style = clonazia.game.mainColors.collision;
                objects[i].graphics._fill.style = clonazia.game.mainColors.collision;

            }
        }
       // testttt += returnObjects.length;

    }
    return quad;
}

function aCollision(circle1, circle2) {

    var dx = (circle1.x + circle1.radius) - (circle2.x + circle2.radius);
    var dy = (circle1.y + circle1.radius) - (circle2.y + circle2.radius);
    var distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < circle1.radius + circle2.radius) {
        // collision detected!
        return true;
    }
    return false;
}

//Deal with Shapes
/*function createShape(rect, color, name, container) {

    var shape = new createjs.Shape();
    shape.name = name || 'none';
    shape.graphics.beginFill(color).drawRect(0, 0, rect.width, rect.height);
    shape.width = rect.width;
    shape.height = rect.height;
    shape.regX = rect.width / 2;
    shape.regY = rect.height / 2;
    shape.x = rect.x + shape.width / 2;
    shape.y = rect.y + shape.height / 2;
    shape.topLeft =  { x: shape.x - shape.width / 2, y: shape.y - shape.width / 2 };

    shape.rect = rect;

    if (container != undefined) {

        container.addChild(shape);
    }

    return shape;
}*/

game.prototype.addCircle = function() {

    var x = Math.random() * (this.quadBounds.x + this.quadBounds.width);
    var y = Math.random() * (this.quadBounds.y + this.quadBounds.height);
    var r = 10;
    var circle = new createjs.Shape();
    circle.graphics.beginFill(this.mainColors.normal).drawCircle(0, 0, r);
    circle.x = x;
    circle.y = y;

    circle.radius = r;
    circle.topLeft = function() {

        return { x: circle.x - circle.radius, y: circle.y - circle.radius };
    };
    //{x: circle.x - circle.radius, y: circle.y - circle.radius };

    circle.width = circle.radius * 2;
    circle.height = circle.radius * 2;

    this.layers.objects.addChild(circle);

    circle.velocity = { x : Math.random() * 3 - 1.5, y: Math.random() * 3  - 1.5 };
    var bounds = this.quadBounds;
    circle.move = function() {

        this.x += this.velocity.x;
        this.y += this.velocity.y;
        if (this.x < bounds.x || this.x > bounds.x + bounds.width) { this.velocity.x *= -1; }
        if (this.y < bounds.y || this.y > bounds.y + bounds.height) { this.velocity.y *= -1; }
    }

};

/*game.prototype.addRectangle = function() {

    var rect = new createjs.Shape();
    rect.graphics.beginFill("red").drawRect(0, 0, 15, 15);
    rect.x = Math.random() * (this.width - 100) + 50;
    rect.y = Math.random() * (this.height - 100) + 50;
    rect.width = 1;
    rect.height = 1;
    rect.radius = 6;
    this.layers.objects.addChild(rect);
};*/

game.prototype.events = function () {

    this.stage.on('stagemousemove', function (e) {

        //var gridPos = { x: ~~(e.stageX / game.gridSpot.width), y: ~~(e.stageY / game.gridSpot.height) };

        /*for (var i = 0; i < clonazia.game.gridContainer.children.length; i++) {

            //TODO: get mouseover position with grid[~~(e.stageX / gridSpot.width)][~~(e.stageY / gridSpot.height)]


            if (pointRectangleIntersection({x: e.stageX, y: e.stageY}, clonazia.game.gridContainer.children[i])) {

                if (clonazia.game.mouseDown == true) {
                    var t = clonazia.game.gridContainer.children[i];
                    if (clonazia.game.isPainting && clonazia.game.moveCharacter == false && t.name == "shape") {

                        t.graphics._fill.style = clonazia.game.blockColor;
                        t.pathblock = clonazia.game.blockType;
                        //t.cache(0,0, t.rect.width, t.rect.height);
                        //t.updateCache();
                        //updateImageFromContainer(clonazia.game.gridContainer, clonazia.game.gridBackground);
                        updateSmall(t, clonazia.game.gridBackground);
                    }
                    if (clonazia.game.moveCharacter != "") {

                        clonazia.game.moveableCharacters[clonazia.game.moveCharacter].move(t);
                    }
                }
            }
        }*/

    });

    document.addEventListener('keypress', function(evt) {

        if (evt.keyCode == 13) {

            /*startPathFinding();*/
        }
    });

    this.stage.on('stagemousedown', function (e) {

        clonazia.game.mouseDown = true;
       /* var a = this.getObjectUnderPoint(e.stageX, e.stageY);
        if (a == null) { return; }
        if (a.name == 'shape') {

            var s = null;
            for (var i = 0; i < clonazia.game.gridContainer.children.length; i++) {

                if (pointRectangleIntersection({x: e.stageX, y: e.stageY}, clonazia.game.gridContainer.children[i])) {

                    s = clonazia.game.gridContainer.children[i];
                }
            }
            if (s == null) { return; }
            clonazia.game.blockColor = (s.graphics._fill.style == clonazia.game.mainColors.closed) ? clonazia.game.mainColors.open : clonazia.game.mainColors.closed;
            clonazia.game.blockType = (s.graphics._fill.style != clonazia.game.mainColors.closed);
        }
        if (s != undefined && s.name == 'shape' && s.character == false) {

            s.graphics._fill.style = clonazia.game.blockColor;
            s.pathblock =  clonazia.game.blockType;
            updateSmall(s, clonazia.game.gridBackground);
            clonazia.game.isPainting = true;
            removePath();
        }
        if (a.name == 'character' || a.name == 'end') {

            clonazia.game.moveCharacter = a.name;
            removePath();
        }*/

    });

    this.stage.on('stagemouseup', function (e) {

        clonazia.game.mouseDown = false;
        clonazia.game.moveCharacter = false;
        clonazia.game.isPainting = false;
        //startPathFinding();
    });
};

function pointRectangleIntersection(p, y) {
    var q = y.rect;
    var r = { x: y.x - q.width / 2, y: y.y - q.height / 2 };
    return (p.x > r.x && p.x < r.x + q.width && p.y > r.y && p.y < r.y + q.height);

}

function updateImageFromContainer(container) {

     clonazia.game.layers.gridImage.removeAllChildren();
    /*clonazia.game.gridBackground = new createjs.Bitmap();
     var testtt = [];
     for (var i = 0, c = clonazia.game.gridContainer.children, l = clonazia.game.gridContainer.children.length; i < l; i++) {

     testtt.push(c[i]);
     }
     clonazia.game.gridContainer = new createjs.Container();
     for (var i = 0; i < testtt.length; i++) {

     clonazia.game.gridContainer.addChild(testtt);
     }
     container = clonazia.game.gridContainer;*/
    var bitmap = clonazia.game.gridBackground;
//    bitmap = clonazia.game.gridBackground;
    clonazia.game.layers.gridImage.addChild(bitmap); bitmap.name='shape';
    //bitmap = new createjs.Bitmap();
    //clonazia.game.gridBackground = new createjs.Bitmap(); clonazia.game.gridBackground.name = 'shape';
    bitmap.uncache();


    //container.uncache();
    var bnds = container.getTransformedBounds();

    container.cache(0, 0, clonazia.game.gridObject.width, clonazia.game.gridObject.height);//bnds.width, bnds.height);

    var a = container.cacheCanvas;
    //a.getContext('2d').clearRect(0,0,clonazia.game.width, clonazia.game.height);


    bitmap.image = a;
    //bitmap.image = a;
    bitmap.rect = bnds;
    container.uncache();
    //container.updateCache();
}

function updateSmall(shape, bitmap) {


    shape.cache(0, 0, shape.rect.width, shape.rect.height);
    bitmap.cache(0, 0, bitmap.image.width, bitmap.image.height); //this used to be bitmap.rect.width / height

    var ctx = bitmap.image.getContext('2d');
    ctx.drawImage(shape.cacheCanvas, (shape.x - (shape.rect.width / 2)), (shape.y - shape.rect.height / 2));
    shape.uncache();
    bitmap.updateCache();
    //shape.updateCache();

}

function character(spot, rect, color, name, stage) {

    clonazia.game.moveableCharacters[name] = this;
    this.name = name;
    this.gridSpot = clonazia.game.grid[spot.x][spot.y];
    this.gridSpot.character = true;
    this.shape = new createShape(rect, color, name, stage);
    this.shape.x = this.gridSpot.x; this.shape.y = this.gridSpot.y;

}

character.prototype.move = function(spot) {

    this.gridSpot.character = false;
    this.gridSpot = spot;

    this.shape.x = this.gridSpot.x;
    this.shape.y = this.gridSpot.y;

    this.gridSpot.character = true;
};

function clearGrid(clr) {
    clr = clr || clonazia.game.mainColors.open;
    var a = clonazia.game;
    for (var i = 0, c = a.gridContainer.children; i < a.gridContainer.children.length; i++) {
        c[i].graphics._fill.style = clr;
        c[i].pathblock = false;
        /*updateSmall(c[i], a.gridBackground);*/
    }
    updateImageFromContainer(a.gridContainer, a.gridBackground);
    removePath();
}

//Create User-Interface CSS elements
function createUserInterface() {

    //imageview-in-game css relativeposition
    var layout = $('#gameView');
    $('body').append('<div id="debugger" style="z-index: 800; color:rgba(255,50,50,0.8);position: absolute;width: 17%; min-width: 70px; height:auto; right: 0; background-color: rgba(40,40,40,0.5); font-size: 14px; visibility: visible;"></div>');
    $('#debugger').append('<div id="fps" style="text-align: center;"><p>FPS: <b>20</b></p></div>');
    layout.append('<div id="interface" style="bottom: 0; position: absolute; z-index: 900; width: 92%; margin-left: 8%; min-width: 460px; height: 18%;"></div>');
    var interface = $('#interface');

    interface.append('<div class="interfaceSwitches"><input type="checkbox" id="quadtree" class="switch"/><label for="quadtree">Quad Tree</label></div>');
    addClick({ element: $('#quadtree'), func:
        function(e) { clonazia.game.quadIsOn = clonazia.game.quadIsOn ? false: true; }
    });

    interface.append('<div class="interfaceSwitches"><input type="checkbox" id="render" class="switch"/><label for="render">Render Objects</label></div>');
    addClick({ element: $('#render'), func:
        function(e) { clonazia.game.render = clonazia.game.render ? false: true;
            var a = clonazia.game.stage.canvas.getContext('2d');
            setTimeout(function(){a.clearRect(0,0,clonazia.game.width,clonazia.game.height);},20);
        }
    });

    interface.append('<div class="interfaceSwitches"><input type="checkbox" id="quads" class="switch"/><label for="quads">Render Quads</label></div>');
    addClick({ element: $('#quads'), func:
        function(e) { clonazia.game.renderQuads = clonazia.game.renderQuads ? false: true; }
    });

    interface.append('<div class="interfaceSwitches"><input type="checkbox" id="move" class="switch"/><label for="move">Motion</label></div>');
    addClick({ element: $('#move'), func:
        function(e) { clonazia.game.motion = clonazia.game.motion ? false: true; }
    });

    /*interface.append('<div class="interfaceSwitches"><input type="range" min=0 max=1000 step=1 value=100 id="spawnables" /><label for="spawnables">objects</label></div>');*/

    clonazia.game.resize();
}

function startPathFinding() {

    var game = clonazia.game;

    removePath();

    game.pathfinder = new pathFind(game.grid, game.character.gridSpot.pos, game.end.gridSpot.pos);
}

function removePath() {

    var game = clonazia.game;

    game.layers.path.removeChild(game.pathContainer);
    game.pathContainer = new createjs.Container();
    game.layers.path.addChild(game.pathContainer);
    game.foreground.update();
}



//Update loop, e for delta time
game.prototype.tick = function (e) {

    if (this.fpsTimer < e.timeStamp) {
        this.fpsTimer = e.timeStamp + 1000;
        $('#fps').html('<p>FPS: <b>' + ~~(createjs.Ticker.getMeasuredFPS() * 10) / 10 + '</b><br>Set to: ' + this.frameRate + '</p>');

    }

    if (this.motion) { for (var i = 0; i < this.layers.objects.children.length; i++) {

        this.layers.objects.children[i].move();
    } }

    if (this.quadIsOn == true) {

        this.myQuadTree.clear();

        for (var i = 0; i < this.layers.objects.children.length; i++) {

            this.layers.objects.children[i].graphics._fill.style = this.mainColors.normal;
            this.myQuadTree.insert(this.layers.objects.children[i]);
        }


        var returnObjects = [];

        for (var i = 0; i < this.layers.objects.children.length; i++) {

            returnObjects = [];
            this.myQuadTree.retrieve(returnObjects, this.layers.objects.children[i]);

            for (var x = 0; x < returnObjects.length; x++) {
                // Run collision detection algorithm between objects

                if (this.layers.objects.children[i] !== returnObjects[x] && aCollision(this.layers.objects.children[i], returnObjects[x])) {

                    returnObjects[x].graphics._fill.style = this.mainColors.collision;
                    this.layers.objects.children[i].graphics._fill.style = this.mainColors.collision;

                }
            }
        }


    } else {
        //noquadtree...
        for (var i = 0; i < this.layers.objects.children.length; i++) {

            this.layers.objects.children[i].graphics._fill.style = 'red';

        }
        for (var i = 0; i < this.layers.objects.children.length; i++) {

            for (var q = 0; q < this.layers.objects.children.length; q++) {

                if (this.layers.objects.children[q] !== this.layers.objects.children[i] && aCollision(this.layers.objects.children[i], this.layers.objects.children[q])) {
                    this.layers.objects.children[i].graphics._fill.style = 'blue';
                }
            }

        }
    }

    if (this.render) { this.stage.update(); }
    if (this.quadIsOn && this.renderQuads) { this.myQuadTree.draw(!this.render); }
    else if (!this.render) {

        var ctx = this.stage.canvas.getContext('2d');
        ctx.clearRect(0, 0, this.width, this.height);
    }


};

function startMazeGenerator() {

    var game = clonazia.game;
    //clearmazegen
    for (var i = 0; i < game.gridContainer.children.length; i++) {

        var grid = game.gridContainer.children[i];
        game.gridContainer.children[i].pathblock = true;
        grid.graphics._fill.style = grid.pathblock ? clonazia.game.mainColors.closed : clonazia.game.mainColors.open;
    }
    //game.layers.maze.removeAllChildren();
    game.maze = new mazeGenerator(game.grid, {pos: {x: 1,y:1}} );

    for (var i = 1; i < game.gridContainer.children.length; i++) {

        var grid = game.gridContainer.children[i];
        grid.graphics._fill.style = grid.pathblock ? clonazia.game.mainColors.closed : clonazia.game.mainColors.open;
    }
    updateImageFromContainer(clonazia.game.gridContainer, clonazia.game.gridBackground);

    removePath();

}
