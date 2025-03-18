// Function to set theme based on user preference
function setTheme(theme) {
    document.documentElement.setAttribute("data-bs-theme", theme);
    localStorage.setItem("theme", theme);
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

/*!
 * Color mode toggler for Bootstrap's docs (https://getbootstrap.com/)
 * Copyright 2011-2024 The Bootstrap Authors
 * Licensed under the Creative Commons Attribution 3.0 Unported License.
 */

(() => {
    'use strict'

    const getStoredTheme = () => localStorage.getItem('theme')
    const setStoredTheme = theme => localStorage.setItem('theme', theme)

    const getPreferredTheme = () => {
        const storedTheme = getStoredTheme()
        if (storedTheme) {
            return storedTheme
        }

        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }

    const setTheme = theme => {
        if (theme === 'auto') {
            document.documentElement.setAttribute('data-bs-theme', (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'))
        } else {
            document.documentElement.setAttribute('data-bs-theme', theme)
        }
    }

    setTheme(getPreferredTheme())

    const showActiveTheme = (theme, focus = false) => {
        const themeSwitcher = document.querySelector('#bd-theme')

        if (!themeSwitcher) {
            return
        }

        const themeSwitcherText = document.querySelector('#bd-theme-text')
        const activeThemeIcon = document.querySelector('.theme-icon-active')
        const btnToActive = document.querySelector(`[data-bs-theme-value="${theme}"]`)

        document.querySelectorAll('[data-bs-theme-value]').forEach(element => {
            element.classList.remove('active')
            element.setAttribute('aria-pressed', 'false')
        })

        btnToActive.classList.add('active')
        btnToActive.setAttribute('aria-pressed', 'true')

        // Change the icon class based on the theme
        if (theme === 'dark') {
            activeThemeIcon.classList.remove('bi-sun-fill');
            activeThemeIcon.classList.add('bi-moon-stars-fill');
        } else if (theme === 'light') {
            activeThemeIcon.classList.remove('bi-moon-stars-fill');
            activeThemeIcon.classList.add('bi-sun-fill');
        } else if (theme === 'auto') {
            // Determine the current preference and set the icon accordingly
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                activeThemeIcon.classList.remove('bi-sun-fill');
                activeThemeIcon.classList.add('bi-moon-stars-fill');
            } else {
                activeThemeIcon.classList.remove('bi-moon-stars-fill');
                activeThemeIcon.classList.add('bi-sun-fill');
            }
        }

        const themeSwitcherLabel = `${themeSwitcherText.textContent} (${btnToActive.dataset.bsThemeValue})`
        themeSwitcher.setAttribute('aria-label', themeSwitcherLabel)

        if (focus) {
            themeSwitcher.focus()
        }
    }

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        const storedTheme = getStoredTheme()
        if (storedTheme !== 'light' && storedTheme !== 'dark') {
            setTheme(getPreferredTheme())
        }
    })

    window.addEventListener('DOMContentLoaded', () => {
        showActiveTheme(getPreferredTheme())

        document.querySelectorAll('[data-bs-theme-value]')
            .forEach(toggle => {
                toggle.addEventListener('click', () => {
                    const theme = toggle.getAttribute('data-bs-theme-value')
                    setStoredTheme(theme)
                    setTheme(theme)
                    showActiveTheme(theme, true)
                })
            })
    })
})()

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

// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
    'use strict'

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.needs-validation')

    // Loop over them and prevent submission
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault()
                event.stopPropagation()
            }

            form.classList.add('was-validated')
        }, false)
    })
})()




