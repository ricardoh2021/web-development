// Import Flatpickr styles (ensures Webpack bundles them)
import 'flatpickr/dist/flatpickr.min.css';
import flatpickr from "flatpickr";

// document.addEventListener("DOMContentLoaded", () => {
//     console.log("Flatpickr script loaded!");

//     // Select all inputs with class .datepicker
//     const datepickers = document.querySelectorAll("#datepicker");

//     if (datepickers.length > 0) {
//         console.log(`Initializing Flatpickr on ${datepickers.length} elements`);
//         flatpickr("#datepicker", {
//             altInput: true,
//             altFormat: "F j, Y",
//             dateFormat: "Y-m-d",
//             onClose: function (_, dateStr, instance) {
//                 let inputField = instance.input;
//                 if (!dateStr) {
//                     inputField.classList.add("is-invalid");
//                     inputField.classList.remove("is-valid");
//                 } else {
//                     inputField.classList.add("is-valid");
//                     inputField.classList.remove("is-invalid");
//                 }
//             }
//         });
//     } else {
//         console.warn("No datepicker elements found.");
//     }
// });

$(document).ready(function () {
    $('#datepicker').flatpickr(
        {
            altInput: true,
            altFormat: "F j, Y",
            dateFormat: "Y-m-d",
            onClose: function (_, dateStr, instance) {
                let $inputField = $(instance.input);
                let $altInputField = $(instance.altInput); // Flatpickr's alternative input
                if (!dateStr) {
                    $inputField.addClass("is-invalid").removeClass("is-valid");
                    $altInputField.addClass("is-invalid").removeClass("is-valid");
                }
                else {
                    $inputField.addClass("is-valid").removeClass("is-invalid")
                    $altInputField.addClass("is-valid").removeClass("is-invalid")
                }
            }
        }
    )
})

$(document).ready(function () {
    $("form").on("submit", function (event) {
        //Check the flatpickr
        let $inputField = $("#datepicker");
        let $altInputField = $inputField.siblings(".form-control"); // Alt input
        console.log($inputField.val());
        console.log($inputField);
        console.log($altInputField);

        if (!$inputField.val().trim()) {
            $inputField.addClass("is-invalid").removeClass("is-valid");
            $altInputField.addClass("is-invalid").removeClass("is-valid");
            event.preventDefault(); // Stop form submission
        }
        else {
            $inputField.addClass("is-valid").removeClass("is-invalid");
            $altInputField.addClass("is-valid").removeClass("is-invalid");
        }
    })
})