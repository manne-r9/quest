// Mobile menu functionality
const navbarMenu = document.querySelector(".navbar .links");
const hamburgerBtn = document.querySelector(".hamburger-btn");
const hideMenuBtn = document.querySelector(".navbar .close-btn");

// Show mobile menu
hamburgerBtn.addEventListener("click", () => {
    navbarMenu.classList.add("show-menu");
});

// Hide mobile menu
hideMenuBtn.addEventListener("click", () => {
    navbarMenu.classList.remove("show-menu");
});

// Login popup functionality
const showPopupBtn = document.querySelector(".login-btn");
const formPopup = document.querySelector(".form-popup");
const hidePopupBtn = formPopup.querySelector(".close-btn");
const signupLoginLink = formPopup.querySelectorAll(".bottom-link a");

// Show login popup
showPopupBtn.addEventListener("click", () => {
    document.body.classList.toggle("show-popup");
});

// Hide login popup
hidePopupBtn.addEventListener("click", () => {
    document.body.classList.remove("show-popup");
});

// Toggle signup and login forms
signupLoginLink.forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        formPopup.classList[link.id === 'signup-link' ? 'add' : 'remove']("show-signup");
    });
});


// Booking popup functionality
const bookButtons = document.querySelectorAll('.book-btn');
const popup = document.getElementById('booking-popup');
const closePopup = document.querySelector('.close-popup');

// Show booking popup
bookButtons.forEach(button => {
    button.addEventListener('click', () => {
        popup.style.display = 'flex';
    });
});

// Close booking popup
closePopup.addEventListener('click', () => {
    popup.style.display = 'none';
});

// Close booking popup when clicking outside
window.addEventListener('click', (event) => {
    if (event.target === popup) {
        popup.style.display = 'none';
    }
});

// Handle form submission
document.getElementById('booking-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const from = document.getElementById('from').value;
    const destination = document.getElementById('destination').value;
    const howMany = document.getElementById('how-many').value;
    const price = document.getElementById('price').value;
    const type = document.getElementById('type').value;

    // Send booking data to the server
    fetch('http://localhost:3000/book-package', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ from, destination, howMany, price, type }),
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        popup.style.display = 'none';
    })
    .catch(error => console.error('Error booking package:', error));
});
