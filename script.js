// ==================== PlACE ORDER FUNCTIONS ====================
// ==================== MOCK CART DATA - AUTO LOAD IF EMPTY ====================
// Function to ensure cart always has data for testing
function ensureCartHasData() {
    const existingCart = localStorage.getItem('cart');
    
    // Always load mock cart for testing (force)
    const mockCart = [
        { 
            id: 1, 
            name: "Sourdough Boule", 
            price: 18.50, 
            qty: 2, 
            size: "Large (500g)",
            description: "Artisan country loaf, crispy crust"
        },
        { 
            id: 2, 
            name: "Almond Croissant", 
            price: 12.90, 
            qty: 1, 
            size: "Regular",
            description: "Buttery & flaky with almond filling"
        },
        { 
            id: 3, 
            name: "Matcha Danish", 
            price: 9.90, 
            qty: 3, 
            size: "Regular",
            description: "Japanese inspired matcha cream"
        },
        { 
            id: 4, 
            name: "Chocolate Chip Cookie", 
            price: 6.50, 
            qty: 4, 
            size: "Large",
            description: "Soft baked with dark chocolate chunks"
        },
        { 
            id: 5, 
            name: "Iced Latte", 
            price: 11.90, 
            qty: 1, 
            size: "Regular",
            description: "Cold brew with fresh milk"
        }
    ];
    
    localStorage.setItem('cart', JSON.stringify(mockCart));
    console.log('✅ FORCE MOCK CART loaded with', mockCart.length, 'items');
    
    return true;
}

ensureCartHasData();


// ==================== RESET TO MOCK CART (for testing) ====================
function resetToMockCart() {
    const mockCart = [
        { id: 1, name: "Sourdough Boule", price: 18.50, qty: 2, size: "Large", description: "Artisan country loaf" },
        { id: 2, name: "Almond Croissant", price: 12.90, qty: 1, size: "Regular", description: "Buttery & flaky" },
        { id: 3, name: "Matcha Danish", price: 9.90, qty: 3, size: "Regular", description: "Japanese inspired" },
        { id: 4, name: "Chocolate Chip Cookie", price: 6.50, qty: 4, size: "Large", description: "Soft baked" }
    ];
    localStorage.setItem('cart', JSON.stringify(mockCart));
    alert('✅ Mock cart loaded! Refresh page to see changes.');
    location.reload();
}

// ==================== VIEW CURRENT CART ====================
function viewCurrentCart() {
    const cart = localStorage.getItem('cart');
    if (cart) {
        const items = JSON.parse(cart);
        let message = `🛒 Cart has ${items.length} items:\n\n`;
        items.forEach((item, i) => {
            message += `${i+1}. ${item.name} x${item.qty || 1} - RM${(item.price * (item.qty || 1)).toFixed(2)}\n`;
        });
        const total = items.reduce((sum, i) => sum + (i.price * (i.qty || 1)), 0);
        message += `\n💰 Total: RM${total.toFixed(2)}`;
        alert(message);
    } else {
        alert('🛒 Cart is empty!');
    }
}

// ==================== CLEAR CART ====================
function clearCart() {
    if (confirm('⚠️ Are you sure you want to clear your entire cart?')) {
        localStorage.removeItem('cart');
        alert('✅ Cart cleared!');
        location.reload();
    }
}

// ==================== ADD SAMPLE ITEM ====================
function addSampleItem() {
    const cart = localStorage.getItem('cart');
    let cartItems = cart ? JSON.parse(cart) : [];
    
    const newItem = {
        id: Date.now(),
        name: "Fresh Baguette",
        price: 7.50,
        qty: 1,
        size: "Regular",
        description: "Crispy French baguette"
    };
    
    cartItems.push(newItem);
    localStorage.setItem('cart', JSON.stringify(cartItems));
    alert(`✅ Added: ${newItem.name} to cart`);
    location.reload();
}

const DELIVERY_FEE = 30.00;
const discountCodes = {
    'WELCOME10': { type: 'percentage', value: 10, description: '10% Welcome Discount' },
    'DEX15': { type: 'percentage', value: 15, description: '15% Off (Max RM20)' },
    'SAVEMORE': { type: 'fixed', value: 5, description: 'RM 5.00 Off' }
};

let currentDiscount = 0;
let discountType = 'fixed';
let generatedTAC = "";

document.addEventListener('DOMContentLoaded', function() {
    const path = window.location.pathname;
    const fileName = path.split('/').pop().toLowerCase();
    
    console.log('Current page:', fileName);
    
    if (fileName === 'placeorder.html' || fileName === 'placeorder') {
        initPlaceOrder();
    } 
    else if (fileName === 'payment.html' || fileName === 'payment') {
        initPayment();
    } 
    else if (fileName === 'paymentgateway.html' || fileName === 'paymentgateway') {
        initPaymentGateway();
    } 
    else if (fileName === 'confirmation.html' || fileName === 'confirmation') {
        initConfirmation();
    }
});

