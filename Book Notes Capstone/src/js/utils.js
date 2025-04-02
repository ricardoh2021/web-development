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
        $body.toggleClass('no-scroll');  // Toggle the 'no-scroll' class on the body
    });

    // Lazy Loading
    $(".lazy-load").each(function () {
        const $this = $(this);
        const imageUrl = $this.data("bg");

        if (imageUrl) {
            const img = new Image();
            img.src = imageUrl;
            img.onload = function () {
                $this.css("background-image", `url('${imageUrl}')`).addClass("loaded");
            };
        }
    });
});

// Mobile tap handler
$(document).on('click', '.book-card', function () {
    if (window.innerWidth <= 768) { // Mobile only
        const $card = $(this);

        // Toggle expanded state
        $card.toggleClass('mobile-expanded');

        // Close other expanded cards
        $('.book-card').not($card).removeClass('mobile-expanded');

        // Scroll to card if opening
        if ($card.hasClass('mobile-expanded')) {
            const cardTop = $card.offset().top - 20;
            $('html').css('scroll-behavior', 'smooth');
            window.scrollTo(0, cardTop);

            // Reset after scroll completes
            setTimeout(() => {
                $('html').css('scroll-behavior', 'auto');
            }, 400);
        }
    }
});

// Desktop hover handler remains the same
$(window).on('resize', function () {
    // Reset mobile states when resizing to desktop
    if (window.innerWidth > 768) {
        $('.book-card').removeClass('mobile-expanded');
    }
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
