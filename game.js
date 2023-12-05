var game;
var gameOptions = {//gameSettings
    tileSize: 200,
    tileSpacing: 20,
    boardSize: {
    rows: 4,
    cols: 4,
    },
    tweenSpeed: 100,
    swipeMaxTime: 1000,
    swipeMinDistance: 20,
    swipeMinNormal: 0.85,
    aspectRatio: 16/9,
    quickMerge: false,
    localStorageName: "topscore4096"
};
const LEFT = 0;
const RIGHT = 1;
const UP = 2;
const DOWN = 3;
window.onload = function() { //onload is ran when the window is ready
    var tileAndSpacing = gameOptions.tileSize + gameOptions.tileSpacing; // set width based on game stuff
    var width = gameOptions.boardSize.cols * tileAndSpacing;
    width += gameOptions.tileSpacing;
    var gameConfig = { //gameConfig is passed on constructor to set Phaser settings
        width: width,
        height: width * gameOptions.aspectRatio, // and height based on width
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
        this.score = 0;
        var restartButton = this.add.image(game.config.width / 2, game.config.height / 1.2, "restartButton");
        restartButton.setInteractive();
        restartButton.on("pointerdown", function(){this.scene.start("PlayGame");}, this); //onclick
        this.add.image(game.config.width / 2, 256, "ui");
        var gameTitle = this.add.image(10, 5, "gameLogo");
        gameTitle.setOrigin(0, 0);
        var howTo = this.add.image(game.config.width, 5, "howtoplay");
        howTo.setOrigin(1, 0);
        var logo = this.add.image(game.config.width / 2, game.config.height, "name");
        logo.setOrigin(0.5, 1);
        logo.setInteractive();
        logo.on("pointerdown", function(){window.location.href = "https://www.google.com/search?q=nathan+r"});

        this.scoreText = this.add.bitmapText(((game.config.width / 2) - 80) - 96, 232, "font", "0");
        this.bestScore = localStorage.getItem(gameOptions.localStorageName); //load from browser save
        if(this.bestScore == null) this.bestScore = 0;
        this.bestScoreText = this.add.bitmapText(((game.config.width / 2) + 240) - 96, 232, "font", this.bestScore.toString());
        
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

        this.moveSound = this.sound.add("move"); //import the sound to the scene
        this.growSound = this.sound.add("grow");

    }
    getTilePosition(col, row){//calculations for where to place tiles based on coordinates
        var posX = (gameOptions.tileSpacing * (col + 1)) + gameOptions.tileSize * (col + 0.5);
        var posY = (gameOptions.tileSpacing * (row + 1)) + gameOptions.tileSize * (row + 0.5);
        var boardHeight = gameOptions.boardSize.rows * gameOptions.tileSize; // vertically centered
        boardHeight += (gameOptions.boardSize.rows + 1) * gameOptions.tileSpacing;
        posY += (game.config.height - boardHeight) / 2;
        return new Phaser.Geom.Point(posX, posY);
    }
    addTile(){
        var emptyTiles = [];
        for(var y = 0; y < gameOptions.boardSize.rows; y++){ // gets all empty tiles and puts their coords into an array
            for(var x = 0; x < gameOptions.boardSize.cols; x++){
                if(this.boardArray[y][x].tileValue == 0){
                emptyTiles.push({
                    row: y,
                    col: x,
                    upgraded: false //whether or not its been merged in the same turn
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
        this.movingTiles = 0;
        var dMoveX = (d == UP || d == DOWN) ? 0 : d == LEFT ? -1 : 1;
        var dMoveY = (d == LEFT || d == RIGHT) ? 0 : d == UP ? -1 : 1;
        this.canMove = false;
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
                    while(this.isLegalPosition(newCol + dMoveX, newRow + dMoveY, tileValue)){
                        newCol += dMoveX;
                        newRow += dMoveY;
                    }
                    if(newRow != curRow || newCol != curCol){
                        //move
                        var newPos = this.getTilePosition(newCol, newRow);
                        var willUpdate = this.boardArray[newRow][newCol].tileValue == tileValue;
                        this.moveTile(this.boardArray[curRow][curCol].tileSprite, newPos, willUpdate);
                        this.boardArray[curRow][curCol].tileValue = 0; //get rid of it
                        //merge
                        if(willUpdate){
                            this.score += Math.pow(2, this.boardArray[newRow][newCol].tileValue); // add points
                            this.boardArray[newRow][newCol].tileValue++;
                            this.boardArray[newRow][newCol].upgraded = true
                        }
                        else this.boardArray[newRow][newCol].tileValue = tileValue; //bring it back
                    }
                }
            }
        }
        if(this.movingTiles == 0) this.canMove = true;
        else this.moveSound.play();
    }
    isLegalPosition(col, row, value){
        var rowInside = row >= 0 && row < gameOptions.boardSize.rows;
        var colInside = col >= 0 && col < gameOptions.boardSize.cols;
        if(!rowInside || !colInside) return false; // if outside
        if(this.boardArray[row][col].tileValue == 12) return false; //you won!!
        var emptySpot = this.boardArray[row][col].tileValue == 0;
        var sameValue = this.boardArray[row][col].tileValue == value;
        var alreadyUpgraded = this.boardArray[row][col].upgraded && !gameOptions.quickMerge; //quickmerge override for different playstyles
        return emptySpot || (sameValue && !alreadyUpgraded);
    }
    refreshBoard(){
        this.scoreText.text = this.score.toString(); //convert int to string
        if(this.score > this.bestScore){ //update top score
            this.bestScore = this.score;
            localStorage.setItem(gameOptions.localStorageName, this.bestScore);
            this.bestScoreText.text = this.bestScore.toString();
        }
        for(var y = 0; y < gameOptions.boardSize.rows; y++){
            for(var x = 0; x < gameOptions.boardSize.cols; x++){
                var spritePosition = this.getTilePosition(x, y);
                this.boardArray[y][x].tileSprite.x = spritePosition.x;
                this.boardArray[y][x].tileSprite.y = spritePosition.y;
                var tileValue = this.boardArray[y][x].tileValue;
                if(tileValue > 0){
                    this.boardArray[y][x].tileSprite.visible = true;
                    this.boardArray[y][x].upgraded = false;
                    this.boardArray[y][x].tileSprite.setFrame(tileValue - 1);
                }
                else this.boardArray[y][x].tileSprite.visible = false;
            }
        }
        this.addTile();
    }
    moveTile(tile, point, upgrade){
        this.movingTiles++;
        tile.depth = this.movingTiles;
        var distance = Math.abs(tile.x - point.x) + Math.abs(tile.y - point.y);//total distance (will usually be one axis)
        this.tweens.add({ //do a tween!!
            targets: [tile],
            x: point.x,
            y: point.y,
            duration: gameOptions.tweenSpeed * distance / gameOptions.tileSize,//scale time based on distance
            callbackScope: this,
            onComplete: function(){
                if(upgrade) this.upgradeTile(tile);
                else this.endTween(tile)
            }
        })
    }
    upgradeTile(tile){ //ease the merging
        this.growSound.play();
        tile.setFrame(tile.frame.name + 1);
        this.tweens.add({
            targets: [tile],
            scaleX: 1.1,
            scaleY: 1.1,
            duration: gameOptions.tweenSpeed,
            yoyo: true,
            repeat: 1,
            callbackScope: this,
            onComplete: function(){this.endTween(tile)}})
    }
    endTween(tile){// clean up
        this.movingTiles --;
        tile.depth = 0;
        if(this.movingTiles == 0) this.refreshBoard();
    }
}

class bootGame extends Phaser.Scene{
        constructor(){super("BootGame");}
        preload(){//use this to load resources
            //format - name, filePath
            this.load.image("emptytile", "assets/sprites/image.png");
            this.load.image("restartButton", "assets/sprites/restart.png");
            this.load.image("gameLogo", "assets/sprites/title.png");
            this.load.image("name", "assets/sprites/signature.png");
            this.load.image("howtoplay", "assets/sprites/tutorial.png");
            this.load.spritesheet("tiles", "assets/sprites/tiles.png", { // name, filePath, frameWidth, frameHeight
                frameWidth: gameOptions.tileSize,
                frameHeight: gameOptions.tileSize
            });
            this.load.image("ui", "assets/sprites/ui.png"); // name, filePath, frameWidth, frameHeight
            this.load.audio("move", ["assets/sounds/move.ogg", "assets/sounds/move.mp3"]); //import audio with best compatibility
            this.load.audio("grow", ["assets/sounds/grow.ogg", "assets/sounds/grow.mp3"]);
            this.load.bitmapFont("font", "assets/sprites/font.png", "assets/sprites/font.xml");
        }
        create(){
            console.log("game is booting...");
            this.scene.start("PlayGame");
        }
    }