function initPlaceOrder() {
    displayCartItems();
    updateTotal();

    // Billing Toggle
    const billingCheckbox = document.getElementById('same-as-shipping');
    if (billingCheckbox) {
        billingCheckbox.addEventListener('change', function() {
            const billingSection = document.getElementById('billing-details');
            if (billingSection) billingSection.style.display = this.checked ? 'none' : 'block';
        });
    }

    // Shipping Method Listeners
    const shippingOptions = document.querySelectorAll('input[name="shipping"]');
    shippingOptions.forEach(opt => {
        opt.addEventListener('change', () => {
            // UI Visual Feedback
            document.querySelectorAll('.radio-option').forEach(el => el.classList.remove('selected'));
            opt.closest('.radio-option').classList.add('selected');
            updateTotal();
        });
    });
}

function updateTotal() {
    const cart = getCartData();
    let subtotal = cart.reduce((sum, item) => sum + (item.price * (item.qty || 1)), 0);
    
    const deliveryOption = document.getElementById('delivery-option');
    const isDelivery = deliveryOption ? deliveryOption.checked : false;
    const shippingCost = isDelivery ? DELIVERY_FEE : 0;
    
    let discountAmount = 0;
    if (currentDiscount > 0) {
        discountAmount = (discountType === 'percentage') ? (subtotal * (currentDiscount / 100)) : currentDiscount;
    }

    const total = Math.max(0, subtotal + shippingCost - discountAmount);

    if (document.getElementById('subtotalSummaryPrice')) 
        document.getElementById('subtotalSummaryPrice').textContent = `RM ${subtotal.toFixed(2)}`;
    
    const deliveryItem = document.getElementById('deliverySummaryItem');
    if (deliveryItem) deliveryItem.style.display = isDelivery ? 'flex' : 'none';
    
    const discountItem = document.getElementById('discountSummaryItem');
    if (discountItem) {
        discountItem.style.display = currentDiscount > 0 ? 'flex' : 'none';
        if (document.getElementById('discountSummaryValue'))
            document.getElementById('discountSummaryValue').textContent = `-RM ${discountAmount.toFixed(2)}`;
    }

    if (document.getElementById('totalSummaryPrice'))
        document.getElementById('totalSummaryPrice').textContent = `RM ${total.toFixed(2)}`;

    localStorage.setItem('tempOrderTotal', total.toFixed(2));
}

function applyDiscount() {
    const input = document.getElementById('discount');
    const msg = document.getElementById('discount-message');
    if (!input) return;
    
    const code = input.value.trim().toUpperCase();
    if (discountCodes[code]) {
        currentDiscount = discountCodes[code].value;
        discountType = discountCodes[code].type;
        if (msg) {
            msg.textContent = `Applied: ${discountCodes[code].description}`;
            msg.style.color = '#27ae60';
        }
        updateTotal();
    } else {
        alert('Invalid Discount Code');
    }
}

function proceedToPayment() {
    const fields = {
        firstName: document.getElementById('first-name')?.value,
        email: document.getElementById('email')?.value,
        phone: document.getElementById('phone')?.value
    };

    if (!fields.firstName || !fields.email || !fields.phone) {
        alert('Please complete contact information.');
        return;
    }

    const orderData = {
        customerName: fields.firstName + " " + (document.getElementById('last-name')?.value || ""),
        email: fields.email,
        phone: fields.phone,
        address: document.getElementById('street-address')?.value || "Self Pickup",
        deliveryMethod: document.querySelector('input[name="shipping"]:checked')?.parentElement.textContent.trim() || "Standard",
        total: localStorage.getItem('tempOrderTotal') || "0.00",
        orderDate: new Date().toLocaleDateString('en-GB'),
        orderTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    localStorage.setItem('fullOrderDetails', JSON.stringify(orderData));
    window.location.href = 'Payment.html';
}
// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
const billingCheckbox = document.getElementById('same-as-shipping');
const checkboxContainer = billingCheckbox.closest('.checkbox-group');

if (billingCheckbox.checked) {
    checkboxContainer.classList.add('selected');
}

checkboxContainer.addEventListener('click', function(e) {
    if (e.target !== billingCheckbox) {
        billingCheckbox.checked = !billingCheckbox.checked;
    }
    
    if (billingCheckbox.checked) {
        this.classList.add('selected');
        document.getElementById('billing-details').style.display = 'none';
    } else {
        this.classList.remove('selected');
        document.getElementById('billing-details').style.display = 'block';
    }
});

    const paymentOptions = document.querySelectorAll('.payment-option');
    paymentOptions.forEach(option => {
        option.addEventListener('click', function() {
            paymentOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            this.querySelector('input[type="radio"]').checked = true;
        });
    });
    const options = document.querySelectorAll('.radio-option, .payment-option');

    options.forEach(option => {
        option.addEventListener('click', function() {
            // Ambil group name (cth: "shipping") supaya tak kacau group lain
            const radioInput = this.querySelector('input[type="radio"]');
            const groupName = radioInput.getAttribute('name');
            
            document.querySelectorAll(`input[name="${groupName}"]`).forEach(input => {
                input.closest('.radio-option, .payment-option').classList.remove('selected');
            });

            this.classList.add('selected');
            
            radioInput.checked = true;

            if (typeof updateTotal === 'function') updateTotal();
        });
    });
});

