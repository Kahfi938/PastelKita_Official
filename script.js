// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking a link
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// Testimonial Slider
const testimonialItems = document.querySelectorAll('.testimonial-item');
const dots = document.querySelectorAll('.dot');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');
let currentSlide = 0;

function showSlide(n) {
    // Reset all slides and dots
    testimonialItems.forEach(item => item.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    // Handle slide boundaries
    if (n >= testimonialItems.length) currentSlide = 0;
    else if (n < 0) currentSlide = testimonialItems.length - 1;
    else currentSlide = n;
    
    // Show current slide and activate corresponding dot
    testimonialItems[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
}

// Next/previous controls
nextBtn.addEventListener('click', () => {
    showSlide(currentSlide + 1);
});

prevBtn.addEventListener('click', () => {
    showSlide(currentSlide - 1);
});

// Dot controls
dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        showSlide(index);
    });
});

// Auto slide every 5 seconds
setInterval(() => {
    showSlide(currentSlide + 1);
}, 5000);

// Product Filtering
const categoryBtns = document.querySelectorAll('.category-btn');
const productCards = document.querySelectorAll('.product-card');

categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all buttons
        categoryBtns.forEach(b => b.classList.remove('active'));
        // Add active class to clicked button
        btn.classList.add('active');
        
        const category = btn.getAttribute('data-category');
        
        // Filter products
        productCards.forEach(card => {
            if (category === 'all' || card.getAttribute('data-category') === category) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
});

// ==================== KODE BARU UNTUK FORM PEMESANAN ====================
// Price mapping untuk pastel (sesuaikan dengan HTML form Anda)
const pastelPrices = {
    'ayam': 4000,
    'bakso': 5000,
    'special': 5000,
    'telur': 3000,
    'campur': 0 // Tidak ada harga tetap untuk campur, akan dihitung manual
};

// Format Rupiah
function formatRupiah(amount) {
    return 'Rp ' + amount.toLocaleString('id-ID');
}

// Fungsi khusus untuk menghitung harga campur dari catatan
function calculateMixedPrice(notes) {
    if (!notes) return 0;
    
    let totalPrice = 0;
    const noteText = notes.toLowerCase();
    
    // Pola pencarian untuk varian dalam catatan
    const patterns = [
        { keyword: 'ayam', price: 4000 },
        { keyword: 'bakso', price: 5000 },
        { keyword: 'special', price: 5000 },
        { keyword: 'telur', price: 3000 }
    ];
    
    // Cari angka yang terkait dengan varian
    patterns.forEach(pattern => {
        const regex = new RegExp(`${pattern.keyword}\\s*(\\d+)`, 'gi');
        const matches = [...noteText.matchAll(regex)];
        
        matches.forEach(match => {
            const quantity = parseInt(match[1]) || 1;
            totalPrice += pattern.price * quantity;
        });
    });
    
    // Juga cek format: "5 ayam, 3 telur"
    const simplePatterns = [
        { keywords: ['ayam'], price: 4000 },
        { keywords: ['bakso'], price: 5000 },
        { keywords: ['special', 'spesial'], price: 5000 },
        { keywords: ['telur'], price: 3000 }
    ];
    
    simplePatterns.forEach(pattern => {
        pattern.keywords.forEach(keyword => {
            if (noteText.includes(keyword)) {
                // Cari angka sebelum keyword
                const beforeRegex = new RegExp(`(\\d+)\\s*${keyword}`, 'gi');
                const beforeMatches = [...noteText.matchAll(beforeRegex)];
                
                // Cari angka setelah keyword
                const afterRegex = new RegExp(`${keyword}\\s*(\\d+)`, 'gi');
                const afterMatches = [...noteText.matchAll(afterRegex)];
                
                const allMatches = [...beforeMatches, ...afterMatches];
                
                if (allMatches.length > 0) {
                    allMatches.forEach(match => {
                        const quantity = parseInt(match[1]) || 1;
                        totalPrice += pattern.price * quantity;
                    });
                } else if (noteText.includes(keyword)) {
                    // Jika hanya disebutkan tanpa jumlah, anggap 1
                    totalPrice += pattern.price;
                }
            }
        });
    });
    
    return totalPrice;
}

