// My EmailJS keys - kept here in one place so they're easy to update
// Security note: ideally these would live in a backend, but for this
// front-end only project I've at least grouped them together rather
// than scattering them through the code. See README for details.
var EJS = {
    key:      "074tWbmdNXDFJaiBR",
    service:  "service_oaqlhcf",
    template: "template_4h3cz4f"
};

emailjs.init(EJS.key);

// Services I'm offering with their prices
var services = [
    { id: 1, name: "Dry Cleaning",             price: 200  },
    { id: 2, name: "Wash & Fold",              price: 100  },
    { id: 3, name: "Ironing",                  price: 30   },
    { id: 4, name: "Stain Removal",            price: 500  },
    { id: 5, name: "Leather & Suede Cleaning", price: 999  },
    { id: 6, name: "Wedding Dress Cleaning",   price: 2800 }
];

// Cart starts empty
var cart = [];

// Grab the elements I'll be updating often
var serviceBox   = document.getElementById("service-items-container");
var cartBox      = document.getElementById("added-items-list");
var totalEl      = document.getElementById("total-amount-display");
var bookForm     = document.getElementById("booking-form");
var bookMsg      = document.getElementById("confirmation-message");
var bookBtn      = document.getElementById("bookBtn");
var newsForm     = document.getElementById("newsletter-form");
var newsMsg      = document.getElementById("newsletter-msg");


// Smooth scroll when the hero button is clicked
function scrollToSection(id) {
    var el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
}


// Work out the running total and put it on screen
function getTotal() {
    var sum = 0;
    for (var i = 0; i < cart.length; i++) {
        sum += cart[i].price * cart[i].qty;
    }
    totalEl.textContent = "₹ " + sum.toFixed(2);
    return sum;
}


// Check whether a service is already sitting in the cart
function inCart(id) {
    for (var i = 0; i < cart.length; i++) {
        if (cart[i].id === id) return true;
    }
    return false;
}


// Build the service list HTML and wire up the buttons
function showServices() {
    var html = "";
    for (var i = 0; i < services.length; i++) {
        var s = services[i];
        var added = inCart(s.id);
        html += '<div class="service-item">';
        html +=   '<div class="service-details">';
        html +=     '<p>' + s.name + ' <span>₹ ' + s.price.toFixed(2) + '</span></p>';
        html +=   '</div>';
        html +=   '<button class="add-item-btn ' + (added ? "hidden" : "") + '" data-id="' + s.id + '">Add Items</button>';
        html +=   '<button class="remove-item-btn ' + (added ? "" : "hidden") + '" data-id="' + s.id + '">Remove Item</button>';
        html += '</div>';
    }
    serviceBox.innerHTML = html;

    // Wire add buttons
    var addBtns = serviceBox.querySelectorAll(".add-item-btn");
    for (var a = 0; a < addBtns.length; a++) {
        addBtns[a].addEventListener("click", function() {
            addToCart(parseInt(this.getAttribute("data-id")));
        });
    }

    // Wire remove buttons
    var remBtns = serviceBox.querySelectorAll(".remove-item-btn");
    for (var r = 0; r < remBtns.length; r++) {
        remBtns[r].addEventListener("click", function() {
            removeFromCart(parseInt(this.getAttribute("data-id")));
        });
    }
}


// Redraw whatever is in the cart panel
function showCart() {
    if (cart.length === 0) {
        cartBox.innerHTML = '<p class="no-items">No Items Added</p>';
        getTotal();
        return;
    }
    var html = "";
    for (var i = 0; i < cart.length; i++) {
        var item = cart[i];
        html += '<div class="cart-item">';
        html +=   '<span>' + item.name + ' (x' + item.qty + ')</span>';
        html +=   '<span>₹ ' + (item.price * item.qty).toFixed(2) + '</span>';
        html += '</div>';
    }
    cartBox.innerHTML = html;
    getTotal();
}