function setupEventListeners() {
    const shippingRadios = document.querySelectorAll('input[name="shipping"]');
    shippingRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            document.querySelectorAll('.radio-option').forEach(opt => opt.classList.remove('selected'));
            this.closest('.radio-option').classList.add('selected');
            updateTotal();
        });
    });

    // Discount button
    const applyBtn = document.getElementById('apply-discount');
    if (applyBtn) applyBtn.addEventListener('click', applyDiscount);

    // Billing address toggle
    const billingCheckbox = document.getElementById('same-as-shipping');
    const billingSection = document.getElementById('billing-details');
    if (billingCheckbox) {
        billingCheckbox.addEventListener('change', function() {
            billingSection.style.display = this.checked ? 'none' : 'block';
        });
    }
}

// ==================== CART LOGIC ====================
function getCartData() {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
}

function displayCartItems() {
    const container = document.getElementById('cartItemsContainer');
    if (!container) return;
    
    const cart = getCartData();
    container.innerHTML = '';
    
    if (cart.length === 0) {
        container.innerHTML = `<div class="empty-cart-message"><p>Your cart is empty</p></div>`;
        return;
    }
    
    cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'summary-item';
        itemElement.innerHTML = `
            <div class="product-details-enhanced">
                <div class="product-name-enhanced">${item.qty || 1}x ${item.name}</div>
                <div class="summary-details">${item.size || 'Standard'}</div>
            </div>
            <div class="summary-price">RM ${(item.price * (item.qty || 1)).toFixed(2)}</div>
        `;
        container.appendChild(itemElement);
    });
}

function updateTotal() {
    const cart = getCartData();
    let subtotal = cart.reduce((sum, item) => sum + (item.price * (item.qty || 1)), 0);
    
    // Check if delivery is selected
    const isDelivery = document.getElementById('delivery-option').checked;
    const shippingCost = isDelivery ? DELIVERY_FEE : 0;
    
    // Calculate Discount
    let discountAmount = 0;
    if (currentDiscount > 0) {
        discountAmount = (discountType === 'percentage') ? (subtotal * (currentDiscount / 100)) : currentDiscount;
    }

    const total = subtotal + shippingCost - discountAmount;

    // Update UI
    document.getElementById('subtotalSummaryPrice').textContent = `RM ${subtotal.toFixed(2)}`;
    document.getElementById('deliverySummaryItem').style.display = isDelivery ? 'flex' : 'none';
    document.getElementById('discountSummaryItem').style.display = currentDiscount > 0 ? 'flex' : 'none';
    document.getElementById('discountSummaryValue').textContent = `-RM ${discountAmount.toFixed(2)}`;
    document.getElementById('totalSummaryPrice').textContent = `RM ${total.toFixed(2)}`;
    
    localStorage.setItem('tempOrderTotal', total.toFixed(2));
}

// ==================== FORM SUBMISSION ====================
function proceedToPayment() {
    const firstName = document.getElementById('first-name')?.value || "";
    const lastName = document.getElementById('last-name')?.value || "";
    const email = document.getElementById('email')?.value || "";
    const phone = document.getElementById('phone')?.value || "";
    const address = document.getElementById('street-address')?.value || "Self Pickup";
    const city = document.getElementById('town-city')?.value || "";
    const postcode = document.getElementById('postcode')?.value || "";
    const state = document.getElementById('state')?.value || "";
    
    // Get delivery method
    const deliveryRadio = document.getElementById('delivery-option');
    const isDelivery = deliveryRadio ? deliveryRadio.checked : false;
    const deliveryMethod = isDelivery ? "Delivery" : "Self Pickup";
    
    const deliveryDate = document.getElementById('delivery-date')?.value || "";
    const timeSelect = document.getElementById('delivery-time');
    let timeSlot = "N/A";
    
    if (timeSelect && timeSelect.value) {
        const selectedOption = timeSelect.options[timeSelect.selectedIndex];
        timeSlot = selectedOption ? selectedOption.text : timeSelect.value;
    }
    
    // Get payment method
    const paymentRadios = document.querySelectorAll('input[name="payment"]');
    let paymentMethod = "Not selected";
    for (let radio of paymentRadios) {
        if (radio.checked) {
            const parentDiv = radio.closest('.payment-option');
            if (parentDiv) {
                const label = parentDiv.querySelector('label');
                paymentMethod = label ? label.textContent : radio.value;
            } else {
                paymentMethod = radio.value;
            }
            break;
        }
    }
    
    if (!firstName || !email || !phone) {
        alert('Please complete your contact information.');
        return;
    }
    
    if (!deliveryDate) {
        alert('Please select a delivery/pickup date.');
        return;
    }
    
    if (!timeSelect || !timeSelect.value) {
        alert('Please select a time slot.');
        return;
    }
    
    // Get cart items
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        alert('Your cart is empty. Please add items before placing order.');
        return;
    }
    
    // Calculate totals
    const subtotal = cart.reduce((sum, item) => sum + (item.price * (item.qty || 1)), 0);
    const shippingCost = isDelivery ? 30 : 0;
    
    // Get discount from global variable (if any)
    let discountAmount = 0;
    if (typeof currentDiscount !== 'undefined' && currentDiscount > 0) {
        if (discountType === 'percentage') {
            discountAmount = subtotal * (currentDiscount / 100);
        } else {
            discountAmount = currentDiscount;
        }
    }
    
    const total = subtotal + shippingCost - discountAmount;
    
    // Generate order ID
    const orderId = 'DF-M' + new Date().getFullYear() + 
                    (new Date().getMonth() + 1).toString().padStart(2, '0') +
                    Math.floor(10000 + Math.random() * 90000);
    
    // Save full order details
    const fullOrderDetails = {
        orderId: orderId,
        customerName: firstName + " " + lastName,
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phone,
        address: isDelivery ? `${address}, ${city}, ${postcode}, ${state}, Malaysia` : "Self Pickup",
        streetAddress: address,
        city: city,
        postcode: postcode,
        state: state,
        deliveryMethod: deliveryMethod,
        deliveryDate: deliveryDate,
        timeSlot: timeSlot,
        paymentMethod: paymentMethod,
        orderDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
        orderTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        subtotal: subtotal.toFixed(2),
        shippingCost: shippingCost.toFixed(2),
        discountAmount: discountAmount.toFixed(2),
        total: total.toFixed(2),
        specialInstructions: document.getElementById('special-instructions')?.value || ""
    };
    
    localStorage.setItem('fullOrderDetails', JSON.stringify(fullOrderDetails));
    localStorage.setItem('tempOrderTotal', total.toFixed(2));
    localStorage.setItem('currentOrderId', orderId);
    
    if (paymentMethod === "PayPal" || paymentMethod === "Credit/Debit Card" || paymentMethod === "eWallet") {
        localStorage.setItem('paymentSuccess', 'true');
        window.location.href = 'confirmation.html';
    } else {
        window.location.href = 'Payment.html';
    }
}

