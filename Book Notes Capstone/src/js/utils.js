
/**
 * UTILITY FUNCTIONS FOR WEBSITE FUNCTIONALITY
 * Organized by component/feature with detailed comments
 */

// ==================== NAVBAR TOGGLER ====================
/**
 * Initializes the navbar toggler functionality.
 * Handles expanding/collapsing the navbar and toggling related classes.
 */
function setupNavbarToggler() {
    'use strict';

    // Select navbar elements
    const navbar = document.querySelector(".navbar");
    const navbarToggler = document.querySelector(".navbar-toggler");
    const navbarCollapse = document.querySelector("#navbarNav");

    // Debugging: Ensure elements exist before proceeding
    if (!navbar) {
        console.warn("Navbar element (.navbar) not found.");
        return;
    }
    if (!navbarToggler) {
        console.warn("Navbar toggler (.navbar-toggler) not found.");
        return;
    }
    if (!navbarCollapse) {
        console.warn("Navbar collapse container (#navbarNav) not found.");
        return;
    }

    console.log("Navbar toggler initialized successfully."); // Debugging log

    // Event listener for toggler click
    navbarToggler.addEventListener("click", function () {
        navbar.classList.toggle("expanded"); // Toggle class instead of always adding
        console.log("Navbar toggled. Expanded:", navbar.classList.contains("expanded"));
    });

    // Event listener for Bootstrap collapse hiding event
    navbarCollapse.addEventListener("hidden.bs.collapse", function () {
        navbar.classList.remove("expanded");
        console.log("Navbar collapsed. Expanded class removed.");
    });
}

// ==================== COLOR THEME HANDLER ====================

/**
 * Handles color theme toggling.
 * 
 * This function:
 * - Detects the user's preferred color theme (light/dark/auto).
 * - Saves and retrieves theme preferences from local storage.
 * - Updates the UI accordingly, including theme icons and buttons.
 * - Listens for system theme changes if set to "auto".
 * 
 * Based on Bootstrap docs, with enhancements.
 */
function setupColorTheme() {
    'use strict';

    // ==================== THEME STORAGE ====================
    /**
     * Retrieves the stored theme from local storage.
     * @returns {string|null} The stored theme ('light', 'dark', 'auto') or null if not set.
     */
    const getStoredTheme = () => localStorage.getItem('theme');

    /**
     * Stores the selected theme in local storage.
     * @param {string} theme - The theme to store ('light', 'dark', 'auto').
     */
    const setStoredTheme = theme => localStorage.setItem('theme', theme);

    /**
     * Determines the preferred theme:
     * - Uses stored preference if available.
     * - Otherwise, detects system preference (dark/light mode).
     * @returns {string} The resolved theme ('light' or 'dark').
     */
    const getPreferredTheme = () => {
        const storedTheme = getStoredTheme();
        return storedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    };

    // ==================== THEME APPLICATION ====================
    /**
     * Applies the given theme to the document.
     * @param {string} theme - The theme to apply ('light', 'dark', or 'auto').
     */
    const setTheme = theme => {
        const resolvedTheme = theme === 'auto'
            ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
            : theme;

        document.documentElement.setAttribute('data-bs-theme', resolvedTheme);
    };

    /**
     * Updates UI elements to reflect the active theme.
     * @param {string} theme - The current theme ('light', 'dark', 'auto').
     * @param {boolean} [focus=false] - Whether to focus the theme toggle button.
     */
    const showActiveTheme = (theme, focus = false) => {
        const themeSwitcher = document.querySelector('#bd-theme');
        if (!themeSwitcher) return; // Exit if theme switcher is not found.

        // Select UI elements for theme switching
        const themeSwitcherText = document.querySelector('#bd-theme-text');
        const activeThemeIcon = document.querySelector('.theme-icon-active');
        const btnToActive = document.querySelector(`[data-bs-theme-value="${theme}"]`);

        // Deactivate all theme buttons
        document.querySelectorAll('[data-bs-theme-value]').forEach(element => {
            element.classList.remove('active');
            element.setAttribute('aria-pressed', 'false');
        });

        // Activate the selected theme button
        btnToActive.classList.add('active');
        btnToActive.setAttribute('aria-pressed', 'true');

        // Toggle icon based on theme
        const isDark = theme === 'dark' ||
            (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

        activeThemeIcon.classList.toggle('bi-sun-fill', !isDark);
        activeThemeIcon.classList.toggle('bi-moon-stars-fill', isDark);

        // Update ARIA label for accessibility
        themeSwitcher.setAttribute('aria-label', `${themeSwitcherText.textContent} (${btnToActive.dataset.bsThemeValue})`);

        if (focus) themeSwitcher.focus();
    };

    // ==================== INITIAL SETUP ====================
    // Apply the preferred theme at page load
    setTheme(getPreferredTheme());
    showActiveTheme(getPreferredTheme());

    // Listen for system theme changes (when theme is set to "auto")
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        const storedTheme = getStoredTheme();
        if (storedTheme !== 'light' && storedTheme !== 'dark') {
            setTheme(getPreferredTheme());
            showActiveTheme(getPreferredTheme());
        }
    });

    // ==================== THEME SWITCHER EVENT LISTENER ====================
    // Attach click event to all theme toggle buttons
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
 * Sets up Bootstrap form validation.
 * 
 * This function:
 * - Selects all forms with the `.needs-validation` class.
 * - Prevents form submission if validation fails.
 * - Adds Bootstrap’s `.was-validated` class to show validation styles.
 */
