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

buttons.forEach(button => button.addEventListener("click", () => playSound(button.innerHTML)));
document.addEventListener("keydown", event => playSound(event.key));

function playSound(key) {
    const soundPath = sounds[key];
    if (soundPath) {
        new Audio(soundPath).play();
    }
}