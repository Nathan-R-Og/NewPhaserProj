var game;
var gameOptions = {//gameSettings
    tileSize: 200,
    tileSpacing: 20,
    boardSize: {
    rows: 4,
    cols: 4,
    },
    tweenSpeed: 200,
    swipeMaxTime: 1000,
    swipeMinDistance: 20,
    swipeMinNormal: 0.85,
};
const LEFT = 0;
const RIGHT = 1;
const UP = 2;
const DOWN = 3;
/*I noticed you couldn't get the window to load the gameOptions properly for resizing;
You might've put it after the onload? It works before the onload, so that couldve been what happened.*/
window.onload = function() { //onload is ran when the window is ready
    var newWidth  = (gameOptions.boardSize.cols * (gameOptions.tileSize + gameOptions.tileSpacing)) + gameOptions.tileSpacing
    var newHeight  = (gameOptions.boardSize.rows * (gameOptions.tileSize + gameOptions.tileSpacing)) + gameOptions.tileSpacing
    var gameConfig = { //gameConfig is passed on constructor to set Phaser settings
        width: newWidth,
        height: newHeight,
        backgroundColor: 0xecf0f1,
        scene: [bootGame, playGame] //define scenes here
    }
    game = new Phaser.Game(gameConfig);
    window.focus();
    resizeGame();
    window.addEventListener("resize", resizeGame);
}
function resizeGame() { //some math stuffs to fill the screen size better
    var canvas = document.querySelector("canvas");
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;
    var windowRatio = windowWidth / windowHeight;
    var gameRatio = game.config.width / game.config.height;
    if(windowRatio < gameRatio){
        canvas.style.width = windowWidth + "px";
        canvas.style.height = (windowWidth / gameRatio) + "px";
    }
    else{
        canvas.style.width = (windowHeight * gameRatio) + "px";
        canvas.style.height = windowHeight + "px";
    }
}

