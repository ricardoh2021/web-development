// Import Flatpickr styles (ensures Webpack bundles them)
import 'flatpickr/dist/flatpickr.min.css';
import flatpickr from "flatpickr";

document.addEventListener("DOMContentLoaded", () => {
    console.log("Flatpickr script loaded!");

    // Select all inputs with class .datepicker
    const datepickers = document.querySelectorAll("#datepicker");

    if (datepickers.length > 0) {
        console.log(`Initializing Flatpickr on ${datepickers.length} elements`);
        flatpickr("#datepicker", {
            altInput: true,
            altFormat: "F j, Y",
            dateFormat: "Y-m-d",
        });
    } else {
        console.warn("No datepicker elements found.");
    }
});