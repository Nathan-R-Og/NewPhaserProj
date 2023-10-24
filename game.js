var game;
window.onload = function() { //onload is ran when the window is ready
    var gameConfig = { //gameConfig is passed on constructor to set Phaser settings
        width: 480,
        height: 640,
        backgroundColor: 0xff0000,
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
    create(){console.log("this is my awesome game");}
}

class bootGame extends Phaser.Scene{
        constructor(){super("BootGame");}
        create(){
            console.log("game is booting...");
            this.scene.start("PlayGame");
        }
    }