class playGame extends Phaser.Scene{//a scene object extends Phaser.scene to make our own
    constructor(){super("PlayGame"); }
    create(){//onCreate, basically
        this.canMove = false;
        //this.add.image(100, 100, "emptytile");
        //adds an image to the scene.
        //format - x, y, name
        this.boardArray = [];
        for(var y = 0; y < gameOptions.boardSize.rows; y++){
            this.boardArray[y] = [];
            for(var x = 0; x < gameOptions.boardSize.cols; x++){
                var tilePosition = this.getTilePosition(x, y);
                this.add.image(tilePosition.x, tilePosition.y, "emptytile");
                var tile = this.add.sprite(tilePosition.x, tilePosition.y, "tiles", 0); //sprite needs arg frame for spritesheet (duh)
                tile.visible = false;
                this.boardArray[y][x] = { //dict with tile data
                    tileValue: 0,
                    tileSprite: tile
                }
            }
        }
        this.addTile();
        this.addTile();

        this.input.keyboard.on("keydown", this.handleKey, this); //keydown, callback, context
        this.input.on("pointerup", this.handleSwipe, this); //pointerup, callback, context

    }
    getTilePosition(col, row){//calculations for where to place tiles based on coordinates
        var posX = (gameOptions.tileSpacing * (col + 1)) + gameOptions.tileSize * (col + 0.5);
        var posY = (gameOptions.tileSpacing * (row + 1)) + gameOptions.tileSize * (row + 0.5);
        return new Phaser.Geom.Point(posX, posY);
    }
    addTile(){
        var emptyTiles = [];
        for(var y = 0; y < gameOptions.boardSize.rows; y++){ // gets all empty tiles and puts their coords into an array
            for(var x = 0; x < gameOptions.boardSize.cols; x++){
                if(this.boardArray[y][x].tileValue == 0){
                emptyTiles.push({
                    row: y,
                    col: x
                })}
            }
        }
        if(emptyTiles.length > 0){ //gets a random tile from emptyTiles and sets it to 1
            var chosenTile = Phaser.Utils.Array.GetRandom(emptyTiles);
            this.boardArray[chosenTile.row][chosenTile.col].tileValue = 1;
            this.boardArray[chosenTile.row][chosenTile.col].tileSprite.visible = true;
            this.boardArray[chosenTile.row][chosenTile.col].tileSprite.setFrame(0);
            //tweenAnimation
            this.boardArray[chosenTile.row][chosenTile.col].tileSprite.alpha = 0;
            this.tweens.add({ //creates a tween under Phaser.scene
                targets: [this.boardArray[chosenTile.row][chosenTile.col].tileSprite], //objects
                alpha: 1, //proerty
                duration: gameOptions.tweenSpeed, // speed
                callbackScope: this, // objectToBeCalled
                onComplete: function(){ // function ran when tween is completed
                    console.log("tween completed");
                    this.canMove = true;
                }
            });
        }

    }
    handleKey(key){//keyboard handler
        if(this.canMove){
            switch(key.code){
                case "KeyA":
                case "ArrowLeft":
                    this.makeMove(LEFT);
                    break;
                case "KeyD":
                case "ArrowRight":
                    this.makeMove(RIGHT);
                    break;
                case "KeyW":
                case "ArrowUp":
                    this.makeMove(UP);
                    break;
                case "KeyS":
                case "ArrowDown":
                    this.makeMove(DOWN);
                    break;
            }
        }
    }
    handleSwipe(motion){//touchscreen/mouse handler
        if(this.canMove){
            var swipeTime = motion.upTime - motion.downTime;//timestamps used to calculate total time
            var fastEnough = swipeTime < gameOptions.swipeMaxTime;
            //downs are start coords, ups are end coords.
            var swipe = new Phaser.Geom.Point(motion.upX - motion.downX, motion.upY - motion.downY);
            var swipeMagnitude = Phaser.Geom.Point.GetMagnitude(swipe);
            var longEnough = swipeMagnitude > gameOptions.swipeMinDistance;
            if(longEnough && fastEnough){
                Phaser.Geom.Point.SetMagnitude(swipe, 1);
                if(swipe.x > gameOptions.swipeMinNormal) this.makeMove(RIGHT);
                if(swipe.x < -gameOptions.swipeMinNormal) this.makeMove(LEFT);
                if(swipe.y > gameOptions.swipeMinNormal) this.makeMove(DOWN);
                if(swipe.y < -gameOptions.swipeMinNormal) this.makeMove(UP);
                
            }
        }
    }
    makeMove(d){
        var dMoveX = (d == UP || d == DOWN) ? 0 : d == LEFT ? -1 : 1;
        var dMoveY = (d == LEFT || d == RIGHT) ? 0 : d == UP ? -1 : 1;
        this.canMove = false;
        var movedTiles = 0;
        //define scan ranges
        var firstRow = (d == UP) ? 1 : 0; //set first row to 1 if moving up
        var lastRow = gameOptions.boardSize.rows - ((d == DOWN) ? 1 : 0); //set last row to rows-1 if moving down
        var firstCol = (d == LEFT) ? 1 : 0;//etc
        var lastCol = gameOptions.boardSize.cols - ((d == RIGHT) ? 1 : 0);
        for(var y = firstRow; y < lastRow; y++){
            for(var x = firstCol; x < lastCol; x++){
                //currs are where the tiles will end up
                var curCol = dMoveX == 1 ? (lastCol - 1) - x : x;
                var curRow = dMoveY == 1 ? (lastRow - 1) - y : y;
                var tileValue = this.boardArray[curRow][curCol].tileValue;
                if(tileValue != 0){
                    //check if legal
                    var newCol = curCol;
                    var newRow = curRow;
                    while(this.isLegalPosition(newCol + dMoveX, newRow + dMoveY)){
                        newCol += dMoveX;
                        newRow += dMoveY;
                    }
                    //set the z order
                    movedTiles++;
                    this.boardArray[curRow][curCol].tileSprite.depth = movedTiles;
                    //move
                    var newPos = this.getTilePosition(newCol, newRow);
                    this.boardArray[curRow][curCol].tileSprite.x = newPos.x;
                    this.boardArray[curRow][curCol].tileSprite.y = newPos.y;
                }
            }
        }
    }
    isLegalPosition(col, row){
        var colInside = col >= 0 && col < gameOptions.boardSize.cols;
        var rowInside = row >= 0 && row < gameOptions.boardSize.rows;
        return colInside && rowInside;
    }
}

class bootGame extends Phaser.Scene{
        constructor(){super("BootGame");}
        preload(){//use this to load resources
            //format - name, filePath
            this.load.image("emptytile", "assets/sprites/image.png");
            this.load.spritesheet("tiles", "assets/sprites/tiles.png", { // name, filePath, frameWidth, frameHeight
                frameWidth: gameOptions.tileSize,
                frameHeight: gameOptions.tileSize
                });
        }
        create(){
            console.log("game is booting...");
            this.scene.start("PlayGame");
        }
    }