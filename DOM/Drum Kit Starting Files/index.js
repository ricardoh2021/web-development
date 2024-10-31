const buttons = document.querySelectorAll("button.drum");
const sounds = {
    "w": "./sounds/tom-1.mp3",
    "a": "./sounds/tom-2.mp3",
    "s": "./sounds/tom-3.mp3",
    "d": "./sounds/tom-4.mp3",
    "j": "./sounds/snare.mp3",
    "k": "./sounds/kick-bass.mp3",
    "l": "./sounds/crash.mp3"
};

buttons.forEach(button => button.addEventListener("click", () => {
    handleInteraction(button.innerHTML);
}));
document.addEventListener("keydown", event => {
    handleInteraction(event.key);
});

function handleInteraction(input) {
    const key = input;
    playSound(key);
    buttonAnimation(key);
}

function playSound(key) {
    if (sounds[key]) new Audio(sounds[key]).play();
}

function buttonAnimation(key) {
    const activeButton = document.querySelector(`.${key}`);
    if (activeButton) {
        activeButton.classList.add("pressed");
        setTimeout(() => activeButton.classList.remove("pressed"), 100);
    }
}