function applyDiscount() {
    const code = document.getElementById('discount').value.trim().toUpperCase();
    const msg = document.getElementById('discount-message');
    
    if (discountCodes[code]) {
        currentDiscount = discountCodes[code].value;
        discountType = discountCodes[code].type;
        msg.textContent = `Applied: ${discountCodes[code].description}`;
        msg.style.color = '#27ae60';
        updateTotal();
    } else {
        alert('Invalid Discount Code');
    }
}
// ==================== PAYMENT FUNCTIONS ====================

function proceedToBank() {
    const bankSelect = document.getElementById('bankSelect');
    const selectedBankValue = bankSelect.value;
    const selectedBankName = bankSelect.options[bankSelect.selectedIndex]?.text || "";

    if (selectedBankValue === "") {
        const warning = document.getElementById('warningMessage');
        if (warning) warning.style.display = 'block';
        return;
    }

    localStorage.setItem('selectedFPXBank', selectedBankName);
    localStorage.setItem('selectedBankName', selectedBankName);
    localStorage.setItem('selectedBankCode', selectedBankValue);
    
    console.log('Bank saved:', selectedBankName); // Debug
    
    window.location.href = 'paymentGateway.html';
}

// ==================== PAYMENT GATEWAY FUNCTIONS (paymentGateway.html) ====================

let timerIntervalFPX;
let timeLeftFPX = 600;
let selectedBank = "";

function initPaymentGateway() {
    let bankName = localStorage.getItem('selectedFPXBank');
    
    if (!bankName) {
        bankName = localStorage.getItem('selectedBankName');
    }
    
    // Default jika masih tiada
    if (!bankName) {
        bankName = "Maybank";
    }
    
    console.log('Bank loaded in gateway:', bankName);
    
    // Papar nama bank di header
    const bankNameElement = document.getElementById('bankName');
    if (bankNameElement) {
        bankNameElement.textContent = bankName + ' FPX';
    }
    
    selectedBank = bankName;
    loadTransactionData();
    startFPXTimer();
}