// Update Order Summary
function updateOrderSummary() {
    // Get elements from your form
    const productSelect = document.getElementById('productSelect');
    const quantityInput = document.getElementById('quantity');
    const notesTextarea = document.querySelector('textarea[placeholder="Catatan Tambahan (opsional)"]');
    const subtotalElement = document.getElementById('subtotal');
    const shippingElement = document.getElementById('shipping');
    const totalElement = document.getElementById('total');
    
    let productPrice = 0;
    let quantity = parseInt(quantityInput.value) || 10; // Default 10 sesuai form
    let selectedProduct = productSelect ? productSelect.value : '';
    let notes = notesTextarea ? notesTextarea.value : '';
    
    // Jika ada produk yang dipilih
    if (selectedProduct && selectedProduct !== "") {
        if (selectedProduct === 'campur') {
            // Untuk varian campur, hitung dari catatan
            productPrice = calculateMixedPrice(notes);
            
            // Jika ada harga dari catatan, update jumlah berdasarkan total pcs yang dibutuhkan
            if (productPrice > 0) {
                // Hitung jumlah minimum berdasarkan harga rata-rata
                const averagePrice = 4500; // Rata-rata harga pastel
                const calculatedQuantity = Math.max(10, Math.ceil(productPrice / averagePrice));
                
                // Update jumlah jika diperlukan
                if (calculatedQuantity > quantity) {
                    quantity = calculatedQuantity;
                    if (quantityInput) {
                        quantityInput.value = quantity;
                    }
                }
                
                // Update harga per pcs untuk display
                productPrice = productPrice / quantity;
            } else {
                productPrice = 4500; // Harga default jika tidak ada catatan
            }
        } else if (pastelPrices[selectedProduct]) {
            productPrice = pastelPrices[selectedProduct];
        }
    }
    
    // Hitung subtotal
    let subtotal = 0;
    
    if (selectedProduct === 'campur' && notes) {
        // Untuk campur, hitung total dari catatan
        subtotal = calculateMixedPrice(notes);
        if (subtotal === 0) {
            subtotal = productPrice * quantity; // Fallback ke harga default
        }
    } else {
        subtotal = productPrice * quantity;
    }
    
    // Kebijakan ongkir (contoh: gratis)
    let shipping = 0;
    let shippingText = 'Gratis';
    
    // Contoh: Ongkir Rp 10.000 untuk pesanan di bawah Rp 50.000
    if (subtotal > 0 && subtotal < 50000) {
        shipping = 10000;
        shippingText = formatRupiah(shipping);
    }
    
    // Hitung total
    let total = subtotal + shipping;
    
    // Update UI
    if (subtotalElement) {
        subtotalElement.textContent = subtotal > 0 ? formatRupiah(subtotal) : 'Rp 0';
    }
    if (shippingElement) {
        shippingElement.textContent = shippingText;
    }
    if (totalElement) {
        totalElement.textContent = total > 0 ? formatRupiah(total) : 'Rp 0';
    }
    
    // Tampilkan pesan untuk varian campur
    if (selectedProduct === 'campur' && notesTextarea) {
        const campurInfo = document.getElementById('campurInfo') || (() => {
            const infoDiv = document.createElement('div');
            infoDiv.id = 'campurInfo';
            infoDiv.className = 'campur-info';
            infoDiv.style.cssText = 'background: #f0f8ff; padding: 10px; border-radius: 5px; margin-top: 10px; font-size: 14px; color: #0066cc; border-left: 4px solid #0066cc;';
            notesTextarea.parentNode.insertBefore(infoDiv, notesTextarea.nextSibling);
            return infoDiv;
        })();
        
        if (notes.trim()) {
            const calculatedPrice = calculateMixedPrice(notes);
            if (calculatedPrice > 0) {
                campurInfo.innerHTML = `
                    <strong>Perhitungan Campur:</strong><br>
                    Total dari catatan: ${formatRupiah(calculatedPrice)}<br>
                    <small>Format contoh: "5 ayam, 3 telur" atau "ayam 5, bakso 5"</small>
                `;
                campurInfo.style.display = 'block';
            } else {
                campurInfo.innerHTML = `
                    <strong>Tips:</strong> Sebutkan komposisi di catatan (contoh: "5 ayam, 3 telur, 2 special")<br>
                    <small>Harga akan dihitung otomatis berdasarkan komposisi yang Anda sebutkan</small>
                `;
                campurInfo.style.display = 'block';
            }
        } else {
            campurInfo.style.display = 'none';
        }
    } else {
        const campurInfo = document.getElementById('campurInfo');
        if (campurInfo) {
            campurInfo.style.display = 'none';
        }
    }
}

// Quantity Selector
const minusBtn = document.querySelector('.qty-btn.minus');
const plusBtn = document.querySelector('.qty-btn.plus');
const quantityInput = document.getElementById('quantity');

if (minusBtn && quantityInput) {
    minusBtn.addEventListener('click', () => {
        let currentValue = parseInt(quantityInput.value) || 10;
        if (currentValue > parseInt(quantityInput.min || 10)) {
            quantityInput.value = currentValue - 1;
            updateOrderSummary();
        }
    });
}

