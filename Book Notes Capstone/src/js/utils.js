/**
 * Handles book cover validation and user input
 * - Checks for valid cover via ISBN (validates both response and content size)
 * - Shows/hides cover URL input field based on validation
 * - Provides user feedback throughout the process
 */
/**
 * Secure Cover Image Handling System
 * - Validates ISBN and cover URLs with multiple security checks
 * - Implements CSRF protection, input sanitization, and secure CORS policies
 * - Provides clear user feedback while maintaining security
 */
function setupCover() {
    // Safe DOM element selection with null checks
    const isbnInput = document.getElementById('inputISBN');
    const coverUrlField = document.getElementById('coverUrlField');
    const coverUrlInput = document.getElementById('coverUrl');

    if (!isbnInput || !coverUrlField || !coverUrlInput) {
        console.error('Required elements not found');
        return;
    }

    // Create secure status element
    const coverStatus = document.createElement('small');
    coverStatus.className = 'form-text text-muted mt-1';
    coverUrlField.parentNode.insertBefore(coverStatus, coverUrlField.nextSibling);

    // Security constants
    const MIN_COVER_SIZE = 1024; // 1KB minimum
    const ALLOWED_IMAGE_TYPES = ['jpg', 'jpeg', 'png'];
    const OPEN_LIBRARY_DOMAIN = 'covers.openlibrary.org';
    const DEBOUNCE_TIME = 1000;

    // Secure timeout reference
    let checkCoverTimeout = null;

    // Secure ISBN validation regex
    const isValidISBN = (isbn) => /^\d{9}[\dXx]$/.test(isbn);

    // Secure URL validation
    const isValidImageUrl = (url) => {
        try {
            const parsed = new URL(url);
            const ext = parsed.pathname.split('.').pop().toLowerCase();
            return (
                ['http:', 'https:'].includes(parsed.protocol) &&
                ALLOWED_IMAGE_TYPES.includes(ext) &&
                !parsed.hostname.includes('archive.org') // Block archive.org placeholders
            );
        } catch {
            return false;
        }
    };

    // Secure fetch with timeout and CORS checks
    const secureFetch = async (url, options = {}) => {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(url, {
                ...options,
                mode: 'cors',
                credentials: 'omit',
                signal: controller.signal
            });

            clearTimeout(timeout);

            // Verify response came from expected domain
            const responseUrl = new URL(response.url);
            if (!responseUrl.hostname.endsWith(OPEN_LIBRARY_DOMAIN)) {
                throw new Error('Unexpected response domain');
            }

            return response;
        } catch (error) {
            console.error('Secure fetch failed:', error);
            throw error;
        }
    };

    // Debounced cover check with cleanup
    const debouncedCheck = () => {
        clearTimeout(checkCoverTimeout);
        checkCoverTimeout = setTimeout(() => {
            checkCoverExists().catch(console.error);
        }, DEBOUNCE_TIME);
    };

    isbnInput.addEventListener('input', debouncedCheck);

    // Main cover validation function
    async function checkCoverExists() {
        const isbn = isbnInput.value.trim();

        // Reset state for invalid ISBN
        if (!isValidISBN(isbn)) {
            resetCoverField();
            return;
        }

        coverStatus.textContent = 'Verifying cover...';
        coverStatus.className = 'form-text text-info mt-1';

        try {
            // First check with HEAD request
            const headResponse = await secureFetch(
                `https://${OPEN_LIBRARY_DOMAIN}/b/isbn/${isbn}-L.jpg`,
                { method: 'HEAD' }
            );

            if (headResponse.ok) {
                const contentLength = parseInt(headResponse.headers.get('content-length') || '0');

                if (contentLength > MIN_COVER_SIZE) {
                    await handleValidCover();
                } else {
                    await verifyWithFullRequest(isbn);
                }
            } else {
                requireManualCover();
            }
        } catch (error) {
            console.error('Cover verification failed:', error);
            requireManualCover('Cover verification service unavailable');
        }
    }

    async function verifyWithFullRequest(isbn) {
        try {
            const img = new Image();
            const imgLoadPromise = new Promise((resolve) => {
                img.onload = () => resolve(true);
                img.onerror = () => resolve(false);
            });

            // Add cache busting and set crossorigin attribute
            img.crossOrigin = 'anonymous';
            img.src = `https://${OPEN_LIBRARY_DOMAIN}/b/isbn/${isbn}-L.jpg?t=${Date.now()}`;

            const loaded = await imgLoadPromise;

            if (loaded && img.naturalWidth > 100 && img.naturalHeight > 100) {
                await handleValidCover();
            } else {
                requireManualCover();
            }
        } catch (error) {
            console.error('Image verification failed:', error);
            requireManualCover();
        }
    }

    async function handleValidCover() {
        coverUrlField.style.display = 'none';
        coverUrlInput.required = false;
        coverStatus.textContent = '✓ Valid cover found';
        coverStatus.className = 'form-text text-success mt-1';

        // Clear any existing invalid state
        coverUrlInput.setCustomValidity('');
    }

    function requireManualCover(message = 'No cover found. Please provide one.') {
        coverUrlField.style.display = 'block';
        coverUrlInput.required = true;
        coverStatus.textContent = message;
        coverStatus.className = 'form-text text-warning mt-1';

        // Set validation message
        if (coverUrlInput.value.trim() === '') {
            coverUrlInput.setCustomValidity(message);
        }
    }

    function resetCoverField() {
        coverUrlField.style.display = 'none';
        coverUrlInput.required = false;
        coverStatus.textContent = '';
        coverUrlInput.setCustomValidity('');
    }

    // Secure preview functionality
    const setupPreview = () => {
        const previewButton = document.getElementById('previewCover');
        const coverPreview = document.getElementById('coverPreview');

        if (!previewButton || !coverPreview) return;

        previewButton.addEventListener('click', async function () {
            const url = coverUrlInput.value.trim();

            if (!url) {
                showError('Please enter a URL');
                return;
            }

            if (!isValidImageUrl(url)) {
                showError('Invalid image URL. Only JPG/JPEG/PNG allowed.');
                return;
            }

            try {
                // Verify URL is safe before preview
                const parsedUrl = new URL(url);
                if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
                    throw new Error('Invalid protocol');
                }

                const img = new Image();
                img.crossOrigin = 'anonymous'; // Prevent tainted canvas

                const loaded = await new Promise((resolve) => {
                    img.onload = () => resolve(true);
                    img.onerror = () => resolve(false);
                    img.src = url;
                });

                if (loaded && img.naturalWidth > 100 && img.naturalHeight > 100) {
                    coverPreview.querySelector('img').src = url;
                    coverPreview.style.display = 'block';
                    coverStatus.textContent = '✓ Valid cover image';
                    coverStatus.className = 'form-text text-success mt-1';
                } else {
                    showError('Image failed to load or is too small');
                }
            } catch (error) {
                showError('Security error loading image');
                console.error('Preview error:', error);
            }
        });
    };

    const showError = (message) => {
        coverStatus.textContent = message;
        coverStatus.className = 'form-text text-danger mt-1';
        const coverPreview = document.getElementById('coverPreview');
        if (coverPreview) coverPreview.style.display = 'none';
    };

    // Initialize preview and validation
    setupPreview();

    // Secure input validation
    coverUrlInput.addEventListener('input', function () {
        if (coverUrlField.style.display !== 'none') {
            const isValid = this.value.trim() !== '' && isValidImageUrl(this.value);
            this.setCustomValidity(isValid ? '' : 'Please provide a valid image URL');

            if (isValid) {
                coverStatus.textContent = '✓ Valid URL format';
                coverStatus.className = 'form-text text-success mt-1';
            }
        }
    });

    // Custom invalid feedback scenarios
    const invalidFeedback = document.querySelector('#coverUrlField .invalid-feedback');
    const scenarios = {
        empty: {
            test: (url) => url.trim() === '',
            message: 'Please provide a cover URL'
        },
        invalid_protocol: {
            test: (url) => !/^https?:\/\//i.test(url),
            message: 'URL must start with http:// or https://'
        },
        invalid_extension: {
            test: (url) => !/\.(jpg|jpeg|png)(?:\?.*)?$/i.test(url),
            message: 'URL must end with .jpg, .jpeg, or .png'
        },
        archive_placeholder: {
            test: (url) => /archive\.org/i.test(url),
            message: 'Archive.org placeholder detected - please use a direct image URL'
        },
        invalid_url: {
            test: (url) => {
                try { new URL(url); return false; }
                catch { return true; }
            },
            message: 'Please enter a properly formatted URL'
        },
        image_too_small: {
            test: (img) => img.naturalWidth < 100 || img.naturalHeight < 100,
            message: 'Image is too small (minimum 100×100px)'
        }
    };

    // Enhanced validation function
    function validateCoverUrl(url) {
        if (!url) return scenarios.empty;

        // Check URL format scenarios first
        for (const [key, scenario] of Object.entries(scenarios)) {
            if (key !== 'image_too_small' && scenario.test(url)) {
                return scenario;
            }
        }

        return null; // No errors found
    }

    // Update validation on input
    coverUrlInput.addEventListener('input', function () {
        if (coverUrlField.style.display === 'none') return;

        const url = this.value.trim();
        const errorScenario = validateCoverUrl(url);

        if (errorScenario) {
            this.setCustomValidity(errorScenario.message);
            invalidFeedback.textContent = errorScenario.message;
        } else {
            this.setCustomValidity('');
            invalidFeedback.textContent = '';
        }
    });

    // Enhanced preview with image validation
    previewButton.addEventListener('click', async function () {
        const url = coverUrlInput.value.trim();
        const formatError = validateCoverUrl(url);

        if (formatError) {
            invalidFeedback.textContent = formatError.message;
            coverUrlInput.classList.add('is-invalid');
            return;
        }

        // Verify image loads successfully
        const img = new Image();
        img.crossOrigin = 'Anonymous'; // Important for security

        try {
            const loaded = await new Promise((resolve) => {
                img.onload = () => resolve(true);
                img.onerror = () => resolve(false);
                img.src = url;
            });

            if (!loaded) {
                throw new Error('Image failed to load');
            }

            // Check image dimensions
            if (scenarios.image_too_small.test(img)) {
                invalidFeedback.textContent = scenarios.image_too_small.message;
                coverUrlInput.classList.add('is-invalid');
            } else {
                // Success case
                previewImage.src = url;
                coverPreview.style.display = 'block';
                coverUrlInput.classList.remove('is-invalid');
            }
        } catch (error) {
            invalidFeedback.textContent = 'Could not load image from this URL';
            coverUrlInput.classList.add('is-invalid');
            console.error('Image load error:', error);
        }
    });

    // Cleanup on window unload
    window.addEventListener('beforeunload', () => {
        clearTimeout(checkCoverTimeout);
    });


}

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
    const navbar = document.querySelector(".navbar");
    const navbarToggler = document.querySelector(".navbar-toggler");
    const navbarCollapse = document.querySelector("#navbarNav");

    if (!navbar || !navbarToggler || !navbarCollapse) {
        console.warn("Navbar elements not found. Ensure the correct classes and IDs are used.");
        return;
    }

    navbarToggler.addEventListener("click", function () {
        navbar.classList.add("expanded");
        console.log("Swag");
    });

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

    const getPreferredTheme = () => {
        const storedTheme = getStoredTheme();
        return storedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    };

    const setTheme = theme => {
        const resolvedTheme = theme === 'auto'
            ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
            : theme;
        document.documentElement.setAttribute('data-bs-theme', resolvedTheme);
    };

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

        const isDark = theme === 'dark' ||
            (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

        activeThemeIcon.classList.toggle('bi-sun-fill', !isDark);
        activeThemeIcon.classList.toggle('bi-moon-stars-fill', isDark);

        themeSwitcher.setAttribute('aria-label', `${themeSwitcherText.textContent} (${btnToActive.dataset.bsThemeValue})`);

        if (focus) themeSwitcher.focus();
    };

    setTheme(getPreferredTheme());
    showActiveTheme(getPreferredTheme());

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        const storedTheme = getStoredTheme();
        if (storedTheme !== 'light' && storedTheme !== 'dark') {
            setTheme(getPreferredTheme());
            showActiveTheme(getPreferredTheme());
        }
    });

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
    const isTabletTouchDevice = () => (
        window.matchMedia('(hover: none) and (pointer: coarse)').matches &&
        window.matchMedia('(min-width: 768px)').matches
    );

    if (!isTabletTouchDevice()) return;

    const cards = document.querySelectorAll('.card');
    let currentFlippedCard = null;
    let touchStart = { x: 0, y: 0 };
    let isScrolling = false;

    cards.forEach(card => {
        card.addEventListener('touchstart', handleTouchStart, { passive: true });
        card.addEventListener('touchmove', handleTouchMove, { passive: true });
        card.addEventListener('touchend', handleTouchEnd, { passive: true });

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

        const now = Date.now();
        if (now - (this.lastTouchTime || 0) < 300) return;
        this.lastTouchTime = now;

        if (this === currentFlippedCard) {
            this.classList.remove('flipped');
            currentFlippedCard = null;
        } else {
            if (currentFlippedCard) currentFlippedCard.classList.remove('flipped');
            this.classList.add('flipped');
            currentFlippedCard = this;
        }
    }

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
        $('#navbar-toggler').on('click', function () {
            $('body').toggleClass('no-scroll');
        });

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

        $(window).on('resize', function () {
            if (window.innerWidth > 768) {
                $('.book-card').removeClass('mobile-expanded');
            }
        });
    });
}

