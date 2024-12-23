// Consolidated Quote Calculator Logic
function calculateQuote() {
    const serviceType = document.getElementById("service-type").value;
    const numRooms = parseInt(document.getElementById("num-rooms").value, 10);

    if (!serviceType) {
        alert("Please select a service type.");
        return;
    }

    if (isNaN(numRooms) || numRooms <= 0) {
        alert("Please enter a valid number of rooms.");
        return;
    }

    const prices = {
        regular: 50,
        deep: 75,
        garage: 100, // Flat price
        move: 85,
    };

    const totalPrice = serviceType === "garage" ? prices.garage : prices[serviceType] * numRooms;
    document.getElementById("quote-result").textContent = `Estimated Quote: CAD ${totalPrice.toFixed(2)}`;
}

// Open and Close Modal
document.querySelectorAll(".quote-btn").forEach((button) => {
    button.addEventListener("click", (event) => {
        const serviceType = event.target.getAttribute("data-service");
        document.getElementById("service-type").value = serviceType; // Pre-fill service type
        document.getElementById("quote-modal").style.display = "flex";
    });
});

document.getElementById("close-modal").addEventListener("click", () => {
    document.getElementById("quote-modal").style.display = "none";
    document.getElementById("quote-result").textContent = ""; // Clear result
});

// Calculate Button Listener
document.getElementById("calculate-quote").addEventListener("click", calculateQuote);

// Special Request Form Submit
document.getElementById("special-request-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Thank you! We have received your request and will contact you soon.");
    e.target.reset();
});
