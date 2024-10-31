function randomDiceNumber() {
    return Math.ceil(Math.random() * 6);
}


function updateLeftDice() {
    var imageElement = document.querySelector(".img1");
    var leftDiceNumber = randomDiceNumber();
    imageElement.src = "./images/dice" + leftDiceNumber + ".png";
    return leftDiceNumber;
}

function updateRightDice() {
    var imageElement = document.querySelector(".img2");
    var rightDiceNumber = randomDiceNumber();
    imageElement.src = "./images/dice" + rightDiceNumber + ".png";

    return rightDiceNumber;
}

function determineWinner() {
    var heading = document.querySelector("h1");
    var leftDice = updateLeftDice();
    var rightDice = updateRightDice();

    if (leftDice > rightDice) {
        heading.textContent = "🚩Player 1 Wins!";
    }
    else if (rightDice > leftDice) {
        heading.textContent = "Player 2 wins🚩";
    }
    else {
        heading.textContent = "Draw!"
    }
}

determineWinner();