function setupFormValidation() {
    'use strict';

    // Select all forms that require validation
    const forms = document.querySelectorAll('.needs-validation');

    // Convert NodeList to an array and loop through each form
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            // Prevent form submission if invalid
            if (!form.checkValidity()) {
                event.preventDefault(); // Stop form submission
                event.stopPropagation(); // Prevent event bubbling
            }
            // Apply Bootstrap validation styling
            form.classList.add('was-validated');
        }, false);
    });
}

// ==================== CARD INTERACTIONS ====================

/**
 * Enables touch-based card flipping on tablets while preserving scroll behavior.
 * 
 * This function:
 * - Detects if the device is a tablet with a touch interface.
 * - Allows tapping on cards to flip them while preventing accidental scrolling.
 * - Ensures only one card is flipped at a time.
 * - Prevents flipping when clicking links inside the card.
 * - Unflips the card when tapping outside of it.
 */
function setupTabletCardFlip() {
    /**
     * Checks if the device is a tablet with a touch interface.
     * - `(hover: none) and (pointer: coarse)`: Ensures it's a touchscreen device.
     * - `(min-width: 768px)`: Ensures it's at least a tablet-sized screen.
     */
    const isTabletTouchDevice = () => (
        window.matchMedia('(hover: none) and (pointer: coarse)').matches &&
        window.matchMedia('(min-width: 768px)').matches
    );

    // Exit if the device is not a tablet with a touch interface
    if (!isTabletTouchDevice()) return;

    const cards = document.querySelectorAll('.card');
    let currentFlippedCard = null; // Keeps track of the currently flipped card
    let touchStart = { x: 0, y: 0 }; // Stores the touch start position
    let isScrolling = false; // Flag to check if the user is scrolling

    // Add touch event listeners to each card
    cards.forEach(card => {
        card.addEventListener('touchstart', handleTouchStart, { passive: true });
        card.addEventListener('touchmove', handleTouchMove, { passive: true });
        card.addEventListener('touchend', handleTouchEnd, { passive: true });

        // Prevent links inside cards from triggering card flips
        card.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', e => e.stopPropagation());
        });
    });

    /**
     * Handles the touch start event.
     * - Stores the initial touch position.
     * - Prevents flipping if touching a link.
     */
    function handleTouchStart(e) {
        if (e.target.closest('a')) return; // Ignore touches on links
        touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        isScrolling = false; // Reset scrolling flag
    }

    /**
     * Handles the touch move event.
     * - Determines if the user is scrolling by checking movement threshold.
     */
    function handleTouchMove(e) {
        const threshold = 10; // Minimum movement before detecting scrolling
        const xDiff = Math.abs(e.touches[0].clientX - touchStart.x);
        const yDiff = Math.abs(e.touches[0].clientY - touchStart.y);
        isScrolling = xDiff > threshold || yDiff > threshold; // Detect scrolling
    }

    /**
     * Handles the touch end event.
     * - If the user was scrolling, prevents the card from flipping.
     * - Toggles the flipped state of the card.
     * - Ensures only one card is flipped at a time.
     */
    function handleTouchEnd(e) {
        if (isScrolling || e.target.closest('a')) return; // Ignore if scrolling or touching a link

        const now = Date.now();
        if (now - (this.lastTouchTime || 0) < 300) return; // Prevents rapid double taps
        this.lastTouchTime = now;

        if (this === currentFlippedCard) {
            // Unflip if the tapped card is already flipped
            this.classList.remove('flipped');
            currentFlippedCard = null;
        } else {
            // Flip the tapped card and unflip any previously flipped card
            if (currentFlippedCard) currentFlippedCard.classList.remove('flipped');
            this.classList.add('flipped');
            currentFlippedCard = this;
        }
    }

    /**
     * Handles tap outside of a flipped card to close it.
     */
    document.addEventListener('touchstart', function (e) {
        if (currentFlippedCard && !currentFlippedCard.contains(e.target)) {
            currentFlippedCard.classList.remove('flipped');
            currentFlippedCard = null;
        }
    }, { passive: true });
}

