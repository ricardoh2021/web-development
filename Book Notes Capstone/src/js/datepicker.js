// import "flatpickr/dist/flatpickr.min.css";

// function initFlatpickr() {
//     const dateInputs = document.querySelectorAll("#datepicker");

//     if (dateInputs.length > 0) {
//         console.log("Initializing Flatpickr... Found", dateInputs.length, "date fields.");

//         import("flatpickr").then(({ default: flatpickr }) => {
//             dateInputs.forEach(input => {
//                 if (!input.dataset.flatpickr) { // Prevent re-initialization
//                     console.log("Applying Flatpickr to:", input);

//                     try {
//                         flatpickr(input, {
//                             dateFormat: "m/d/Y",
//                             allowInput: true,
//                         });
//                         input.dataset.flatpickr = true;
//                     } catch (error) {
//                         console.error("Error initializing Flatpickr:", error);
//                     }
//                 }
//             });
//         }).catch(error => {
//             console.error("Error importing Flatpickr:", error);
//         });
//     } else {
//         console.warn("No datepicker elements found.");
//     }
// }

// document.addEventListener("DOMContentLoaded", initFlatpickr);