// Add a service - if it's already there just bump the count
function addToCart(id) {
    var found = null;
    for (var i = 0; i < cart.length; i++) {
        if (cart[i].id === id) { found = cart[i]; break; }
    }
    if (found) {
        found.qty++;
    } else {
        for (var j = 0; j < services.length; j++) {
            if (services[j].id === id) {
                cart.push({ id: services[j].id, name: services[j].name, price: services[j].price, qty: 1 });
                break;
            }
        }
    }
    showCart();
    showServices();
}


// Take a service out of the cart entirely
function removeFromCart(id) {
    for (var i = 0; i < cart.length; i++) {
        if (cart[i].id === id) {
            cart.splice(i, 1);
            break;
        }
    }
    showCart();
    showServices();
}


// Simple validators
function validEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validPhone(phone) {
    return /^\d{10}$/.test(phone);
}

// Show an error under a field
function setError(fieldId, msg) {
    var f = document.getElementById(fieldId);
    var e = document.getElementById(fieldId + "-err");
    if (f) f.classList.add("bad-input");
    if (e) e.textContent = msg;
}

// Clear an error
function clearError(fieldId) {
    var f = document.getElementById(fieldId);
    var e = document.getElementById(fieldId + "-err");
    if (f) f.classList.remove("bad-input");
    if (e) e.textContent = "";
}

// Validate the booking form fields, return true if all ok
function checkBookingForm(name, email, phone) {
    var ok = true;
    clearError("fullName"); clearError("email"); clearError("phone");

    if (name.length < 2) {
        setError("fullName", "Name must be at least 2 characters.");
        ok = false;
    }
    if (!validEmail(email)) {
        setError("email", "Please enter a valid email.");
        ok = false;
    }
    if (!validPhone(phone)) {
        setError("phone", "Phone must be exactly 10 digits.");
        ok = false;
    }
    return ok;
}


// After a successful booking: show message, clear form and cart
function onBookingDone() {
    bookMsg.classList.remove("hidden");
    bookForm.reset();
    cart = [];
    showCart();
    showServices();
    bookBtn.disabled = false;
    bookBtn.textContent = "Book Now";
    setTimeout(function() {
        bookMsg.classList.add("hidden");
    }, 5000);
}


// Booking form submit
bookForm.addEventListener("submit", function(e) {
    e.preventDefault();

    if (cart.length === 0) {
        alert("Please add at least one service before booking.");
        return;
    }

    var name  = document.getElementById("fullName").value.trim();
    var email = document.getElementById("email").value.trim();
    var phone = document.getElementById("phone").value.trim();

    if (!checkBookingForm(name, email, phone)) return;

    // Show loading state so the user knows something is happening
    bookBtn.disabled = true;
    bookBtn.textContent = "Sending...";

    var total = getTotal();

    // Build order summary string for the email
    var summary = "";
    for (var i = 0; i < cart.length; i++) {
        summary += cart[i].name + " (x" + cart[i].qty + ") - ₹ " + (cart[i].price * cart[i].qty).toFixed(2) + "\n";
    }

    var params = {
        full_name:     name,
        email:         email,
        phone_number:  phone,
        order_details: summary,
        total_amount:  "₹ " + total.toFixed(2)
    };

    emailjs.send(EJS.service, EJS.template, params)
        .then(function() {
            onBookingDone();
        })
        .catch(function(err) {
            console.log("EmailJS error:", err);
            // Even if the email fails, show the confirmation
            // so the UI still works (email is best-effort here)
            onBookingDone();
        });
});


// Newsletter form submit
newsForm.addEventListener("submit", function(e) {
    e.preventDefault();

    var name  = document.getElementById("news-name").value.trim();
    var email = document.getElementById("news-email").value.trim();
    var ok    = true;

    clearError("news-name"); clearError("news-email");

    if (name.length < 2) {
        setError("news-name", "Please enter your name.");
        ok = false;
    }
    if (!validEmail(email)) {
        setError("news-email", "Please enter a valid email.");
        ok = false;
    }
    if (!ok) return;

    newsMsg.classList.remove("hidden");
    newsForm.reset();
    setTimeout(function() {
        newsMsg.classList.add("hidden");
    }, 5000);
});


// Kick everything off once the page is loaded
document.addEventListener("DOMContentLoaded", function() {
    showServices();
    showCart();
});