function loadTransactionData() {
    try {
        // Load order data dari fullOrderDetails
        const orderJson = localStorage.getItem('fullOrderDetails');
        if (orderJson) {
            const orderData = JSON.parse(orderJson);
            
            // Set Order ID
            const orderIdElement = document.getElementById('orderId');
            if (orderIdElement) {
                orderIdElement.textContent = orderData.orderId || `DF-M${Math.floor(100000 + Math.random() * 900000)}`;
            }
            
            // Set Amount
            const amountElement = document.getElementById('amountToPay');
            if (amountElement && orderData.total) {
                let totalAmount = orderData.total;
                if (totalAmount.startsWith('RM')) {
                    amountElement.textContent = totalAmount;
                } else {
                    amountElement.textContent = `RM ${parseFloat(totalAmount).toFixed(2)}`;
                }
            } else if (amountElement) {
                const tempTotal = localStorage.getItem('tempOrderTotal');
                if (tempTotal) {
                    amountElement.textContent = `RM ${parseFloat(tempTotal).toFixed(2)}`;
                }
            }
        } else {
            // Fallback: guna tempOrderTotal
            const tempTotal = localStorage.getItem('tempOrderTotal');
            const amountElement = document.getElementById('amountToPay');
            if (amountElement && tempTotal) {
                amountElement.textContent = `RM ${parseFloat(tempTotal).toFixed(2)}`;
            }
        }
        
        // Generate reference number
        const refElement = document.getElementById('refNumber');
        if (refElement) {
            const refNum = 'MB' + new Date().getFullYear() + 
                          (new Date().getMonth() + 1).toString().padStart(2, '0') + 
                          Math.floor(10000 + Math.random() * 90000);
            refElement.textContent = refNum;
        }
        
        // Set transaction date time
        const transDateTimeElement = document.getElementById('transDateTime');
        if (transDateTimeElement) {
            const now = new Date();
            const dateTimeStr = now.toLocaleDateString('en-MY', { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric' 
            }) + ', ' + now.toLocaleTimeString('en-MY', { 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit' 
            });
            transDateTimeElement.textContent = dateTimeStr;
        }
        
    } catch (error) {
        console.error('Error loading transaction data:', error);
    }
}

function startFPXTimer() {
    const timeDisplay = document.getElementById('timeDisplay');
    if (!timeDisplay) return;
    
    function updateTimer() {
        const minutes = Math.floor(timeLeftFPX / 60);
        const seconds = timeLeftFPX % 60;
        timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if (timeLeftFPX <= 60) {
            timeDisplay.style.color = '#ff6b6b';
            timeDisplay.style.animation = 'pulse 1s infinite';
        }
        
        if (timeLeftFPX <= 0) {
            clearInterval(timerIntervalFPX);
            timeExpiredFPX();
        }
        timeLeftFPX--;
    }
    
    updateTimer();
    timerIntervalFPX = setInterval(updateTimer, 1000);
}

function timeExpiredFPX() {
    alert('Payment session has expired. Please start a new payment.');
    window.location.href = 'Payment.html';
}

function generateTAC() {
    const username = document.getElementById('username');
    const password = document.getElementById('password');
    
    if (!username || !password || !username.value || !password.value) {
        alert('Please enter your username and password first');
        return;
    }
    
    generatedTAC = Math.floor(100000 + Math.random() * 900000).toString();
    
    const tacSection = document.getElementById('tacSection');
    const tacCode = document.getElementById('tacCode');
    
    if (tacSection) tacSection.style.display = 'block';
    if (tacCode) tacCode.value = "";
    
    // Simulate TAC sent
    alert(`TAC ${generatedTAC} has been sent to your registered mobile number.`);
}

function resendTAC() {
    generatedTAC = Math.floor(100000 + Math.random() * 900000).toString();
    const tacCode = document.getElementById('tacCode');
    if (tacCode) tacCode.value = "";
    alert(`New TAC ${generatedTAC} has been sent.`);
}

function processFPXPayment() {
    const username = document.getElementById('username');
    const password = document.getElementById('password');
    const tacCode = document.getElementById('tacCode');
    
    if (!username || !username.value) {
        alert('Please enter your username');
        return;
    }
    
    if (!password || !password.value) {
        alert('Please enter your password');
        return;
    }
    
    if (!generatedTAC) {
        alert('Please request a TAC first');
        return;
    }
    
    if (!tacCode || tacCode.value.length !== 6) {
        alert('Please enter the 6-digit TAC');
        return;
    }
    
    if (tacCode.value !== generatedTAC) {
        alert('Invalid TAC. Please enter the correct TAC sent to your mobile.');
        return;
    }
    
    const payButton = document.getElementById('payButton');
    const cancelButton = document.querySelector('.cancel-button');
    const processingMessage = document.getElementById('processingMessage');
    
    if (payButton) {
        payButton.disabled = true;
        payButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    }
    if (cancelButton) cancelButton.disabled = true;
    if (processingMessage) processingMessage.style.display = 'block';
    
    setTimeout(() => {
        completeFPXPayment();
    }, 3000);
}

function completeFPXPayment() {
    // Save payment success
    localStorage.setItem('paymentSuccess', 'true');
    localStorage.setItem('paymentBank', selectedBank);
    
    // Get order data to save for confirmation
    const orderDetails = localStorage.getItem('fullOrderDetails');
    if (orderDetails) {
        const order = JSON.parse(orderDetails);
        order.paymentMethod = `FPX - ${selectedBank}`;
        localStorage.setItem('fullOrderDetails', JSON.stringify(order));
    }
    
    setTimeout(() => {
        window.location.href = 'confirmation.html';
    }, 500);
}

function cancelFPXPayment() {
    if (confirm('Are you sure you want to cancel this payment? This transaction will be terminated.')) {
        clearInterval(timerIntervalFPX);
        window.location.href = 'Payment.html';
    }
}

