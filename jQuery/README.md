# Learning Log – November 1st, 2024 (All Saints Day)

Happy All Saints Day! This week, my activity has been a bit lower as I've been working part-time as a seasonal stock associate at Under Armour. Today, I woke up at 4:25 a.m. and, despite the early start, I’m still going strong. I also attended Mass this morning.

Today’s main project was the Simon Says exercise. I really enjoyed learning about jQuery – although I’ve used it in the past, this exercise gave me a chance to dig deeper and truly understand it. Working with jQuery has been a game-changer; it's a lot of fun and really powerful for simplifying JavaScript tasks.

The most challenging part of this project was getting the game logic right. Once I set up the appropriate `if` statements, the logic flowed more smoothly. The hints provided along the way were helpful too. After completing the assignment, I had ChatGPT refactor and clean up my code, which gave me some great ideas for optimizing and organizing my work.

I'm looking forward to integrating everything I've been learning to improve my brother's business website and to start building new, cool projects!

## Key Takeaways

- **Early Morning Routine**: Started my day at 4:25 a.m.
- **Simon Says Project**: Improved understanding of jQuery and game logic.
- **Challenges**: Crafting the game logic was tough, but breaking down the `if` statements helped simplify it.
- **Next Steps**: Use this knowledge to tackle real-world projects and continue learning!

---

---

ChatGPT optimized code.

````javascript
// Available button colors for the Simon game
const buttonColors = ["green", "red", "yellow", "blue"];

// Sequence patterns for the game and user
let gamePattern = [];
let userClickedPattern = [];

// Game status and level
let gameStarted = false;
let level = 1;

// Sound file paths for each color and the wrong answer
const sounds = {
    green: "./sounds/green.mp3",
    red: "./sounds/red.mp3",
    yellow: "./sounds/yellow.mp3",
    blue: "./sounds/blue.mp3",
    wrong: "./sounds/wrong.mp3"
};

/**
 * Generates the next sequence in the game pattern.
 * Increments the level and displays it.
 * Selects a random color, animates it, and plays its sound.
 */
function nextSequence() {
    const randomChosenColor = buttonColors[Math.floor(Math.random() * 4)];
    gamePattern.push(randomChosenColor);
    animatePress(randomChosenColor);
    playSound(randomChosenColor);
    $("h1").text("Level " + level++);
}

/**
 * Adds and removes the pressed class to animate button presses.
 * @param {string} color - The color of the button to animate.
 */
function animatePress(color) {
    $("#" + color).addClass("pressed");
    setTimeout(() => $("#" + color).removeClass("pressed"), 100);
}

/**
 * Plays the corresponding sound for the given color.
 * @param {string} color - The color key to play sound for.
 */
function playSound(color) {
    if (sounds[color]) {
        new Audio(sounds[color]).play();
    }
}

/**
 * Handles button click events by adding the clicked color to the user pattern,
 * animating the button, playing the sound, and checking the answer.
 */
$(".btn").on("click", function () {
    const userChosenColor = $(this).attr("id");
    userClickedPattern.push(userChosenColor);
    animatePress(userChosenColor);
    playSound(userChosenColor);
    checkAnswer();
});

/**
 * Checks the user's current answer against the game pattern.
 * If the sequence is correct and complete, proceeds to the next sequence.
 * Otherwise, it triggers the game-over sequence.
 */
function checkAnswer() {
    const lastAnswerIndex = userClickedPattern.length - 1;

    if (gamePattern[lastAnswerIndex] === userClickedPattern[lastAnswerIndex]) {
        if (userClickedPattern.length === gamePattern.length) {
            setTimeout(() => {
                userClickedPattern = [];
                nextSequence();
            }, 1000);
        }
    } else {
        gameOver();
    }
}

/**
 * Handles the game-over sequence, resetting necessary variables
 * and updating UI with game-over messaging.
 */
function gameOver() {
    playSound("wrong");
    $("h1").text("Game Over, Press Any Key to Restart");
    $("body").addClass("game-over");
    setTimeout(() => $("body").removeClass("game-over"), 200);
    startOver();
}

/**
 * Resets the game variables to start a new game session.
 */
function startOver() {
    level = 1;
    gamePattern = [];
    userClickedPattern = [];
    gameStarted = false;
}

/**
 * Starts the game when a key is pressed if it hasn't already started.
 */
$(document).on("keydown", function () {
    if (!gameStarted) {
        nextSequence();
        gameStarted = true;
    }
});```
````
