var buttonColors = ["green", "red", "yellow", "blue"];

var gamePattern = [];

var userClickedPattern = [];

var gameStarted = false;

var level = 1;

const sounds = {
    "green": "./sounds/green.mp3",
    "red": "./sounds/red.mp3",
    "yellow": "./sounds/yellow.mp3",
    "blue": "./sounds/blue.mp3",
    "wrong": "./sounds/wrong.mp3",
};

function nextSequence() {
    var randomNumber = Math.floor(Math.random() * 4);
    var randomChosenColor = buttonColors[randomNumber];
    gamePattern.push(randomChosenColor);
    animatePress(randomChosenColor);
    $("h1").text("Level " + level++);
}

function animatePress(color) {
    $("#" + color).addClass("pressed")
    setTimeout(() => $("#" + color).removeClass("pressed"), 100);
    playSound(color);
}

function playSound(key) {
    if (sounds[key]) {
        new Audio(sounds[key]).play();
    }
}


$(".btn").on("click", function (event) {
    var userChosenColor = $(this).attr('id');
    userClickedPattern.push(userChosenColor);
    animatePress(userChosenColor);
    playSound(userChosenColor);
    checkAnswer();

});

function checkAnswer() {
    var lastIndex = userClickedPattern.length - 1;
    var userAnswer = userClickedPattern[lastIndex];
    var gameAnswer = gamePattern[lastIndex];

    if (gameAnswer === userAnswer) {
        console.log("Success");
        if (gamePattern.length === userClickedPattern.length) {
            console.log("Lenght is same and success");
            setTimeout(() => {
                userClickedPattern = [];
                nextSequence()
            }, 1000);
        }
    }
    else {
        console.log("FAIL");
        playSound("wrong");
        $("h1").text("Game Over, Press Any Key to Restart")
        $("body").addClass("game-over");
        setTimeout(() => $("body").removeClass("game-over"), 200);
        startOver();

    }


}

function startOver() {
    level = 1;
    gamePattern = [];
    userClickedPattern = [];
    gameStarted = false;
}


$(document).on("keydown", function () {
    if (!gameStarted) {
        nextSequence();
        gameStarted = true;
    }
})




