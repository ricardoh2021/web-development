// Import Flatpickr styles (ensures Webpack bundles them)
import 'flatpickr/dist/flatpickr.min.css';
import flatpickr from "flatpickr";

$(document).ready(function () {
    // Initialize flatpickr
    const $datepicker = $('#datepicker');
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

    const $stars = $('.star-wrapper');
    const $ratingInput = $('#bookRating');
    let currentHover = 0;
    let selectedRating = 0;

    // Handle star hover
    $stars.on('mousemove', function (e) {
        const $star = $(this);
        const starPos = e.pageX - $star.offset().left;
        const starWidth = $star.width();
        const starValue = parseFloat($star.data('rating'));

        // Determine if hovering left (half) or right (full) side
        const isHalfHover = starPos < starWidth / 2;
        currentHover = isHalfHover ? starValue - 0.5 : starValue;

        updateHoverDisplay();
    });

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
        $stars.removeClass('hover-half hover-full');

        if (currentHover > 0) {
            $stars.each(function () {
                const starValue = parseFloat($(this).data('rating'));

                if (starValue <= currentHover) {
                    $(this).addClass('hover-full');
                }
                else if (starValue - 0.5 <= currentHover) {
                    $(this).addClass('hover-half');
                }
            });
        }
    }

    function updateSelectedDisplay() {
        $stars.removeClass('selected-half selected-full');

        $stars.each(function () {
            const starValue = parseFloat($(this).data('rating'));

            if (starValue <= selectedRating) {
                $(this).addClass('selected-full');
            }
            else if (starValue - 0.5 <= selectedRating) {
                $(this).addClass('selected-half');
            }
        });

        // Update feedback text
        const feedbackText = selectedRating > 0
            ? `Your rating: ${selectedRating.toFixed(1)} stars`
            : "Hover and click on left/right side of stars";
        $('.rating-feedback').text(feedbackText);
    }
});