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
});