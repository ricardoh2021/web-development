// Import Flatpickr styles (ensures Webpack bundles them)
import 'flatpickr/dist/flatpickr.min.css';
import flatpickr from "flatpickr";

$(document).ready(function () {
    // Initialize flatpickr
    const $datepicker = $('#datepicker');
    const $stars = $('.star-wrapper');
    const $ratingInput = $('#bookRating');
    let currentHover = 0; // The current hover rating. THis will be used to check if currently hovering or not.
    let selectedRating = 0; //The selected rating when clicked

    const datepickerInstance = $datepicker.flatpickr({
        altInput: true,
        altFormat: "F j, Y",
        dateFormat: "Y-m-d",
        maxDate: 'today',
        onClose: function (_, dateStr, instance) {
            updateInputValidity(instance.input, instance.altInput, dateStr);
        }
    });

    // Form submission handler
    $("form").on("submit", function (event) {
        const isValid = !!$datepicker.val().trim();
        updateInputValidity($datepicker[0], $datepicker.siblings(".form-control")[0], isValid);

        if (!isValid) {
            event.preventDefault();
        }
    });

    // Shared function to update input validity
    function updateInputValidity(inputElement, altInputElement, isValid) {
        const $input = $(inputElement);
        const $altInput = $(altInputElement);
        const hasValue = typeof isValid === 'string' ? !!isValid : isValid;

        if (hasValue) {
            $input.addClass("is-valid").removeClass("is-invalid");
            $altInput.addClass("is-valid").removeClass("is-invalid");
        } else {
            $input.addClass("is-invalid").removeClass("is-valid");
            $altInput.addClass("is-invalid").removeClass("is-valid");
        }
    }

    $stars.on("mousemove", function (e) {
        const $star = $(this);
        const starPos = e.pageX - $star.offset().left;
        const starWidth = $star.width();
        const starValue = $star.data("rating");

        //Determin if half of star or not. 
        const isHalfStar = starPos < starWidth / 2;
        currentHover = isHalfStar ? starValue - 0.5 : starValue;

        updateHoverDisplay();

    })

    $stars.on('mouseleave', function () {
        currentHover = 0;
        updateHoverDisplay();
    });

    // Handle star click
    $stars.on('click', function (e) {
        const $star = $(this);
        const starPos = e.pageX - $star.offset().left;
        const starWidth = $star.width();
        const starValue = parseFloat($star.data('rating'));

        selectedRating = starPos < starWidth / 2 ? starValue - 0.5 : starValue;
        $ratingInput.val(selectedRating);
        updateSelectedDisplay();
    });

    function updateHoverDisplay() {
        // •	Remove previous classes.
        $stars.removeClass("hover-half hover-full");
        // •	Check if hovering.
        if (currentHover > 0) {
            $stars.each(function () {
                const starValue = parseFloat($(this).data("rating"));

                if (starValue <= currentHover) {
                    $(this).addClass("hover-full");
                }
                else if (starValue - 0.5 === currentHover) {
                    $(this).addClass("hover-half");

                }
            })
        }
    }

    function feedbackTextBasedOnRating(rating) {
        const feedbackText = "Hover and click on left/right side of stars";

        const ratings = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

        const feedbackMessages = {
            0.5: "You wasted your time. Learn from this failure. Adapt. Move on. 📉",
            1: "That book broke you, but you ain’t staying down. Find a better one. 🔥",
            1.5: "You forced yourself to finish, but was it worth it? Demand more. 🏋️",
            2: "Mediocre effort. You don’t settle for average—why should your books? ⚔️",
            2.5: "Halfway decent, but halfway doesn’t cut it in life. Keep pushing. 🚀",
            3: "Solid, but solid isn’t greatness. What did you LEARN? Apply it. 📖",
            3.5: "This book had value, but don’t just read—EXECUTE. Get after it. 🔥",
            4: "That was strong! Take the lessons and make them count. No excuses. 💯",
            4.5: "Great book! But greatness demands ACTION. Don’t just read—LIVE IT. 🚀",
            5: "This book is a WEAPON. If you don’t use what you learned, you wasted it. GO! 🔥💪",
        };

        if (ratings.includes(rating)) {
            $('.rating-feedback').text(`Rating: ${rating}: ${feedbackMessages[rating]}`);
        }
        else {
            $('.rating-feedback').text(feedbackText);
        }
    }

    function updateSelectedDisplay() {
        $stars.removeClass('selected-half selected-full');

        $stars.each(function () {
            const starValue = parseFloat($(this).data('rating'));

            if (starValue <= selectedRating) {
                $(this).addClass('selected-full');
            }
            else if (starValue - 0.5 === selectedRating) {
                $(this).addClass('selected-half');
            }
        });

        // Update feedback text
        feedbackTextBasedOnRating(selectedRating);
    }
});

