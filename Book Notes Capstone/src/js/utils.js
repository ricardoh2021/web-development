/**
 * UTILITY FUNCTIONS FOR WEBSITE FUNCTIONALITY
 * Organized by component/feature with detailed comments
 */

// ==================== NAVBAR TOGGLER ====================
/**
 * Sets up the navbar toggler functionality
 * Handles expanding/collapsing the navbar and toggling related classes
 */
function setupNavbarToggler() {
    // Get required elements
    const navbar = document.querySelector(".navbar");
    const navbarToggler = document.querySelector(".navbar-toggler");
    const navbarCollapse = document.querySelector("#navbarNav");

    // Early return if elements not found
    if (!navbar || !navbarToggler || !navbarCollapse) {
        console.warn("Navbar elements not found. Ensure the correct classes and IDs are used.");
        return;
    }

    // Toggle expanded class on navbar when toggler is clicked
    navbarToggler.addEventListener("click", function () {
        navbar.classList.toggle("expanded", navbarCollapse.classList.contains("show"));
    });

    // Remove expanded class when collapse is hidden
    navbarCollapse.addEventListener("hidden.bs.collapse", function () {
        navbar.classList.remove("expanded");
    });
}

// ==================== COLOR THEME HANDLER ====================
/**
 * Color mode toggler functionality
 * Handles theme preference detection, storage, and application
 * Original source from Bootstrap docs with enhancements
 */
function setupColorTheme() {
    'use strict';

    // Theme storage functions
    const getStoredTheme = () => localStorage.getItem('theme');
    const setStoredTheme = theme => localStorage.setItem('theme', theme);

    // Get preferred theme (stored > system preference)
    const getPreferredTheme = () => {
        const storedTheme = getStoredTheme();
        if (storedTheme) return storedTheme;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    // Apply theme to document
    const setTheme = theme => {
        const resolvedTheme = theme === 'auto'
            ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
            : theme;
        document.documentElement.setAttribute('data-bs-theme', resolvedTheme);
    };

    // Update UI to reflect active theme
    const showActiveTheme = (theme, focus = false) => {
        const themeSwitcher = document.querySelector('#bd-theme');
        if (!themeSwitcher) return;

        const themeSwitcherText = document.querySelector('#bd-theme-text');
        const activeThemeIcon = document.querySelector('.theme-icon-active');
        const btnToActive = document.querySelector(`[data-bs-theme-value="${theme}"]`);

        // Update all theme buttons
        document.querySelectorAll('[data-bs-theme-value]').forEach(element => {
            element.classList.remove('active');
            element.setAttribute('aria-pressed', 'false');
        });

        // Activate current theme button
        btnToActive.classList.add('active');
        btnToActive.setAttribute('aria-pressed', 'true');

        // Update icon based on theme
        const isDark = theme === 'dark' ||
            (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

        activeThemeIcon.classList.toggle('bi-sun-fill', !isDark);
        activeThemeIcon.classList.toggle('bi-moon-stars-fill', isDark);

        // Update accessibility label
        themeSwitcher.setAttribute('aria-label', `${themeSwitcherText.textContent} (${btnToActive.dataset.bsThemeValue})`);

        if (focus) themeSwitcher.focus();
    };

    // Initialize theme on load
    setTheme(getPreferredTheme());
    showActiveTheme(getPreferredTheme());

    // Watch for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        const storedTheme = getStoredTheme();
        if (storedTheme !== 'light' && storedTheme !== 'dark') {
            setTheme(getPreferredTheme());
            showActiveTheme(getPreferredTheme());
        }
    });

    // Set up theme switcher buttons
    document.querySelectorAll('[data-bs-theme-value]').forEach(toggle => {
        toggle.addEventListener('click', () => {
            const theme = toggle.getAttribute('data-bs-theme-value');
            setStoredTheme(theme);
            setTheme(theme);
            showActiveTheme(theme, true);
        });
    });
}

// ==================== FORM VALIDATION ====================
/**
 * Bootstrap form validation handler
 * Applies validation styles and prevents invalid submissions
 */