if (plusBtn && quantityInput) {
    plusBtn.addEventListener('click', () => {
        let currentValue = parseInt(quantityInput.value) || 10;
        if (currentValue < parseInt(quantityInput.max || 100)) {
            quantityInput.value = currentValue + 1;
            updateOrderSummary();
        }
    });
}

if (quantityInput) {
    quantityInput.addEventListener('input', () => {
        let value = parseInt(quantityInput.value) || 10;
        const min = parseInt(quantityInput.min || 10);
        const max = parseInt(quantityInput.max || 100);
        
        if (value < min) quantityInput.value = min;
        if (value > max) quantityInput.value = max;
        updateOrderSummary();
    });
    
    quantityInput.addEventListener('change', () => {
        updateOrderSummary();
    });
}

// Update summary when product changes
const productSelect = document.getElementById('productSelect');
if (productSelect) {
    productSelect.addEventListener('change', updateOrderSummary);
}

// Update summary when notes change (khusus untuk varian campur)
const notesTextarea = document.querySelector('textarea[placeholder="Catatan Tambahan (opsional)"]');
if (notesTextarea) {
    // Gunakan debounce untuk menghindari terlalu banyak pemanggilan
    let timeout;
    notesTextarea.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            const selectedProduct = productSelect ? productSelect.value : '';
            if (selectedProduct === 'campur') {
                updateOrderSummary();
            }
        }, 500); // Delay 500ms
    });
}

// Initialize order summary when page loads
document.addEventListener('DOMContentLoaded', function() {
    updateOrderSummary();
});

// Order Form Submission
const orderForm = document.getElementById('orderForm');
const orderModal = document.getElementById('orderModal');
const closeModal = document.querySelector('.close-modal');
const closeModalBtn = document.getElementById('closeModalBtn');
const whatsappBtn = document.getElementById('whatsappBtn');
const modalMessage = document.getElementById('modalMessage');

if (orderForm) {
    orderForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data from your form structure
        const name = this.querySelector('input[type="text"]')?.value;
        const phone = this.querySelector('input[type="tel"]')?.value;
        const address = this.querySelector('textarea[placeholder="Alamat Pengiriman"]')?.value;
        const productSelectElement = this.querySelector('#productSelect');
        const productText = productSelectElement?.selectedOptions[0]?.text;
        const productValue = productSelectElement?.value;
        const quantity = this.querySelector('#quantity').value;
        const notes = this.querySelector('textarea[placeholder="Catatan Tambahan (opsional)"]')?.value;
        const total = document.getElementById('total')?.textContent || 'Rp 0';
        const subtotal = document.getElementById('subtotal')?.textContent || 'Rp 0';
        
        // Validasi
        if (!productValue || productValue === "") {
            alert('Silakan pilih varian pastel terlebih dahulu!');
            productSelectElement.focus();
            return false;
        }
        
        if (productValue === 'campur') {
            if (!notes || notes.trim() === '') {
                alert('Untuk pesanan campur, silakan sebutkan komposisi di catatan tambahan!\n\nContoh: "5 ayam, 3 telur, 2 special"');
                this.querySelector('textarea[placeholder="Catatan Tambahan (opsional)"]').focus();
                return false;
            }
            
            // Validasi format catatan untuk campur
            const hasVarian = /(ayam|bakso|special|telur)/i.test(notes);
            if (!hasVarian) {
                alert('Mohon sebutkan varian pastel dalam catatan!\n\nContoh: "5 ayam, 3 telur, 2 special"\n\nVarian yang tersedia: Ayam, Bakso, Special, Telur');
                this.querySelector('textarea[placeholder="Catatan Tambahan (opsional)"]').focus();
                return false;
            }
            
            // Hitung jumlah dari catatan
            const calculatedPrice = calculateMixedPrice(notes);
            if (calculatedPrice === 0) {
                alert('Mohon sebutkan jumlah untuk setiap varian!\n\nContoh: "5 ayam, 3 telur" atau "ayam 5, bakso 3"');
                this.querySelector('textarea[placeholder="Catatan Tambahan (opsional)"]').focus();
                return false;
            }
            
            // Update total berdasarkan perhitungan yang lebih akurat
            const actualQuantity = Math.max(10, Math.ceil(calculatedPrice / 4500));
            if (parseInt(quantity) < actualQuantity) {
                const confirmUpdate = confirm(`Berdasarkan komposisi Anda, disarankan minimal ${actualQuantity} pcs. Update jumlah pesanan?`);
                if (confirmUpdate) {
                    quantityInput.value = actualQuantity;
                    updateOrderSummary();
                }
            }
        }
        
        // Update modal message
        if (modalMessage) {
            let additionalInfo = '';
            if (productValue === 'campur') {
                const calculatedPrice = calculateMixedPrice(notes);
                additionalInfo = `\n\nKomposisi campur: ${notes}\nPerhitungan detail: ${formatRupiah(calculatedPrice)}`;
            }
            
            modalMessage.textContent = `Terima kasih ${name}! Pesanan ${productText} sebanyak ${quantity} pcs dengan total ${total} telah berhasil dikirim.${additionalInfo}\n\nKami akan menghubungi Anda via WhatsApp dalam waktu 1x24 jam untuk konfirmasi pesanan.`;
        }
        
        // Set WhatsApp button link
        if (whatsappBtn) {
            let detailMessage = '';
            if (productValue === 'campur') {
                const calculatedPrice = calculateMixedPrice(notes);
                detailMessage = `Komposisi: ${notes}\nPerhitungan: ${formatRupiah(calculatedPrice)}`;
            }
            
            const message = `Halo Pastelkita, saya ingin memesan:\n\nNama: ${name}\nWhatsApp: ${phone}\nProduk: ${productText}\nJumlah: ${quantity} pcs\nAlamat: ${address}\n${detailMessage ? detailMessage + '\n' : ''}Subtotal: ${subtotal}\nTotal: ${total}\nCatatan: ${notes || '-'}`;
            const encodedMessage = encodeURIComponent(message);
            whatsappBtn.href = `https://wa.me/6282140731577?text=${encodedMessage}`; // Ganti dengan nomor WhatsApp Anda
        }
        
        // Show modal if exists
        if (orderModal) {
            orderModal.style.display = 'flex';
        } else {
            // Jika tidak ada modal, langsung kirim ke WhatsApp
            const message = `Halo Pastelkita, saya ingin memesan:\n\nNama: ${name}\nWhatsApp: ${phone}\nProduk: ${productText}\nJumlah: ${quantity} pcs\nAlamat: ${address}\nTotal: ${total}\nCatatan: ${notes || '-'}`;
            const encodedMessage = encodeURIComponent(message);
            window.open(`https://wa.me/6282140731577?text=${encodedMessage}`, '_blank');
        }
    });
}