function initPayment() {
    // Load order data
    const orderData = JSON.parse(localStorage.getItem('fullOrderDetails'));
    if (orderData && document.getElementById('totalAmount')) {
        let total = orderData.total;
        if (typeof total === 'string' && total.startsWith('RM')) {
            document.getElementById('totalAmount').textContent = total;
        } else {
            document.getElementById('totalAmount').textContent = `RM ${parseFloat(total).toFixed(2)}`;
        }
    } else {
        const tempTotal = localStorage.getItem('tempOrderTotal');
        if (tempTotal && document.getElementById('totalAmount')) {
            document.getElementById('totalAmount').textContent = `RM ${parseFloat(tempTotal).toFixed(2)}`;
        }
    }
    
    // Set Order ID
    if (document.getElementById('orderId')) {
        const orderId = localStorage.getItem('currentOrderId') || `DF-M${Math.floor(100000 + Math.random() * 900000)}`;
        document.getElementById('orderId').textContent = orderId;
        localStorage.setItem('currentOrderId', orderId);
    }
    
    // Set Payment ID
    if (document.getElementById('paymentId')) {
        const paymentId = 'c4Get3zh' + Math.floor(10000 + Math.random() * 90000);
        document.getElementById('paymentId').textContent = paymentId;
    }
    
    // Set Order Description
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length > 0 && document.getElementById('orderDescription')) {
        const firstItem = cart[0];
        const itemCount = cart.length;
        if (itemCount === 1) {
            document.getElementById('orderDescription').textContent = firstItem.name;
        } else {
            document.getElementById('orderDescription').textContent = `${firstItem.name} + ${itemCount - 1} other item(s)`;
        }
    }
    
    // Hide warning initially
    const warningMessage = document.getElementById('warningMessage');
    if (warningMessage) {
        warningMessage.style.display = 'none';
    }
    
    // Start timer
    startPaymentTimer();
}

function startPaymentTimer() {
    let timeLeftPayment = 300; // 5 minutes
    const timeDisplay = document.getElementById('timeDisplay');
    if (!timeDisplay) return;
    
    function updateTimer() {
        const minutes = Math.floor(timeLeftPayment / 60);
        const seconds = timeLeftPayment % 60;
        timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if (timeLeftPayment <= 60) {
            timeDisplay.style.color = '#e74c3c';
        }
        
        if (timeLeftPayment <= 0) {
            clearInterval(timerInterval);
            alert('Payment session has expired. Please start over.');
            window.location.href = 'PlaceOrder.html';
        }
        timeLeftPayment--;
    }
    
    updateTimer();
    window.timerInterval = setInterval(updateTimer, 1000);
}

function cancelPayment() {
    if (confirm('Cancel payment and return to order page?')) {
        if (window.timerInterval) clearInterval(window.timerInterval);
        window.location.href = 'PlaceOrder.html';
    }
}

function initConfirmation() {
    displayDateTime();
    loadOrderDataConfirmation();
    createConfetti();
}

// Helper function to get cart data
function getCartData() {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
}

// ==================== CONFIRMATION PAGE FUNCTIONS ====================
// Mock cart data - same as what customer ordered
        const MOCK_CART = [
            { id: 1, name: "Sourdough Boule", price: 18.50, qty: 2, size: "Large (500g)", description: "Artisan country loaf, crispy crust" },
            { id: 2, name: "Almond Croissant", price: 12.90, qty: 1, size: "Regular", description: "Buttery & flaky with almond filling" },
            { id: 3, name: "Matcha Danish", price: 9.90, qty: 3, size: "Regular", description: "Japanese inspired matcha cream" },
            { id: 4, name: "Chocolate Chip Cookie", price: 6.50, qty: 2, size: "Large", description: "Soft baked with dark chocolate chunks" }
        ];
      
        document.addEventListener('DOMContentLoaded', function() {
            console.log('Confirmation page loaded');
            loadAllOrderData();
            createConfetti();
        });
        
        function loadAllOrderData() {
    console.log('=== LOADING ORDER DATA ===');
    
    // FIRST: Force ensure cart has data
    ensureCartHasData();
    
    let orderData = null;
    let cartItems = [];
    
    // Get cart from localStorage
    const savedCart = localStorage.getItem('cart');
    console.log('Raw cart from localStorage:', savedCart);
    
    if (savedCart) {
        try {
            const parsed = JSON.parse(savedCart);
            if (parsed && parsed.length > 0) {
                cartItems = parsed;
                console.log('📦 Cart loaded with', cartItems.length, 'items:');
                cartItems.forEach((item, i) => {
                    console.log(`  ${i+1}. ${item.name} x${item.qty} - RM${item.price}`);
                });
            } else {
                console.warn('⚠️ Cart parsed but empty');
            }
        } catch(e) {
            console.error('Error parsing cart:', e);
        }
    }
    
    // If cart still empty, create from MOCK_CART
    if (cartItems.length === 0) {
        console.log('🔄 Cart empty, using MOCK_CART');
        cartItems = MOCK_CART;
        localStorage.setItem('cart', JSON.stringify(cartItems));
        console.log('Saved mock cart to localStorage');
    }
    
    // Get order details
    const fullOrderStr = localStorage.getItem('fullOrderDetails');
    if (fullOrderStr) {
        try {
            orderData = JSON.parse(fullOrderStr);
            console.log('Loaded fullOrderDetails:', orderData);
        } catch(e) {
            console.error('Error parsing fullOrderDetails:', e);
        }
    }
    
    // If no order data, create from cart
    if (!orderData) {
        console.log('🆕 No order data found, creating new...');
        const subtotal = calculateSubtotal(cartItems);
        
        orderData = {
            orderId: 'DF-M' + new Date().getFullYear() + 
                    (new Date().getMonth() + 1).toString().padStart(2, '0') +
                    Math.floor(10000 + Math.random() * 90000),
            customerName: 'Guest User',
            firstName: 'Guest',
            lastName: 'User',
            email: 'guest@delivax.com',
            phone: '0123456789',
            address: 'Self Pickup',
            deliveryMethod: 'Self Pickup',
            deliveryDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
            timeSlot: '12:00 PM - 1:00 PM',
            paymentMethod: 'FPX - Maybank',
            orderDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
            orderTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            subtotal: subtotal.toFixed(2),
            shippingCost: '0.00',
            discountAmount: '0.00',
            total: subtotal.toFixed(2),
            items: cartItems
        };
        
        localStorage.setItem('fullOrderDetails', JSON.stringify(orderData));
        console.log('✅ Created new order data');
    }
    
    // FINAL: Display everything
    console.log('🎨 Displaying with', cartItems.length, 'cart items');
    displayOrderData(orderData, cartItems);
    
    // Also force display cart items directly
    forceDisplayCartItems(cartItems);
}

