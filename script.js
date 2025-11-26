// ------------------------------
// Laundry Services Data
// ------------------------------
const services = [
    { id: 1, name: "Dry Cleaning", price: 200.00 },
    { id: 2, name: "Wash & Fold", price: 100.00 },
    { id: 3, name: "Ironing", price: 30.00 },
    { id: 4, name: "Stain Removal", price: 500.00 },
    { id: 5, name: "Leather & Suede Cleaning", price: 999.00 },
    { id: 6, name: "Wedding Dress Cleaning", price: 2800.00 }
];

let cart = [];

const serviceItemsContainer = document.getElementById('service-items-container');
const addedItemsList = document.getElementById('added-items-list');
const totalAmountDisplay = document.getElementById('total-amount-display');
const bookingForm = document.getElementById('booking-form');
const confirmationMessage = document.getElementById('confirmation-message');


// ---------------------------------------------------------
// Scroll Function
// ---------------------------------------------------------
function scrollToSection(sectionId) {
    document.getElementById(sectionId).scrollIntoView({ behavior: "smooth" });
}


// ---------------------------------------------------------
// Calculate Total
// ---------------------------------------------------------
function calculateTotal() {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    totalAmountDisplay.textContent = `₹ ${total.toFixed(2)}`;
    return total;
}


// ---------------------------------------------------------
// Render Service List
// ---------------------------------------------------------
function renderServiceList() {
    serviceItemsContainer.innerHTML = services.map(service => `
        <div class="service-item">
            <div class="service-details">
                <p>${service.name} <span>₹ ${service.price.toFixed(2)}</span></p>
            </div>
            <button class="add-item-btn" data-id="${service.id}">Add Items</button>
        </div>
    `).join("");

    document.querySelectorAll(".add-item-btn").forEach(btn => {
        btn.addEventListener("click", e => {
            addItemToCart(parseInt(e.target.dataset.id));
        });
    });
}


// ---------------------------------------------------------
// Render Cart
// ---------------------------------------------------------
function renderCart() {
    if (cart.length === 0) {
        addedItemsList.innerHTML = `<p class="no-items">No Items Added</p>`;
        calculateTotal();
        return;
    }

    addedItemsList.innerHTML = cart.map(item => `
        <div class="cart-item">
            <span>${item.name} (x${item.quantity})</span>
            <span>₹ ${(item.price * item.quantity).toFixed(2)}</span>
            <button class="remove-now-btn" data-id="${item.id}">Remove Now</button>
        </div>
    `).join("");

    document.querySelectorAll(".remove-now-btn").forEach(btn => {
        btn.addEventListener("click", e => {
            removeItemFromCart(parseInt(e.target.dataset.id));
        });
    });

    calculateTotal();
}


// ---------------------------------------------------------
// Add Item
// ---------------------------------------------------------
function addItemToCart(id) {
    const existing = cart.find(item => item.id === id);
    const service = services.find(s => s.id === id);

    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ ...service, quantity: 1 });
    }

    renderCart();
}


// ---------------------------------------------------------
// Remove Item
// ---------------------------------------------------------
function removeItemFromCart(id) {
    const index = cart.findIndex(item => item.id === id);

    if (index !== -1) {
        if (cart[index].quantity > 1) {
            cart[index].quantity--;
        } else {
            cart.splice(index, 1);
        }
    }

    renderCart();
}


// ---------------------------------------------------------
// EmailJS Booking Submission
// ---------------------------------------------------------

// IMPORTANT: Initialize EmailJS with your PUBLIC KEY
emailjs.init("IuFQItToLxei5sCsw");

bookingForm.addEventListener("submit", function (e) {
    e.preventDefault();

    if (cart.length === 0) {
        alert("Please add services before booking.");
        return;
    }

    const fullName = document.getElementById("fullName").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const totalAmount = calculateTotal();

    const cartDetails = cart.map(item =>
        `${item.name} (x${item.quantity}) - ₹ ${(item.price * item.quantity).toFixed(2)}`
    ).join("\n");

    // Your EXACT EmailJS Template Variables
    const templateParams = {
        full_name: fullName,
        email: email,
        phone_number: phone,
        order_details: cartDetails,
        total_amount: `₹ ${totalAmount.toFixed(2)}`
    };

    emailjs.send("service_oaqlhcf", "template_4h3cz4f", templateParams)
        .then(() => {
            confirmationMessage.classList.remove("hidden");
            bookingForm.reset();
            cart = [];
            renderCart();

            setTimeout(() => {
                confirmationMessage.classList.add("hidden");
            }, 5000);
        })
        .catch(err => {
            console.error("EmailJS Error:", err);
            alert("Booking failed! Check console for details.");
        });
});


// ---------------------------------------------------------
// Initialize Page
// ---------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    renderServiceList();
    renderCart();
});