// ==================== JQUERY DEPENDENT FUNCTIONS ====================

/**
 * Initializes jQuery-dependent functionality.
 * 
 * This function:
 * - Checks if jQuery is available before executing.
 * - Toggles a "no-scroll" class on the body when the navbar toggler is clicked.
 * - Implements lazy loading for background images.
 * - Expands book cards on mobile screens when clicked.
 * - Ensures book cards collapse when resizing to a larger screen.
 */
function setupJQueryFeatures() {
    // Exit if jQuery is not available
    if (typeof jQuery === 'undefined') return;

    $(function () {
        /**
         * Toggles the "no-scroll" class on the <body> when the navbar toggler is clicked.
         */
        $('#navbar-toggler').on('click', function () {
            $('body').toggleClass('no-scroll');
        });

        /**
         * Implements lazy loading for elements with the "lazy-load" class.
         * Loads the background image only when needed to improve performance.
         */
        $(".lazy-load").each(function () {
            const $this = $(this);
            const imageUrl = $this.data("bg"); // Retrieves background image URL from data attribute

            if (imageUrl) {
                const img = new Image();
                img.src = imageUrl;

                // Once the image is fully loaded, apply it as a background
                img.onload = () => {
                    $this.css("background-image", `url('${imageUrl}')`).addClass("loaded");
                };
            }
        });

        /**
         * Expands a book card on mobile when clicked and collapses others.
         * Ensures only one book card is expanded at a time.
         */
        $(document).on('click', '.book-card', function () {
            if (window.innerWidth <= 768) { // Only applies on mobile screens
                const $card = $(this).toggleClass('mobile-expanded'); // Toggle expansion on clicked card
                $('.book-card').not($card).removeClass('mobile-expanded'); // Collapse all other book cards

                // Scroll smoothly to the expanded card for better visibility
                if ($card.hasClass('mobile-expanded')) {
                    $('html').css('scroll-behavior', 'smooth');
                    window.scrollTo(0, $card.offset().top - 20);
                    setTimeout(() => $('html').css('scroll-behavior', 'auto'), 400); // Reset scroll behavior
                }
            }
        });

        /**
         * Removes the "mobile-expanded" class from all book cards
         * when resizing the window to a width greater than 768px.
         */
        $(window).on('resize', function () {
            if (window.innerWidth > 768) {
                $('.book-card').removeClass('mobile-expanded');
            }
        });
    });
}
// ==================== BOOK PAGINATION ====================

/**
 * Initializes pagination for a list of book cards.
 * 
 * This function:
 * - Limits the number of book cards displayed per page.
 * - Creates pagination controls (Previous, Next, and numbered pages).
 * - Updates the displayed books based on the selected page.
 * - Handles pagination button clicks to navigate through pages.
 */