/**
 * Sets up cover image validation and preview functionality for book entries.
 * Handles:
 * - Automatic cover lookup by ISBN
 * - Manual cover URL validation
 * - Image preview with security checks
 * - User feedback and error handling
 */
function setupCover() {
    // Debug initialization
    console.debug('[setupCover] Initializing cover management system');

    // --- DOM ELEMENT SELECTION ---
    // Safe element selection with null checks and debug logging
    const isbnInput = document.getElementById('inputISBN');
    const coverUrlField = document.getElementById('coverUrlField');
    const coverUrlInput = document.getElementById('coverUrl');

    if (!isbnInput || !coverUrlField || !coverUrlInput) {
        console.error('[setupCover] Critical Error: Required DOM elements not found');
        return;
    } else {
        console.debug('[setupCover] Found all required DOM elements');
    }

    // Create status element for user feedback
    const coverStatus = document.createElement('small');
    coverStatus.className = 'form-text text-muted mt-1';
    coverStatus.setAttribute('aria-live', 'polite'); // For screen readers
    coverUrlField.parentNode.insertBefore(coverStatus, coverUrlField.nextSibling);
    console.debug('[setupCover] Created status notification element');

    // --- SECURITY CONSTANTS ---
    const MIN_COVER_SIZE = 1024; // 1KB minimum to avoid placeholder images
    const ALLOWED_IMAGE_TYPES = ['jpg', 'jpeg', 'png'];
    const OPEN_LIBRARY_DOMAIN = 'covers.openlibrary.org';
    const US_ARCHIVE_DOMAIN = 'us.archive.org';
    const DEBOUNCE_TIME = 1000; // 1 second debounce for ISBN input

    // --- STATE MANAGEMENT ---
    let checkCoverTimeout = null;
    console.debug('[setupCover] Initialized state variables');

    // --- VALIDATION FUNCTIONS ---

    /**
     * Validates ISBN format (10-digit with optional X check digit)
     * @param {string} isbn - The ISBN to validate
     * @returns {boolean} True if valid ISBN format
     */
    const isValidISBN = (isbn) => {
        const result = /^\d{9}[\dXx]$/.test(isbn);
        console.debug(`[isValidISBN] Validating "${isbn}": ${result}`);
        return result;
    };

    /**
     * Validates image URLs with security checks
     * @param {string} url - The URL to validate
     * @returns {boolean} True if URL is safe and points to allowed image type
     */
    const isValidImageUrl = (url) => {
        try {
            const parsed = new URL(url);
            const ext = parsed.pathname.split('.').pop().toLowerCase();

            // Security checks:
            const validProtocol = ['http:', 'https:'].includes(parsed.protocol);
            const validExtension = ALLOWED_IMAGE_TYPES.includes(ext);
            const notArchive = !parsed.hostname.includes('archive.org');

            const result = validProtocol && validExtension && notArchive;
            console.debug(`[isValidImageUrl] Validating "${url}": ${result}`);

            return result;
        } catch (error) {
            console.debug(`[isValidImageUrl] Invalid URL format: "${url}"`);
            return false;
        }
    };

    // --- NETWORK FUNCTIONS ---

    /**
     * Secure fetch wrapper with timeout and CORS checks
     * @param {string} url - URL to fetch
     * @param {object} options - Fetch options
     * @returns {Promise<Response>} Fetch response
     * @throws {Error} On network failure or security violation
     */
    const secureFetch = async (url, options = {}) => {
        console.debug(`[secureFetch] Attempting secure fetch to: ${url}`);

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
            console.log(responseUrl.hostname);
            if (!responseUrl.hostname.endsWith(OPEN_LIBRARY_DOMAIN) && !responseUrl.hostname.endsWith(US_ARCHIVE_DOMAIN)) {
                console.warn('[secureFetch] Security Alert: Response from unexpected domain', responseUrl.hostname);
                throw new Error('Unexpected response domain');
            }

            console.debug(`[secureFetch] Successfully fetched: ${url}`);
            return response;
        } catch (error) {
            console.error('[secureFetch] Network Error:', error.message, 'for URL:', url);
            throw error;
        }
    };

    // --- DEBOUNCE HANDLING ---

    /**
     * Debounced cover check to prevent rapid firing during typing
     */
    const debouncedCheck = () => {
        console.debug('[debouncedCheck] ISBN input detected, starting debounce timer');
        clearTimeout(checkCoverTimeout);
        checkCoverTimeout = setTimeout(() => {
            console.debug('[debouncedCheck] Executing delayed cover check');
            checkCoverExists().catch(error => {
                console.error('[debouncedCheck] Error during cover check:', error);
            });
        }, DEBOUNCE_TIME);
    };

    // --- EVENT LISTENERS ---
    isbnInput.addEventListener('input', debouncedCheck);
    console.debug('[setupCover] Added ISBN input listener');

    // --- MAIN COVER CHECK LOGIC ---

    /**
     * Main cover validation workflow
     * 1. Checks ISBN validity
     * 2. Attempts HEAD request to check cover existence
     * 3. Falls back to full image load if needed
     */
    async function checkCoverExists() {
        const isbn = isbnInput.value.trim();
        console.log(`[checkCoverExists] Starting check for ISBN: ${isbn}`);

        // Reset state for invalid ISBN
        if (!isValidISBN(isbn)) {
            console.debug('[checkCoverExists] Invalid ISBN format, resetting');
            resetCoverField();
            return;
        }

        // Update UI state
        coverStatus.textContent = 'Verifying cover...';
        coverStatus.className = 'form-text text-info mt-1';
        console.debug('[checkCoverExists] Showing verification status');

        try {
            // First attempt with lightweight HEAD request
            console.debug('[checkCoverExists] Trying HEAD request');
            const headResponse = await secureFetch(
                `https://${OPEN_LIBRARY_DOMAIN}/b/isbn/${isbn}-L.jpg`,
                { method: 'HEAD' }
            );

            if (headResponse.ok) {
                const contentLength = parseInt(headResponse.headers.get('content-length') || '0');
                console.debug(`[checkCoverExists] HEAD response size: ${contentLength} bytes`);

                if (contentLength > MIN_COVER_SIZE) {
                    console.debug('[checkCoverExists] Valid cover found via HEAD');
                    await handleValidCover();
                } else {
                    console.debug('[checkCoverExists] Small file size, verifying with full request');
                    await verifyWithFullRequest(isbn);
                }
            } else {
                console.debug('[checkCoverExists] No cover found via HEAD');
                requireManualCover();
            }
        } catch (error) {
            console.error('[checkCoverExists] Verification failed:', error);
            requireManualCover('Cover verification service unavailable');
        }
    }

    /**
     * Fallback verification by loading full image
     * @param {string} isbn - ISBN to check
     */
    async function verifyWithFullRequest(isbn) {
        console.debug(`[verifyWithFullRequest] Starting full image load for ISBN: ${isbn}`);

        try {
            const img = new Image();
            const imgLoadPromise = new Promise((resolve) => {
                img.onload = () => {
                    console.debug('[verifyWithFullRequest] Image loaded successfully');
                    resolve(true);
                };
                img.onerror = () => {
                    console.debug('[verifyWithFullRequest] Image failed to load');
                    resolve(false);
                };
            });

            // Security attributes
            img.crossOrigin = 'anonymous';
            // Cache busting to prevent false negatives
            img.src = `https://${OPEN_LIBRARY_DOMAIN}/b/isbn/${isbn}-L.jpg?t=${Date.now()}`;

            const loaded = await imgLoadPromise;

            if (loaded && img.naturalWidth > 100 && img.naturalHeight > 100) {
                console.debug('[verifyWithFullRequest] Valid cover dimensions found');
                await handleValidCover();
            } else {
                console.debug('[verifyWithFullRequest] Invalid cover dimensions');
                requireManualCover();
            }
        } catch (error) {
            console.error('[verifyWithFullRequest] Image verification failed:', error);
            requireManualCover();
        }
    }

    // --- UI STATE HANDLERS ---

    /**
     * Handles successful cover detection
     */
    async function handleValidCover() {
        console.debug('[handleValidCover] Showing valid cover state');
        coverUrlField.style.display = 'none';
        coverUrlInput.required = false;
        coverStatus.textContent = '✓ Valid cover found';
        coverStatus.className = 'form-text text-success mt-1';

        // Clear any existing invalid state
        coverUrlInput.setCustomValidity('');
    }

    /**
     * Handles missing cover scenario
     * @param {string} message - Optional custom message
     */
    function requireManualCover(message = 'No cover found. Please provide one.') {
        console.debug(`[requireManualCover] ${message}`);
        coverUrlField.style.display = 'block';
        coverUrlInput.required = true;
        coverStatus.textContent = message;
        coverStatus.className = 'form-text text-warning mt-1';

        // Set validation message if field is empty
        if (coverUrlInput.value.trim() === '') {
            coverUrlInput.setCustomValidity(message);
        }
    }

    /**
     * Resets the cover field to default state
     */
    function resetCoverField() {
        console.debug('[resetCoverField] Resetting cover field');
        coverUrlField.style.display = 'none';
        coverUrlInput.required = false;
        coverStatus.textContent = '';
        coverUrlInput.setCustomValidity('');
    }

    // --- PREVIEW FUNCTIONALITY ---

    /**
     * Sets up cover preview functionality
     */
    const setupPreview = () => {
        console.debug('[setupPreview] Initializing preview system');
        const previewButton = document.getElementById('previewCover');
        const coverPreview = document.getElementById('coverPreview');

        if (!previewButton || !coverPreview) {
            console.warn('[setupPreview] Preview elements not found');
            return;
        }

        previewButton.addEventListener('click', async function () {
            console.debug('[previewButton] Click handler triggered');
            const url = coverUrlInput.value.trim();

            if (!url) {
                showError('Please enter a URL');
                console.debug('[previewButton] Empty URL provided');
                return;
            }

            if (!isValidImageUrl(url)) {
                showError('Invalid image URL. Only JPG/JPEG/PNG allowed.');
                console.debug('[previewButton] Invalid URL format');
                return;
            }

            try {
                console.debug('[previewButton] Attempting to load preview image');
                const parsedUrl = new URL(url);
                if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
                    throw new Error('Invalid protocol');
                }

                const img = new Image();
                img.crossOrigin = 'anonymous'; // Prevent tainted canvas

                const loaded = await new Promise((resolve) => {
                    img.onload = () => {
                        console.debug('[previewButton] Image loaded successfully');
                        resolve(true);
                    };
                    img.onerror = () => {
                        console.debug('[previewButton] Image failed to load');
                        resolve(false);
                    };
                    img.src = url;
                });

                if (loaded && img.naturalWidth > 100 && img.naturalHeight > 100) {
                    console.debug('[previewButton] Showing valid preview');
                    coverPreview.querySelector('img').src = url;
                    coverPreview.style.display = 'block';
                    coverStatus.textContent = '✓ Valid cover image';
                    coverStatus.className = 'form-text text-success mt-1';
                } else {
                    const msg = 'Image failed to load or is too small';
                    showError(msg);
                    console.debug(`[previewButton] ${msg}`);
                }
            } catch (error) {
                const msg = 'Security error loading image';
                showError(msg);
                console.error('[previewButton]', msg, error);
            }
        });
    };

    /**
     * Shows error message in UI
     * @param {string} message - Error message to display
     */
    const showError = (message) => {
        console.debug(`[showError] Displaying error: ${message}`);
        coverStatus.textContent = message;
        coverStatus.className = 'form-text text-danger mt-1';
        const coverPreview = document.getElementById('coverPreview');
        if (coverPreview) coverPreview.style.display = 'none';
    };

    // Initialize preview system
    setupPreview();

    // --- INPUT VALIDATION ---

    // Validate cover URL on input
    coverUrlInput.addEventListener('input', function () {
        console.debug('[coverUrlInput] Input event triggered');
        if (coverUrlField.style.display !== 'none') {
            const isValid = this.value.trim() !== '' && isValidImageUrl(this.value);
            this.setCustomValidity(isValid ? '' : 'Please provide a valid image URL');

            if (isValid) {
                console.debug('[coverUrlInput] Valid URL entered');
                coverStatus.textContent = '✓ Valid URL format';
                coverStatus.className = 'form-text text-success mt-1';
            } else {
                console.debug('[coverUrlInput] Invalid URL entered');
            }
        }
    });

    // --- CLEANUP ---
    window.addEventListener('beforeunload', () => {
        console.debug('[setupCover] Cleaning up before unload');
        clearTimeout(checkCoverTimeout);
    });

    console.debug('[setupCover] Initialization complete');
}

window.addEventListener('DOMContentLoaded', () => {
    setupCover();
});
