var game;
var gameOptions = {//gameSettings
    tileSize: 300,
    tileSpacing: 20,
    boardSize: {
    rows: 2,
    cols: 4
    }
};
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
        //this.add.image(100, 100, "emptytile");
        //adds an image to the scene.
        //format - x, y, name
        for(var y = 0; y < gameOptions.boardSize.cols; y++){
           for(var x = 0; x < gameOptions.boardSize.rows; x++){
                var tilePosition = this.getTilePosition(x, y);
                this.add.image(tilePosition.x, tilePosition.y, "emptytile");
            }
        }
    }
    getTilePosition(row, col){//calculations for where to place tiles based on coordinates
        var posX = (gameOptions.tileSpacing * (col + 1)) + gameOptions.tileSize * (col + 0.5);
        var posY = (gameOptions.tileSpacing * (row + 1)) + gameOptions.tileSize * (row + 0.5);
        return new Phaser.Geom.Point(posX, posY);
    }
}

class bootGame extends Phaser.Scene{
        constructor(){super("BootGame");}
        preload(){//use this to load resources
            //format - name, filePath
            this.load.image("emptytile", "assets/sprites/image.png");
        }
        create(){
            console.log("game is booting...");
            this.scene.start("PlayGame");
        }
    }