// Real-Time Quote Calculator
function calculateQuote() {
    const serviceType = document.getElementById("service-type").value;
    const numRooms = parseInt(document.getElementById("num-rooms").value);
    let price = 0;

    if (serviceType === "regular") price = 60 * numRooms;
    if (serviceType === "deep") price = 90 * numRooms;
    if (serviceType === "garage") price = 120; // Example garage price
    if (serviceType === "move") price = 100 * numRooms;

    const result = price
        ? `Estimated Price: CAD ${price}`
        : "Please select a valid service and number of rooms.";
    document.getElementById("quote-result").textContent = result;
}

// Special Request Form
document.getElementById("special-request-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Thank you! We have received your request and will contact you soon.");
    e.target.reset();
});