// Product Order Buttons (jika ada)
document.querySelectorAll('.btn-product').forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        
        const product = this.getAttribute('data-product');
        const productKey = this.getAttribute('data-product-key');
        
        // Find and select the product in the dropdown
        if (productSelect) {
            for (let i = 0; i < productSelect.options.length; i++) {
                if (productKey && productSelect.options[i].value === productKey) {
                    productSelect.selectedIndex = i;
                    break;
                }
            }
        }
        
        // Update order summary
        updateOrderSummary();
        
        // Scroll to contact form
        setTimeout(() => {
            const contactSection = document.getElementById('contact');
            if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
            }
        }, 500);
    });
});

// Close Modal Functions
if (closeModal) {
    closeModal.addEventListener('click', () => {
        if (orderModal) orderModal.style.display = 'none';
    });
}

if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
        if (orderModal) orderModal.style.display = 'none';
    });
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (orderModal && e.target === orderModal) {
        orderModal.style.display = 'none';
    }
});

// Header Scroll Effect
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    
    if (window.scrollY > 100) {
        header.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    }
});

// Smooth Scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Initialize the first slide
showSlide(0);

// Animasi Scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animated');
        }
    });
}, observerOptions);

// Terapkan animasi pada elemen
document.querySelectorAll('.feature, .product-card, .testimonial-content').forEach(el => {
    observer.observe(el);
});

// Tambahkan class untuk animasi
const style = document.createElement('style');
style.textContent = `
    .feature, .product-card, .testimonial-content {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .feature.animated, .product-card.animated, .testimonial-content.animated {
        opacity: 1;
        transform: translateY(0);
    }
    
    .feature:nth-child(1).animated { transition-delay: 0.1s; }
    .feature:nth-child(2).animated { transition-delay: 0.2s; }
    .feature:nth-child(3).animated { transition-delay: 0.3s; }
    
    .product-card:nth-child(1).animated { transition-delay: 0.1s; }
    .product-card:nth-child(2).animated { transition-delay: 0.2s; }
    .product-card:nth-child(3).animated { transition-delay: 0.3s; }
    .product-card:nth-child(4).animated { transition-delay: 0.4s; }
    .product-card:nth-child(5).animated { transition-delay: 0.5s; }
    .product-card:nth-child(6).animated { transition-delay: 0.6s; }
    
    /* Style untuk info campur */
    .campur-info {
        background: #f0f8ff;
        padding: 12px;
        border-radius: 8px;
        margin: 10px 0;
        font-size: 14px;
        color: #0066cc;
        border-left: 4px solid #0066cc;
        animation: fadeIn 0.3s ease;
    }
    
    .campur-info strong {
        color: #004080;
    }
    
    .campur-info small {
        color: #666;
        font-size: 12px;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-5px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);