// NEW: Force display cart items
function forceDisplayCartItems(cartItems) {
    const container = document.getElementById('cartItems');
    if (!container) {
        console.error('❌ cartItems container not found!');
        return;
    }
    
    console.log('Force displaying', cartItems.length, 'items');
    container.innerHTML = '';
    
    if (!cartItems || cartItems.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #e74c3c;">⚠️ No items in cart. Please add items.</p>';
        return;
    }
    
    cartItems.forEach((item, index) => {
        const qty = item.qty || 1;
        const itemTotal = item.price * qty;
        const itemName = item.name || 'Unknown Item';
        const itemSize = item.size || 'Standard';
        
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        itemDiv.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #e2c9aa;';
        
        itemDiv.innerHTML = `
            <div style="flex: 1;">
                <div style="font-weight: 700; color: #1a5f7a;">${qty}x ${itemName}</div>
                <div style="font-size: 0.8rem; color: #7fa9c2;">Size: ${itemSize}</div>
                <div style="font-size: 0.75rem; color: #95a5a6;">RM ${item.price.toFixed(2)} each</div>
            </div>
            <div style="font-weight: 700; color: #1a5f7a;">RM ${itemTotal.toFixed(2)}</div>
        `;
        
        container.appendChild(itemDiv);
    });
    
    console.log('✅ Displayed', cartItems.length, 'items in cart');
}
        
        function displayOrderData(orderData, cartItems) {
            // Display Order Number
            const orderNumberEl = document.getElementById('orderNumber');
            if (orderNumberEl) {
                orderNumberEl.textContent = orderData.orderId || 'DF-M' + Math.floor(100000 + Math.random() * 900000);
            }
            
            // Display Order Date & Time
            const orderDateEl = document.getElementById('orderDate');
            const orderTimeEl = document.getElementById('orderTime');
            
            if (orderDateEl) {
                orderDateEl.textContent = orderData.orderDate || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
            }
            if (orderTimeEl) {
                orderTimeEl.textContent = orderData.orderTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
            
            // Display Customer Info
            const nameEl = document.getElementById('conf-name');
            const emailEl = document.getElementById('conf-email');
            const phoneEl = document.getElementById('conf-phone');
            const methodEl = document.getElementById('conf-method');
            
            if (nameEl) {
                const fullName = orderData.customerName || `${orderData.firstName || ''} ${orderData.lastName || ''}`.trim() || 'Guest User';
                nameEl.textContent = fullName;
            }
            if (emailEl) {
                emailEl.textContent = orderData.email || 'Not provided';
            }
            if (phoneEl) {
                phoneEl.textContent = orderData.phone || 'Not provided';
            }
            if (methodEl) {
                let paymentMethod = orderData.paymentMethod || 'FPX';
                // Add bank name if available
                const paymentBank = localStorage.getItem('paymentBank');
                if (paymentBank && !paymentMethod.includes(paymentBank)) {
                    paymentMethod = `${paymentMethod} - ${paymentBank}`;
                }
                methodEl.textContent = paymentMethod;
            }
            
            // Display Delivery Details
            const delMethodEl = document.getElementById('conf-del-method');
            const delDateEl = document.getElementById('conf-del-date');
            const delTimeEl = document.getElementById('conf-del-time');
            const addressEl = document.getElementById('conf-address');
            
            if (delMethodEl) {
                delMethodEl.textContent = orderData.deliveryMethod || 'Self Pickup';
            }
            if (delDateEl) {
                delDateEl.textContent = orderData.deliveryDate || orderData.pickupDate || 'Not specified';
            }
            if (delTimeEl) {
                delTimeEl.textContent = orderData.timeSlot || orderData.pickupTime || '12:00 PM - 1:00 PM';
            }
            if (addressEl) {
                let address = orderData.address || 'Self Pickup - No address needed';
                if (address === 'Self Pickup - No address needed' || address === 'Self Pickup') {
                    addressEl.textContent = '📍 Self Pickup at DeliVax Bakery';
                } else {
                    addressEl.textContent = address;
                }
            }
            
            // Display Cart Items
            displayCartItems(cartItems, orderData.items);
            
            // Display Payment Summary
            const subtotal = parseFloat(orderData.subtotal) || calculateSubtotal(cartItems);
            const shipping = parseFloat(orderData.shippingCost) || (orderData.deliveryMethod === 'Delivery' ? 30 : 0);
            const discount = parseFloat(orderData.discountAmount) || 0;
            const total = parseFloat(orderData.total) || (subtotal + shipping - discount);
            
            const subtotalEl = document.getElementById('subtotalAmount');
            const deliveryRow = document.getElementById('deliveryRow');
            const deliveryAmountEl = document.getElementById('deliveryAmount');
            const discountRow = document.getElementById('discountRow');
            const discountAmountEl = document.getElementById('discountAmount');
            const totalEl = document.getElementById('totalAmountPaid');
            
            if (subtotalEl) {
                subtotalEl.textContent = `RM ${subtotal.toFixed(2)}`;
            }
            
            if (deliveryRow && deliveryAmountEl) {
                if (shipping > 0) {
                    deliveryRow.style.display = 'flex';
                    deliveryAmountEl.textContent = `RM ${shipping.toFixed(2)}`;
                } else {
                    deliveryRow.style.display = 'none';
                }
            }
            
            if (discountRow && discountAmountEl) {
                if (discount > 0) {
                    discountRow.style.display = 'flex';
                    discountAmountEl.textContent = `-RM ${discount.toFixed(2)}`;
                } else {
                    discountRow.style.display = 'none';
                }
            }
            
            if (totalEl) {
                totalEl.textContent = `RM ${total.toFixed(2)}`;
            }
            
            const oldTotalElements = document.querySelectorAll('#totalAmount');
            oldTotalElements.forEach(el => {
                if (el !== totalEl) {
                    el.textContent = `RM ${total.toFixed(2)}`;
                }
            });
        }
        
        function calculateSubtotal(cartItems) {
            if (!cartItems || cartItems.length === 0) return 0;
            return cartItems.reduce((sum, item) => sum + (item.price * (item.qty || 1)), 0);
        }
        
        function displayCartItems(cartItems, orderItems) {
    const container = document.getElementById('cartItems');
    if (!container) {
        console.error('❌ Cart container not found!');
        return;
    }
    
    // Use orderItems if available, otherwise use cartItems
    const items = (orderItems && orderItems.length > 0) ? orderItems : cartItems;
    
    console.log('Displaying cart items - count:', items?.length);
    
    if (!items || items.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #e74c3c; padding: 20px;">⚠️ Cart is empty! Please add items to your order.</p>';
        return;
    }
    
    container.innerHTML = '';
    
    items.forEach(item => {
        const qty = item.qty || 1;
        const itemTotal = item.price * qty;
        const itemName = item.name || 'Unknown Item';
        const itemSize = item.size || 'Standard';
        
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        itemDiv.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #e2c9aa;';
        
        itemDiv.innerHTML = `
            <div style="flex: 1;">
                <div style="font-weight: 700; color: #1a5f7a;">${qty}x ${itemName}</div>
                <div style="font-size: 0.8rem; color: #7fa9c2;">Size: ${itemSize}</div>
                <div style="font-size: 0.7rem; color: #95a5a6;">RM ${item.price.toFixed(2)} each</div>
            </div>
            <div style="font-weight: 700; color: #1a5f7a;">RM ${itemTotal.toFixed(2)}</div>
        `;
        
        container.appendChild(itemDiv);
    });
    
    console.log('✅ Cart items displayed successfully');
}
        
        function createConfetti() {
            const colors = ['#1a5f7a', '#5dade2', '#27ae60', '#f39c12', '#e74c3c'];
            for (let i = 0; i < 50; i++) {
                const confetti = document.createElement('div');
                confetti.style.cssText = `
                    position: fixed;
                    width: 8px;
                    height: 8px;
                    background: ${colors[Math.floor(Math.random() * colors.length)]};
                    top: -10px;
                    left: ${Math.random() * 100}vw;
                    opacity: ${Math.random() * 0.8 + 0.2};
                    transform: rotate(${Math.random() * 360}deg);
                    animation: fall ${Math.random() * 3 + 2}s linear forwards;
                    z-index: 9999;
                    pointer-events: none;
                `;
                document.body.appendChild(confetti);
                setTimeout(() => confetti.remove(), 4000);
            }
        }
        
        function printConfirmation() {
            window.print();
        }
        
        function trackOrder() {
            alert('Order tracking feature coming soon! Your order is being prepared.');
        }
        
        function backToMenu() {
            window.location.href = 'Menu.html';
        }