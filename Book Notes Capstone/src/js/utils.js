// Function to set theme based on user preference
function setTheme(theme) {
    document.documentElement.setAttribute("data-bs-theme", theme);
    localStorage.setItem("theme", theme);
}

// Function to toggle between light and dark mode
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-bs-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    setTheme(newTheme);
}

// Function to load theme on page load
function loadTheme() {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        // Auto-detect system preference
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setTheme(prefersDark ? "dark" : "light");
    }
}

function setupNavbarToggler() {
    const navbar = document.querySelector(".navbar");
    const navbarToggler = document.querySelector(".navbar-toggler");
    const navbarCollapse = document.querySelector("#navbarNav");

    if (!navbar || !navbarToggler || !navbarCollapse) {
        console.warn("Navbar elements not found. Ensure the correct classes and IDs are used.");
        return;
    }

    navbarToggler.addEventListener("click", function () {
        if (navbarCollapse.classList.contains("show")) {
            console.log("Hello Show");
            navbar.classList.remove("expanded");
        } else {
            navbar.classList.add("expanded");
        }
    });

    navbarCollapse.addEventListener("hidden.bs.collapse", function () {
        navbar.classList.remove("expanded");
    });
}


document.addEventListener("DOMContentLoaded", setupNavbarToggler);

// Run theme check on page load
document.addEventListener("DOMContentLoaded", loadTheme);

$(document).ready(function () {
    // Select the navbar toggler and the body element
    const $navbarToggler = $('#navbar-toggler')
    const $body = $('body');

    // Toggle 'no-scroll' class on the body when the button is clicked
    $navbarToggler.on('click', function () {
        console.log("swag");
        $body.toggleClass('no-scroll');  // Toggle the 'no-scroll' class on the body
    });
});

// Expose the function to be used in HTML buttons
window.toggleTheme = toggleTheme;

