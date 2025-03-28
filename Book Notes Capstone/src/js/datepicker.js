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