function setupBookPagination() {
    const cardsPerPage = 12; // Maximum number of book cards per page
    const booksContainer = document.querySelector('.row.row-cols-1'); // Container holding all book cards
    const bookCards = Array.from(document.querySelectorAll('.book-card')); // Converts NodeList to an array

    // Exit if there's no book container or if pagination isn't needed
    if (!booksContainer || bookCards.length <= cardsPerPage) return;

    // Calculate the total number of pages required
    const totalPages = Math.ceil(bookCards.length / cardsPerPage);

    // Generate the pagination controls and insert them after the book container
    const paginationHTML = `
        <div class="pagination-container mt-5 mb-4">
            <nav aria-label="Books pagination">
                <ul class="pagination justify-content-center flex-wrap">
                    <li class="page-item prev">
                        <button class="page-link" aria-label="Previous">
                            <span aria-hidden="true">&laquo;</span>
                        </button>
                    </li>
                    <div class="page-numbers d-flex flex-wrap"></div>
                    <li class="page-item next">
                        <button class="page-link" aria-label="Next">
                            <span aria-hidden="true">&raquo;</span>
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
    `;
    booksContainer.insertAdjacentHTML('afterend', paginationHTML);

    // Select pagination elements after inserting them into the DOM
    const pageNumbersContainer = document.querySelector('.page-numbers');
    const prevBtn = document.querySelector('.pagination .prev');
    const nextBtn = document.querySelector('.pagination .next');

    /**
     * Updates the displayed book cards based on the selected page index.
     * 
     * @param {number} pageIndex - The index of the page to display (0-based).
     */
    const updatePagination = (pageIndex) => {
        const startIndex = pageIndex * cardsPerPage; // First book index for the current page
        const endIndex = startIndex + cardsPerPage; // Last book index for the current page

        // Loop through all book cards and display only the ones for the current page
        bookCards.forEach((card, index) => {
            if (index >= startIndex && index < endIndex) {
                card.classList.remove('d-none'); // Show book card
            } else {
                card.classList.add('d-none'); // Hide book card
            }
        });

        // Clear previous pagination numbers and generate new ones
        pageNumbersContainer.innerHTML = '';
        for (let i = 0; i < totalPages; i++) {
            const pageItem = document.createElement('li');
            pageItem.classList.add('page-item');
            pageItem.innerHTML = `
                <button class="page-link">${i + 1}</button>
            `;
            pageItem.addEventListener('click', () => updatePagination(i)); // Update page on click
            pageNumbersContainer.appendChild(pageItem);
        }

        // Enable/disable previous and next buttons based on the current page
        prevBtn.disabled = pageIndex === 0;
        nextBtn.disabled = pageIndex === totalPages - 1;
    };

    // Event listeners for previous and next page buttons
    prevBtn.addEventListener('click', () => updatePagination(0)); // Go to first page
    nextBtn.addEventListener('click', () => updatePagination(totalPages - 1)); // Go to last page

    updatePagination(0); // Initialize pagination on the first page
}

/**
 * Sets up event listeners for all elements with the class `.book-card`.
 * 
 * Each `.book-card` contains an inner `.card` element that flips when hovered over.
 * - Adds the `flipped` class on `mouseenter` to visually flip the card.
 * - Removes the `flipped` class on `mouseleave` to reset the flip.
 * - Logs events to the console for debugging purposes.
 */
function setupClickWithinCard() {
    if (window.matchMedia("(min-width: 768px)").matches) { // Adjust breakpoint as needed
        // Select all elements with the class 'book-card' and iterate over each
        document.querySelectorAll('.book-card').forEach((card) => {
            // Find the inner '.card' element within the book card
            const cardInner = card.querySelector('.card');

            // Add flip effect when the mouse enters the card
            cardInner.addEventListener('mouseenter', () => {
                cardInner.classList.add('flipped'); // Flip when entering
            });

            // Remove flip effect when the mouse leaves the card
            cardInner.addEventListener('mouseleave', () => {
                cardInner.classList.remove('flipped'); // Flip back when fully leaving
            });
        });
    }

}

function setupClickIndicatorHover() {
    if (window.innerWidth >= 992) { // Only applies on desktop screens
        // Step 2 will go here
        const cards = document.querySelectorAll('.book-card');

        cards.forEach((card) => {
            // Step 3 will go here
            const clickIndicator = card.querySelector('.click-indicator')

            // Add flip effect when the mouse enters the card
            clickIndicator.addEventListener('mouseenter', () => {
                clickIndicator.classList.add('hovered-note-indicator'); // Flip when entering
            });

            // Remove flip effect when the mouse leaves the card
            clickIndicator.addEventListener('mouseleave', () => {
                clickIndicator.classList.remove('hovered-note-indicator'); // Flip back when fully leaving
            });
        });
    }
}

window.addEventListener('DOMContentLoaded', () => {
    setupNavbarToggler();
    setupColorTheme();
    setupFormValidation();
    setupTabletCardFlip();
    setupJQueryFeatures();
    setupBookPagination();
    setupClickWithinCard();
    setupClickIndicatorHover();
});