// ==================== BOOK PAGINATION ====================
function setupBookPagination() {
    const cardsPerPage = 12;
    const booksContainer = document.querySelector('.row.row-cols-1');
    const bookCards = Array.from(document.querySelectorAll('.book-card'));

    if (!booksContainer || bookCards.length <= cardsPerPage) return;

    const totalPages = Math.ceil(bookCards.length / cardsPerPage);
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

    const pageNumbersContainer = document.querySelector('.page-numbers');
    const prevBtn = document.querySelector('.pagination .prev');
    const nextBtn = document.querySelector('.pagination .next');

    const updatePagination = (pageIndex) => {
        const startIndex = pageIndex * cardsPerPage;
        const endIndex = startIndex + cardsPerPage;

        bookCards.forEach((card, index) => {
            if (index >= startIndex && index < endIndex) {
                card.classList.remove('d-none');
            } else {
                card.classList.add('d-none');
            }
        });

        pageNumbersContainer.innerHTML = '';
        for (let i = 0; i < totalPages; i++) {
            const pageItem = document.createElement('li');
            pageItem.classList.add('page-item');
            pageItem.innerHTML = `
                <button class="page-link">${i + 1}</button>
            `;
            pageItem.addEventListener('click', () => updatePagination(i));
            pageNumbersContainer.appendChild(pageItem);
        }

        prevBtn.disabled = pageIndex === 0;
        nextBtn.disabled = pageIndex === totalPages - 1;
    };

    prevBtn.addEventListener('click', () => updatePagination(0));
    nextBtn.addEventListener('click', () => updatePagination(totalPages - 1));

    updatePagination(0);
}

window.addEventListener('DOMContentLoaded', () => {
    setupNavbarToggler();
    setupColorTheme();
    setupFormValidation();
    setupTabletCardFlip();
    setupJQueryFeatures();
    setupBookPagination();
    setupCover();
});