function setupFormValidation() {
    'use strict';

    const forms = document.querySelectorAll('.needs-validation');

    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        }, false);
    });
}

// ==================== CARD INTERACTIONS ====================
/**
 * Tablet-specific card flip functionality
 * Handles touch interactions while preserving scroll behavior
 */
function setupTabletCardFlip() {
    // Detect tablet touch devices
    const isTabletTouchDevice = () => (
        window.matchMedia('(hover: none) and (pointer: coarse)').matches &&
        window.matchMedia('(min-width: 768px)').matches
    );

    if (!isTabletTouchDevice()) return;

    const cards = document.querySelectorAll('.card');
    let currentFlippedCard = null;
    let touchStart = { x: 0, y: 0 };
    let isScrolling = false;

    // Set up touch event handlers for each card
    cards.forEach(card => {
        card.addEventListener('touchstart', handleTouchStart, { passive: true });
        card.addEventListener('touchmove', handleTouchMove, { passive: true });
        card.addEventListener('touchend', handleTouchEnd, { passive: true });

        // Ensure links work normally within cards
        card.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', e => e.stopPropagation());
        });
    });

    function handleTouchStart(e) {
        if (e.target.closest('a')) return;
        touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        isScrolling = false;
    }

    function handleTouchMove(e) {
        const threshold = 10;
        const xDiff = Math.abs(e.touches[0].clientX - touchStart.x);
        const yDiff = Math.abs(e.touches[0].clientY - touchStart.y);
        isScrolling = xDiff > threshold || yDiff > threshold;
    }

    function handleTouchEnd(e) {
        if (isScrolling || e.target.closest('a')) return;

        // Debounce rapid touches
        const now = Date.now();
        if (now - (this.lastTouchTime || 0) < 300) return;
        this.lastTouchTime = now;

        // Toggle card flip state
        if (this === currentFlippedCard) {
            this.classList.remove('flipped');
            currentFlippedCard = null;
        } else {
            if (currentFlippedCard) currentFlippedCard.classList.remove('flipped');
            this.classList.add('flipped');
            currentFlippedCard = this;
        }
    }

    // Close flipped card when tapping outside
    document.addEventListener('touchstart', function (e) {
        if (currentFlippedCard && !currentFlippedCard.contains(e.target)) {
            currentFlippedCard.classList.remove('flipped');
            currentFlippedCard = null;
        }
    }, { passive: true });
}

// ==================== JQUERY DEPENDENT FUNCTIONS ====================
/**
 * jQuery-dependent functionality
 * Only runs if jQuery is available
 */
function setupJQueryFeatures() {
    if (typeof jQuery === 'undefined') return;

    $(function () {
        // Body scroll lock when navbar is open
        $('#navbar-toggler').on('click', function () {
            $('body').toggleClass('no-scroll');
        });

        // Lazy loading for background images
        $(".lazy-load").each(function () {
            const $this = $(this);
            const imageUrl = $this.data("bg");

            if (imageUrl) {
                const img = new Image();
                img.src = imageUrl;
                img.onload = () => {
                    $this.css("background-image", `url('${imageUrl}')`).addClass("loaded");
                };
            }
        });

        // Mobile card expansion
        $(document).on('click', '.book-card', function () {
            if (window.innerWidth <= 768) {
                const $card = $(this).toggleClass('mobile-expanded');
                $('.book-card').not($card).removeClass('mobile-expanded');

                if ($card.hasClass('mobile-expanded')) {
                    $('html').css('scroll-behavior', 'smooth');
                    window.scrollTo(0, $card.offset().top - 20);
                    setTimeout(() => $('html').css('scroll-behavior', 'auto'), 400);
                }
            }
        });

        // Reset mobile states on desktop
        $(window).on('resize', function () {
            if (window.innerWidth > 768) {
                $('.book-card').removeClass('mobile-expanded');
            }
        });
    });
}

// ==================== INITIALIZATION ====================
/**
 * Initialize all functionality when DOM is ready
 */
document.addEventListener('DOMContentLoaded', function () {
    setupNavbarToggler();
    setupColorTheme();
    setupFormValidation();
    setupTabletCardFlip();
    setupJQueryFeatures();
});