document.addEventListener('DOMContentLoaded', function() {

  // Smooth scroll for anchor links
  document.addEventListener('click', function(e) {
    const anchor = e.target.closest('a[href^="#"]');
    if (anchor && anchor.getAttribute('href') !== '#') {
      e.preventDefault();
      const targetId = anchor.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  });

  // Navbar scroll effect
  const navbar = document.querySelector('nav, .navbar, header');
  let lastScrollTop = 0;
  
  function handleNavbarScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (navbar) {
      if (scrollTop > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
    
    lastScrollTop = scrollTop;
  }

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll();

  // Form validation for contact form
  const contactForm = document.querySelector('.contact-form');
  
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      let isValid = true;
      const formElements = contactForm.elements;
      
      // Clear previous error messages
      const existingErrors = contactForm.querySelectorAll('.error-message');
      existingErrors.forEach(error => error.remove());
      
      // Clear error classes
      const errorFields = contactForm.querySelectorAll('.error');
      errorFields.forEach(field => field.classList.remove('error'));
      
      for (let i = 0; i < formElements.length; i++) {
        const field = formElements[i];
        
        if (field.hasAttribute('required') && !field.value.trim()) {
          isValid = false;
          field.classList.add('error');
          
          const errorMsg = document.createElement('span');
          errorMsg.className = 'error-message';
          errorMsg.textContent = 'This field is required';
          errorMsg.style.color = 'red';
          errorMsg.style.fontSize = '0.875rem';
          errorMsg.style.marginTop = '0.25rem';
          errorMsg.style.display = 'block';
          
          field.parentNode.insertBefore(errorMsg, field.nextSibling);
        }
        
        if (field.type === 'email' && field.value.trim()) {
          const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailPattern.test(field.value.trim())) {
            isValid = false;
            field.classList.add('error');
            
            const errorMsg = document.createElement('span');
            errorMsg.className = 'error-message';
            errorMsg.textContent = 'Please enter a valid email address';
            errorMsg.style.color = 'red';
            errorMsg.style.fontSize = '0.875rem';
            errorMsg.style.marginTop = '0.25rem';
            errorMsg.style.display = 'block';
            
            field.parentNode.insertBefore(errorMsg, field.nextSibling);
          }
        }
      }
      
      if (isValid) {
        contactForm.submit();
      }
    });
    
    // Remove error on input
    contactForm.addEventListener('input', function(e) {
      if (e.target.classList.contains('error')) {
        e.target.classList.remove('error');
        const errorMsg = e.target.parentNode.querySelector('.error-message');
        if (errorMsg) {
          errorMsg.remove();
        }
      }
    });
  }

  // Scroll animations (fade-in on scroll)
  const animatedElements = document.querySelectorAll('.fade-in, [data-animate="fade-in"]');
  
  function checkScroll() {
    const windowHeight = window.innerHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    animatedElements.forEach(function(element) {
      const elementTop = element.getBoundingClientRect().top + scrollTop;
      const elementVisible = elementTop - scrollTop < windowHeight - 100;
      
      if (elementVisible && !element.classList.contains('animated')) {
        element.classList.add('animated');
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }
    });
  }
  
  // Initialize animated elements
  animatedElements.forEach(function(element) {
    if (!element.classList.contains('animated')) {

      element.style.transform = 'translateY(20px)';
      element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    }
  });
  
  window.addEventListener('scroll', checkScroll, { passive: true });
  checkScroll();

});
;
/* ==ZAPPY E-COMMERCE JS START== */
// E-commerce functionality
(function() {
  // Mark this document as an e-commerce site for cross-cutting helpers (e.g. multiLanguageService CSS).
  // This lets them avoid injecting non-ecommerce UI like the phone header button.
  try {
    document.documentElement.setAttribute('data-zappy-site-type', 'ecommerce');
  } catch (e) {}
  try {
    document.body && document.body.setAttribute('data-zappy-site-type', 'ecommerce');
  } catch (e) {}

  const websiteId = window.ZAPPY_WEBSITE_ID;
  const isCatalogMode = true; // true = catalog only (no cart), false = full e-commerce
  
  // Set up fixed header heights - NO GAP between header and catalog menu
  function setupFixedHeaders() {
    const announcementBar = document.querySelector('.zappy-announcement-bar');
    const catalogMenu = document.querySelector('.zappy-catalog-menu');
    const announcementBarHeight = announcementBar ? Math.ceil(announcementBar.getBoundingClientRect().height) : 0;
    
    const findPrimaryHeader = function() {
      // Prioritize nav elements over generic header to avoid matching content headers
      // (e.g., .lookbook-gallery-header which is inside a section, not the navbar)
      const candidates = [
        'nav#navbar',
        'nav.navbar',
        '.navbar:not(.zappy-catalog-menu)',
        'nav[class*="nav"]',
        'header.navbar',
        'header:not([class*="gallery"]):not([class*="hero"]):not([class*="section"])'
      ];
      for (const selector of candidates) {
        const el = document.querySelector(selector);
        if (!el) continue;
        if (el.classList && el.classList.contains('zappy-catalog-menu')) continue;
        if (el.id === 'zappy-catalog-menu') continue;
        if (el.classList && el.classList.contains('mobile-search-panel')) continue;
        // Skip content headers that are inside sections (not navigation)
        if (el.tagName === 'HEADER' && el.closest('section')) continue;
        // Skip headers with content-related classes
        if (el.classList && (
          el.classList.contains('lookbook-gallery-header') ||
          el.classList.contains('hero-header') ||
          el.classList.contains('section-header') ||
          el.classList.contains('page-header')
        )) continue;
        return el;
      }
      return null;
    };
    
    const header = findPrimaryHeader();
    
    if (header) {
      // Preserve header padding so height is accurate
      header.style.marginBottom = '0';
      
      // Ensure header is fixed and sits below announcement bar
      header.style.setProperty('position', 'fixed', 'important');
      header.style.setProperty('top', announcementBarHeight + 'px', 'important');
      header.style.setProperty('left', '0', 'important');
      header.style.setProperty('right', '0', 'important');
      header.style.setProperty('z-index', '100000', 'important');
      
      const headerHeight = Math.ceil(header.getBoundingClientRect().height || header.offsetHeight || 0);
      let totalHeight = announcementBarHeight + headerHeight;
      
      if (catalogMenu) {
        // Remove extra spacing from catalog menu
        catalogMenu.style.marginTop = '0';
        // Position exactly at header bottom - no gap
        const catalogTop = announcementBarHeight + headerHeight;
        catalogMenu.style.setProperty('top', catalogTop + 'px', 'important');
        const catalogHeight = Math.ceil(catalogMenu.getBoundingClientRect().height || catalogMenu.offsetHeight || 0);
        totalHeight = catalogTop + catalogHeight;
      }
      
      document.documentElement.style.setProperty('--header-height', headerHeight + 'px');
      document.documentElement.style.setProperty('--total-header-height', totalHeight + 'px');
      document.body.style.setProperty('padding-top', totalHeight + 'px', 'important');
    } else if (announcementBarHeight > 0) {
      document.body.style.setProperty('padding-top', announcementBarHeight + 'px', 'important');
    }
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupFixedHeaders);
  } else {
    setupFixedHeaders();
  }
  window.addEventListener('resize', setupFixedHeaders);
  setTimeout(setupFixedHeaders, 50);
  setTimeout(setupFixedHeaders, 200);
  setTimeout(setupFixedHeaders, 500);
  const getApiBase = function() {
    const explicitBase = (window.ZAPPY_API_BASE || '').replace(/\/$/, '');
    const path = window.location ? window.location.pathname : '';
    if (path.indexOf('/preview') !== -1 || path.indexOf('/preview-fullscreen') !== -1) {
      return window.location.origin;
    }
    return explicitBase;
  };
  const buildApiUrl = function(path) {
    if (path.charAt(0) !== '/') {
      path = '/' + path;
    }
    const apiBase = getApiBase();
    return apiBase ? apiBase + path : path;
  };
  if (!websiteId) return;
  
  // Translations
  const t = {"products":"מוצרים","ourProducts":"המוצרים שלנו","featuredProducts":"מוצרים מומלצים","noFeaturedProducts":"עוד לא נבחרו מוצרים מומלצים. צפו בכל המוצרים שלנו!","featuredCategories":"קנו לפי קטגוריה","all":"הכל","featured":"מומלצים","new":"חדשים","sale":"מבצעים","loadingProducts":"טוען מוצרים...","cart":"עגלת קניות","yourCart":"עגלת הקניות שלך","emptyCart":"העגלה ריקה","total":"סה\"כ","proceedToCheckout":"המשך לתשלום","checkout":"תשלום","customerInfo":"פרטי לקוח","fullName":"שם מלא","email":"אימייל","phone":"טלפון","shippingAddress":"כתובת למשלוח","street":"רחוב ומספר","apartment":"דירה, קומה, כניסה","city":"עיר","zip":"מיקוד","saveAddressForNextTime":"שמור את הכתובת לפעם הבאה","shippingMethod":"שיטת משלוח","loadingShipping":"טוען שיטות משלוח...","payment":"תשלום","loadingPayment":"טוען אפשרויות תשלום...","orderSummary":"סיכום הזמנה","subtotal":"סכום ביניים","vat":"מע\"מ","vatIncluded":"כולל מע\"מ","shipping":"משלוח","discount":"הנחה","totalToPay":"סה\"כ לתשלום","placeOrder":"בצע הזמנה","login":"התחברות","customerLogin":"התחברות לקוחות","enterEmail":"הזן את כתובת האימייל שלך ונשלח לך קוד התחברות","emailAddress":"כתובת אימייל","sendCode":"שלח קוד","enterCode":"הזן את הקוד שנשלח לאימייל שלך","verificationCode":"קוד אימות","verify":"אמת","returnPolicy":"מדיניות החזרות","addToCart":"הוסף לעגלה","startingAt":"החל מ","addedToCart":"המוצר נוסף לעגלה!","remove":"הסר","noProducts":"אין מוצרים להצגה כרגע","errorLoading":"שגיאה בטעינה","days":"ימים","currency":"₪","free":"חינם","freeAbove":"משלוח חינם מעל","noShippingMethods":"אין אפשרויות משלוח זמינות","viewAllResults":"הצג את כל התוצאות","searchProducts":"חיפוש מוצרים","productDetails":"פרטי המוצר","viewDetails":"לפרטים נוספים","inStock":"במלאי","outOfStock":"אזל מהמלאי","sku":"מק\"ט","category":"קטגוריה","relatedProducts":"מוצרים דומים","productNotFound":"המוצר לא נמצא","backToProducts":"חזרה למוצרים","home":"בית","quantity":"כמות","unitLabels":{"piece":"יח'","kg":"ק\"ג","gram":"גרם","liter":"ליטר","ml":"מ\"ל"},"perUnit":"/","couponCode":"קוד קופון","enterCouponCode":"הזן קוד קופון","applyCoupon":"החל","removeCoupon":"הסר","couponApplied":"הקופון הוחל בהצלחה!","invalidCoupon":"קוד קופון לא תקין","couponExpired":"הקופון פג תוקף","couponMinOrder":"סכום הזמנה מינימלי","alreadyHaveAccount":"כבר יש לך חשבון?","loginHere":"התחבר כאן","loggedInAs":"מחובר כ:","logout":"התנתק","haveCouponCode":"יש לי קוד קופון","agreeToTerms":"אני מסכים/ה ל","termsAndConditions":"תנאי השימוש","pleaseAcceptTerms":"נא לאשר את תנאי השימוש","nameRequired":"נא להזין שם מלא","emailRequired":"נא להזין כתובת אימייל","emailInvalid":"כתובת אימייל לא תקינה","phoneRequired":"נא להזין מספר טלפון","shippingRequired":"נא לבחור שיטת משלוח","streetRequired":"נא להזין רחוב ומספר","cityRequired":"נא להזין עיר","cartEmpty":"העגלה ריקה","paymentNotConfigured":"תשלום מקוון לא מוגדר","orderSuccess":"ההזמנה התקבלה!","thankYouOrder":"תודה על ההזמנה","orderNumber":"מספר הזמנה","orderConfirmation":"אישור הזמנה נשלח לאימייל שלך","orderProcessing":"ההזמנה שלך בטיפול. נעדכן אותך כשהמשלוח יצא לדרך.","continueShopping":"להמשך קניות","orderDetails":"פרטי ההזמנה","loadingOrder":"טוען פרטי הזמנה...","orderNotFound":"לא נמצאה הזמנה","orderItems":"פריטים בהזמנה","paidAmount":"סכום ששולם","myAccount":"החשבון שלי","accountWelcome":"ברוך הבא","yourOrders":"ההזמנות שלך","noOrders":"אין עדיין הזמנות","orderDate":"תאריך","orderStatus":"סטטוס","orderTotal":"סה\"כ","viewOrder":"צפה בהזמנה","statusPending":"ממתין לתשלום","statusPaid":"שולם","statusProcessing":"בטיפול","statusShipped":"נשלח","statusDelivered":"נמסר","statusCancelled":"בוטל","notLoggedIn":"לא מחובר","pleaseLogin":"יש להתחבר כדי לצפות בחשבון","personalDetails":"פרטים אישיים","editProfile":"עריכת פרופיל","name":"שם","saveChanges":"שמור שינויים","cancel":"ביטול","addresses":"כתובות","addAddress":"הוסף כתובת","editAddress":"ערוך כתובת","deleteAddress":"מחק כתובת","setAsDefault":"הגדר כברירת מחדל","defaultAddress":"כתובת ברירת מחדל","addressLabel":"שם הכתובת","work":"עבודה","other":"אחר","noAddresses":"אין כתובות שמורות","confirmDelete":"האם אתה בטוח שברצונך למחוק?","profileUpdated":"הפרופיל עודכן בהצלחה","addressSaved":"הכתובת נשמרה בהצלחה","addressDeleted":"הכתובת נמחקה","saving":"שומר...","selectVariant":"בחר אפשרות","variantUnavailable":"לא זמין","color":"צבע","size":"מידה","material":"חומר","style":"סגנון","weight":"משקל","capacity":"קיבולת","length":"אורך","inquiryAbout":"פנייה בנושא","sendInquiry":"שלח פנייה","callNow":"התקשר עכשיו","specifications":"מפרט טכני","businessPhone":"[business_phone]","businessEmail":"[business_email]"};
  
  // Helper to get localized e-commerce UI text
  // Tries zappyI18n first for multilingual support, falls back to static t object
  function getEcomText(key, fallback) {
    if (typeof zappyI18n !== 'undefined' && typeof zappyI18n.t === 'function') {
      var translated = zappyI18n.t('ecom_' + key);
      if (translated && translated !== 'ecom_' + key) {
        return translated;
      }
    }
    return fallback;
  }
  
  
// Helper to strip HTML tags and convert rich text to plain text for card previews
function stripHtmlToText(html) {
  if (!html) return '';
  // Create a temporary element to parse HTML
  var temp = document.createElement('div');
  temp.innerHTML = html;
  // Replace block-level elements' closing tags with space to preserve word boundaries
  // This handles </p>, </div>, </li>, <br>, etc. from rich text editors
  temp.innerHTML = temp.innerHTML
    .replace(/<\/p>/gi, ' ')
    .replace(/<\/div>/gi, ' ')
    .replace(/<\/li>/gi, ' ')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/h[1-6]>/gi, ' ');
  // Get text content (strips remaining HTML tags)
  var text = temp.textContent || temp.innerText || '';
  // Normalize whitespace (replace multiple spaces/newlines with single space)
  text = text.replace(/\s+/g, ' ').trim();
  return text;
}

  
  // RTL detection (based on HTML lang attribute or document direction)
  const htmlLang = document.documentElement.lang || '';
  const isRTL = ['he', 'ar', 'iw'].includes(htmlLang.toLowerCase().substring(0, 2)) || document.documentElement.dir === 'rtl' || document.body.dir === 'rtl';
  
  // Cart state
  let cart = JSON.parse(localStorage.getItem('zappy_cart_' + websiteId) || '[]');
  
  // VAT rate - fetched from store settings, with fallback to default
  let vatRate = 0.18; // Default fallback (Israel VAT rate as of January 2025)
  let productLayout = 'standard'; // Default product card layout
  let storeSettingsFetched = false;
  
  // Fetch store settings (including tax rate and product layout) from API
  async function fetchStoreSettings() {
    if (storeSettingsFetched) return;
    try {
      const res = await fetch(buildApiUrl('/api/ecommerce/storefront/settings?websiteId=' + websiteId));
      const data = await res.json();
      if (data.success && data.data) {
        if (data.data.taxRate && data.data.taxRate > 0) {
          vatRate = data.data.taxRate;
        }
        if (data.data.productLayout) {
          productLayout = data.data.productLayout;
        }
        storeSettingsFetched = true;
      }
    } catch (e) {
      console.warn('Failed to fetch store settings, using defaults:', e);
    }
  }
  
  // Fetch settings on page load
  fetchStoreSettings();
  
  // Helper to strip RTL/LTR control characters that browsers may insert in RTL interfaces
  function sanitizeEmail(str) {
    return (str || '').replace(/[‎‏‪-‮⁦-⁩​-‍﻿]/g, '').trim();
  }
  
  
  function saveCart() {
    localStorage.setItem('zappy_cart_' + websiteId, JSON.stringify(cart));
    updateCartCount();
    renderCartDrawer(); // Keep drawer in sync
  }
  
  function updateCartCount() {
    // Count distinct cart entries (not sum of quantities) so unit-based items count as 1 each
    const count = cart.length;
    // Update all cart count badges (our injected one and any existing ones)
    const countElements = document.querySelectorAll('.cart-count');
    countElements.forEach(function(el) { el.textContent = count; });
  }
  
  // Get the display label for a quantity unit
  function getUnitLabel(item) {
    var unit = item.quantityUnit || item.quantity_unit || 'piece';
    if (unit === 'piece') return '';
    if (unit === 'custom') return item.customUnitLabel || item.custom_unit_label || '';
    var labels = t.unitLabels || {};
    return labels[unit] || unit;
  }
  
  // Format quantity with unit label for display
  function formatQtyDisplay(item) {
    var label = getUnitLabel(item);
    return label ? item.quantity + ' ' + label : item.quantity;
  }
  
  // Compute "price per reference unit" HTML for product cards/detail page
  // For gram → per 100g, for ml → per 100ml, for kg/liter → per kg/L
  // For piece-based products with piece_unit_type/value → compute from piece weight
  function getPricePerUnitHtml(p) {
    if (!p.show_price_per_unit) return '';
    var unit = p.quantity_unit || 'piece';
    
    // Check if product uses variant-driven pricing
    var vCount = parseInt(p.variant_count || 0, 10);
    var vPriceCount = parseInt(p.variant_price_count || 0, 10);
    var vMinPrice = parseFloat(p.variant_min_price);
    var vMaxPrice = parseFloat(p.variant_max_price);
    var hasVarRange = vCount > 1 && vPriceCount > 1 && Number.isFinite(vMinPrice) && Number.isFinite(vMaxPrice) && vMinPrice !== vMaxPrice;
    
    // Use variant min price when the card shows "Starting at" pricing, otherwise use sale/base price
    var price = hasVarRange
      ? vMinPrice
      : (parseFloat(p.sale_price) && parseFloat(p.sale_price) < parseFloat(p.price) ? parseFloat(p.sale_price) : parseFloat(p.price));
    if (!price) return '';
    
    var refAmount, refLabel, pricePerRef;
    
    if (unit === 'piece') {
      // Piece-based product: use piece_unit_type and piece_unit_value
      var pieceUnit = p.piece_unit_type;
      var pieceValue = parseFloat(p.piece_unit_value);
      if (!pieceUnit || !pieceValue) return '';
      // Normalize to a reference amount based on the piece unit type
      if (pieceUnit === 'gram') { refAmount = 100; refLabel = '100' + ((t.unitLabels && t.unitLabels.gram) || 'g'); }
      else if (pieceUnit === 'ml') { refAmount = 100; refLabel = '100' + ((t.unitLabels && t.unitLabels.ml) || 'ml'); }
      else if (pieceUnit === 'kg') { refAmount = 1; refLabel = (t.unitLabels && t.unitLabels.kg) || 'kg'; }
      else if (pieceUnit === 'liter') { refAmount = 1; refLabel = (t.unitLabels && t.unitLabels.liter) || 'L'; }
      else return '';
      // price is for 1 piece which contains pieceValue of pieceUnit
      pricePerRef = (price / pieceValue) * refAmount;
    } else {
      var step = parseFloat(p.quantity_step) || 1;
      if (!step) return '';
      if (unit === 'gram') { refAmount = 100; refLabel = '100' + ((t.unitLabels && t.unitLabels.gram) || 'g'); }
      else if (unit === 'ml') { refAmount = 100; refLabel = '100' + ((t.unitLabels && t.unitLabels.ml) || 'ml'); }
      else if (unit === 'kg') { refAmount = 1; refLabel = (t.unitLabels && t.unitLabels.kg) || 'kg'; }
      else if (unit === 'liter') { refAmount = 1; refLabel = (t.unitLabels && t.unitLabels.liter) || 'L'; }
      else if (unit === 'custom') { refAmount = 1; refLabel = p.custom_unit_label || ''; }
      else return '';
      // price is per step amount of unit
      pricePerRef = (price / step) * refAmount;
    }
    
    return '<div class="price-per-unit-info">' + t.currency + pricePerRef.toFixed(2) + ' / ' + refLabel + '</div>';
  }
  
  // Get effective price (sale_price if available and less than price, otherwise price)
  function getItemPrice(item) {
    if (item.sale_price && parseFloat(item.sale_price) < parseFloat(item.price)) {
      return parseFloat(item.sale_price);
    }
    return parseFloat(item.price);
  }
  
  // Get cart line total: price is per step, so total = price * (quantity / step)
  function getCartLineTotal(item) {
    var price = getItemPrice(item);
    var step = parseFloat(item.quantityStep) || 1;
    var unit = item.quantityUnit || item.quantity_unit || 'piece';
    if (unit === 'piece') return price * item.quantity;
    return price * (item.quantity / step);
  }
  
  function addToCart(product) {
    // Create a unique cart item ID that includes variant info
    const variantId = product.selectedVariant ? product.selectedVariant.id : null;
    const cartItemId = variantId ? product.id + '-' + variantId : product.id;
    
    // Find existing item with same product AND variant
    const existing = cart.find(item => {
      const existingVariantId = item.selectedVariant ? item.selectedVariant.id : null;
      const existingCartId = existingVariantId ? item.id + '-' + existingVariantId : item.id;
      return existingCartId === cartItemId;
    });
    
    const step = parseFloat(product.quantityStep || product.quantity_step) || 1;
    const qty = product.quantity || step;
    
    if (existing) {
      existing.quantity += qty;
      // Round to avoid floating point issues
      var decimals = (step.toString().split('.')[1] || '').length;
      existing.quantity = parseFloat(existing.quantity.toFixed(decimals));
    } else {
      cart.push({ ...product, quantity: qty, quantityUnit: product.quantityUnit || product.quantity_unit || 'piece', quantityStep: step, customUnitLabel: product.customUnitLabel || product.custom_unit_label || null });
    }
    saveCart();
    openCartDrawer(); // Open cart drawer instead of alert
  }
  
  // Store loaded products for filtering
  var productsCache = [];
  var currentFilter = 'all';
  
  // Load products on products page (uses public storefront API)
  // This is called on page load - delegates to loadProductsWithFilter
  async function loadProducts() {
    const grid = document.getElementById('zappy-product-grid');
    if (!grid) return;
    
    // Ensure store settings are loaded first (for productLayout)
    await fetchStoreSettings();
    
    // Update page title if viewing a specific category
    const urlParams = new URLSearchParams(window.location.search);
    const pageParam = urlParams.get('page');
    let categoryId = urlParams.get('category');
    if (pageParam) {
      const pageUrl = new URL(pageParam, window.location.origin);
      categoryId = pageUrl.searchParams.get('category') || categoryId;
    }
    
    if (categoryId) {
      try {
        const catRes = await fetch(buildApiUrlWithLang('/api/ecommerce/storefront/categories?websiteId=' + websiteId));
        const catData = await catRes.json();
        if (catData.success && catData.data) {
          const category = catData.data.find(function(c) { return c.id === categoryId; });
          if (category) {
            const productsSection = document.querySelector('.products-section');
            const titleEl = productsSection ? productsSection.querySelector('h1') : null;
            if (titleEl) {
              titleEl.textContent = category.name;
            }
            document.title = category.name + ' - ' + document.title.split(' - ').pop();
          }
        }
      } catch (catErr) {
        console.warn('Failed to fetch category name', catErr);
      }
    }
    
    // Load products with default filter
    loadProductsWithFilter('all');
  }
  
  // Load products with optional filter (all, featured, new, sale)
  async function loadProductsWithFilter(filter) {
    const grid = document.getElementById('zappy-product-grid');
    if (!grid) return;
    
    currentFilter = filter || 'all';
    
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(function(btn) {
      btn.classList.remove('active');
      if (btn.getAttribute('data-category') === currentFilter) {
        btn.classList.add('active');
      }
    });
    
    try {
      // Get category filter from URL if present
      const urlParams = new URLSearchParams(window.location.search);
      const pageParam = urlParams.get('page');
      // Search query can exist either on the real URL (?search=) or inside the preview page param (page=/products?search=)
      let searchQuery = (urlParams.get('search') || '').trim();
      let categoryId = urlParams.get('category');
      if (pageParam) {
        const pageUrl = new URL(pageParam, window.location.origin);
        categoryId = pageUrl.searchParams.get('category') || categoryId;
        if (!searchQuery) {
          searchQuery = (pageUrl.searchParams.get('search') || '').trim();
        }
      }
      
      // Build API URL with language support for translations
      let apiUrl = buildApiUrlWithLang('/api/ecommerce/storefront/products?websiteId=' + websiteId);
      if (categoryId) {
        apiUrl += '&categoryId=' + categoryId;
      }
      if (searchQuery && searchQuery.length >= 2) {
        apiUrl += '&search=' + encodeURIComponent(searchQuery);
      }
      
      const res = await fetch(apiUrl);
      const data = await res.json();
      
      if (!data.success || !data.data?.length) {
        grid.innerHTML = '<div class="empty-cart">' + t.noProducts + '</div>';
        productsCache = [];
        return;
      }
      
      // Store all products for client-side filtering
      productsCache = data.data;
      
      // Apply filter
      var productsToShow = productsCache;
      if (currentFilter === 'featured') {
        productsToShow = productsCache.filter(function(p) { return p.is_featured; });
      } else if (currentFilter === 'sale') {
        productsToShow = productsCache.filter(function(p) { 
          return p.sale_price && parseFloat(p.sale_price) < parseFloat(p.price); 
        });
      } else if (currentFilter === 'new') {
        // Show products with "new" tag (manual only)
        productsToShow = productsCache.filter(function(p) { 
          return p.tags && p.tags.some(function(tag) { 
            return tag.toLowerCase() === 'new' || tag.toLowerCase() === 'חדש'; 
          });
        });
      }
      
      if (productsToShow.length === 0) {
        grid.innerHTML = '<div class="empty-cart">' + t.noProducts + '</div>';
        return;
      }
      
      renderProductsToGrid(grid, productsToShow);
    } catch (e) {
      console.error('Failed to load products', e);
      grid.innerHTML = '<div class="empty-cart">' + t.errorLoading + '</div>';
    }
  }
  
  // Helper: resolve product image URL for preview + live
  function getPreviewAssetBase() {
    var websiteId = window.ZAPPY_WEBSITE_ID || (window.ZAPPY_CONFIG && window.ZAPPY_CONFIG.websiteId);
    var path = window.location && window.location.pathname ? window.location.pathname : '';
    if (!websiteId || !path) return '';
    if (path.indexOf('/api/website/preview-fullscreen/') !== -1) return '/api/website/preview-fullscreen/' + websiteId + '/assets/';
    if (path.indexOf('/api/website/preview/') !== -1) return '/api/website/preview/' + websiteId + '/assets/';
    if (path.indexOf('/preview-fullscreen/') !== -1) return '/api/website/preview-fullscreen/' + websiteId + '/assets/';
    if (path.indexOf('/preview/') !== -1) return '/api/website/preview/' + websiteId + '/assets/';
    return '';
  }

  function resolveProductImageUrl(url) {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    if (url.startsWith('/api/website/preview')) {
      return url;
    }
    if (url.startsWith('/preview-fullscreen/')) {
      return '/api/website' + url;
    }
    if (url.startsWith('/preview/')) {
      return '/api/website' + url;
    }
    var previewBase = getPreviewAssetBase();
    var normalized = url.replace(/^\/?assets\//, '');
    if (previewBase) {
      return previewBase + normalized;
    }
    if (url.startsWith('/')) {
      return url;
    }
    return '/' + url;
  }
  // Expose helper for functions outside this IIFE
  window.resolveProductImageUrl = resolveProductImageUrl;
  
  // Render products to grid
  function renderProductsToGrid(grid, products) {
    // Update grid class based on layout
    grid.className = 'product-grid layout-' + productLayout;
    
    grid.innerHTML = products.map(function(p) {
      // Check if price should be displayed (default to true if not set)
      var showPrice = p.custom_fields?.showPrice !== false;
      var hasSalePrice = p.sale_price && parseFloat(p.sale_price) < parseFloat(p.price);
      var variantCount = parseInt(p.variant_count || 0, 10);
      var variantPriceCount = parseInt(p.variant_price_count || 0, 10);
      var variantMinPrice = parseFloat(p.variant_min_price);
      var variantMaxPrice = parseFloat(p.variant_max_price);
      var hasVariantPriceRange = variantCount > 1 && variantPriceCount > 1 && Number.isFinite(variantMinPrice) && Number.isFinite(variantMaxPrice) && variantMinPrice !== variantMaxPrice;
      var startingAtLabel = getEcomText('startingAt', t.startingAt || 'Starting at');
      var displayPrice = showPrice 
        ? (hasVariantPriceRange
          ? startingAtLabel + ' ' + t.currency + variantMinPrice.toFixed(2)
          : (hasSalePrice 
            ? t.currency + parseFloat(p.sale_price).toFixed(2) + ' <span class="original-price">' + t.currency + parseFloat(p.price).toFixed(2) + '</span>'
            : t.currency + parseFloat(p.price).toFixed(2)))
        : '';
      
      // Get first image with correct URL in preview/live
      var imageUrl = p.images && p.images[0] ? resolveProductImageUrl(p.images[0]) : '';
      
      // Build tag badges (manual only - all tags come from product.tags array)
      var tagBadges = [];
      if (p.tags && p.tags.length) {
        p.tags.forEach(function(tag) {
          var tagLower = tag.toLowerCase();
          // Apply special styling for known tag types
          if (tagLower === 'sale' || tagLower === 'מבצע') {
            tagBadges.push('<span class="product-tag tag-sale">' + tag + '</span>');
          } else if (tagLower === 'new' || tagLower === 'חדש') {
            tagBadges.push('<span class="product-tag tag-new">' + tag + '</span>');
          } else if (tagLower === 'featured' || tagLower === 'מומלץ') {
            tagBadges.push('<span class="product-tag tag-featured">' + tag + '</span>');
          } else {
            tagBadges.push('<span class="product-tag">' + tag + '</span>');
          }
        });
      }
      var tagsHtml = tagBadges.length > 0 ? '<div class="product-tags">' + tagBadges.join('') + '</div>' : '';
      
      // Build card content based on layout
      var cardContent = '';
      var imageHtml = imageUrl ? '<img src="' + imageUrl + '" alt="' + p.name + '">' : '<div class="no-image-placeholder">📦</div>';
      
      // Get localized button text based on mode
      var localizedAddToCart = getEcomText('addToCart', t.addToCart);
      var localizedViewDetails = getEcomText('viewDetails', t.viewDetails);
      
      // Only include price div if showPrice is true
      var pricePerUnitHtml = getPricePerUnitHtml(p);
      var priceHtml = showPrice ? '<div class="price">' + displayPrice + '</div>' + pricePerUnitHtml : '';
      
      if (productLayout === 'compact') {
        // Compact: image, name, price only
        cardContent = tagsHtml +
          '<a href="/product/' + (p.slug || p.id) + '" class="product-card-link">' +
            imageHtml +
            '<h3>' + p.name + '</h3>' +
            priceHtml +
          '</a>';
      } else if (productLayout === 'detailed') {
        // Detailed: image, name, full description, price, action button
        // Strip HTML from rich text description and let CSS line-clamp handle truncation
        var detailedDesc = stripHtmlToText(p.description || '');
        // In catalog mode, show "View Details" link instead of "Add to Cart" button
        var actionButton = isCatalogMode
          ? '<a href="/product/' + (p.slug || p.id) + '" class="add-to-cart view-details-btn">' + localizedViewDetails + '</a>'
          : '<button class="add-to-cart" onclick="event.stopPropagation(); window.zappyHandleAddToCart(' + JSON.stringify(p).replace(/"/g, '&quot;') + ')">' + localizedAddToCart + '</button>';
        cardContent = tagsHtml +
          '<a href="/product/' + (p.slug || p.id) + '" class="product-card-link">' +
            imageHtml +
            '<h3>' + p.name + '</h3>' +
            '<p>' + detailedDesc + '</p>' +
            priceHtml +
          '</a>' +
          actionButton;
      } else {
        // Standard (default): image, name, short description, price
        // Strip HTML from rich text description and let CSS line-clamp handle truncation
        var standardDesc = stripHtmlToText(p.description || '');
        cardContent = tagsHtml +
          '<a href="/product/' + (p.slug || p.id) + '" class="product-card-link">' +
            imageHtml +
            '<h3>' + p.name + '</h3>' +
            '<p>' + standardDesc + '</p>' +
            priceHtml +
          '</a>';
      }
      
      return '<div class="product-card ' + productLayout + '" data-product-id="' + p.id + '">' + cardContent + '</div>';
    }).join('');
  }
  
  // Initialize filter buttons
  function initFilterButtons() {
    document.querySelectorAll('.filter-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var filter = btn.getAttribute('data-category');
        loadProductsWithFilter(filter);
      });
    });
  }
  
  // Render cart drawer (slide-out panel)
  function renderCartDrawer() {
    const drawerItems = document.getElementById('cart-drawer-items');
    const drawerTotal = document.getElementById('cart-drawer-total');
    if (!drawerItems) return;
    
    if (cart.length === 0) {
      drawerItems.innerHTML = '<div class="empty-cart"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg><p>' + t.emptyCart + '</p></div>';
      if (drawerTotal) drawerTotal.textContent = t.currency + '0';
      return;
    }
    
    let total = 0;
    drawerItems.innerHTML = cart.map(item => {
      const lineTotal = getCartLineTotal(item);
      total += lineTotal;
      const variantInfo = item.variantName ? '<div class="cart-item-variant">' + item.variantName + '</div>' : '';
      return '<div class="cart-item" data-item-id="' + item.id + (item.selectedVariant ? '-' + item.selectedVariant.id : '') + '">' +
        '<img src="' + (resolveProductImageUrl(item.images?.[0]) || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2270%22 height=%2270%22 viewBox=%220 0 70 70%22%3E%3Crect fill=%22%23f3f4f6%22 width=%2270%22 height=%2270%22/%3E%3Cpath fill=%22%239ca3af%22 d=%22M28 25h14v14H28z%22/%3E%3C/svg%3E') + '" alt="' + item.name + '">' +
        '<div class="cart-item-info">' +
          '<div class="cart-item-name">' + item.name + '</div>' +
          variantInfo +
          '<div class="cart-item-price">' + t.currency + lineTotal.toFixed(2) + '</div>' +
          '<div class="cart-item-qty">' +
            '<button onclick="window.zappyUpdateQty(\'' + item.id + (item.selectedVariant ? '-' + item.selectedVariant.id : '') + '\', -1)">−</button>' +
            '<span>' + formatQtyDisplay(item) + '</span>' +
            '<button onclick="window.zappyUpdateQty(\'' + item.id + (item.selectedVariant ? '-' + item.selectedVariant.id : '') + '\', 1)">+</button>' +
          '</div>' +
        '</div>' +
        '<button class="cart-item-remove" onclick="window.zappyRemoveFromCart(\'' + item.id + (item.selectedVariant ? '-' + item.selectedVariant.id : '') + '\')"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button>' +
      '</div>';
    }).join('');
    if (drawerTotal) drawerTotal.textContent = t.currency + total.toFixed(2);
  }
  
  // Open/close cart drawer
  function openCartDrawer() {
    var drawer = document.getElementById('cart-drawer');
    var overlay = document.getElementById('cart-drawer-overlay');
    
    // If drawer doesn't exist, create it dynamically
    if (!drawer) {
      var drawerHtml = '<div class="cart-drawer-overlay" id="cart-drawer-overlay"></div>' +
        '<aside class="cart-drawer" id="cart-drawer">' +
        '<div class="cart-drawer-header"><h2>' + t.yourCart + '</h2>' +
        '<button type="button" class="cart-drawer-close" id="cart-drawer-close">' +
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button></div>' +
        '<div class="cart-drawer-body" id="cart-drawer-items"><div class="empty-cart">' + t.emptyCart + '</div></div>' +
        '<div class="cart-drawer-footer"><div class="cart-drawer-total"><span>' + t.total + ':</span><span id="cart-drawer-total">' + t.currency + '0</span></div>' +
        '<a href="/checkout" class="cart-drawer-checkout">' + t.proceedToCheckout + '</a></div></aside>';
      document.body.insertAdjacentHTML('beforeend', drawerHtml);
      drawer = document.getElementById('cart-drawer');
      overlay = document.getElementById('cart-drawer-overlay');
      
      // Add close handlers for newly created elements
      var closeBtn = document.getElementById('cart-drawer-close');
      if (closeBtn) closeBtn.addEventListener('click', closeCartDrawer);
      if (overlay) overlay.addEventListener('click', closeCartDrawer);
    }
    
    if (drawer) { 
      drawer.classList.add('active'); 
      document.body.style.overflow = 'hidden';
    }
    if (overlay) {
      overlay.classList.add('active');
    }
    renderCartDrawer();
  }
  
  function closeCartDrawer() {
    var drawer = document.getElementById('cart-drawer');
    var overlay = document.getElementById('cart-drawer-overlay');
    if (drawer) drawer.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
  
  // Update quantity (handles variant IDs in format "productId-variantId")
  window.zappyUpdateQty = function(compositeId, delta) {
    // Find item by composite ID (product + variant)
    const item = cart.find(i => {
      const variantId = i.selectedVariant ? i.selectedVariant.id : null;
      const itemCompositeId = variantId ? i.id + '-' + variantId : i.id;
      return itemCompositeId === compositeId;
    });
    if (item) {
      const step = parseFloat(item.quantityStep) || 1;
      item.quantity += delta * step;
      // Round to avoid floating point issues
      var decimals = (step.toString().split('.')[1] || '').length;
      item.quantity = parseFloat(item.quantity.toFixed(decimals));
      if (item.quantity <= 0) {
        cart = cart.filter(i => {
          const variantId = i.selectedVariant ? i.selectedVariant.id : null;
          const itemCompositeId = variantId ? i.id + '-' + variantId : i.id;
          return itemCompositeId !== compositeId;
        });
      }
      saveCart();
      renderCartDrawer();
    }
  };
  
  // Render cart on cart page (legacy full page)
  function renderCart() {
    const itemsEl = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    if (!itemsEl) return;
    
    if (cart.length === 0) {
      itemsEl.innerHTML = '<div class="empty-cart">' + t.emptyCart + '</div>';
      if (totalEl) totalEl.textContent = t.currency + '0';
      return;
    }
    
    let total = 0;
    itemsEl.innerHTML = cart.map(item => {
      const lineTotal = getCartLineTotal(item);
      total += lineTotal;
      const itemPrice = getItemPrice(item);
      const variantInfo = item.variantName ? '<br><span style="font-size:12px;color:#6b7280;">' + item.variantName + '</span>' : '';
      const compositeId = item.selectedVariant ? item.id + '-' + item.selectedVariant.id : item.id;
      return '<div class="cart-item">' +
        '<img src="' + (resolveProductImageUrl(item.images?.[0]) || '') + '" alt="' + item.name + '">' +
        '<div><strong>' + item.name + '</strong>' + variantInfo + '<br>' + t.currency + itemPrice.toFixed(2) + ' x ' + formatQtyDisplay(item) + '</div>' +
        '<button onclick="window.zappyRemoveFromCart(\'' + compositeId + '\')">' + t.remove + '</button>' +
      '</div>';
    }).join('');
    if (totalEl) totalEl.textContent = t.currency + total.toFixed(2);
  }
  
  // Checkout state
  let selectedShipping = null;
  let shippingMethods = [];
  
  // Load shipping methods on checkout page
  async function loadShippingMethods() {
    const container = document.getElementById('shipping-methods');
    if (!container) return;
    
    try {
      const res = await fetch(buildApiUrl('/api/ecommerce/storefront/shipping?websiteId=' + websiteId));
      const data = await res.json();
      shippingMethods = data.data || [];
      
      if (!shippingMethods.length) {
        container.innerHTML = '<div class="no-shipping">' + (t.noShippingMethods || 'No shipping options available') + '</div>';
        return;
      }
      
      container.innerHTML = shippingMethods.map((method, idx) => {
        const isPickup = method.is_pickup;
        const isFree = parseFloat(method.price) === 0;
        const hasFreeAbove = method.conditions?.freeAbove && getCartSubtotal() >= method.conditions.freeAbove;
        const priceDisplay = isFree || hasFreeAbove ? (t.free || 'FREE') : t.currency + method.price;
        const daysText = method.estimated_days ? ' (' + method.estimated_days + ' ' + t.days + ')' : '';
        const pickupIcon = isPickup ? '📍 ' : '🚚 ';
        const pickupAddress = isPickup && method.pickup_address?.street ? '<div class="shipping-address">' + method.pickup_address.street + ', ' + (method.pickup_address.city || '') + '</div>' : '';
        const freeAboveNote = method.conditions?.freeAbove && !hasFreeAbove ? '<div class="shipping-free-note">' + (t.freeAbove || 'Free above') + ' ' + t.currency + method.conditions.freeAbove + '</div>' : '';
        
        return '<label class="shipping-option' + (idx === 0 ? ' selected' : '') + '" data-method-id="' + method.id + '">' +
          '<input type="radio" name="shipping" value="' + method.id + '"' + (idx === 0 ? ' checked' : '') + ' onchange="window.zappySelectShipping(this.value)">' +
          '<div class="shipping-info">' +
            '<div class="shipping-name">' + pickupIcon + method.name + daysText + '</div>' +
            (method.description ? '<div class="shipping-desc">' + method.description + '</div>' : '') +
            pickupAddress +
            freeAboveNote +
          '</div>' +
          '<div class="shipping-price' + (isFree || hasFreeAbove ? ' free' : '') + '">' + priceDisplay + '</div>' +
        '</label>';
      }).join('');
      
      // Auto-select first option
      if (shippingMethods.length > 0) {
        selectedShipping = shippingMethods[0];
        // Show/hide shipping address based on pickup status
        const addressSection = document.getElementById('shipping-address-section');
        if (addressSection) {
          addressSection.style.display = selectedShipping.is_pickup ? 'none' : 'block';
        }
        updateOrderTotals();
      }
    } catch (e) {
      console.error('Failed to load shipping methods', e);
      container.innerHTML = '<div class="error">' + (t.errorLoading || 'Error loading options') + '</div>';
    }
  }
  
  // Payment state
  let selectedPaymentMethod = null;
  let paymentMethods = [];
  let isPaymentConfigured = false;
  
  // Load payment methods on checkout page
  async function loadPaymentMethods() {
    const container = document.getElementById('payment-container');
    if (!container) return;
    
    try {
      const res = await fetch(buildApiUrl('/api/ecommerce/storefront/payment-status?websiteId=' + websiteId));
      const data = await res.json();
      
      isPaymentConfigured = data.data?.isConfigured || false;
      paymentMethods = data.data?.methods || [];
      
      if (!isPaymentConfigured || !paymentMethods.length) {
        container.innerHTML = '<div class="payment-not-configured">' + 
          '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>' +
          '<span>' + (isRTL ? 'תשלום מקוון לא מוגדר. צרו קשר עם בעל האתר.' : 'Online payment not configured. Please contact the store owner.') + '</span>' +
        '</div>';
        return;
      }
      
      container.innerHTML = paymentMethods.map((method, idx) => {
        const name = isRTL ? method.name : method.nameEn;
        const icon = method.icon === 'credit-card' ? 
          '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>' :
          '';
        
        return '<label class="payment-option' + (idx === 0 ? ' selected' : '') + '" data-method-id="' + method.id + '">' +
          '<input type="radio" name="payment" value="' + method.id + '"' + (idx === 0 ? ' checked' : '') + ' onchange="window.zappySelectPayment(this.value)">' +
          '<div class="payment-info">' +
            '<div class="payment-icon">' + icon + '</div>' +
            '<div class="payment-name">' + name + '</div>' +
          '</div>' +
        '</label>';
      }).join('');
      
      // Auto-select first option
      if (paymentMethods.length > 0) {
        selectedPaymentMethod = paymentMethods[0];
      }
    } catch (e) {
      console.error('Failed to load payment methods', e);
      container.innerHTML = '<div class="error">' + (t.errorLoading || 'Error loading options') + '</div>';
    }
  }
  
  // Select payment method
  window.zappySelectPayment = function(methodId) {
    selectedPaymentMethod = paymentMethods.find(m => m.id === methodId);
    document.querySelectorAll('.payment-option').forEach(el => {
      el.classList.toggle('selected', el.dataset.methodId === methodId);
    });
  };
  
  // Inline validation helper functions
  function showFieldError(inputId, errorId, message) {
    var input = document.getElementById(inputId);
    var errorEl = document.getElementById(errorId);
    if (input) {
      input.classList.add('input-error');
    }
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('visible');
    }
  }
  
  function clearFieldError(inputId, errorId) {
    var input = document.getElementById(inputId);
    var errorEl = document.getElementById(errorId);
    if (input) {
      input.classList.remove('input-error');
    }
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.remove('visible');
    }
  }
  
  function clearAllFieldErrors() {
    document.querySelectorAll('.field-error').forEach(function(el) {
      el.textContent = '';
      el.classList.remove('visible');
    });
    document.querySelectorAll('.input-error').forEach(function(el) {
      el.classList.remove('input-error');
    });
    document.querySelectorAll('.has-error').forEach(function(el) {
      el.classList.remove('has-error');
    });
  }
  
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  
  // Initialize checkout / place order button
  function initCheckout() {
    const placeOrderBtn = document.getElementById('place-order-btn');
    if (!placeOrderBtn) return;
    
    // Add real-time validation - clear errors when user types
    var fieldsToWatch = ['customer-name', 'customer-email', 'customer-phone', 'shipping-street', 'shipping-city'];
    fieldsToWatch.forEach(function(fieldId) {
      var field = document.getElementById(fieldId);
      if (field) {
        field.addEventListener('input', function() {
          clearFieldError(fieldId, fieldId + '-error');
        });
      }
    });
    
    // Clear terms error when checkbox changes
    var termsCheckbox = document.getElementById('terms-checkbox');
    if (termsCheckbox) {
      termsCheckbox.addEventListener('change', function() {
        var wrapper = document.querySelector('.terms-checkbox-wrapper');
        if (wrapper) wrapper.classList.remove('has-error');
        clearFieldError('', 'terms-checkbox-error');
      });
    }
    
    placeOrderBtn.addEventListener('click', async function(e) {
      e.preventDefault();
      
      // Clear all previous errors first
      clearAllFieldErrors();
      
      var hasErrors = false;
      var firstErrorField = null;
      
      // Validate cart
      if (!cart || cart.length === 0) {
        alert(t.cartEmpty || (isRTL ? 'העגלה ריקה' : 'Your cart is empty'));
        return;
      }
      
      // Get customer info
      const customerName = document.getElementById('customer-name')?.value?.trim() || '';
      const customerEmailRaw = document.getElementById('customer-email')?.value || '';
      const customerEmail = sanitizeEmail(customerEmailRaw);
      const customerPhone = document.getElementById('customer-phone')?.value?.trim() || '';
      
      // Validate customer name
      if (!customerName) {
        showFieldError('customer-name', 'customer-name-error', getEcomText('nameRequired', t.nameRequired || (isRTL ? 'נא להזין שם מלא' : 'Please enter your full name')));
        hasErrors = true;
        if (!firstErrorField) firstErrorField = 'customer-name';
      }
      
      // Validate customer email
      if (!customerEmailRaw.trim()) {
        showFieldError('customer-email', 'customer-email-error', getEcomText('emailRequired', t.emailRequired || (isRTL ? 'נא להזין כתובת אימייל' : 'Please enter your email address')));
        hasErrors = true;
        if (!firstErrorField) firstErrorField = 'customer-email';
      } else if (!isValidEmail(customerEmailRaw.trim())) {
        showFieldError('customer-email', 'customer-email-error', getEcomText('emailInvalid', t.emailInvalid || (isRTL ? 'כתובת אימייל לא תקינה' : 'Please enter a valid email address')));
        hasErrors = true;
        if (!firstErrorField) firstErrorField = 'customer-email';
      }
      
      // Validate customer phone
      if (!customerPhone) {
        showFieldError('customer-phone', 'customer-phone-error', getEcomText('phoneRequired', t.phoneRequired || (isRTL ? 'נא להזין מספר טלפון' : 'Please enter your phone number')));
        hasErrors = true;
        if (!firstErrorField) firstErrorField = 'customer-phone';
      }
      
      // Validate shipping method
      if (!selectedShipping) {
        var shippingError = document.getElementById('shipping-method-error');
        if (shippingError) {
          shippingError.textContent = getEcomText('shippingRequired', t.shippingRequired || (isRTL ? 'נא לבחור שיטת משלוח' : 'Please select a shipping method'));
          shippingError.classList.add('visible');
        }
        hasErrors = true;
        if (!firstErrorField) firstErrorField = 'shipping-methods';
      }
      
      // Get shipping address
      const shippingStreet = document.getElementById('shipping-street')?.value?.trim() || '';
      const shippingApartment = document.getElementById('shipping-apartment')?.value?.trim() || '';
      const shippingCity = document.getElementById('shipping-city')?.value?.trim() || '';
      const shippingZip = document.getElementById('shipping-zip')?.value?.trim() || '';
      
      // Validate shipping address (unless it's pickup)
      if (selectedShipping && !selectedShipping.is_pickup) {
        if (!shippingStreet) {
          showFieldError('shipping-street', 'shipping-street-error', getEcomText('streetRequired', t.streetRequired || (isRTL ? 'נא להזין רחוב ומספר' : 'Please enter your street address')));
          hasErrors = true;
          if (!firstErrorField) firstErrorField = 'shipping-street';
        }
        if (!shippingCity) {
          showFieldError('shipping-city', 'shipping-city-error', getEcomText('cityRequired', t.cityRequired || (isRTL ? 'נא להזין עיר' : 'Please enter your city')));
          hasErrors = true;
          if (!firstErrorField) firstErrorField = 'shipping-city';
        }
      }
      
      // Validate payment is configured
      if (!isPaymentConfigured || !selectedPaymentMethod) {
        alert(t.paymentNotConfigured || (isRTL ? 'תשלום מקוון לא מוגדר. צרו קשר עם בעל האתר.' : 'Online payment not configured. Please contact the store owner.'));
        return;
      }
      
      // Validate terms and conditions checkbox - MUST be checked to proceed
      var termsBox = document.getElementById('terms-checkbox');
      if (!termsBox || !termsBox.checked) {
        var termsWrapper = document.querySelector('.terms-checkbox-wrapper');
        if (termsWrapper) termsWrapper.classList.add('has-error');
        var termsErrorEl = document.getElementById('terms-checkbox-error');
        if (termsErrorEl) {
          termsErrorEl.textContent = getEcomText('pleaseAcceptTerms', t.pleaseAcceptTerms || (isRTL ? 'נא לאשר את תנאי השימוש' : 'Please accept the terms and conditions'));
          termsErrorEl.classList.add('visible');
        }
        hasErrors = true;
        if (!firstErrorField) firstErrorField = 'terms-checkbox';
      }
      
      // If there are errors, scroll to first error and stop
      if (hasErrors) {
        if (firstErrorField) {
          var errorElement = document.getElementById(firstErrorField);
          if (errorElement) {
            errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            if (errorElement.focus) errorElement.focus();
          }
        }
        console.log('[E-COMMERCE] Validation failed, stopping checkout');
        return;
      }
      
      // Disable button and show loading
      placeOrderBtn.disabled = true;
      placeOrderBtn.innerHTML = isRTL ? 'מעבד...' : 'Processing...';
      
      // Save address if checkbox is checked and user is logged in
      const saveAddressCheckbox = document.getElementById('save-address-checkbox');
      const tokenKey = 'zappy_customer_token_' + websiteId;
      const customerToken = localStorage.getItem(tokenKey);
      
      if (saveAddressCheckbox && saveAddressCheckbox.checked && customerToken && shippingStreet && shippingCity) {
        try {
          // First get the current customer data to preserve existing addresses
          const customerRes = await fetch(buildApiUrl('/api/ecommerce/customers/me?websiteId=' + encodeURIComponent(websiteId)), {
            headers: { 'Authorization': 'Bearer ' + customerToken }
          });
          
          if (customerRes.ok) {
            const customerData = await customerRes.json();
            if (customerData.success && customerData.data) {
              const existingAddresses = customerData.data.addresses || [];
              
              // Create new address object
              const newAddress = {
                id: 'addr_' + Date.now(),
                label: 'home',
                street: shippingStreet,
                apartment: shippingApartment || '',
                city: shippingCity,
                zip: shippingZip || '',
                isDefault: true
              };
              
              // Mark all existing addresses as not default
              const updatedAddresses = existingAddresses.map(function(addr) {
                return Object.assign({}, addr, { isDefault: false });
              });
              
              // Check if an address with the same street and city already exists
              const existingIndex = updatedAddresses.findIndex(function(addr) {
                return addr.street === newAddress.street && addr.city === newAddress.city;
              });
              
              if (existingIndex >= 0) {
                // Update existing address and set as default
                updatedAddresses[existingIndex] = Object.assign({}, updatedAddresses[existingIndex], {
                  apartment: newAddress.apartment,
                  zip: newAddress.zip,
                  isDefault: true
                });
              } else {
                // Add new address at the beginning
                updatedAddresses.unshift(newAddress);
              }
              
              // Save updated addresses
              await fetch(buildApiUrl('/api/ecommerce/customers/me'), {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer ' + customerToken
                },
                body: JSON.stringify({
                  websiteId: websiteId,
                  addresses: updatedAddresses
                })
              });
              console.log('[E-COMMERCE] Address saved for next time');
            }
          }
        } catch (saveErr) {
          // Don't block checkout if address save fails
          console.warn('[E-COMMERCE] Failed to save address:', saveErr);
        }
      }
      
      try {
        // Get or create session ID for cart
        let sessionId = localStorage.getItem('zappy_session_id');
        if (!sessionId) {
          sessionId = 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
          localStorage.setItem('zappy_session_id', sessionId);
        }
        
        // Initialize checkout
        const res = await fetch(buildApiUrl('/api/ecommerce/checkout/init'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            websiteId: websiteId,
            sessionId: sessionId,
            customerEmail: customerEmail,
            customerName: customerName,
            customerPhone: customerPhone,
            shippingAddress: {
              street: shippingStreet,
              apartment: shippingApartment,
              city: shippingCity,
              zip: shippingZip
            },
            shippingMethodId: selectedShipping.id,
            shippingCost: selectedShipping.price || 0,
            shippingMethodName: selectedShipping.name || 'משלוח',
            cart: cart,
            couponCode: appliedCoupon ? appliedCoupon.code : null,
            couponDiscount: couponDiscount
          })
        });
        
        const data = await res.json();
        
        if (!data.success || !data.data?.checkoutUrl) {
          throw new Error(data.error || 'Checkout initialization failed');
        }
        
        // Store pending order data in localStorage for order success page
        const reference = data.data.reference;
        if (reference) {
          // Ensure numeric values are properly parsed (shipping.price may be string from DB)
          const subtotalNum = getCartSubtotal();
          const shippingCostNum = parseFloat(selectedShipping.price) || 0;
          const discountNum = parseFloat(couponDiscount) || 0;
          const pendingOrderData = {
            cartItems: cart,
            subtotal: subtotalNum,
            shippingCost: shippingCostNum,
            discount: discountNum,
            total: subtotalNum + shippingCostNum - discountNum,
            shippingMethodName: selectedShipping.name || '',
            customerName: customerName,
            customerEmail: customerEmail
          };
          localStorage.setItem('zappy_pending_order_' + reference, JSON.stringify(pendingOrderData));
        }
        
        // Check if provider is Green Invoice - show iframe instead of redirect
        if (data.data.provider === 'greeninvoice') {
          // Animate out the payment section and button
          const paymentSection = document.getElementById('checkout-payment-section');
          const iframeContainer = document.getElementById('greeninvoice-iframe-container');
          const iframe = document.getElementById('greeninvoice-iframe');
          
          if (paymentSection && iframeContainer && iframe) {
            // Add fade-out animation to payment section
            paymentSection.classList.add('fade-out');
            
            // Show loading state in iframe container
            iframeContainer.style.display = 'block';
            iframeContainer.querySelector('.greeninvoice-iframe-wrapper').innerHTML = '<div class="greeninvoice-loading"><div class="greeninvoice-loading-spinner"></div><span>' + (isRTL ? 'טוען עמוד תשלום...' : 'Loading payment page...') + '</span></div>';
            
            // Listen for postMessage from iframe in case direct redirect fails
            window.addEventListener('message', function(event) {
              if (event.data && event.data.type === 'zappy_order_success' && event.data.url) {
                window.location.href = event.data.url;
              }
            });
            
            // After animation, hide payment section and show iframe
            setTimeout(function() {
              paymentSection.style.display = 'none';
              
              // Create and show the iframe
              iframeContainer.querySelector('.greeninvoice-iframe-wrapper').innerHTML = '<iframe id="greeninvoice-iframe" src="' + data.data.checkoutUrl + '" frameborder="0" allowpaymentrequest="true" style="width: 100%; height: 600px; border: none;"></iframe>';
            }, 300);
            
            return; // Don't redirect
          }
        }
        
        // Redirect to payment page (iCount or fallback)
        window.location.href = data.data.checkoutUrl;
        
      } catch (error) {
        console.error('Checkout failed:', error);
        alert(isRTL ? 'שגיאה בתהליך התשלום. נסו שוב.' : 'Checkout failed. Please try again.');
        placeOrderBtn.disabled = false;
        placeOrderBtn.innerHTML = t.placeOrder || (isRTL ? 'בצע הזמנה' : 'Place Order');
      }
    });
    
    initCheckoutCustomer();
  }

  function initCheckoutCustomer() {
    const nameInput = document.getElementById('customer-name');
    const emailInput = document.getElementById('customer-email');
    const phoneInput = document.getElementById('customer-phone');
    if (!nameInput || !emailInput) return;
    
    // Use site-specific localStorage keys for session isolation
    const tokenKey = 'zappy_customer_token_' + websiteId;
    const emailKey = 'zappy_customer_email_' + websiteId;
    const token = localStorage.getItem(tokenKey);
    const savedEmail = localStorage.getItem(emailKey);
    const loginPrompt = document.getElementById('checkout-login-prompt');
    const loginLink = document.getElementById('checkout-login-link');
    const loggedInEl = document.getElementById('checkout-logged-in');
    const loggedInNameEl = document.getElementById('checkout-logged-in-name');
    const loggedInEmailEl = document.getElementById('checkout-logged-in-email');
    const logoutBtn = document.getElementById('checkout-logout-btn');
    
    if (loginLink) {
      loginLink.addEventListener('click', function() {
        sessionStorage.setItem('zappy_login_return', '/checkout');
      });
    }
    
    const showLoggedIn = (name, email) => {
      if (loginPrompt) loginPrompt.style.display = 'none';
      if (loggedInEl) loggedInEl.style.display = 'flex';
      if (loggedInNameEl) loggedInNameEl.textContent = name || '';
      if (loggedInEmailEl) loggedInEmailEl.textContent = email ? '(' + email + ')' : '';
    };
    
    const showLoggedOut = () => {
      if (loggedInEl) loggedInEl.style.display = 'none';
      if (loginPrompt) loginPrompt.style.display = 'flex';
      if (loggedInNameEl) loggedInNameEl.textContent = '';
      if (loggedInEmailEl) loggedInEmailEl.textContent = '';
    };
    
    if (savedEmail && !emailInput.value) {
      emailInput.value = savedEmail;
    }
    
    if (!token) {
      showLoggedOut();
      return;
    }
    
    // Include websiteId for session isolation validation
    fetch(buildApiUrl('/api/ecommerce/customers/me?websiteId=' + encodeURIComponent(websiteId)), {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(function(res) {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then(function(data) {
        if (!data.success || !data.data) throw new Error('Invalid response');
        const customer = data.data;
        const displayName = customer.name || customer.email || savedEmail || '';
        showLoggedIn(displayName, customer.email || savedEmail || '');
        
        if (customer.name && !nameInput.value) nameInput.value = customer.name;
        if (customer.email && !emailInput.value) emailInput.value = customer.email;
        if (customer.phone && phoneInput && !phoneInput.value) phoneInput.value = customer.phone;
        
        // Auto-fill shipping address from customer's default address
        if (customer.addresses && customer.addresses.length > 0) {
          // Find default address, or use the first one
          const defaultAddress = customer.addresses.find(function(addr) { return addr.isDefault; }) || customer.addresses[0];
          
          const streetInput = document.getElementById('shipping-street');
          const apartmentInput = document.getElementById('shipping-apartment');
          const cityInput = document.getElementById('shipping-city');
          const zipInput = document.getElementById('shipping-zip');
          
          if (defaultAddress.street && streetInput && !streetInput.value) {
            streetInput.value = defaultAddress.street;
          }
          if (defaultAddress.apartment && apartmentInput && !apartmentInput.value) {
            apartmentInput.value = defaultAddress.apartment;
          }
          if (defaultAddress.city && cityInput && !cityInput.value) {
            cityInput.value = defaultAddress.city;
          }
          if (defaultAddress.zip && zipInput && !zipInput.value) {
            zipInput.value = defaultAddress.zip;
          }
        }
      })
      .catch(function() {
        localStorage.removeItem(tokenKey);
        localStorage.removeItem(emailKey);
        showLoggedOut();
      });
    
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function() {
        localStorage.removeItem(tokenKey);
        localStorage.removeItem(emailKey);
        showLoggedOut();
      });
    }
  }
  
  // Coupon state
  let appliedCoupon = null;
  let couponDiscount = 0;
  
  // Initialize coupon functionality
  function initCoupon() {
    const toggleBtn = document.getElementById('coupon-toggle-btn');
    const inputWrapper = document.getElementById('coupon-input-wrapper');
    const closeBtn = document.getElementById('coupon-close-btn');
    const applyBtn = document.getElementById('apply-coupon-btn');
    const removeBtn = document.getElementById('remove-coupon-btn');
    const couponInput = document.getElementById('coupon-code-input');
    const appliedRow = document.getElementById('coupon-applied-row');
    
    if (!toggleBtn || !inputWrapper) return;
    
    // Toggle coupon input visibility
    toggleBtn.addEventListener('click', function() {
      if (inputWrapper.style.display === 'none') {
        inputWrapper.style.display = 'block';
        toggleBtn.style.display = 'none';
        if (couponInput) couponInput.focus();
      }
    });
    
    // Close coupon input
    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        inputWrapper.style.display = 'none';
        toggleBtn.style.display = 'flex';
        if (couponInput) couponInput.value = '';
        const errorEl = document.getElementById('coupon-error');
        if (errorEl) errorEl.style.display = 'none';
      });
    }
    
    if (!applyBtn || !couponInput) return;
    
    // Apply coupon on button click
    applyBtn.addEventListener('click', async function() {
      const code = couponInput.value.trim();
      if (!code) return;
      
      applyBtn.disabled = true;
      applyBtn.textContent = isRTL ? '...' : '...';
      
      try {
        const subtotal = getCartSubtotal();
        const res = await fetch(buildApiUrl('/api/ecommerce/storefront/validate-coupon'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            websiteId: websiteId,
            code: code,
            subtotal: subtotal
          })
        });
        
        const data = await res.json();
        
        if (!data.success || !data.data?.valid) {
          // Show error
          const errorEl = document.getElementById('coupon-error');
          let errorMsg = t.invalidCoupon || 'Invalid coupon code';
          
          if (data.data?.error === 'expired') {
            errorMsg = t.couponExpired || 'Coupon has expired';
          } else if (data.data?.error === 'min_order') {
            errorMsg = (t.couponMinOrder || 'Minimum order amount') + ': ' + t.currency + data.data.minOrderAmount;
          }
          
          if (errorEl) {
            errorEl.textContent = errorMsg;
            errorEl.style.display = 'block';
            setTimeout(function() { errorEl.style.display = 'none'; }, 5000);
          }
          return;
        }
        
        // Apply coupon
        appliedCoupon = data.data.coupon;
        couponDiscount = appliedCoupon.discountAmount || 0;
        
        // Update UI - hide input, show applied badge
        inputWrapper.style.display = 'none';
        toggleBtn.style.display = 'none';
        appliedRow.style.display = 'flex';
        document.getElementById('applied-coupon-code').textContent = appliedCoupon.code;
        document.getElementById('coupon-error').style.display = 'none';
        
        updateOrderTotals();
        
      } catch (e) {
        console.error('Failed to validate coupon', e);
        const errorEl = document.getElementById('coupon-error');
        if (errorEl) {
          errorEl.textContent = t.errorLoading || 'Error';
          errorEl.style.display = 'block';
        }
      } finally {
        applyBtn.disabled = false;
        applyBtn.textContent = t.applyCoupon || 'Apply';
      }
    });
    
    // Apply coupon on Enter key
    couponInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        applyBtn.click();
      }
    });
    
    // Remove coupon
    if (removeBtn) {
      removeBtn.addEventListener('click', function() {
        appliedCoupon = null;
        couponDiscount = 0;
        
        // Update UI - show toggle button again
        appliedRow.style.display = 'none';
        toggleBtn.style.display = 'flex';
        if (couponInput) couponInput.value = '';
        
        updateOrderTotals();
      });
    }
  }
  
  // Get cart subtotal
  function getCartSubtotal() {
    return cart.reduce((sum, item) => sum + getCartLineTotal(item), 0);
  }
  
  // Calculate shipping cost
  function getShippingCost() {
    if (!selectedShipping) return 0;
    const subtotal = getCartSubtotal();
    // Check free shipping condition
    if (selectedShipping.conditions?.freeAbove && subtotal >= selectedShipping.conditions.freeAbove) {
      return 0;
    }
    return parseFloat(selectedShipping.price) || 0;
  }
  
  // Update order totals on checkout page
  function updateOrderTotals() {
    const subtotalEl = document.getElementById('subtotal');
    const vatAmountEl = document.getElementById('vat-amount');
    const shippingCostEl = document.getElementById('shipping-cost');
    const discountEl = document.getElementById('discount');
    const discountRow = document.getElementById('discount-row');
    const orderTotalEl = document.getElementById('order-total');
    const orderItemsEl = document.getElementById('order-items');
    
    const subtotal = getCartSubtotal();
    let shippingCost = getShippingCost();
    
    // Recalculate coupon discount based on current subtotal
    if (appliedCoupon) {
      if (appliedCoupon.type === 'percentage') {
        couponDiscount = (subtotal * appliedCoupon.value) / 100;
      } else if (appliedCoupon.type === 'fixed') {
        couponDiscount = appliedCoupon.value;
      } else if (appliedCoupon.type === 'free_shipping') {
        couponDiscount = 0;
        shippingCost = 0; // Free shipping coupon
      }
      // Cap discount at subtotal
      if (couponDiscount > subtotal) {
        couponDiscount = subtotal;
      }
    }
    
    const total = subtotal + shippingCost - couponDiscount;
    
    // Calculate VAT - prices include VAT
    // VAT rate is fetched from store settings (defaults to 18% for Israel)
    // VAT = total * rate / (1 + rate) (extracting VAT from VAT-inclusive price)
    const vatAmount = total * vatRate / (1 + vatRate);
    
    if (subtotalEl) subtotalEl.textContent = t.currency + subtotal.toFixed(2);
    if (vatAmountEl) vatAmountEl.textContent = t.currency + vatAmount.toFixed(2);
    if (shippingCostEl) shippingCostEl.textContent = shippingCost === 0 ? (t.free || 'FREE') : t.currency + shippingCost.toFixed(2);
    
    // Show/hide discount row
    if (discountRow && discountEl) {
      if (couponDiscount > 0) {
        discountRow.style.display = 'block';
        discountEl.textContent = '-' + t.currency + couponDiscount.toFixed(2);
      } else {
        discountRow.style.display = 'none';
      }
    }
    
    if (orderTotalEl) orderTotalEl.textContent = t.currency + total.toFixed(2);
    
    // Render order items
    if (orderItemsEl) {
      orderItemsEl.innerHTML = cart.map(item => {
        const lineTotal = getCartLineTotal(item);
        const variantLabel = item.variantName ? ' (' + item.variantName + ')' : '';
        return '<div class="order-item">' +
          '<span>' + item.name + variantLabel + ' x ' + formatQtyDisplay(item) + '</span>' +
          '<span>' + t.currency + lineTotal.toFixed(2) + '</span>' +
        '</div>';
      }).join('');
    }
  }
  
  // Select shipping method
  window.zappySelectShipping = function(methodId) {
    selectedShipping = shippingMethods.find(m => m.id === methodId);
    // Update UI
    document.querySelectorAll('.shipping-option').forEach(el => {
      el.classList.toggle('selected', el.dataset.methodId === methodId);
    });
    // Clear shipping method error when selected
    var shippingError = document.getElementById('shipping-method-error');
    if (shippingError) {
      shippingError.textContent = '';
      shippingError.classList.remove('visible');
    }
    // Show/hide shipping address based on pickup status
    const addressSection = document.getElementById('shipping-address-section');
    if (addressSection) {
      if (selectedShipping && selectedShipping.is_pickup) {
        addressSection.style.display = 'none';
      } else {
        addressSection.style.display = 'block';
      }
    }
    updateOrderTotals();
  };
  
  window.zappyAddToCart = addToCart;
  
  // Handle add to cart from product cards - redirect to product page if has variants
  window.zappyHandleAddToCart = function(product) {
    // Check if product has variants that need to be selected
    const variantCount = parseInt(product.variant_count || 0);
    if (variantCount > 0) {
      // Redirect to product detail page to select variant
      const productPath = '/product/' + (product.slug || product.id);
      
      // Check if we're in preview mode
      const currentUrl = window.location.href;
      if (currentUrl.includes('/api/website/preview')) {
        // In preview mode, reconstruct URL with page parameter
        const isFullscreen = currentUrl.includes('preview-fullscreen');
        const previewType = isFullscreen ? 'preview-fullscreen' : 'preview';
        window.location.href = '/api/website/' + previewType + '/' + websiteId + '?page=' + encodeURIComponent(productPath);
      } else {
        // In published site, use direct path
        window.location.href = productPath;
      }
    } else {
      // No variants, add directly to cart
      addToCart(product);
    }
  };
  
  window.zappyRemoveFromCart = function(compositeId) {
    // Remove by composite ID (product + variant)
    cart = cart.filter(item => {
      const variantId = item.selectedVariant ? item.selectedVariant.id : null;
      const itemCompositeId = variantId ? item.id + '-' + variantId : item.id;
      return itemCompositeId !== compositeId;
    });
    saveCart();
    renderCart();
    renderCartDrawer();
  };
  
  // ══════════════════════════════════════════════════════════════════════
  // SEARCH FUNCTIONALITY
  // ══════════════════════════════════════════════════════════════════════
  let allProducts = [];
  let searchTimeout = null;
  
  async function loadAllProductsForSearch() {
    try {
      const res = await fetch(buildApiUrlWithLang('/api/ecommerce/storefront/products?websiteId=' + websiteId));
      const data = await res.json();
      if (data.success && data.data) {
        allProducts = data.data;
      }
    } catch (e) {
      console.error('Failed to load products for search', e);
    }
  }
  
  function searchProducts(query) {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    return allProducts.filter(p => 
      p.name?.toLowerCase().includes(q) || 
      p.description?.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q) ||
      p.tags?.some(tag => tag.toLowerCase().includes(q))
    ).slice(0, 6); // Limit to 6 results
  }
  
  function renderSearchResults(results, query) {
    const container = document.getElementById('nav-search-results');
    if (!container) return;
    
    if (results.length === 0) {
      container.innerHTML = '<div class="search-no-results">' + (t.noProducts || 'No products found') + '</div>';
      container.classList.add('active');
      return;
    }
    
    // Check if we're in preview mode for generating product URLs
    var isPreviewMode = window.location.pathname.includes('preview-fullscreen');
    
    let html = results.map(function(p) {
      var productUrl;
      if (isPreviewMode) {
        var urlObj = new URL(window.location.href);
        urlObj.searchParams.set('page', '/product/' + (p.slug || p.id));
        urlObj.searchParams.delete('search');
        productUrl = urlObj.toString();
      } else {
        productUrl = '/product/' + (p.slug || p.id);
      }
      return '<a href="' + productUrl + '" class="search-result-item">' +
        (p.images?.[0] ? '<img src="' + resolveProductImageUrl(p.images[0]) + '" alt="' + p.name + '" class="search-result-img">' : '<div class="search-result-img"></div>') +
        '<div class="search-result-info">' +
          '<div class="search-result-name">' + p.name + '</div>' +
          '<div class="search-result-price">' + t.currency + p.price + '</div>' +
        '</div>' +
      '</a>';
    }).join('');
    
    // Add "View all results" link
    if (allProducts.filter(p => p.name?.toLowerCase().includes(query.toLowerCase())).length > 6) {
      // Check if we're in preview mode
      var isPreview = window.location.pathname.includes('preview-fullscreen');
      var viewAllUrl;
      if (isPreview) {
        var urlObj = new URL(window.location.href);
        urlObj.searchParams.set('page', '/products');
        urlObj.searchParams.set('search', query);
        viewAllUrl = urlObj.toString();
      } else {
        viewAllUrl = '/products?search=' + encodeURIComponent(query);
      }
      html += '<a href="' + viewAllUrl + '" class="search-view-all">' + 
        (t.viewAllResults || 'View all results') + ' →</a>';
    }
    
    container.innerHTML = html;
    container.classList.add('active');
  }
  
  function initSearch() {
    const input = document.getElementById('nav-search-input');
    const btn = document.getElementById('nav-search-btn');
    const results = document.getElementById('nav-search-results');
    
    if (!input) return;
    
    // Load products for search
    loadAllProductsForSearch();
    
    // Handle input
    input.addEventListener('input', function() {
      const query = this.value.trim();
      
      // Debounce search
      clearTimeout(searchTimeout);
      
      if (query.length < 2) {
        if (results) results.classList.remove('active');
        return;
      }
      
      searchTimeout = setTimeout(function() {
        const matches = searchProducts(query);
        renderSearchResults(matches, query);
      }, 200);
    });
    
    // Handle search button click
    if (btn) {
      btn.addEventListener('click', function() {
        const query = input.value.trim();
        if (query.length >= 2) {
          // Check if we're in preview mode
          const isPreview = window.location.pathname.includes('preview-fullscreen');
          if (isPreview) {
            const url = new URL(window.location.href);
            url.searchParams.set('page', '/products');
            url.searchParams.set('search', query);
            window.location.href = url.toString();
          } else {
            window.location.href = '/products?search=' + encodeURIComponent(query);
          }
        }
      });
    }
    
    // Handle Enter key
    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        const query = this.value.trim();
        if (query.length >= 2) {
          // Check if we're in preview mode
          const isPreview = window.location.pathname.includes('preview-fullscreen');
          if (isPreview) {
            const url = new URL(window.location.href);
            url.searchParams.set('page', '/products');
            url.searchParams.set('search', query);
            window.location.href = url.toString();
          } else {
            window.location.href = '/products?search=' + encodeURIComponent(query);
          }
        }
      }
    });
    
    // Close results when clicking outside
    document.addEventListener('click', function(e) {
      if (results && !e.target.closest('.nav-search-box')) {
        results.classList.remove('active');
      }
    });
    
    // Handle search query from URL on products page
    if (window.location.pathname === '/products') {
      const urlParams = new URLSearchParams(window.location.search);
      const searchQuery = urlParams.get('search');
      if (searchQuery) {
        input.value = searchQuery;
        // Filter products grid based on search
        filterProductsGrid(searchQuery);
      }
    }
  }
  
  function filterProductsGrid(query) {
    const grid = document.getElementById('zappy-product-grid');
    if (!grid) return;
    
    // Wait for products to load, then filter
    setTimeout(function() {
      const cards = grid.querySelectorAll('.product-card');
      const q = query.toLowerCase();
      let visibleCount = 0;
      
      cards.forEach(function(card) {
        const name = card.querySelector('h3')?.textContent?.toLowerCase() || '';
        const desc = card.querySelector('p')?.textContent?.toLowerCase() || '';
        const matches = name.includes(q) || desc.includes(q);
        card.style.display = matches ? '' : 'none';
        if (matches) visibleCount++;
      });
      
      // Show message if no results
      if (visibleCount === 0) {
        const noResults = document.createElement('div');
        noResults.className = 'empty-cart';
        noResults.textContent = t.noProducts || 'No products found';
        noResults.id = 'search-no-results';
        grid.appendChild(noResults);
      }
    }, 500);
  }
  
  // Mobile menu handling - close menu when clicking items
  function initMobileMenuHandling() {
    // Common selectors for mobile menu elements
    const menuSelectors = [
      '.nav-menu', '.mobile-menu', '.mobile-nav', '[class*="mobile-menu"]',
      '[class*="nav-menu"]', '.menu-items', '.nav-links', 'nav ul'
    ];
    const toggleSelectors = [
      '.hamburger', '.menu-toggle', '.nav-toggle', '.mobile-toggle',
      '[class*="hamburger"]', '[class*="menu-toggle"]', '.menu-btn',
      'button[aria-label*="menu"]', '.mobile-menu-btn'
    ];
    
    // Find menu and toggle elements
    let menuEl = null;
    let toggleEl = null;
    
    for (const sel of menuSelectors) {
      menuEl = document.querySelector(sel);
      if (menuEl) break;
    }
    for (const sel of toggleSelectors) {
      toggleEl = document.querySelector(sel);
      if (toggleEl) break;
    }
    
    
    // Check if menu is currently open
    function isMenuOpen() {
      if (!menuEl) return false;
      return menuEl.classList.contains('active') || 
             menuEl.classList.contains('open') || 
             menuEl.classList.contains('show') ||
             menuEl.classList.contains('visible') ||
             menuEl.classList.contains('is-open');
    }
    
    
    // Function to close mobile menu
    function closeMobileMenu() {
      if (!menuEl) return;
      
      // Remove common "open" classes
      menuEl.classList.remove('active', 'open', 'show', 'visible', 'is-open', 'menu-open');
      document.body.classList.remove('menu-open', 'nav-open', 'mobile-menu-open');
      
      // Also check parent nav
      const nav = menuEl.closest('nav') || menuEl.closest('header');
      if (nav) {
        nav.classList.remove('active', 'open', 'show', 'menu-open', 'is-open');
      }
      
      // Update toggle button state
      if (toggleEl) {
        toggleEl.classList.remove('active', 'open', 'is-active');
        toggleEl.setAttribute('aria-expanded', 'false');
      }
      
      // Remove overlay if it exists
      const overlay = document.querySelector('.mobile-menu-overlay');
      if (overlay) overlay.remove();
    }
    
    // Function to open mobile menu
    function openMobileMenu() {
      if (!menuEl) return;
      
      // Add open class
      menuEl.classList.add('active', 'open');
      document.body.classList.add('menu-open');
      
      // Update toggle button state
      if (toggleEl) {
        toggleEl.classList.add('active', 'open');
        toggleEl.setAttribute('aria-expanded', 'true');
      }
      
      // Add overlay for closing
      if (!document.querySelector('.mobile-menu-overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'mobile-menu-overlay';
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.3);z-index:998;';
        overlay.addEventListener('click', closeMobileMenu);
        document.body.appendChild(overlay);
      }
    }
    
    // Toggle menu
    function toggleMobileMenu(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (isMenuOpen()) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    }
    
    // DON'T replace the toggle - site's own handler works
    // Instead, just ensure we can close via overlay and other methods
    
    // Monitor menu state changes and add overlay when open
    let lastMenuState = isMenuOpen();
    setInterval(function() {
      const currentState = isMenuOpen();
      if (currentState !== lastMenuState) {
        lastMenuState = currentState;
        if (currentState) {
          // Menu just opened - add overlay
          if (!document.querySelector('.mobile-menu-overlay')) {
            const overlay = document.createElement('div');
            overlay.className = 'mobile-menu-overlay';
            overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.3);z-index:998;';
            overlay.addEventListener('click', function() {
              // Simulate click on toggle to close via site's own handler
              if (toggleEl) toggleEl.click();
              else closeMobileMenu();
            });
            document.body.appendChild(overlay);
          }
        } else {
          // Menu just closed - remove overlay
          const overlay = document.querySelector('.mobile-menu-overlay');
          if (overlay) overlay.remove();
        }
      }
    }, 100);
    
    // Close menu when clicking on nav items
    document.querySelectorAll('nav a, .nav-menu a, .mobile-menu a').forEach(function(link) {
      link.addEventListener('click', function() {
        setTimeout(closeMobileMenu, 100);
      });
    });
    
    // Close menu when clicking on e-commerce icons
    document.querySelectorAll('.nav-ecommerce-icons a, .cart-link, .login-link').forEach(function(el) {
      el.addEventListener('click', function() {
        closeMobileMenu();
      });
    });
    
    // Close menu when clicking outside (backup)
    document.addEventListener('click', function(e) {
      if (!menuEl || !toggleEl) return;
      
      if (isMenuOpen()) {
        const clickedInMenu = menuEl.contains(e.target);
        const clickedOnToggle = toggleEl.contains(e.target);
        
        if (!clickedInMenu && !clickedOnToggle) {
          closeMobileMenu();
        }
      }
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeMobileMenu();
      }
    });
    
    // Make close function globally available
    window.zappyCloseMobileMenu = closeMobileMenu;
  }

  // Some templates toggle the menu but don't toggle the button icon state.
  // Keep #mobileToggle in sync with #navMenu so hamburger ↔ X works.
  function syncMobileToggleWithMenu() {
    try {
      const toggle = document.getElementById('mobileToggle') || document.querySelector('.mobile-toggle');
      const menu = document.getElementById('navMenu') || document.querySelector('.nav-menu');
      if (!toggle || !menu) return;

      const apply = function() {
        const menuOpen = menu.classList.contains('active') || menu.classList.contains('open') || menu.classList.contains('show');
        if (menuOpen) toggle.classList.add('active');
        else toggle.classList.remove('active');
      };

      apply();

      const obs = new MutationObserver(function(mutations) {
        for (var i = 0; i < mutations.length; i++) {
          if (mutations[i].attributeName === 'class') {
            apply();
            break;
          }
        }
      });
      obs.observe(menu, { attributes: true });
    } catch (e) {
      // no-op
    }
  }
  
  // Initialize cart drawer events
  function initCartDrawer() {
    // Handle all cart links/buttons that should open the drawer
    var cartElements = document.querySelectorAll('#cart-drawer-toggle, [data-cart-toggle], .cart-link.nav-cart, a.nav-cart');
    
    cartElements.forEach(function(el) {
      // Skip if already initialized
      if (el.hasAttribute('data-cart-init')) return;
      el.setAttribute('data-cart-init', 'true');
      el.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        openCartDrawer();
      });
    });
    
    // Close button
    var closeBtn = document.getElementById('cart-drawer-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeCartDrawer);
    }
    
    // Overlay click
    var overlay = document.getElementById('cart-drawer-overlay');
    if (overlay) {
      overlay.addEventListener('click', closeCartDrawer);
    }
    
    // Close on Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeCartDrawer();
      }
    });
    
    // Initial render
    renderCartDrawer();
  }
  
  // Initialize everything
  // Mobile search panel handling
  function initMobileSearch() {
    const toggleBtn = document.getElementById('mobile-search-toggle') || document.querySelector('.nav-search-toggle');
    const panel = document.getElementById('mobile-search-panel');
    const closeBtn = document.getElementById('close-mobile-search');
    const input = document.getElementById('mobile-search-input');
    const results = document.getElementById('mobile-search-results');
    
    if (!toggleBtn || !panel) return;

    function computeTotalHeaderHeightPx() {
      try {
        // Prefer CSS var set by setupFixedHeaders()
        const totalVar = getComputedStyle(document.documentElement).getPropertyValue('--total-header-height').trim();
        if (totalVar) {
          const n = parseFloat(totalVar);
          if (Number.isFinite(n) && n > 0) return Math.ceil(n);
        }
      } catch (e) {}

      // Fallback: compute from DOM
      const announcementBar = document.querySelector('.zappy-announcement-bar');
      const navbar = document.querySelector('nav.navbar, .navbar');
      const barH = announcementBar ? Math.ceil(announcementBar.getBoundingClientRect().height) : 0;
      const navH = navbar ? Math.ceil(navbar.getBoundingClientRect().height) : 0;
      const total = barH + navH;
      return total > 0 ? total : 112;
    }

    // Ensure the mobile search panel has a submit button (older pages may only have input + close)
    (function ensureSearchSubmitButton() {
      try {
        const wrapper = panel.querySelector('.search-wrapper');
        if (!wrapper) return;
        if (wrapper.querySelector('#mobile-search-submit, .search-submit')) return;

        const isRTL = (document.documentElement.getAttribute('dir') || '').toLowerCase() === 'rtl';
        const submitBtn = document.createElement('button');
        submitBtn.className = 'search-submit';
        submitBtn.id = 'mobile-search-submit';
        submitBtn.title = isRTL ? 'חיפוש' : 'Search';
        submitBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="M21 21l-4.35-4.35"></path></svg>';

        const close = wrapper.querySelector('#close-mobile-search, .close-search');
        if (close) wrapper.insertBefore(submitBtn, close);
        else wrapper.appendChild(submitBtn);
      } catch (e) {
        // Fail silently; this is a progressive enhancement only
      }
    })();
    
    // Open mobile search panel
    toggleBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      // Ensure panel is positioned below announcement+navbar even if CSS forces --header-height
      try {
        const topPx = computeTotalHeaderHeightPx();
        panel.style.setProperty('top', topPx + 'px', 'important');
      } catch (e2) {}
      panel.classList.add('active');
      setTimeout(function() {
        if (input) input.focus();
      }, 100);
    });
    
    // Close mobile search panel
    function closeMobileSearchPanel() {
      panel.classList.remove('active');
      if (input) input.value = '';
      if (results) results.innerHTML = '';
    }
    
    if (closeBtn) {
      closeBtn.addEventListener('click', closeMobileSearchPanel);
    }
    
    // Close search panel on outside click (blur)
    document.addEventListener('click', function(e) {
      if (!panel.classList.contains('active')) return;
      // If click is inside the panel or on the toggle button, don't close
      if (panel.contains(e.target) || toggleBtn.contains(e.target)) return;
      closeMobileSearchPanel();
    });
    
    // Close search panel when hamburger menu is clicked
    var menuToggle = document.querySelector('.nav-menu-toggle, .hamburger, .menu-toggle, .mobile-toggle, #mobileToggle, [aria-label="תפריט"], [aria-label="Menu"]');
    if (menuToggle) {
      menuToggle.addEventListener('click', function() {
        if (panel.classList.contains('active')) {
          closeMobileSearchPanel();
        }
      });
    }
    
    // Also close search when mobile menu overlay is opened
    var mobileMenuOverlay = document.querySelector('.mobile-menu-overlay, .nav-mobile-menu, .mobile-nav');
    if (mobileMenuOverlay) {
      var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          if (mutation.attributeName === 'class' && 
              (mobileMenuOverlay.classList.contains('active') || mobileMenuOverlay.classList.contains('open'))) {
            closeMobileSearchPanel();
          }
        });
      });
      observer.observe(mobileMenuOverlay, { attributes: true });
    }
    
    // Handle mobile search input
    if (input) {
      input.addEventListener('input', function() {
        const query = this.value.trim();
        
        clearTimeout(searchTimeout);
        
        if (query.length < 2) {
          if (results) results.innerHTML = '';
          return;
        }
        
        searchTimeout = setTimeout(async function() {
          try {
            // Prefer server-side search for mobile suggestions (more reliable than relying on cached allProducts)
            const websiteId = window.ZAPPY_WEBSITE_ID;
            if (!websiteId) throw new Error('Missing websiteId');

            let apiUrl = buildApiUrlWithLang(
              '/api/ecommerce/storefront/products?websiteId=' +
                websiteId +
                '&search=' +
                encodeURIComponent(query) +
                '&limit=8'
            );

            const res = await fetch(apiUrl);
            const data = await res.json();
            const matches = (data && data.success && Array.isArray(data.data)) ? data.data : [];
            renderMobileSearchResults(matches, query);
          } catch (e) {
            // Fallback to local cached search if available
            try {
              const matches = typeof searchProducts === 'function' ? searchProducts(query) : [];
              renderMobileSearchResults(matches, query);
            } catch (e2) {
              renderMobileSearchResults([], query);
            }
          }
        }, 200);
      });
      
      // Handle Enter key on mobile
      input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          const query = this.value.trim();
          if (query.length >= 2) {
            // Check if we're in preview mode
            const isPreview = window.location.pathname.includes('preview-fullscreen');
            if (isPreview) {
              const url = new URL(window.location.href);
              url.searchParams.set('page', '/products');
              url.searchParams.set('search', query);
              window.location.href = url.toString();
            } else {
              window.location.href = '/products?search=' + encodeURIComponent(query);
            }
          }
        }
      });
      
      // Handle mobile search submit button click
      const submitBtn = document.getElementById('mobile-search-submit');
      if (submitBtn) {
        submitBtn.addEventListener('click', function(e) {
          e.preventDefault();
          const query = input.value.trim();
          if (query.length >= 2) {
            // Check if we're in preview mode
            const isPreview = window.location.pathname.includes('preview-fullscreen');
            if (isPreview) {
              const url = new URL(window.location.href);
              url.searchParams.set('page', '/products');
              url.searchParams.set('search', query);
              window.location.href = url.toString();
            } else {
              window.location.href = '/products?search=' + encodeURIComponent(query);
            }
          }
        });
      }
    }
    
    // Close panel when clicking outside
    document.addEventListener('click', function(e) {
      if (panel.classList.contains('active') && 
          !e.target.closest('#mobile-search-panel') && 
          !e.target.closest('#mobile-search-toggle')) {
        panel.classList.remove('active');
      }
    });
  }
  
  function renderMobileSearchResults(matches, query) {
    const results = document.getElementById('mobile-search-results');
    if (!results) return;
    
    if (matches.length === 0) {
      results.innerHTML = '<div class="search-no-results">' + (t.noProducts || 'No products found') + '</div>';
      return;
    }

    // Local safe formatter (do NOT rely on formatPrice being in scope)
    function formatSearchPrice(value) {
      const currency = (t && t.currency) ? t.currency : '₪';
      const n = parseFloat(value);
      if (!Number.isFinite(n)) return '';
      return currency + n.toFixed(2);
    }
    
    // Check if we're in preview mode for generating product URLs
    var isPreviewMode = window.location.pathname.includes('preview-fullscreen');
    
    let html = matches.slice(0, 8).map(function(p) {
      const price = formatSearchPrice(p && p.price);
      const img = p.images && p.images[0] ? resolveProductImageUrl(p.images[0]) : '';
      var productUrl;
      if (isPreviewMode) {
        var urlObj = new URL(window.location.href);
        urlObj.searchParams.set('page', '/product/' + (p.slug || p.id));
        urlObj.searchParams.delete('search');
        productUrl = urlObj.toString();
      } else {
        productUrl = '/product/' + (p.slug || p.id);
      }
      return '<a href="' + productUrl + '" class="search-result-item">' +
        (img ? '<img src="' + img + '" alt="' + p.name + '" class="search-result-img">' : '') +
        '<div class="search-result-info">' +
          '<div class="search-result-name">' + p.name + '</div>' +
          (price ? '<div class="search-result-price">' + price + '</div>' : '') +
        '</div>' +
      '</a>';
    }).join('');
    
    // Always offer a "view all" link for mobile search
    if (query && query.length >= 2) {
      // Check if we're in preview mode
      var isPreview = window.location.pathname.includes('preview-fullscreen');
      var viewAllUrl;
      if (isPreview) {
        var urlObj = new URL(window.location.href);
        urlObj.searchParams.set('page', '/products');
        urlObj.searchParams.set('search', query);
        viewAllUrl = urlObj.toString();
      } else {
        viewAllUrl = '/products?search=' + encodeURIComponent(query);
      }
      html += '<a href="' + viewAllUrl + '" class="search-view-all">' + 
        (t.viewAllResults || 'View all results') + '</a>';
    }
    
    results.innerHTML = html;
  }
  
  // Initialize order success page
  async function initOrderSuccess() {
    // Only run on order-success page
    const pagePath = window.location.pathname;
    const isPreview = window.location.search.includes('page=');
    const previewPage = new URLSearchParams(window.location.search).get('page');
    
    const isOrderSuccessPage = pagePath === '/order-success' || 
                               pagePath.endsWith('/order-success') || 
                               previewPage === '/order-success' ||
                               previewPage === 'order-success';
    
    if (!isOrderSuccessPage) return;
    
    // Check if we're inside an iframe (e.g., Green Invoice payment iframe)
    // If so, redirect the parent window to this success page
    try {
      if (window.self !== window.top) {
        // We're inside an iframe - redirect parent to this URL
        window.top.location.href = window.location.href;
        return; // Stop execution in iframe
      }
    } catch (e) {
      // Cross-origin iframe access error - try postMessage as fallback
      try {
        window.parent.postMessage({ type: 'zappy_order_success', url: window.location.href }, '*');
      } catch (e2) {
        console.warn('Could not communicate with parent frame:', e2);
      }
    }
    
    const orderNumberEl = document.getElementById('order-number-value');
    const orderDetailsSection = document.getElementById('order-details-section');
    const orderItemsList = document.getElementById('order-items-list');
    const orderTotalsSummary = document.getElementById('order-totals-summary');
    
    if (!orderNumberEl) return;
    
    // Get reference from URL
    const urlParams = new URLSearchParams(window.location.search);
    const reference = urlParams.get('ref');
    
    if (!reference) {
      orderNumberEl.textContent = t.orderNotFound || 'Order not found';
      return;
    }
    
    // Extract order number from reference (format: zappy_websiteId_timestamp)
    const parts = reference.split('_');
    const orderDisplay = parts.length >= 3 ? parts[2] : reference;
    orderNumberEl.textContent = '#' + orderDisplay;
    
    // Confirm/create the order on the server (in case webhook didn't fire)
    const websiteId = window.ZAPPY_WEBSITE_ID;
    if (websiteId) {
      try {
        const confirmRes = await fetch(buildApiUrl('/api/ecommerce/confirm-order/' + encodeURIComponent(reference)), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        const confirmData = await confirmRes.json();
        if (confirmData.success) {
          console.log('✅ Order confirmed:', confirmData.data);
          // Update order number to the official one if available
          if (confirmData.data.orderNumber) {
            orderNumberEl.textContent = '#' + confirmData.data.orderNumber;
          }
        } else {
          console.warn('Order confirmation response:', confirmData);
        }
      } catch (e) {
        console.error('Failed to confirm order:', e);
        // Continue anyway - order might have been created by webhook
      }
    }
    
    // Try to fetch order details from the API
    if (websiteId && orderDetailsSection && orderItemsList) {
      // First try localStorage (same-domain checkout)
      const pendingOrderKey = 'zappy_pending_order_' + reference;
      let pendingOrderData = localStorage.getItem(pendingOrderKey);
      
      // If not in localStorage, fetch from API (cross-domain checkout)
      if (!pendingOrderData) {
        try {
          const res = await fetch(buildApiUrl('/api/ecommerce/pending-order/' + encodeURIComponent(reference)));
          const apiData = await res.json();
          if (apiData.success && apiData.data) {
            pendingOrderData = JSON.stringify(apiData.data);
          }
        } catch (e) {
          console.error('Failed to fetch pending order from API:', e);
        }
      }
      
      if (pendingOrderData) {
        try {
          const orderData = JSON.parse(pendingOrderData);
          
          // Show order details
          orderDetailsSection.style.display = 'block';
          
          // Render items
          if (orderData.cartItems && orderData.cartItems.length > 0) {
            orderItemsList.innerHTML = orderData.cartItems.map(function(item) {
              var lineTotal = getCartLineTotal(item);
              var variantLabel = item.variantName ? ' (' + item.variantName + ')' : '';
              return '<div class="order-success-item">' +
                '<span>' + item.name + variantLabel + ' x ' + formatQtyDisplay(item) + '</span>' +
                '<span>' + t.currency + lineTotal.toFixed(2) + '</span>' +
                '</div>';
            }).join('');
          }
          
          // Render totals
          if (orderTotalsSummary) {
            let totalsHtml = '<div><span>' + (t.subtotal || 'Subtotal') + ':</span><span>' + t.currency + parseFloat(orderData.subtotal || 0).toFixed(2) + '</span></div>';
            if (orderData.shippingCost > 0) {
              totalsHtml += '<div><span>' + (t.shipping || 'Shipping') + ':</span><span>' + t.currency + parseFloat(orderData.shippingCost).toFixed(2) + '</span></div>';
            }
            if (orderData.discount > 0) {
              totalsHtml += '<div><span>' + (t.discount || 'Discount') + ':</span><span>-' + t.currency + parseFloat(orderData.discount).toFixed(2) + '</span></div>';
            }
            totalsHtml += '<div class="order-total-final"><span>' + (t.paidAmount || 'Amount Paid') + ':</span><span>' + t.currency + parseFloat(orderData.total || 0).toFixed(2) + '</span></div>';
            orderTotalsSummary.innerHTML = totalsHtml;
          }
          
          // Clean up localStorage after displaying
          localStorage.removeItem(pendingOrderKey);
        } catch (e) {
          console.error('Error parsing pending order data:', e);
        }
      }
    }
    
    // Clear the cart on successful order
    cart = [];
    saveCart();
    updateCartCount();
  }
  
  // Initialize login page
  function initLogin() {
    const sendOtpBtn = document.getElementById('send-otp-btn');
    const verifyOtpBtn = document.getElementById('verify-otp-btn');
    const loginEmailInput = document.getElementById('login-email');
    const otpCodeInput = document.getElementById('otp-code');
    const loginForm = document.querySelector('.login-form');
    const otpForm = document.querySelector('.otp-form');
    
    if (!sendOtpBtn || !loginEmailInput) return;
    
    let currentEmail = '';
    
    // Send OTP
    sendOtpBtn.addEventListener('click', async function(e) {
      e.preventDefault();
      const email = sanitizeEmail(loginEmailInput.value);
      
      if (!email) {
        alert(isRTL ? 'נא להזין כתובת אימייל' : 'Please enter an email address');
        return;
      }
      
      // Basic email validation
      // Note: Using \s instead of s because the backslash gets consumed during JSON serialization
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert(isRTL ? 'נא להזין כתובת אימייל תקינה' : 'Please enter a valid email address');
        return;
      }
      
      sendOtpBtn.disabled = true;
      sendOtpBtn.textContent = isRTL ? 'שולח...' : 'Sending...';
      
      try {
        const res = await fetch(buildApiUrl('/api/ecommerce/customers/login'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            websiteId: websiteId,
            email: email
          })
        });
        
        const data = await res.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to send code');
        }
        
        // Save email for verification step
        currentEmail = email;
        
        // Show OTP form
        if (loginForm) loginForm.style.display = 'none';
        if (otpForm) otpForm.style.display = 'block';
        
        alert(isRTL ? 'קוד אימות נשלח לאימייל שלך' : 'Verification code sent to your email');
        
      } catch (error) {
        console.error('Send OTP failed:', error);
        alert(isRTL ? 'שגיאה בשליחת הקוד. נסה שוב.' : 'Failed to send code. Please try again.');
      } finally {
        sendOtpBtn.disabled = false;
        sendOtpBtn.textContent = t.sendCode || (isRTL ? 'שלח קוד' : 'Send Code');
      }
    });
    
    // Verify OTP
    if (verifyOtpBtn && otpCodeInput) {
      verifyOtpBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        const code = otpCodeInput.value.trim();
        
        if (!code) {
          alert(isRTL ? 'נא להזין את קוד האימות' : 'Please enter the verification code');
          return;
        }
        
        if (code.length !== 6) {
          alert(isRTL ? 'הקוד חייב להיות 6 ספרות' : 'Code must be 6 digits');
          return;
        }
        
        verifyOtpBtn.disabled = true;
        verifyOtpBtn.textContent = isRTL ? 'מאמת...' : 'Verifying...';
        
        try {
          const res = await fetch(buildApiUrl('/api/ecommerce/customers/verify-otp'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              websiteId: websiteId,
              email: currentEmail,
              code: code
            })
          });
          
          const data = await res.json();
          
          if (!data.success) {
            throw new Error(data.error || 'Invalid code');
          }
          
          // Store the auth token with site-specific key for session isolation
          localStorage.setItem('zappy_customer_token_' + websiteId, data.token);
          localStorage.setItem('zappy_customer_email_' + websiteId, currentEmail);
          
          // Show success message
          alert(isRTL ? 'התחברת בהצלחה!' : 'Successfully logged in!');
          
          // Redirect to previous page or products
          const returnUrl = sessionStorage.getItem('zappy_login_return');
          sessionStorage.removeItem('zappy_login_return');
          
          // Determine target page
          let targetPath = (returnUrl && returnUrl !== '/login') ? returnUrl : '/products';
          
          // Check if we're in preview mode and construct proper URL
          const currentUrl = window.location.href;
          if (currentUrl.includes('/api/website/preview')) {
            // In preview mode - construct proper preview URL
            const isFullscreen = currentUrl.includes('preview-fullscreen');
            const previewType = isFullscreen ? 'preview-fullscreen' : 'preview';
            const newUrl = '/api/website/' + previewType + '/' + websiteId + '?page=' + encodeURIComponent(targetPath);
            window.location.href = newUrl;
          } else {
            // Deployed site - use simple path
            window.location.href = targetPath;
          }
          
        } catch (error) {
          console.error('Verify OTP failed:', error);
          alert(isRTL ? 'קוד שגוי או פג תוקף. נסה שוב.' : 'Invalid or expired code. Please try again.');
        } finally {
          verifyOtpBtn.disabled = false;
          verifyOtpBtn.textContent = t.verify || (isRTL ? 'אמת' : 'Verify');
        }
      });
    }
  }
  
  // Initialize account page
  function initAccount() {
    const notLoggedInEl = document.getElementById('account-not-logged-in');
    const loggedInEl = document.getElementById('account-logged-in');
    const accountEmailEl = document.getElementById('account-email');
    const logoutBtn = document.getElementById('logout-btn');
    const ordersLoading = document.getElementById('orders-loading');
    const ordersEmpty = document.getElementById('orders-empty');
    const ordersList = document.getElementById('orders-list');
    
    // Profile elements
    const profileDisplay = document.getElementById('profile-display');
    const profileForm = document.getElementById('profile-form');
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const saveProfileBtn = document.getElementById('save-profile-btn');
    const cancelProfileBtn = document.getElementById('cancel-profile-btn');
    const profileNameEl = document.getElementById('profile-name');
    const profilePhoneEl = document.getElementById('profile-phone');
    const editNameInput = document.getElementById('edit-name');
    const editPhoneInput = document.getElementById('edit-phone');
    
    // Address elements
    const addressesList = document.getElementById('addresses-list');
    const addressesEmpty = document.getElementById('addresses-empty');
    const addAddressBtn = document.getElementById('add-address-btn');
    const addressModalOverlay = document.getElementById('address-modal-overlay');
    const addressModalTitle = document.getElementById('address-modal-title');
    const addressModalClose = document.getElementById('address-modal-close');
    const saveAddressBtn = document.getElementById('save-address-btn');
    const cancelAddressBtn = document.getElementById('cancel-address-btn');
    const addressEditId = document.getElementById('address-edit-id');
    const addressLabelSelect = document.getElementById('address-label');
    const addressStreetInput = document.getElementById('address-street');
    const addressApartmentInput = document.getElementById('address-apartment');
    const addressCityInput = document.getElementById('address-city');
    const addressZipInput = document.getElementById('address-zip');
    const addressDefaultCheckbox = document.getElementById('address-default');
    
    if (!notLoggedInEl || !loggedInEl) return;
    
    // Use site-specific localStorage keys for session isolation
    const tokenKey = 'zappy_customer_token_' + websiteId;
    const emailKey = 'zappy_customer_email_' + websiteId;
    const token = localStorage.getItem(tokenKey);
    const email = localStorage.getItem(emailKey);
    
    // Customer data storage
    let customerData = { name: '', phone: '', addresses: [] };
    
    if (!token) {
      // Not logged in
      notLoggedInEl.style.display = 'block';
      loggedInEl.style.display = 'none';
      return;
    }
    
    // Show logged in state
    notLoggedInEl.style.display = 'none';
    loggedInEl.style.display = 'block';
    
    if (accountEmailEl && email) {
      accountEmailEl.textContent = email;
    }
    
    // Toast notification helper
    function showToast(message, type) {
      const existing = document.querySelector('.toast');
      if (existing) existing.remove();
      
      const toast = document.createElement('div');
      toast.className = 'toast ' + (type || '');
      toast.textContent = message;
      document.body.appendChild(toast);
      
      setTimeout(function() { toast.classList.add('show'); }, 10);
      setTimeout(function() {
        toast.classList.remove('show');
        setTimeout(function() { toast.remove(); }, 300);
      }, 3000);
    }
    
    // Logout handler
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function() {
        localStorage.removeItem(tokenKey);
        localStorage.removeItem(emailKey);
        
        // Navigate to home page
        const currentUrl = window.location.href;
        if (currentUrl.includes('/api/website/preview')) {
          const isFullscreen = currentUrl.includes('preview-fullscreen');
          const previewType = isFullscreen ? 'preview-fullscreen' : 'preview';
          window.location.href = '/api/website/' + previewType + '/' + websiteId + '?page=' + encodeURIComponent('/');
        } else {
          window.location.href = '/';
        }
      });
    }
    
    // Load customer profile
    loadCustomerProfile();
    
    async function loadCustomerProfile() {
      try {
        // Include websiteId for session isolation validation
        const res = await fetch(buildApiUrl('/api/ecommerce/customers/me?websiteId=' + encodeURIComponent(websiteId)), {
          headers: { 'Authorization': 'Bearer ' + token }
        });
        
        const data = await res.json();
        
        if (data.success && data.data) {
          customerData = {
            name: data.data.name || '',
            phone: data.data.phone || '',
            addresses: data.data.addresses || []
          };
          
          // Update profile display - fall back to email if name is not set
          if (profileNameEl) profileNameEl.textContent = customerData.name || data.data.email || '-';
          if (profilePhoneEl) profilePhoneEl.textContent = customerData.phone || '-';
          
          // Update welcome message - show name if available, otherwise email
          if (accountEmailEl) {
            accountEmailEl.textContent = customerData.name || data.data.email || '';
          }
          
          // Render addresses
          renderAddresses();
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      }
    }
    
    // Profile editing
    if (editProfileBtn) {
      editProfileBtn.addEventListener('click', function() {
        if (editNameInput) editNameInput.value = customerData.name || '';
        if (editPhoneInput) editPhoneInput.value = customerData.phone || '';
        if (profileDisplay) profileDisplay.style.display = 'none';
        if (profileForm) profileForm.style.display = 'flex';
        if (editProfileBtn) editProfileBtn.style.display = 'none';
      });
    }
    
    if (cancelProfileBtn) {
      cancelProfileBtn.addEventListener('click', function() {
        if (profileDisplay) profileDisplay.style.display = 'flex';
        if (profileForm) profileForm.style.display = 'none';
        if (editProfileBtn) editProfileBtn.style.display = 'inline-flex';
      });
    }
    
    if (saveProfileBtn) {
      saveProfileBtn.addEventListener('click', async function() {
        const newName = editNameInput ? editNameInput.value.trim() : '';
        const newPhone = editPhoneInput ? editPhoneInput.value.trim() : '';
        
        saveProfileBtn.disabled = true;
        saveProfileBtn.textContent = t.saving || 'Saving...';
        
        try {
          // Include websiteId for session isolation validation
          const res = await fetch(buildApiUrl('/api/ecommerce/customers/me'), {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({
              websiteId: websiteId,
              name: newName,
              phone: newPhone
            })
          });
          
          const data = await res.json();
          
          if (data.success) {
            customerData.name = newName;
            customerData.phone = newPhone;
            
            if (profileNameEl) profileNameEl.textContent = newName || '-';
            if (profilePhoneEl) profilePhoneEl.textContent = newPhone || '-';
            
            if (profileDisplay) profileDisplay.style.display = 'flex';
            if (profileForm) profileForm.style.display = 'none';
            if (editProfileBtn) editProfileBtn.style.display = 'inline-flex';
            
            showToast(t.profileUpdated || 'Profile updated successfully', 'success');
          } else {
            throw new Error(data.error || 'Failed to update profile');
          }
        } catch (error) {
          console.error('Failed to save profile:', error);
          showToast(error.message || 'Error saving profile', 'error');
        } finally {
          saveProfileBtn.disabled = false;
          saveProfileBtn.textContent = t.saveChanges || 'Save Changes';
        }
      });
    }
    
    // Address management
    function renderAddresses() {
      if (!addressesList) return;
      
      if (!customerData.addresses || customerData.addresses.length === 0) {
        addressesList.innerHTML = '<div class="addresses-empty" id="addresses-empty"><p>' + (t.noAddresses || 'No saved addresses') + '</p></div>';
        return;
      }
      
      const labelNames = {
        home: t.home || 'Home',
        work: t.work || 'Work',
        other: t.other || 'Other'
      };
      
      addressesList.innerHTML = customerData.addresses.map(function(addr) {
        const labelText = labelNames[addr.label] || addr.label || t.other || 'Other';
        const isDefault = addr.isDefault;
        
        return '<div class="address-card' + (isDefault ? ' default' : '') + '" data-id="' + addr.id + '">' +
          '<div class="address-card-header">' +
            '<span class="address-label-tag">' + labelText + '</span>' +
            (isDefault ? '<span class="address-default-badge">' + (t.defaultAddress || 'Default') + '</span>' : '') +
          '</div>' +
          '<div class="address-card-body">' +
            '<div>' + (addr.street || '') + (addr.apartment ? ', ' + addr.apartment : '') + '</div>' +
            '<div>' + (addr.city || '') + (addr.zip ? ' ' + addr.zip : '') + '</div>' +
          '</div>' +
          '<div class="address-card-actions">' +
            '<button class="btn-icon btn-edit-address" data-id="' + addr.id + '">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>' +
              '<span>' + (t.editAddress || 'Edit') + '</span>' +
            '</button>' +
            (!isDefault ? '<button class="btn-icon btn-default-address" data-id="' + addr.id + '">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>' +
              '<span>' + (t.setAsDefault || 'Set as Default') + '</span>' +
            '</button>' : '') +
            '<button class="btn-icon btn-delete btn-delete-address" data-id="' + addr.id + '">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>' +
              '<span>' + (t.deleteAddress || 'Delete') + '</span>' +
            '</button>' +
          '</div>' +
        '</div>';
      }).join('');
      
      // Attach event listeners
      addressesList.querySelectorAll('.btn-edit-address').forEach(function(btn) {
        btn.addEventListener('click', function() {
          const id = this.getAttribute('data-id');
          openAddressModal(id);
        });
      });
      
      addressesList.querySelectorAll('.btn-default-address').forEach(function(btn) {
        btn.addEventListener('click', function() {
          const id = this.getAttribute('data-id');
          setDefaultAddress(id);
        });
      });
      
      addressesList.querySelectorAll('.btn-delete-address').forEach(function(btn) {
        btn.addEventListener('click', function() {
          const id = this.getAttribute('data-id');
          deleteAddress(id);
        });
      });
    }
    
    function openAddressModal(editId) {
      const isEdit = !!editId;
      
      if (addressModalTitle) {
        addressModalTitle.textContent = isEdit ? (t.editAddress || 'Edit Address') : (t.addAddress || 'Add Address');
      }
      
      // Reset form
      if (addressEditId) addressEditId.value = editId || '';
      if (addressLabelSelect) addressLabelSelect.value = 'home';
      if (addressStreetInput) addressStreetInput.value = '';
      if (addressApartmentInput) addressApartmentInput.value = '';
      if (addressCityInput) addressCityInput.value = '';
      if (addressZipInput) addressZipInput.value = '';
      if (addressDefaultCheckbox) addressDefaultCheckbox.checked = false;
      
      // Fill form if editing
      if (isEdit && customerData.addresses) {
        const addr = customerData.addresses.find(function(a) { return a.id === editId; });
        if (addr) {
          if (addressLabelSelect) addressLabelSelect.value = addr.label || 'home';
          if (addressStreetInput) addressStreetInput.value = addr.street || '';
          if (addressApartmentInput) addressApartmentInput.value = addr.apartment || '';
          if (addressCityInput) addressCityInput.value = addr.city || '';
          if (addressZipInput) addressZipInput.value = addr.zip || '';
          if (addressDefaultCheckbox) addressDefaultCheckbox.checked = !!addr.isDefault;
        }
      }
      
      if (addressModalOverlay) addressModalOverlay.style.display = 'flex';
    }
    
    function closeAddressModal() {
      if (addressModalOverlay) addressModalOverlay.style.display = 'none';
    }
    
    // Add address button
    if (addAddressBtn) {
      addAddressBtn.addEventListener('click', function() {
        openAddressModal(null);
      });
    }
    
    // Modal close buttons
    if (addressModalClose) {
      addressModalClose.addEventListener('click', closeAddressModal);
    }
    if (cancelAddressBtn) {
      cancelAddressBtn.addEventListener('click', closeAddressModal);
    }
    if (addressModalOverlay) {
      addressModalOverlay.addEventListener('click', function(e) {
        if (e.target === addressModalOverlay) closeAddressModal();
      });
    }
    
    // Save address
    if (saveAddressBtn) {
      saveAddressBtn.addEventListener('click', async function() {
        const street = addressStreetInput ? addressStreetInput.value.trim() : '';
        const city = addressCityInput ? addressCityInput.value.trim() : '';
        
        if (!street || !city) {
          showToast(isRTL ? 'נא למלא רחוב ועיר' : 'Please fill in street and city', 'error');
          return;
        }
        
        const editId = addressEditId ? addressEditId.value : '';
        const isEdit = !!editId;
        const isDefault = addressDefaultCheckbox ? addressDefaultCheckbox.checked : false;
        
        const addressData = {
          id: isEdit ? editId : 'addr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
          label: addressLabelSelect ? addressLabelSelect.value : 'home',
          street: street,
          apartment: addressApartmentInput ? addressApartmentInput.value.trim() : '',
          city: city,
          zip: addressZipInput ? addressZipInput.value.trim() : '',
          isDefault: isDefault
        };
        
        // Update local addresses array
        let newAddresses = customerData.addresses ? customerData.addresses.slice() : [];
        
        if (isEdit) {
          newAddresses = newAddresses.map(function(a) {
            if (a.id === editId) return addressData;
            return a;
          });
        } else {
          newAddresses.push(addressData);
        }
        
        // If setting as default, unset others
        if (isDefault) {
          newAddresses = newAddresses.map(function(a) {
            if (a.id !== addressData.id) {
              return Object.assign({}, a, { isDefault: false });
            }
            return a;
          });
        }
        
        saveAddressBtn.disabled = true;
        saveAddressBtn.textContent = t.saving || 'Saving...';
        
        try {
          // Include websiteId for session isolation validation
          const res = await fetch(buildApiUrl('/api/ecommerce/customers/me'), {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ websiteId: websiteId, addresses: newAddresses })
          });
          
          const data = await res.json();
          
          if (data.success) {
            customerData.addresses = newAddresses;
            renderAddresses();
            closeAddressModal();
            showToast(t.addressSaved || 'Address saved successfully', 'success');
          } else {
            throw new Error(data.error || 'Failed to save address');
          }
        } catch (error) {
          console.error('Failed to save address:', error);
          showToast(error.message || 'Error saving address', 'error');
        } finally {
          saveAddressBtn.disabled = false;
          saveAddressBtn.textContent = t.saveChanges || 'Save Changes';
        }
      });
    }
    
    async function setDefaultAddress(id) {
      const newAddresses = customerData.addresses.map(function(a) {
        return Object.assign({}, a, { isDefault: a.id === id });
      });
      
      try {
        // Include websiteId for session isolation validation
        const res = await fetch(buildApiUrl('/api/ecommerce/customers/me'), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify({ websiteId: websiteId, addresses: newAddresses })
        });
        
        const data = await res.json();
        
        if (data.success) {
          customerData.addresses = newAddresses;
          renderAddresses();
          showToast(t.addressSaved || 'Default address updated', 'success');
        }
      } catch (error) {
        console.error('Failed to set default address:', error);
        showToast('Error updating default address', 'error');
      }
    }
    
    async function deleteAddress(id) {
      if (!confirm(t.confirmDelete || 'Are you sure you want to delete this address?')) {
        return;
      }
      
      const newAddresses = customerData.addresses.filter(function(a) {
        return a.id !== id;
      });
      
      try {
        // Include websiteId for session isolation validation
        const res = await fetch(buildApiUrl('/api/ecommerce/customers/me'), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify({ websiteId: websiteId, addresses: newAddresses })
        });
        
        const data = await res.json();
        
        if (data.success) {
          customerData.addresses = newAddresses;
          renderAddresses();
          showToast(t.addressDeleted || 'Address deleted', 'success');
        }
      } catch (error) {
        console.error('Failed to delete address:', error);
        showToast('Error deleting address', 'error');
      }
    }
    
    // Load orders
    loadCustomerOrders();
    
    async function loadCustomerOrders() {
      if (!ordersLoading || !ordersList) return;
      
      try {
        // Include websiteId for session isolation validation
        const res = await fetch(buildApiUrl('/api/ecommerce/customers/me/orders?websiteId=' + encodeURIComponent(websiteId)), {
          headers: {
            'Authorization': 'Bearer ' + token
          }
        });
        
        const data = await res.json();
        
        ordersLoading.style.display = 'none';
        
        if (!data.success || !data.data || data.data.length === 0) {
          if (ordersEmpty) ordersEmpty.style.display = 'block';
          return;
        }
        
        ordersList.style.display = 'block';
        ordersList.innerHTML = data.data.map(function(order) {
          const statusKey = 'status' + (order.payment_status || order.status || 'pending').charAt(0).toUpperCase() + (order.payment_status || order.status || 'pending').slice(1);
          const statusText = t[statusKey] || order.payment_status || order.status || 'pending';
          const orderDate = new Date(order.created_at).toLocaleDateString(isRTL ? 'he-IL' : 'en-US');
          
          // Parse items if it's a JSON string
          let orderItems = order.items;
          if (typeof orderItems === 'string') {
            try { orderItems = JSON.parse(orderItems); } catch(e) { orderItems = []; }
          }
          orderItems = orderItems || [];
          
          // Get total - try different field names
          const orderTotal = parseFloat(order.total || order.total_amount || 0);
          
          return '<div class="order-card">' +
            '<div class="order-card-header">' +
              '<span class="order-number">#' + (order.order_number || order.id.slice(0, 8)) + '</span>' +
              '<span class="order-status status-' + (order.payment_status || order.status) + '">' + statusText + '</span>' +
            '</div>' +
            '<div class="order-card-body">' +
              '<div class="order-info-row">' +
                '<span class="order-label">' + (t.orderDate || 'Date') + ':</span>' +
                '<span class="order-value">' + orderDate + '</span>' +
              '</div>' +
              '<div class="order-info-row">' +
                '<span class="order-label">' + (t.orderTotal || 'Total') + ':</span>' +
                '<span class="order-value">' + t.currency + orderTotal.toFixed(2) + '</span>' +
              '</div>' +
              (orderItems.length > 0 ? '<div class="order-items-summary">' +
                orderItems.slice(0, 3).map(function(item) {
                  const itemName = item.name || item.productName || 'Item';
                  var qtyLabel = item.quantity > 1 || (item.quantityUnit && item.quantityUnit !== 'piece') ? ' x' + item.quantity : '';
                  if (qtyLabel && item.quantityUnit && item.quantityUnit !== 'piece') {
                    var uLabel = item.customUnitLabel || (t.unitLabels && t.unitLabels[item.quantityUnit]) || item.quantityUnit;
                    qtyLabel += ' ' + uLabel;
                  }
                  return '<span class="order-item-name">' + itemName + qtyLabel + '</span>';
                }).join(', ') +
                (orderItems.length > 3 ? '...' : '') +
              '</div>' : '') +
            '</div>' +
          '</div>';
        }).join('');
        
      } catch (error) {
        console.error('Failed to load orders:', error);
        ordersLoading.style.display = 'none';
        if (ordersEmpty) {
          ordersEmpty.querySelector('p').textContent = t.errorLoading || 'Error loading orders';
          ordersEmpty.style.display = 'block';
        }
      }
    }
  }
  
  // Update header auth state
  function updateHeaderAuthState() {
    // Use site-specific localStorage key for session isolation
    const token = localStorage.getItem('zappy_customer_token_' + websiteId);
    
    // Find login links and account links
    const loginLinks = document.querySelectorAll('a[href="/login"]');
    const accountLinks = document.querySelectorAll('a[href="/account"]');
    
    if (token) {
      // User is logged in - redirect login links to account page
      loginLinks.forEach(function(link) {
        link.href = '/account';
      });
    } else {
      // User is not logged in - redirect account links to login page
      accountLinks.forEach(function(link) {
        link.href = '/login';
      });
    }
  }
  
  function initAll() {
    updateCartCount();
    loadProducts();
    initFilterButtons();
    renderCart();
    loadShippingMethods();
    loadPaymentMethods();
    updateOrderTotals();
    initSearch();
    initMobileSearch();
    initMobileMenuHandling();
    syncMobileToggleWithMenu();
    initMobileCategoriesSubmenu();
    initCartDrawer();
    initCheckout();
    initCoupon();
    initOrderSuccess();
    initLogin();
    initAccount();
    updateHeaderAuthState();
  }
  
  // Add categories submenu to Products link in mobile menu
  function initMobileCategoriesSubmenu() {
    // Only run on mobile
    if (window.innerWidth > 768) return;
    
    // Find the Products link in the mobile menu
    const productsLinks = document.querySelectorAll('a[href="/products"], a[href*="/products"]');
    if (!productsLinks.length) return;
    
    // Get categories from the catalog menu or fetch them
    const catalogMenu = document.getElementById('zappy-category-links');
    let categories = [];
    
    if (catalogMenu) {
      const categoryLinks = catalogMenu.querySelectorAll('a');
      categoryLinks.forEach(function(link) {
        categories.push({ name: link.textContent.trim(), href: link.href });
      });
    }
    
    // If no categories from DOM, try to fetch them
    if (categories.length === 0) {
      const websiteId = window.ZAPPY_WEBSITE_ID;
      if (websiteId) {
        fetch(buildApiUrl('/api/ecommerce/' + websiteId + '/categories'))
          .then(function(r) { return r.json(); })
          .then(function(data) {
            if (data.categories && data.categories.length > 0) {
              categories = data.categories.map(function(c) {
                // Use SEO-friendly slug URL, fallback to id for backward compatibility
                return { name: c.name, href: '/category/' + (c.slug || c.id) };
              });
              addSubmenuToProductsLinks(productsLinks, categories);
            }
          })
          .catch(function() {});
      }
    } else {
      addSubmenuToProductsLinks(productsLinks, categories);
    }
  }
  
  function addSubmenuToProductsLinks(links, categories) {
    if (!categories.length) return;
    
    links.forEach(function(link) {
      // Skip if already has submenu
      if (link.parentElement.querySelector('.mobile-categories-submenu')) return;
      
      // Only process links in mobile menu context
      const parent = link.closest('.nav-menu, .mobile-menu, .mobile-nav, [class*="mobile"], [class*="nav-menu"]');
      if (!parent) return;
      
      // Create submenu container
      const submenu = document.createElement('div');
      submenu.className = 'mobile-categories-submenu';
      submenu.innerHTML = categories.map(function(cat) {
        return '<a href="' + cat.href + '">' + cat.name + '</a>';
      }).join('');
      
      // Wrap the link content for toggle
      const originalText = link.innerHTML;
      link.innerHTML = '<span class="products-menu-toggle">' + originalText + '</span>';
      link.classList.add('products-menu-item');
      
      // Insert submenu after the link
      link.parentElement.insertBefore(submenu, link.nextSibling);
      
      // Toggle submenu on click
      link.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const toggle = link.querySelector('.products-menu-toggle');
        if (toggle) toggle.classList.toggle('active');
        submenu.classList.toggle('active');
      });
    });
  }
  
  // Handle both cases: DOM already loaded or not yet loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    // DOM already loaded, run immediately
    initAll();
  }
  
  // Register language change callback to refresh products when language changes
  // This ensures translated product names, descriptions, etc. are displayed
  if (typeof zappyI18n !== 'undefined' && typeof zappyI18n.onLanguageChange === 'function') {
    zappyI18n.onLanguageChange(function(newLang, oldLang) {
      console.log('[E-COMMERCE MAIN] Language changed from ' + oldLang + ' to ' + newLang + ', refreshing products...');
      
      // Refresh products listing with translated content
      loadProducts();
      
      // Also refresh search results if any products were loaded for search
      if (typeof loadAllProductsForSearch === 'function') {
        loadAllProductsForSearch();
      }
    });
    console.log('[E-COMMERCE MAIN] Registered language change callback for products refresh');
  }
})();

;
// Catalog mode flag - set at generation time
const isCatalogMode = true; // true = catalog only (no cart/checkout), false = full e-commerce

// API base helper for additional JS
function getApiBase() {
  var explicitBase = (window.ZAPPY_API_BASE || '').replace(/\/$/, '');
  var path = window.location ? window.location.pathname : '';
  if (path.indexOf('/preview') !== -1 || path.indexOf('/preview-fullscreen') !== -1) {
    return window.location.origin;
  }
  return explicitBase;
}
function buildApiUrl(path) {
  if (path.charAt(0) !== '/') {
    path = '/' + path;
  }
  var apiBase = getApiBase();
  return apiBase ? apiBase + path : path;
}

// Get current language for API calls (uses i18next if available, falls back to HTML lang attribute)
function getCurrentLanguage() {
  // Try i18next first (if multilingual site)
  if (typeof i18next !== 'undefined' && i18next.language) {
    return i18next.language;
  }
  // Fall back to HTML lang attribute
  var htmlLang = document.documentElement.getAttribute('lang');
  if (htmlLang) {
    return htmlLang;
  }
  return null;
}

// Build API URL with language parameter for e-commerce translations
function buildApiUrlWithLang(path) {
  var url = buildApiUrl(path);
  var lang = getCurrentLanguage();
  if (lang) {
    // Add lang parameter to URL
    url += (url.indexOf('?') === -1 ? '?' : '&') + 'lang=' + encodeURIComponent(lang);
  }
  return url;
}

// Store settings for this section
let additionalJsProductLayout = 'standard';
let additionalJsSettingsFetched = false;
let additionalJsAllProductsLabel = null; // Custom "All Products" label from store settings

// Fetch store settings (announcement bar, product layout, etc.)
// Pass force=true to bypass the cache and re-fetch (e.g., when language changes)
async function fetchAdditionalJsSettings(force) {
  if (additionalJsSettingsFetched && !force) return;
  const websiteId = window.ZAPPY_WEBSITE_ID;
  if (!websiteId) return;
  try {
    const res = await fetch(buildApiUrlWithLang('/api/ecommerce/storefront/settings?websiteId=' + websiteId));
    const data = await res.json();
    if (data.success && data.data) {
      if (data.data.productLayout) {
        additionalJsProductLayout = data.data.productLayout;
      }
      // Handle custom "All Products" label (catalog menu bar + nav dropdown first item)
      if (data.data.allProductsLabel) {
        additionalJsAllProductsLabel = data.data.allProductsLabel;
        // Update the catalog menu "All Products" link text
        var allProductsLink = document.querySelector('.catalog-menu-all');
        if (allProductsLink) {
          allProductsLink.textContent = data.data.allProductsLabel;
        }
        // Update the nav dropdown "All Products" link text (first item)
        var navList = document.getElementById('zappy-nav-category-links');
        if (navList) {
          var firstNavLink = navList.querySelector('li:first-child a');
          var firstNavHref = firstNavLink ? firstNavLink.getAttribute('href') : '';
          if (firstNavLink && (firstNavHref === '/products' || firstNavHref.indexOf('/products') !== -1 || firstNavHref.indexOf('%2Fproducts') !== -1)) {
            firstNavLink.textContent = data.data.allProductsLabel;
          }
        }
      }
      // Handle custom "Products" nav menu trigger label
      if (data.data.productsMenuLabel) {
        var productsDropdown = document.querySelector('.zappy-products-dropdown > a');
        if (productsDropdown) {
          // Preserve the dropdown arrow SVG, only replace the text node
          var arrowSvg = productsDropdown.querySelector('svg');
          productsDropdown.textContent = '';
          productsDropdown.appendChild(document.createTextNode(data.data.productsMenuLabel + ' '));
          if (arrowSvg) productsDropdown.appendChild(arrowSvg);
        }
      }
      // Handle dynamic announcement bar
      handleDynamicAnnouncementBar(data.data.announcementBar);
      additionalJsSettingsFetched = true;
    }
  } catch (e) {
    console.warn('Failed to fetch store settings:', e);
  }
}

// Dynamically create/update/remove announcement bar based on settings
function handleDynamicAnnouncementBar(settings) {
  var existingBar = document.querySelector('.zappy-announcement-bar');
  
  // If disabled or no messages, remove existing bar
  if (!settings) {
    if (existingBar) {
      existingBar.remove();
      var styleTag = document.getElementById('zappy-announcement-bar-style');
      if (styleTag) styleTag.remove();
    }
    return;
  }
  if (!settings.enabled) {
    if (existingBar) {
      existingBar.remove();
      var styleTag2 = document.getElementById('zappy-announcement-bar-style');
      if (styleTag2) styleTag2.remove();
    }
    return;
  }
  if (!settings.messages) {
    if (existingBar) {
      existingBar.remove();
      var styleTag3 = document.getElementById('zappy-announcement-bar-style');
      if (styleTag3) styleTag3.remove();
    }
    return;
  }
  if (settings.messages.length === 0) {
    if (existingBar) {
      existingBar.remove();
      var styleTag4 = document.getElementById('zappy-announcement-bar-style');
      if (styleTag4) styleTag4.remove();
    }
    return;
  }
  
  // Filter out empty messages
  var messages = [];
  for (var i = 0; i < settings.messages.length; i++) {
    var m = settings.messages[i];
    if (m) {
      var trimmed = m.trim();
      if (trimmed !== '') {
        messages.push(m);
      }
    }
  }
  if (messages.length === 0) {
    if (existingBar) existingBar.remove();
    return;
  }
  
  var bgColor = settings.bgColor || '#000000';
  var textColor = settings.textColor || '#ffffff';
  var interval = settings.interval || 4000;
  
  // Create or update announcement bar
  if (!existingBar) {
    // Add CSS if not already present
    if (!document.getElementById('zappy-announcement-bar-style')) {
      var style = document.createElement('style');
      style.id = 'zappy-announcement-bar-style';
      style.textContent = '.zappy-announcement-bar { ' +
        'background-color: ' + bgColor + '; ' +
        'color: ' + textColor + '; ' +
        'position: fixed; top: 0; left: 0; right: 0; width: 100%; ' +
        'text-align: center; padding: 10px 20px; font-size: 14px; ' +
        'font-weight: 500; line-height: 1.4; box-sizing: border-box; ' +
        'z-index: 1001; min-height: 40px; display: flex; ' +
        'align-items: center; justify-content: center; ' +
      '} ' +
      '.zappy-announcement-bar .zappy-announcement-message { ' +
        'position: absolute; opacity: 0; transition: opacity 0.5s ease-in-out; ' +
        'width: 100%; left: 0; right: 0; padding: 0 20px; box-sizing: border-box; ' +
      '} ' +
      '.zappy-announcement-bar .zappy-announcement-message.active { opacity: 1; }';
      document.head.appendChild(style);
    }
    
    // Create announcement bar HTML
    var bar = document.createElement('div');
    bar.className = 'zappy-announcement-bar';
    var messagesHtml = '';
    for (var j = 0; j < messages.length; j++) {
      var msg = messages[j];
      var escapedMsg = msg.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      var activeClass = (j === 0) ? ' active' : '';
      messagesHtml += '<span class="zappy-announcement-message' + activeClass + '">' + escapedMsg + '</span>';
    }
    bar.innerHTML = messagesHtml;
    
    // Insert at start of body
    document.body.insertBefore(bar, document.body.firstChild);
    
    // Set up rotation if multiple messages
    if (messages.length > 1) {
      var currentIndex = 0;
      setInterval(function() {
        var allMsgs = bar.querySelectorAll('.zappy-announcement-message');
        allMsgs[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % allMsgs.length;
        allMsgs[currentIndex].classList.add('active');
      }, interval);
    }
    
    // Trigger layout recalculation for fixed headers
    if (typeof setupFixedHeaders === 'function') {
      setTimeout(setupFixedHeaders, 100);
    }
  } else {
    // Update existing bar colors and messages
    existingBar.style.backgroundColor = bgColor;
    existingBar.style.color = textColor;
  }
}

// Load featured products on home page (uses public storefront API)
// Only shows products marked as "featured" - no fallback to all products
async function loadFeaturedProducts() {
  const grid = document.getElementById('zappy-featured-products');
  if (!grid) return;
  const websiteId = window.ZAPPY_WEBSITE_ID;
  if (!websiteId) return;
  
  // Ensure store settings are loaded first (for productLayout)
  await fetchAdditionalJsSettings();
  
  const t = {"products":"מוצרים","ourProducts":"המוצרים שלנו","featuredProducts":"מוצרים מומלצים","noFeaturedProducts":"עוד לא נבחרו מוצרים מומלצים. צפו בכל המוצרים שלנו!","featuredCategories":"קנו לפי קטגוריה","all":"הכל","featured":"מומלצים","new":"חדשים","sale":"מבצעים","loadingProducts":"טוען מוצרים...","cart":"עגלת קניות","yourCart":"עגלת הקניות שלך","emptyCart":"העגלה ריקה","total":"סה\"כ","proceedToCheckout":"המשך לתשלום","checkout":"תשלום","customerInfo":"פרטי לקוח","fullName":"שם מלא","email":"אימייל","phone":"טלפון","shippingAddress":"כתובת למשלוח","street":"רחוב ומספר","apartment":"דירה, קומה, כניסה","city":"עיר","zip":"מיקוד","saveAddressForNextTime":"שמור את הכתובת לפעם הבאה","shippingMethod":"שיטת משלוח","loadingShipping":"טוען שיטות משלוח...","payment":"תשלום","loadingPayment":"טוען אפשרויות תשלום...","orderSummary":"סיכום הזמנה","subtotal":"סכום ביניים","vat":"מע\"מ","vatIncluded":"כולל מע\"מ","shipping":"משלוח","discount":"הנחה","totalToPay":"סה\"כ לתשלום","placeOrder":"בצע הזמנה","login":"התחברות","customerLogin":"התחברות לקוחות","enterEmail":"הזן את כתובת האימייל שלך ונשלח לך קוד התחברות","emailAddress":"כתובת אימייל","sendCode":"שלח קוד","enterCode":"הזן את הקוד שנשלח לאימייל שלך","verificationCode":"קוד אימות","verify":"אמת","returnPolicy":"מדיניות החזרות","addToCart":"הוסף לעגלה","startingAt":"החל מ","addedToCart":"המוצר נוסף לעגלה!","remove":"הסר","noProducts":"אין מוצרים להצגה כרגע","errorLoading":"שגיאה בטעינה","days":"ימים","currency":"₪","free":"חינם","freeAbove":"משלוח חינם מעל","noShippingMethods":"אין אפשרויות משלוח זמינות","viewAllResults":"הצג את כל התוצאות","searchProducts":"חיפוש מוצרים","productDetails":"פרטי המוצר","viewDetails":"לפרטים נוספים","inStock":"במלאי","outOfStock":"אזל מהמלאי","sku":"מק\"ט","category":"קטגוריה","relatedProducts":"מוצרים דומים","productNotFound":"המוצר לא נמצא","backToProducts":"חזרה למוצרים","home":"בית","quantity":"כמות","unitLabels":{"piece":"יח'","kg":"ק\"ג","gram":"גרם","liter":"ליטר","ml":"מ\"ל"},"perUnit":"/","couponCode":"קוד קופון","enterCouponCode":"הזן קוד קופון","applyCoupon":"החל","removeCoupon":"הסר","couponApplied":"הקופון הוחל בהצלחה!","invalidCoupon":"קוד קופון לא תקין","couponExpired":"הקופון פג תוקף","couponMinOrder":"סכום הזמנה מינימלי","alreadyHaveAccount":"כבר יש לך חשבון?","loginHere":"התחבר כאן","loggedInAs":"מחובר כ:","logout":"התנתק","haveCouponCode":"יש לי קוד קופון","agreeToTerms":"אני מסכים/ה ל","termsAndConditions":"תנאי השימוש","pleaseAcceptTerms":"נא לאשר את תנאי השימוש","nameRequired":"נא להזין שם מלא","emailRequired":"נא להזין כתובת אימייל","emailInvalid":"כתובת אימייל לא תקינה","phoneRequired":"נא להזין מספר טלפון","shippingRequired":"נא לבחור שיטת משלוח","streetRequired":"נא להזין רחוב ומספר","cityRequired":"נא להזין עיר","cartEmpty":"העגלה ריקה","paymentNotConfigured":"תשלום מקוון לא מוגדר","orderSuccess":"ההזמנה התקבלה!","thankYouOrder":"תודה על ההזמנה","orderNumber":"מספר הזמנה","orderConfirmation":"אישור הזמנה נשלח לאימייל שלך","orderProcessing":"ההזמנה שלך בטיפול. נעדכן אותך כשהמשלוח יצא לדרך.","continueShopping":"להמשך קניות","orderDetails":"פרטי ההזמנה","loadingOrder":"טוען פרטי הזמנה...","orderNotFound":"לא נמצאה הזמנה","orderItems":"פריטים בהזמנה","paidAmount":"סכום ששולם","myAccount":"החשבון שלי","accountWelcome":"ברוך הבא","yourOrders":"ההזמנות שלך","noOrders":"אין עדיין הזמנות","orderDate":"תאריך","orderStatus":"סטטוס","orderTotal":"סה\"כ","viewOrder":"צפה בהזמנה","statusPending":"ממתין לתשלום","statusPaid":"שולם","statusProcessing":"בטיפול","statusShipped":"נשלח","statusDelivered":"נמסר","statusCancelled":"בוטל","notLoggedIn":"לא מחובר","pleaseLogin":"יש להתחבר כדי לצפות בחשבון","personalDetails":"פרטים אישיים","editProfile":"עריכת פרופיל","name":"שם","saveChanges":"שמור שינויים","cancel":"ביטול","addresses":"כתובות","addAddress":"הוסף כתובת","editAddress":"ערוך כתובת","deleteAddress":"מחק כתובת","setAsDefault":"הגדר כברירת מחדל","defaultAddress":"כתובת ברירת מחדל","addressLabel":"שם הכתובת","work":"עבודה","other":"אחר","noAddresses":"אין כתובות שמורות","confirmDelete":"האם אתה בטוח שברצונך למחוק?","profileUpdated":"הפרופיל עודכן בהצלחה","addressSaved":"הכתובת נשמרה בהצלחה","addressDeleted":"הכתובת נמחקה","saving":"שומר...","selectVariant":"בחר אפשרות","variantUnavailable":"לא זמין","color":"צבע","size":"מידה","material":"חומר","style":"סגנון","weight":"משקל","capacity":"קיבולת","length":"אורך","inquiryAbout":"פנייה בנושא","sendInquiry":"שלח פנייה","callNow":"התקשר עכשיו","specifications":"מפרט טכני","businessPhone":"[business_phone]","businessEmail":"[business_email]"};
  
  try {
    // Only fetch featured products - no fallback, with language support
    const res = await fetch(buildApiUrlWithLang('/api/ecommerce/storefront/products?websiteId=' + websiteId + '&featured=true&limit=6'));
    const data = await res.json();
    if (!data.success || !data.data?.length) {
      // Show a friendly message when no featured products
      grid.innerHTML = '<div class="no-featured-products">' + (t.noFeaturedProducts || 'No featured products yet. Check out all our products!') + '</div>';
      return;
    }
    renderProductGrid(grid, data.data, t, true);
  } catch (e) {
    console.error('Failed to load featured products', e);
    grid.innerHTML = '<div class="empty-cart">' + t.errorLoading + '</div>';
  }
}

// Load featured categories on home page (uses public storefront API)
// Only shows categories marked as "featured" with images
async function loadFeaturedCategories() {
  const container = document.getElementById('zappy-featured-categories');
  if (!container) return;
  const websiteId = window.ZAPPY_WEBSITE_ID;
  if (!websiteId) return;
  
  try {
    const res = await fetch(buildApiUrlWithLang('/api/ecommerce/storefront/featured-categories?websiteId=' + websiteId));
    const data = await res.json();
    if (!data.success || !data.data?.length) {
      // Remove the entire section if no featured categories
      const section = document.getElementById('featured-categories');
      if (section) section.remove();
      return;
    }
    
    // Render category blocks with SEO-friendly slug URLs
    container.innerHTML = data.data.map(function(cat) {
      const imageUrl = resolveProductImageUrl(cat.image) || '';
      // Use SEO-friendly slug URL, fallback to id for backward compatibility
      const categoryUrl = '/category/' + (cat.slug || cat.id);
      return '<a href="' + categoryUrl + '" class="category-block" data-category-id="' + cat.id + '" data-category-slug="' + (cat.slug || '') + '">' +
        '<div class="category-block-bg" style="background-image: url(\'' + imageUrl + '\')"></div>' +
        '<div class="category-block-overlay"></div>' +
        '<div class="category-block-content">' +
          '<span class="category-block-name">' + cat.name + '</span>' +
        '</div>' +
      '</a>';
    }).join('');
  } catch (e) {
    console.error('Failed to load featured categories', e);
    // Remove section on error
    const section = document.getElementById('featured-categories');
    if (section) section.remove();
  }
}

// Helper to get localized e-commerce UI text
// Tries zappyI18n first for multilingual support, falls back to static t object
function getEcomText(key, fallback) {
  if (typeof zappyI18n !== 'undefined' && typeof zappyI18n.t === 'function') {
    var translated = zappyI18n.t('ecom_' + key);
    // If translation exists and is not just the key, use it
    if (translated && translated !== 'ecom_' + key) {
      return translated;
    }
  }
  return fallback;
}

// Helper to strip HTML tags - defined here since ecommerceJs uses an IIFE and its scope is not accessible

// Helper to strip HTML tags and convert rich text to plain text for card previews
function stripHtmlToText(html) {
  if (!html) return '';
  // Create a temporary element to parse HTML
  var temp = document.createElement('div');
  temp.innerHTML = html;
  // Replace block-level elements' closing tags with space to preserve word boundaries
  // This handles </p>, </div>, </li>, <br>, etc. from rich text editors
  temp.innerHTML = temp.innerHTML
    .replace(/<\/p>/gi, ' ')
    .replace(/<\/div>/gi, ' ')
    .replace(/<\/li>/gi, ' ')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/h[1-6]>/gi, ' ');
  // Get text content (strips remaining HTML tags)
  var text = temp.textContent || temp.innerText || '';
  // Normalize whitespace (replace multiple spaces/newlines with single space)
  text = text.replace(/\s+/g, ' ').trim();
  return text;
}


function renderProductGrid(grid, products, t, isFeaturedSection) {
  // Update grid class based on layout (only for product grids, not featured section which has its own styling)
  var layout = additionalJsProductLayout || 'standard';
  if (!isFeaturedSection) {
    grid.className = 'product-grid layout-' + layout;
  }
  
  // Get localized text for UI elements
  var localizedAddToCart = getEcomText('addToCart', t.addToCart);
  var localizedViewDetails = getEcomText('viewDetails', t.viewDetails);
  
  grid.innerHTML = products.map(p => {
    // Check if price should be displayed (default to true if not set)
    const showPrice = p.custom_fields?.showPrice !== false;
    const hasSalePrice = p.sale_price && parseFloat(p.sale_price) < parseFloat(p.price);
    const variantCount = parseInt(p.variant_count || 0, 10);
    const variantPriceCount = parseInt(p.variant_price_count || 0, 10);
    const variantMinPrice = parseFloat(p.variant_min_price);
    const variantMaxPrice = parseFloat(p.variant_max_price);
    const hasVariantPriceRange = variantCount > 1 && variantPriceCount > 1 && Number.isFinite(variantMinPrice) && Number.isFinite(variantMaxPrice) && variantMinPrice !== variantMaxPrice;
    const startingAtLabel = getEcomText('startingAt', t.startingAt || 'Starting at');
    const displayPrice = showPrice 
      ? (hasVariantPriceRange
        ? startingAtLabel + ' ' + t.currency + variantMinPrice.toFixed(2)
        : (hasSalePrice 
          ? t.currency + parseFloat(p.sale_price).toFixed(2) + ' <span class="original-price">' + t.currency + parseFloat(p.price).toFixed(2) + '</span>'
          : t.currency + parseFloat(p.price).toFixed(2)))
      : '';
    
    // Get first image with correct URL in preview/live
    var imageUrl = p.images && p.images[0]
      ? (window.resolveProductImageUrl ? window.resolveProductImageUrl(p.images[0]) : p.images[0])
      : '';
    
    // Build tag badges (manual only - all tags come from product.tags array)
    var tagBadges = [];
    if (p.tags && p.tags.length) {
      p.tags.forEach(function(tag) {
        var tagLower = tag.toLowerCase();
        // Apply special styling for known tag types
        if (tagLower === 'sale' || tagLower === 'מבצע') {
          tagBadges.push('<span class="product-tag tag-sale">' + tag + '</span>');
        } else if (tagLower === 'new' || tagLower === 'חדש') {
          tagBadges.push('<span class="product-tag tag-new">' + tag + '</span>');
        } else if (tagLower === 'featured' || tagLower === 'מומלץ') {
          tagBadges.push('<span class="product-tag tag-featured">' + tag + '</span>');
        } else {
          tagBadges.push('<span class="product-tag">' + tag + '</span>');
        }
      });
    }
    var tagsHtml = tagBadges.length > 0 ? '<div class="product-tags">' + tagBadges.join('') + '</div>' : '';
    
    // Build card content based on layout
    var cardContent = '';
    var imageHtml = imageUrl ? '<img src="' + imageUrl + '" alt="' + p.name + '">' : '<div class="no-image-placeholder">📦</div>';
    var layout = additionalJsProductLayout || 'standard';
    
    // Only include price div if showPrice is true
    var pricePerUnitHtml = getPricePerUnitHtml(p);
    var priceHtml = showPrice ? '<div class="price">' + displayPrice + '</div>' + pricePerUnitHtml : '';
    
    if (layout === 'compact') {
      // Compact: image, name, price only
      cardContent = tagsHtml +
        '<a href="/product/' + (p.slug || p.id) + '" class="product-card-link">' +
          imageHtml +
          '<h3>' + p.name + '</h3>' +
          priceHtml +
        '</a>';
    } else if (layout === 'detailed') {
      // Detailed: image, name, full description, price, action button
      // Strip HTML from rich text description and let CSS line-clamp handle truncation
      var detailedDesc = stripHtmlToText(p.description || '');
      // In catalog mode, show "View Details" link instead of "Add to Cart" button
      var actionButton = isCatalogMode
        ? '<a href="/product/' + (p.slug || p.id) + '" class="add-to-cart view-details-btn">' + localizedViewDetails + '</a>'
        : '<button class="add-to-cart" onclick="event.stopPropagation(); window.zappyHandleAddToCart(' + JSON.stringify(p).replace(/"/g, '&quot;') + ')">' + localizedAddToCart + '</button>';
      cardContent = tagsHtml +
        '<a href="/product/' + (p.slug || p.id) + '" class="product-card-link">' +
          imageHtml +
          '<h3>' + p.name + '</h3>' +
          '<p>' + detailedDesc + '</p>' +
          priceHtml +
        '</a>' +
        actionButton;
    } else {
      // Standard (default): image, name, short description, price
      // Strip HTML from rich text description and let CSS line-clamp handle truncation
      var standardDesc = stripHtmlToText(p.description || '');
      cardContent = tagsHtml +
        '<a href="/product/' + (p.slug || p.id) + '" class="product-card-link">' +
          imageHtml +
          '<h3>' + p.name + '</h3>' +
          '<p>' + standardDesc + '</p>' +
          priceHtml +
        '</a>';
    }
    
    return '<div class="product-card ' + layout + '" data-product-id="' + p.id + '">' + cardContent + '</div>';
  }).join('');
}

// Load categories into catalog dropdown
async function loadCatalogCategories() {
    const list = document.getElementById('zappy-category-links');
    const navList = document.getElementById('zappy-nav-category-links');
    if (!list && !navList) return;
  const websiteId = window.ZAPPY_WEBSITE_ID;
  if (!websiteId) return;
  
  try {
    const res = await fetch(buildApiUrlWithLang('/api/ecommerce/storefront/categories?websiteId=' + websiteId));
    const data = await res.json();
    if (!data.success || !data.data?.length) return;
    
    // Use SEO-friendly slug URLs for categories, fallback to id for backward compatibility
    const dropdownItemsHtml = data.data.map(cat => {
      const categoryUrl = '/category/' + (cat.slug || cat.id);
      return '<li data-category-id="' + cat.id + '" data-category-slug="' + (cat.slug || '') + '"><a href="' + categoryUrl + '">' + cat.name + '</a></li>';
    }).join('');

    const barItemsHtml = data.data.map(cat => {
      const categoryUrl = '/category/' + (cat.slug || cat.id);
      return '<a href="' + categoryUrl + '" class="catalog-menu-item" data-category-id="' + cat.id + '" data-category-slug="' + (cat.slug || '') + '">' + cat.name + '</a>';
    }).join('');

    if (navList) {
      // Remove any previously injected category items
      navList.querySelectorAll('li[data-category-id]').forEach(function(node) { node.remove(); });
      navList.insertAdjacentHTML('beforeend', dropdownItemsHtml);
    }

    if (list) {
      list.querySelectorAll('[data-category-id]').forEach(function(node) { node.remove(); });
      list.insertAdjacentHTML('beforeend', barItemsHtml);
    }
  } catch (e) {
    console.error('Failed to load categories', e);
  }
}

// Initialize featured products, categories, and product/category page details on load
document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu is handled by the main navbar script - no separate e-commerce handler needed
  
  // Fetch store settings first (handles announcement bar, product layout, etc.)
  fetchAdditionalJsSettings();
  loadFeaturedProducts();
  loadFeaturedCategories();
  loadCatalogCategories();
  loadProductDetailPage();
  loadCategoryPage();
  
  // Register language change callback to refresh e-commerce content
  // This ensures translated product names, categories, etc. are displayed when switching languages
  if (typeof zappyI18n !== 'undefined' && typeof zappyI18n.onLanguageChange === 'function') {
    zappyI18n.onLanguageChange(function(newLang, oldLang) {
      console.log('[E-COMMERCE] Language changed from ' + oldLang + ' to ' + newLang + ', refreshing content...');
      
      // Refresh all e-commerce content with the new language
      // Each function uses buildApiUrlWithLang which will now include the new language
      fetchAdditionalJsSettings(true);  // Force refresh announcement bar with translated messages
      loadFeaturedProducts();           // Refresh featured products section
      loadFeaturedCategories();         // Refresh featured categories section
      loadCatalogCategories();          // Refresh navigation category menu
      
      // If we're on a product detail page, refresh it
      var detailSection = document.getElementById('product-detail');
      if (detailSection) {
        loadProductDetailPage();
      }
      
      // If we're on a category page, refresh it
      var categorySection = document.getElementById('category-products');
      if (categorySection) {
        loadCategoryPage();
      }
      
      // If we're on the products listing page, refresh it
      var productsGrid = document.getElementById('zappy-product-grid');
      if (productsGrid && typeof loadProducts === 'function') {
        loadProducts();
      }
      
      // Update static e-commerce UI elements that are rendered at page generation time
      // These need to be manually updated when language changes
      updateStaticEcommerceUI();
    });
    console.log('[E-COMMERCE] Registered language change callback for content refresh');
  }
  
  // Update static e-commerce UI elements with translated text
  function updateStaticEcommerceUI() {
    // Update "Add to Cart" button on product detail page
    var addToCartBtn = document.getElementById('add-to-cart-btn');
    if (addToCartBtn) {
      addToCartBtn.textContent = getEcomText('addToCart', 'Add to Cart');
    }
    
    // Update all other "Add to Cart" buttons in product grids
    document.querySelectorAll('button.add-to-cart:not(#add-to-cart-btn)').forEach(function(btn) {
      // Only update text content, preserve onclick handler
      btn.textContent = getEcomText('addToCart', 'Add to Cart');
    });
    
    // Update filter buttons text (All, Featured, New, Sale)
    document.querySelectorAll('.filter-btn').forEach(function(btn) {
      var category = btn.getAttribute('data-category');
      if (category === 'all') {
        btn.textContent = getEcomText('all', 'All');
      } else if (category === 'featured') {
        btn.textContent = getEcomText('featured', 'Featured');
      } else if (category === 'new') {
        btn.textContent = getEcomText('new', 'New');
      } else if (category === 'sale') {
        btn.textContent = getEcomText('sale', 'Sale');
      }
    });
    
    // Update cart drawer empty message
    var emptyCartMsg = document.querySelector('.empty-cart p');
    if (emptyCartMsg) {
      emptyCartMsg.textContent = getEcomText('emptyCart', 'Your cart is empty');
    }
    
    // Update checkout button text
    var checkoutBtn = document.querySelector('.checkout-btn, #checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.textContent = getEcomText('proceedToCheckout', 'Proceed to Checkout');
    }
    
    console.log('[E-COMMERCE] Static UI elements updated for language change');
  }
});

// Load product detail page
async function loadProductDetailPage() {
  const detailSection = document.getElementById('product-detail');
  if (!detailSection) return; // Not on product detail page
  
  const websiteId = window.ZAPPY_WEBSITE_ID;
  if (!websiteId) return;
  
  const t = {"products":"מוצרים","ourProducts":"המוצרים שלנו","featuredProducts":"מוצרים מומלצים","noFeaturedProducts":"עוד לא נבחרו מוצרים מומלצים. צפו בכל המוצרים שלנו!","featuredCategories":"קנו לפי קטגוריה","all":"הכל","featured":"מומלצים","new":"חדשים","sale":"מבצעים","loadingProducts":"טוען מוצרים...","cart":"עגלת קניות","yourCart":"עגלת הקניות שלך","emptyCart":"העגלה ריקה","total":"סה\"כ","proceedToCheckout":"המשך לתשלום","checkout":"תשלום","customerInfo":"פרטי לקוח","fullName":"שם מלא","email":"אימייל","phone":"טלפון","shippingAddress":"כתובת למשלוח","street":"רחוב ומספר","apartment":"דירה, קומה, כניסה","city":"עיר","zip":"מיקוד","saveAddressForNextTime":"שמור את הכתובת לפעם הבאה","shippingMethod":"שיטת משלוח","loadingShipping":"טוען שיטות משלוח...","payment":"תשלום","loadingPayment":"טוען אפשרויות תשלום...","orderSummary":"סיכום הזמנה","subtotal":"סכום ביניים","vat":"מע\"מ","vatIncluded":"כולל מע\"מ","shipping":"משלוח","discount":"הנחה","totalToPay":"סה\"כ לתשלום","placeOrder":"בצע הזמנה","login":"התחברות","customerLogin":"התחברות לקוחות","enterEmail":"הזן את כתובת האימייל שלך ונשלח לך קוד התחברות","emailAddress":"כתובת אימייל","sendCode":"שלח קוד","enterCode":"הזן את הקוד שנשלח לאימייל שלך","verificationCode":"קוד אימות","verify":"אמת","returnPolicy":"מדיניות החזרות","addToCart":"הוסף לעגלה","startingAt":"החל מ","addedToCart":"המוצר נוסף לעגלה!","remove":"הסר","noProducts":"אין מוצרים להצגה כרגע","errorLoading":"שגיאה בטעינה","days":"ימים","currency":"₪","free":"חינם","freeAbove":"משלוח חינם מעל","noShippingMethods":"אין אפשרויות משלוח זמינות","viewAllResults":"הצג את כל התוצאות","searchProducts":"חיפוש מוצרים","productDetails":"פרטי המוצר","viewDetails":"לפרטים נוספים","inStock":"במלאי","outOfStock":"אזל מהמלאי","sku":"מק\"ט","category":"קטגוריה","relatedProducts":"מוצרים דומים","productNotFound":"המוצר לא נמצא","backToProducts":"חזרה למוצרים","home":"בית","quantity":"כמות","unitLabels":{"piece":"יח'","kg":"ק\"ג","gram":"גרם","liter":"ליטר","ml":"מ\"ל"},"perUnit":"/","couponCode":"קוד קופון","enterCouponCode":"הזן קוד קופון","applyCoupon":"החל","removeCoupon":"הסר","couponApplied":"הקופון הוחל בהצלחה!","invalidCoupon":"קוד קופון לא תקין","couponExpired":"הקופון פג תוקף","couponMinOrder":"סכום הזמנה מינימלי","alreadyHaveAccount":"כבר יש לך חשבון?","loginHere":"התחבר כאן","loggedInAs":"מחובר כ:","logout":"התנתק","haveCouponCode":"יש לי קוד קופון","agreeToTerms":"אני מסכים/ה ל","termsAndConditions":"תנאי השימוש","pleaseAcceptTerms":"נא לאשר את תנאי השימוש","nameRequired":"נא להזין שם מלא","emailRequired":"נא להזין כתובת אימייל","emailInvalid":"כתובת אימייל לא תקינה","phoneRequired":"נא להזין מספר טלפון","shippingRequired":"נא לבחור שיטת משלוח","streetRequired":"נא להזין רחוב ומספר","cityRequired":"נא להזין עיר","cartEmpty":"העגלה ריקה","paymentNotConfigured":"תשלום מקוון לא מוגדר","orderSuccess":"ההזמנה התקבלה!","thankYouOrder":"תודה על ההזמנה","orderNumber":"מספר הזמנה","orderConfirmation":"אישור הזמנה נשלח לאימייל שלך","orderProcessing":"ההזמנה שלך בטיפול. נעדכן אותך כשהמשלוח יצא לדרך.","continueShopping":"להמשך קניות","orderDetails":"פרטי ההזמנה","loadingOrder":"טוען פרטי הזמנה...","orderNotFound":"לא נמצאה הזמנה","orderItems":"פריטים בהזמנה","paidAmount":"סכום ששולם","myAccount":"החשבון שלי","accountWelcome":"ברוך הבא","yourOrders":"ההזמנות שלך","noOrders":"אין עדיין הזמנות","orderDate":"תאריך","orderStatus":"סטטוס","orderTotal":"סה\"כ","viewOrder":"צפה בהזמנה","statusPending":"ממתין לתשלום","statusPaid":"שולם","statusProcessing":"בטיפול","statusShipped":"נשלח","statusDelivered":"נמסר","statusCancelled":"בוטל","notLoggedIn":"לא מחובר","pleaseLogin":"יש להתחבר כדי לצפות בחשבון","personalDetails":"פרטים אישיים","editProfile":"עריכת פרופיל","name":"שם","saveChanges":"שמור שינויים","cancel":"ביטול","addresses":"כתובות","addAddress":"הוסף כתובת","editAddress":"ערוך כתובת","deleteAddress":"מחק כתובת","setAsDefault":"הגדר כברירת מחדל","defaultAddress":"כתובת ברירת מחדל","addressLabel":"שם הכתובת","work":"עבודה","other":"אחר","noAddresses":"אין כתובות שמורות","confirmDelete":"האם אתה בטוח שברצונך למחוק?","profileUpdated":"הפרופיל עודכן בהצלחה","addressSaved":"הכתובת נשמרה בהצלחה","addressDeleted":"הכתובת נמחקה","saving":"שומר...","selectVariant":"בחר אפשרות","variantUnavailable":"לא זמין","color":"צבע","size":"מידה","material":"חומר","style":"סגנון","weight":"משקל","capacity":"קיבולת","length":"אורך","inquiryAbout":"פנייה בנושא","sendInquiry":"שלח פנייה","callNow":"התקשר עכשיו","specifications":"מפרט טכני","businessPhone":"[business_phone]","businessEmail":"[business_email]"};
  
  // Get slug from URL - check both pathname and query parameter (preview mode)
  let pagePath = window.location.pathname;
  const urlParams = new URLSearchParams(window.location.search);
  const pageParam = urlParams.get('page');
  if (pageParam) {
    pagePath = pageParam;
  }
  
  // Extract slug from path like /product/slug-name
  const pathParts = pagePath.split('/');
  const slug = pathParts[pathParts.length - 1];
  
  if (!slug || slug === 'product') {
    showProductNotFound(detailSection, t);
    return;
  }
  
  console.log('Loading product with slug:', slug);
  
  try {
    const res = await fetch(buildApiUrlWithLang('/api/ecommerce/storefront/products/' + encodeURIComponent(slug) + '?websiteId=' + websiteId));
    const data = await res.json();
    
    if (!data.success || !data.data) {
      showProductNotFound(detailSection, t);
      return;
    }
    
    const product = data.data;
    renderProductDetail(detailSection, product, t);
    
    // Update page title and meta
    document.title = product.name + ' - ' + (document.title.split(' - ').pop() || '');
    
    // Load related products
    loadRelatedProducts(product, t);
    
  } catch (e) {
    console.error('Failed to load product', e);
    showProductNotFound(detailSection, t);
  }
}

// Load category page (similar to product detail page but for categories)
async function loadCategoryPage() {
  const categorySection = document.getElementById('category-page');
  if (!categorySection) return; // Not on category page
  
  const websiteId = window.ZAPPY_WEBSITE_ID;
  if (!websiteId) return;
  
  const t = {"products":"מוצרים","ourProducts":"המוצרים שלנו","featuredProducts":"מוצרים מומלצים","noFeaturedProducts":"עוד לא נבחרו מוצרים מומלצים. צפו בכל המוצרים שלנו!","featuredCategories":"קנו לפי קטגוריה","all":"הכל","featured":"מומלצים","new":"חדשים","sale":"מבצעים","loadingProducts":"טוען מוצרים...","cart":"עגלת קניות","yourCart":"עגלת הקניות שלך","emptyCart":"העגלה ריקה","total":"סה\"כ","proceedToCheckout":"המשך לתשלום","checkout":"תשלום","customerInfo":"פרטי לקוח","fullName":"שם מלא","email":"אימייל","phone":"טלפון","shippingAddress":"כתובת למשלוח","street":"רחוב ומספר","apartment":"דירה, קומה, כניסה","city":"עיר","zip":"מיקוד","saveAddressForNextTime":"שמור את הכתובת לפעם הבאה","shippingMethod":"שיטת משלוח","loadingShipping":"טוען שיטות משלוח...","payment":"תשלום","loadingPayment":"טוען אפשרויות תשלום...","orderSummary":"סיכום הזמנה","subtotal":"סכום ביניים","vat":"מע\"מ","vatIncluded":"כולל מע\"מ","shipping":"משלוח","discount":"הנחה","totalToPay":"סה\"כ לתשלום","placeOrder":"בצע הזמנה","login":"התחברות","customerLogin":"התחברות לקוחות","enterEmail":"הזן את כתובת האימייל שלך ונשלח לך קוד התחברות","emailAddress":"כתובת אימייל","sendCode":"שלח קוד","enterCode":"הזן את הקוד שנשלח לאימייל שלך","verificationCode":"קוד אימות","verify":"אמת","returnPolicy":"מדיניות החזרות","addToCart":"הוסף לעגלה","startingAt":"החל מ","addedToCart":"המוצר נוסף לעגלה!","remove":"הסר","noProducts":"אין מוצרים להצגה כרגע","errorLoading":"שגיאה בטעינה","days":"ימים","currency":"₪","free":"חינם","freeAbove":"משלוח חינם מעל","noShippingMethods":"אין אפשרויות משלוח זמינות","viewAllResults":"הצג את כל התוצאות","searchProducts":"חיפוש מוצרים","productDetails":"פרטי המוצר","viewDetails":"לפרטים נוספים","inStock":"במלאי","outOfStock":"אזל מהמלאי","sku":"מק\"ט","category":"קטגוריה","relatedProducts":"מוצרים דומים","productNotFound":"המוצר לא נמצא","backToProducts":"חזרה למוצרים","home":"בית","quantity":"כמות","unitLabels":{"piece":"יח'","kg":"ק\"ג","gram":"גרם","liter":"ליטר","ml":"מ\"ל"},"perUnit":"/","couponCode":"קוד קופון","enterCouponCode":"הזן קוד קופון","applyCoupon":"החל","removeCoupon":"הסר","couponApplied":"הקופון הוחל בהצלחה!","invalidCoupon":"קוד קופון לא תקין","couponExpired":"הקופון פג תוקף","couponMinOrder":"סכום הזמנה מינימלי","alreadyHaveAccount":"כבר יש לך חשבון?","loginHere":"התחבר כאן","loggedInAs":"מחובר כ:","logout":"התנתק","haveCouponCode":"יש לי קוד קופון","agreeToTerms":"אני מסכים/ה ל","termsAndConditions":"תנאי השימוש","pleaseAcceptTerms":"נא לאשר את תנאי השימוש","nameRequired":"נא להזין שם מלא","emailRequired":"נא להזין כתובת אימייל","emailInvalid":"כתובת אימייל לא תקינה","phoneRequired":"נא להזין מספר טלפון","shippingRequired":"נא לבחור שיטת משלוח","streetRequired":"נא להזין רחוב ומספר","cityRequired":"נא להזין עיר","cartEmpty":"העגלה ריקה","paymentNotConfigured":"תשלום מקוון לא מוגדר","orderSuccess":"ההזמנה התקבלה!","thankYouOrder":"תודה על ההזמנה","orderNumber":"מספר הזמנה","orderConfirmation":"אישור הזמנה נשלח לאימייל שלך","orderProcessing":"ההזמנה שלך בטיפול. נעדכן אותך כשהמשלוח יצא לדרך.","continueShopping":"להמשך קניות","orderDetails":"פרטי ההזמנה","loadingOrder":"טוען פרטי הזמנה...","orderNotFound":"לא נמצאה הזמנה","orderItems":"פריטים בהזמנה","paidAmount":"סכום ששולם","myAccount":"החשבון שלי","accountWelcome":"ברוך הבא","yourOrders":"ההזמנות שלך","noOrders":"אין עדיין הזמנות","orderDate":"תאריך","orderStatus":"סטטוס","orderTotal":"סה\"כ","viewOrder":"צפה בהזמנה","statusPending":"ממתין לתשלום","statusPaid":"שולם","statusProcessing":"בטיפול","statusShipped":"נשלח","statusDelivered":"נמסר","statusCancelled":"בוטל","notLoggedIn":"לא מחובר","pleaseLogin":"יש להתחבר כדי לצפות בחשבון","personalDetails":"פרטים אישיים","editProfile":"עריכת פרופיל","name":"שם","saveChanges":"שמור שינויים","cancel":"ביטול","addresses":"כתובות","addAddress":"הוסף כתובת","editAddress":"ערוך כתובת","deleteAddress":"מחק כתובת","setAsDefault":"הגדר כברירת מחדל","defaultAddress":"כתובת ברירת מחדל","addressLabel":"שם הכתובת","work":"עבודה","other":"אחר","noAddresses":"אין כתובות שמורות","confirmDelete":"האם אתה בטוח שברצונך למחוק?","profileUpdated":"הפרופיל עודכן בהצלחה","addressSaved":"הכתובת נשמרה בהצלחה","addressDeleted":"הכתובת נמחקה","saving":"שומר...","selectVariant":"בחר אפשרות","variantUnavailable":"לא זמין","color":"צבע","size":"מידה","material":"חומר","style":"סגנון","weight":"משקל","capacity":"קיבולת","length":"אורך","inquiryAbout":"פנייה בנושא","sendInquiry":"שלח פנייה","callNow":"התקשר עכשיו","specifications":"מפרט טכני","businessPhone":"[business_phone]","businessEmail":"[business_email]"};
  
  // Get slug from URL - check both pathname and query parameter (preview mode)
  let pagePath = window.location.pathname;
  const urlParams = new URLSearchParams(window.location.search);
  const pageParam = urlParams.get('page');
  if (pageParam) {
    pagePath = pageParam;
  }
  
  // Extract slug from path like /category/slug-name
  const pathParts = pagePath.split('/');
  const slug = pathParts[pathParts.length - 1];
  
  if (!slug || slug === 'category') {
    showCategoryNotFound(categorySection, t);
    return;
  }
  
  console.log('Loading category with slug:', slug);
  
  try {
    // Prefer the dedicated category endpoint (includes products), but fall back to:
    // 1) GET /storefront/categories and match by slug/id
    // 2) GET /storefront/products?categoryId=...
    // This makes deployed sites work even if the API server is older and lacks /categories/:slug.
    let category = null;

    try {
      const res = await fetch(buildApiUrlWithLang('/api/ecommerce/storefront/categories/' + encodeURIComponent(slug) + '?websiteId=' + websiteId));
      if (res && res.ok) {
        const data = await res.json();
        if (data && data.success && data.data) {
          category = data.data;
        }
      }
    } catch (e1) {
      // ignore - will fall back
    }

    if (!category) {
      const listRes = await fetch(buildApiUrlWithLang('/api/ecommerce/storefront/categories?websiteId=' + websiteId));
      if (!listRes || !listRes.ok) {
        showCategoryNotFound(categorySection, t);
        return;
      }
      const listData = await listRes.json();
      const categories = (listData && listData.success && Array.isArray(listData.data)) ? listData.data : [];
      category = categories.find(function(c) {
        return c && (c.slug === slug || c.id === slug);
      }) || null;

      if (!category) {
        showCategoryNotFound(categorySection, t);
        return;
      }

      // Fetch products for this category
      try {
        const prodRes = await fetch(buildApiUrlWithLang('/api/ecommerce/storefront/products?websiteId=' + websiteId + '&categoryId=' + encodeURIComponent(category.id)));
        if (prodRes && prodRes.ok) {
          const prodData = await prodRes.json();
          const products = (prodData && prodData.success && Array.isArray(prodData.data)) ? prodData.data : [];
          category = { ...category, products };
        }
      } catch (e2) {
        category = { ...category, products: [] };
      }
    }

    renderCategoryPage(categorySection, category, t);
    
    // Update page title and meta
    document.title = category.name + ' - ' + (document.title.split(' - ').pop() || '');
    
  } catch (e) {
    console.error('Failed to load category', e);
    showCategoryNotFound(categorySection, t);
  }
}

function showCategoryNotFound(container, t) {
  container.innerHTML = `
    <div class="category-not-found">
      <h2>${t.categoryNotFound || 'Category not found'}</h2>
      <a href="/products" class="btn btn-primary">${t.backToProducts}</a>
    </div>
  `;
}

function renderCategoryPage(container, category, t) {
  const headerContainer = document.getElementById('category-header');
  const productGrid = document.getElementById('zappy-category-products');
  
  // Render category header
  if (headerContainer) {
    const categoryImage = category.image ? '<div class="category-banner" style="background-image: url(\'' + resolveProductImageUrl(category.image) + '\')"></div>' : '';
    headerContainer.innerHTML = categoryImage + '<div class="category-info"><h1>' + category.name + '</h1>' + 
      (category.description ? '<p class="category-description">' + category.description + '</p>' : '') + 
      '</div>';
  }
  
  // Store category products for filtering
  const categoryProducts = category.products || [];
  
  // Render products in this category
  if (productGrid) {
    if (categoryProducts.length === 0) {
      productGrid.innerHTML = '<div class="no-products">' + (t.noProducts || 'No products in this category yet.') + '</div>';
    } else {
      renderProductGrid(productGrid, categoryProducts, t, false);
    }
  }
  
  // Setup filter buttons for category products (same as products page)
  const filterBtns = container.querySelectorAll('.filter-btn');
  filterBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      // Update active state
      filterBtns.forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      
      const filterType = btn.getAttribute('data-category');
      let filteredProducts = categoryProducts;
      
      if (filterType === 'featured') {
        filteredProducts = categoryProducts.filter(function(p) { return p.is_featured; });
      } else if (filterType === 'new') {
        filteredProducts = categoryProducts.filter(function(p) { 
          return p.tags && p.tags.some(function(tag) { 
            return tag.toLowerCase() === 'new' || tag.toLowerCase() === 'חדש'; 
          }); 
        });
      } else if (filterType === 'sale') {
        filteredProducts = categoryProducts.filter(function(p) { 
          return (p.sale_price && parseFloat(p.sale_price) < parseFloat(p.price)) ||
                 (p.tags && p.tags.some(function(tag) { 
                   return tag.toLowerCase() === 'sale' || tag.toLowerCase() === 'מבצע'; 
                 }));
        });
      }
      // 'all' shows all products
      
      if (productGrid) {
        if (filteredProducts.length === 0) {
          productGrid.innerHTML = '<div class="no-products">' + (t.noProducts || 'No products found.') + '</div>';
        } else {
          renderProductGrid(productGrid, filteredProducts, t, false);
        }
      }
    });
  });
}

function showProductNotFound(container, t) {
  container.innerHTML = `
    <div class="product-not-found">
      <h2>${t.productNotFound}</h2>
      <a href="/products" class="btn btn-primary">${t.backToProducts}</a>
    </div>
  `;
}

function renderProductDetail(container, product, t) {
  // Ensure image paths work in preview + live
  const images = (product.images || []).map(function(img) {
    if (window.resolveProductImageUrl) {
      return window.resolveProductImageUrl(img);
    }
    return img;
  }).filter(Boolean);
  const mainImage = images[0] || '';
  const hasMultipleImages = images.length > 1;
  const baseInStock = product.stock_status !== 'out_of_stock';
  const hasSalePrice = product.sale_price && parseFloat(product.sale_price) < parseFloat(product.price);
  const basePrice = hasSalePrice ? parseFloat(product.sale_price) : parseFloat(product.price);
  const originalPrice = parseFloat(product.price);
  // Check if price should be displayed (default to true if not set)
  const showPrice = product.custom_fields?.showPrice !== false;
  
  // Check if product has variants
  const variants = product.variants || [];
  const hasVariants = variants.length > 0;
  const activeVariants = variants.filter(variant => variant.is_active !== false);
  const variantPrices = activeVariants
    .map(variant => {
      if (variant.price !== null && variant.price !== undefined) {
        return parseFloat(variant.price);
      }
      return basePrice;
    })
    .filter(price => Number.isFinite(price));
  const uniqueVariantPrices = Array.from(new Set(variantPrices));
  const hasVariantPriceRange = activeVariants.length > 1 && uniqueVariantPrices.length > 1;
  const minVariantPrice = hasVariantPriceRange ? Math.min(...uniqueVariantPrices) : null;
  const startingAtLabel = getEcomText('startingAt', t.startingAt || 'Starting at');
  
  // Build variant selector HTML if product has variants
  let variantSelectorHtml = '';
  if (hasVariants) {
    // Group variants by attribute type to create selection options
    const attributeGroups = {};
    variants.forEach(variant => {
      if (variant.attributes && variant.is_active !== false) {
        Object.entries(variant.attributes).forEach(([key, value]) => {
          if (!attributeGroups[key]) {
            attributeGroups[key] = new Set();
          }
          attributeGroups[key].add(value);
        });
      }
    });
    
    // Attribute label translations
    const attrLabels = {
      color: t.color || 'Color',
      size: t.size || 'Size',
      material: t.material || 'Material',
      style: t.style || 'Style',
      weight: t.weight || 'Weight',
      capacity: t.capacity || 'Capacity',
      length: t.length || 'Length'
    };
    
    const hasAttributeGroups = Object.keys(attributeGroups).length > 0;
    
    // Build variant groups HTML
    const groupsHtml = hasAttributeGroups
      ? Object.entries(attributeGroups).map(([attrKey, values]) => {
        const label = attrLabels[attrKey.toLowerCase()] || attrKey.charAt(0).toUpperCase() + attrKey.slice(1);
        const valuesArray = Array.from(values);
        const isColorAttr = attrKey.toLowerCase() === 'color';
        
        const optionsHtml = valuesArray.map(value => {
          // For color attribute, try to use color as background
          if (isColorAttr) {
            // Use CSS color names directly - they work for common colors like red, blue, green, etc.
            // For hex values or custom colors, pass through directly
            var bgColor = value;
            // Check if it looks like a hex color
            if (!/^#[0-9A-Fa-f]{3,6}$/.test(value)) {
              // Not a hex, use as CSS color name (works for red, blue, green, black, white, etc.)
              bgColor = value.toLowerCase();
            }
            return '<button type="button" class="variant-option color-swatch" data-attr="' + attrKey + '" data-value="' + value + '" style="background-color: ' + bgColor + ';" title="' + value + '"></button>';
          }
          return '<button type="button" class="variant-option" data-attr="' + attrKey + '" data-value="' + value + '">' + value + '</button>';
        }).join('');
        
        return '<div class="variant-group" data-group="' + attrKey + '"><label class="variant-group-label">' + label + ':</label><div class="variant-options">' + optionsHtml + '</div></div>';
      }).join('')
      : (() => {
        const label = t.selectVariant || 'Select option';
        const optionsHtml = activeVariants.map(variant => {
          const variantLabel = variant.name || variant.sku || label;
          return '<button type="button" class="variant-option" data-attr="variant" data-value="' + variant.id + '" data-variant-id="' + variant.id + '">' + variantLabel + '</button>';
        }).join('');
        return '<div class="variant-group" data-group="variant"><label class="variant-group-label">' + label + ':</label><div class="variant-options">' + optionsHtml + '</div></div>';
      })();
    
    variantSelectorHtml = '<div class="product-variants" id="product-variants">' + groupsHtml + '</div>';
  }
  
  // Build breadcrumb
  var breadcrumbHtml = '<nav class="product-breadcrumb">';
  breadcrumbHtml += '<a href="/">' + t.home + '</a>';
  breadcrumbHtml += '<span class="breadcrumb-separator">›</span>';
  breadcrumbHtml += '<a href="/products">' + t.products + '</a>';
  if (product.category_name) {
    breadcrumbHtml += '<span class="breadcrumb-separator">›</span>';
    if (product.category_id) {
      breadcrumbHtml += '<a href="/products?category=' + product.category_id + '">' + product.category_name + '</a>';
    } else {
      breadcrumbHtml += '<span class="breadcrumb-current">' + product.category_name + '</span>';
    }
  }
  breadcrumbHtml += '<span class="breadcrumb-separator">›</span>';
  breadcrumbHtml += '<span class="breadcrumb-current">' + product.name + '</span>';
  breadcrumbHtml += '</nav>';
  
  container.innerHTML = `
    ${breadcrumbHtml}
    <div class="product-detail-container">
      <div class="product-gallery">
        ${mainImage 
          ? '<img src="' + mainImage + '" alt="' + product.name + '" class="product-gallery-main" id="product-main-image">'
          : '<div class="product-gallery-main" style="display:flex;align-items:center;justify-content:center;color:#999;font-size:64px;">📦</div>'
        }
        ${hasMultipleImages ? `
          <div class="product-gallery-thumbs">
            ${images.map((img, i) => `
              <img src="${img}" alt="${product.name}" class="product-gallery-thumb ${i === 0 ? 'active' : ''}" onclick="changeMainImage(this, '${img}')" />
            `).join('')}
          </div>
        ` : ''}
      </div>
      <div class="product-info">
        <h1>${product.name}</h1>
        ${showPrice ? `
        <div class="product-price" id="product-price-display">
          ${hasVariantPriceRange
            ? startingAtLabel + ' ' + t.currency + minVariantPrice.toFixed(2)
            : (hasSalePrice 
              ? t.currency + product.sale_price + ' <span class="original-price">' + t.currency + product.price + '</span>'
              : t.currency + product.price)
          }${(() => {
            const unit = product.quantity_unit || 'piece';
            if (unit !== 'piece') {
              const step = parseFloat(product.quantity_step) || 1;
              const unitLabel = product.custom_unit_label || (t.unitLabels && t.unitLabels[unit]) || unit;
              const stepPrefix = step !== 1 ? step + ' ' : '';
              return ' <span class="price-per-unit">' + t.perUnit + ' ' + stepPrefix + unitLabel + '</span>';
            }
            return '';
          })()}
        </div>
        ${(() => {
          if (!product.show_price_per_unit) return '';
          const unit = product.quantity_unit || 'piece';
          // Use variant min price when the detail page shows "Starting at" pricing
          const effectivePrice = hasVariantPriceRange
            ? minVariantPrice
            : (product.sale_price && parseFloat(product.sale_price) < parseFloat(product.price) ? parseFloat(product.sale_price) : parseFloat(product.price));
          if (!effectivePrice) return '';
          let refAmount, refLabel, pricePerRef;
          if (unit === 'piece') {
            // Piece-based: use piece_unit_type and piece_unit_value
            const pieceUnit = product.piece_unit_type;
            const pieceValue = parseFloat(product.piece_unit_value);
            if (!pieceUnit || !pieceValue) return '';
            if (pieceUnit === 'gram') { refAmount = 100; refLabel = '100' + ((t.unitLabels && t.unitLabels.gram) || 'g'); }
            else if (pieceUnit === 'ml') { refAmount = 100; refLabel = '100' + ((t.unitLabels && t.unitLabels.ml) || 'ml'); }
            else if (pieceUnit === 'kg') { refAmount = 1; refLabel = (t.unitLabels && t.unitLabels.kg) || 'kg'; }
            else if (pieceUnit === 'liter') { refAmount = 1; refLabel = (t.unitLabels && t.unitLabels.liter) || 'L'; }
            else return '';
            pricePerRef = (effectivePrice / pieceValue) * refAmount;
          } else {
            const step = parseFloat(product.quantity_step) || 1;
            if (!step) return '';
            if (unit === 'gram') { refAmount = 100; refLabel = '100' + ((t.unitLabels && t.unitLabels.gram) || 'g'); }
            else if (unit === 'ml') { refAmount = 100; refLabel = '100' + ((t.unitLabels && t.unitLabels.ml) || 'ml'); }
            else if (unit === 'kg') { refAmount = 1; refLabel = (t.unitLabels && t.unitLabels.kg) || 'kg'; }
            else if (unit === 'liter') { refAmount = 1; refLabel = (t.unitLabels && t.unitLabels.liter) || 'L'; }
            else if (unit === 'custom') { refAmount = 1; refLabel = product.custom_unit_label || ''; }
            else return '';
            pricePerRef = (effectivePrice / step) * refAmount;
          }
          return '<div class="price-per-unit-info" id="product-price-per-unit">' + t.currency + pricePerRef.toFixed(2) + ' / ' + refLabel + '</div>';
        })()}
        ` : ''}
        ${product.sku ? '<div class="product-sku" id="product-sku-display">' + t.sku + ': ' + product.sku + '</div>' : ''}
        <div class="product-stock ${baseInStock ? 'in-stock' : 'out-of-stock'}" id="product-stock-display">
          ${baseInStock 
            ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>' + t.inStock
            : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>' + t.outOfStock
          }
        </div>
        ${variantSelectorHtml}
        ${(() => {
          if (isCatalogMode) return '';
          const qStep = parseFloat(product.quantity_step) || 1;
          const qUnit = product.quantity_unit || 'piece';
          const unitLabel = qUnit !== 'piece' ? (' (' + (product.custom_unit_label || (t.unitLabels && t.unitLabels[qUnit]) || qUnit) + ')') : '';
          return '<div class="product-quantity">' +
            '<label>' + t.quantity + unitLabel + ':</label>' +
            '<div class="quantity-selector">' +
              '<button type="button" onclick="adjustQuantity(-1)">−</button>' +
              '<input type="number" id="product-quantity" value="' + qStep + '" min="' + qStep + '" max="9999" step="' + qStep + '" data-unit="' + qUnit + '" data-step="' + qStep + '">' +
              '<button type="button" onclick="adjustQuantity(1)">+</button>' +
            '</div>' +
          '</div>';
        })()}
        <div class="product-actions ${isCatalogMode ? 'catalog-mode' : ''}">
          ${isCatalogMode ? `
            <a href="mailto:${encodeURIComponent(t.businessEmail)}?subject=${encodeURIComponent(t.inquiryAbout + ' ' + product.name)}" class="btn btn-primary inquiry-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              ${t.sendInquiry}
            </a>
            <a href="tel:${t.businessPhone.replace(/[\s\-()]/g, '')}" class="btn btn-secondary call-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              ${t.callNow}
            </a>
          ` : `
          <button class="add-to-cart" id="add-to-cart-btn" onclick="addProductToCart()" ${!baseInStock ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>
            ${t.addToCart}
          </button>
          `}
        </div>
        ${product.description ? '<div class="product-description">' + product.description + '</div>' : ''}
        ${(product.custom_fields?.specifications?.length > 0) ? `
        <div class="product-specifications">
          <h3>${t.specifications}</h3>
          <table class="specs-table">
            ${product.custom_fields.specifications.map(spec => `
              <tr>
                <th>${spec.key}</th>
                <td>${spec.value}</td>
              </tr>
            `).join('')}
          </table>
        </div>
        ` : ''}
      </div>
    </div>
  `;
  
  // Store product data for add to cart
  window.currentProduct = product;
  window.selectedVariant = null;
  window.productBasePrice = basePrice;
  window.productOriginalPrice = originalPrice;
  window.productHasSalePrice = hasSalePrice;
  window.productHasVariantPriceRange = hasVariantPriceRange;
  window.productVariantMinPrice = minVariantPrice;
  window.productShowPricePerUnit = product.show_price_per_unit;
  window.productTranslations = t;
  
  // Initialize variant selection if product has variants
  if (hasVariants) {
    initVariantSelection(product, t);
  }
}

function changeMainImage(thumb, src) {
  const mainImg = document.getElementById('product-main-image');
  if (mainImg) mainImg.src = src;
  
  // Update active thumb
  document.querySelectorAll('.product-gallery-thumb').forEach(t => t.classList.remove('active'));
  thumb.classList.add('active');
}

function adjustQuantity(delta) {
  const input = document.getElementById('product-quantity');
  if (!input) return;
  const step = parseFloat(input.dataset.step) || 1;
  const minVal = step;
  const current = parseFloat(input.value) || step;
  const newVal = Math.max(minVal, Math.min(9999, current + delta * step));
  // Round to avoid floating point issues
  const decimals = (step.toString().split('.')[1] || '').length;
  input.value = parseFloat(newVal.toFixed(decimals));
}

// Initialize variant selection functionality
function initVariantSelection(product, t) {
  const variants = product.variants || [];
  let selectedAttributes = {};
  
  // Get all variant option buttons
  const variantButtons = document.querySelectorAll('.variant-option');
  
  // Function to check if a specific attribute value is available given a single other selection
  function isOptionAvailableWith(attrKey, attrValue, otherAttrKey, otherAttrValue) {
    return variants.some(variant => {
      if (!variant.attributes || variant.is_active === false) return false;
      return variant.attributes[attrKey] === attrValue && 
             variant.attributes[otherAttrKey] === otherAttrValue;
    });
  }
  
  // Function to get all attribute keys
  function getAttributeKeys() {
    const keys = new Set();
    variantButtons.forEach(btn => keys.add(btn.getAttribute('data-attr')));
    return Array.from(keys);
  }
  
  // Function to update available options - only disable based on the LAST selected attribute
  function updateAvailableOptions(lastSelectedKey) {
    if (!lastSelectedKey || !selectedAttributes[lastSelectedKey]) {
      // No selection yet, enable all
      variantButtons.forEach(btn => {
        btn.classList.remove('disabled');
        btn.disabled = false;
      });
      return;
    }
    
    const lastSelectedValue = selectedAttributes[lastSelectedKey];
    
    variantButtons.forEach(btn => {
      const attrKey = btn.getAttribute('data-attr');
      const attrValue = btn.getAttribute('data-value');
      
      // Don't disable options in the same attribute group as the last selection
      if (attrKey === lastSelectedKey) {
        btn.classList.remove('disabled');
        btn.disabled = false;
        return;
      }
      
      // Check if this option is available with the last selection
      const isAvailable = isOptionAvailableWith(attrKey, attrValue, lastSelectedKey, lastSelectedValue);
      
      if (isAvailable) {
        btn.classList.remove('disabled');
        btn.disabled = false;
      } else {
        btn.classList.add('disabled');
        btn.disabled = true;
      }
    });
  }
  
  variantButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const variantId = this.getAttribute('data-variant-id');
      const attrKey = this.getAttribute('data-attr');
      const attrValue = this.getAttribute('data-value');
      
      if (variantId) {
        // Simple variant selection (no attributes)
        variantButtons.forEach(b => b.classList.remove('selected'));
        this.classList.add('selected');
        const matchedVariant = variants.find(variant => variant.id === variantId);
        updateVariantUI(matchedVariant || null, product, t, {});
        return;
      }
      
      // If clicking a disabled option, clear other selections first
      if (this.disabled || this.classList.contains('disabled')) {
        // Clear all selections except this attribute group
        const attrKeys = getAttributeKeys();
        attrKeys.forEach(key => {
          if (key !== attrKey) {
            delete selectedAttributes[key];
            document.querySelectorAll('.variant-option[data-attr="' + key + '"]').forEach(b => {
              b.classList.remove('selected');
            });
          }
        });
      }
      
      // Toggle selection within the same attribute group
      const groupButtons = document.querySelectorAll('.variant-option[data-attr="' + attrKey + '"]');
      groupButtons.forEach(b => b.classList.remove('selected'));
      this.classList.add('selected');
      
      // Update selected attributes
      selectedAttributes[attrKey] = attrValue;
      
      // Update which options are available based on this selection
      updateAvailableOptions(attrKey);
      
      // Find matching variant
      const matchedVariant = findMatchingVariant(variants, selectedAttributes);
      
      // Update UI based on selection
      updateVariantUI(matchedVariant, product, t, selectedAttributes);
    });
  });
}

// Find variant that matches all selected attributes
function findMatchingVariant(variants, selectedAttributes) {
  const selectedKeys = Object.keys(selectedAttributes);
  if (selectedKeys.length === 0) return null;
  
  return variants.find(variant => {
    if (!variant.attributes || variant.is_active === false) return false;
    
    // Check if variant matches all selected attributes
    return selectedKeys.every(key => {
      return variant.attributes[key] === selectedAttributes[key];
    });
  });
}

// Recompute and update the price-per-unit info element on the detail page
function updatePricePerUnitDisplay(effectivePrice, product, t) {
  const perUnitEl = document.getElementById('product-price-per-unit');
  if (!perUnitEl || !window.productShowPricePerUnit) return;
  if (!effectivePrice) { perUnitEl.textContent = ''; return; }
  
  const unit = product.quantity_unit || 'piece';
  let refAmount, refLabel, pricePerRef;
  
  if (unit === 'piece') {
    const pieceUnit = product.piece_unit_type;
    const pieceValue = parseFloat(product.piece_unit_value);
    if (!pieceUnit || !pieceValue) { perUnitEl.textContent = ''; return; }
    if (pieceUnit === 'gram') { refAmount = 100; refLabel = '100' + ((t.unitLabels && t.unitLabels.gram) || 'g'); }
    else if (pieceUnit === 'ml') { refAmount = 100; refLabel = '100' + ((t.unitLabels && t.unitLabels.ml) || 'ml'); }
    else if (pieceUnit === 'kg') { refAmount = 1; refLabel = (t.unitLabels && t.unitLabels.kg) || 'kg'; }
    else if (pieceUnit === 'liter') { refAmount = 1; refLabel = (t.unitLabels && t.unitLabels.liter) || 'L'; }
    else { perUnitEl.textContent = ''; return; }
    pricePerRef = (effectivePrice / pieceValue) * refAmount;
  } else {
    const step = parseFloat(product.quantity_step) || 1;
    if (!step) { perUnitEl.textContent = ''; return; }
    if (unit === 'gram') { refAmount = 100; refLabel = '100' + ((t.unitLabels && t.unitLabels.gram) || 'g'); }
    else if (unit === 'ml') { refAmount = 100; refLabel = '100' + ((t.unitLabels && t.unitLabels.ml) || 'ml'); }
    else if (unit === 'kg') { refAmount = 1; refLabel = (t.unitLabels && t.unitLabels.kg) || 'kg'; }
    else if (unit === 'liter') { refAmount = 1; refLabel = (t.unitLabels && t.unitLabels.liter) || 'L'; }
    else if (unit === 'custom') { refAmount = 1; refLabel = product.custom_unit_label || ''; }
    else { perUnitEl.textContent = ''; return; }
    pricePerRef = (effectivePrice / step) * refAmount;
  }
  
  perUnitEl.textContent = t.currency + pricePerRef.toFixed(2) + ' / ' + refLabel;
}

// Update UI when variant selection changes
function updateVariantUI(variant, product, t, selectedAttributes) {
  const priceDisplay = document.getElementById('product-price-display');
  const stockDisplay = document.getElementById('product-stock-display');
  const skuDisplay = document.getElementById('product-sku-display');
  const addToCartBtn = document.getElementById('add-to-cart-btn');
  
  const basePrice = window.productBasePrice;
  const originalPrice = window.productOriginalPrice;
  const hasSalePrice = window.productHasSalePrice;
  const hasVariantPriceRange = window.productHasVariantPriceRange;
  const variantMinPrice = window.productVariantMinPrice;
  const startingAtLabel = getEcomText('startingAt', t.startingAt || 'Starting at');
  
  if (variant) {
    // Use variant's own price if set, otherwise fall back to base price
    const variantPrice = variant.price ? parseFloat(variant.price) : null;
    const finalPrice = variantPrice !== null ? variantPrice : basePrice;
    
    if (priceDisplay) {
      // If variant has its own price, don't show original/sale price comparison
      if (variantPrice !== null) {
        priceDisplay.textContent = t.currency + finalPrice.toFixed(2);
      } else if (hasSalePrice) {
        priceDisplay.innerHTML = t.currency + finalPrice.toFixed(2) + ' <span class="original-price">' + t.currency + originalPrice.toFixed(2) + '</span>';
      } else {
        priceDisplay.textContent = t.currency + finalPrice.toFixed(2);
      }
    }
    
    // Update price-per-unit info to match the variant's effective price
    updatePricePerUnitDisplay(finalPrice, product, t);
    
    // Update stock status
    const variantInStock = variant.stock_status !== 'out_of_stock';
    if (stockDisplay) {
      stockDisplay.className = 'product-stock ' + (variantInStock ? 'in-stock' : 'out-of-stock');
      stockDisplay.innerHTML = variantInStock 
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>' + t.inStock
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>' + t.outOfStock;
    }
    
    // Update SKU if variant has one
    if (skuDisplay && variant.sku) {
      skuDisplay.textContent = t.sku + ': ' + variant.sku;
    }
    
    // Update add to cart button
    if (addToCartBtn) {
      addToCartBtn.disabled = !variantInStock;
      addToCartBtn.style.opacity = variantInStock ? '1' : '0.5';
      addToCartBtn.style.cursor = variantInStock ? 'pointer' : 'not-allowed';
    }
    
    // Store selected variant
    window.selectedVariant = variant;
  } else {
    // No matching variant found - show base product info
    if (priceDisplay) {
      if (hasVariantPriceRange && Number.isFinite(variantMinPrice)) {
        priceDisplay.textContent = startingAtLabel + ' ' + t.currency + variantMinPrice.toFixed(2);
      } else if (hasSalePrice) {
        priceDisplay.innerHTML = t.currency + basePrice.toFixed(2) + ' <span class="original-price">' + t.currency + originalPrice.toFixed(2) + '</span>';
      } else {
        priceDisplay.textContent = t.currency + basePrice.toFixed(2);
      }
    }
    
    // Reset price-per-unit to match the base display price
    var resetPrice = hasVariantPriceRange && Number.isFinite(variantMinPrice) ? variantMinPrice : basePrice;
    updatePricePerUnitDisplay(resetPrice, product, t);
    
    // Reset to base product stock
    const baseInStock = product.stock_status !== 'out_of_stock';
    if (stockDisplay) {
      stockDisplay.className = 'product-stock ' + (baseInStock ? 'in-stock' : 'out-of-stock');
      stockDisplay.innerHTML = baseInStock 
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>' + t.inStock
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>' + t.outOfStock;
    }
    
    if (addToCartBtn) {
      addToCartBtn.disabled = !baseInStock;
      addToCartBtn.style.opacity = baseInStock ? '1' : '0.5';
      addToCartBtn.style.cursor = baseInStock ? 'pointer' : 'not-allowed';
    }
    
    window.selectedVariant = null;
  }
}

function addProductToCart() {
  const product = window.currentProduct;
  if (!product) return;
  
  const qtyInput = document.getElementById('product-quantity');
  const quantity = parseFloat(qtyInput?.value || 1);
  const selectedVariant = window.selectedVariant;
  
  // Get quantity unit info from the product
  const quantityUnit = product.quantity_unit || 'piece';
  const quantityStep = parseFloat(product.quantity_step) || 1;
  const customUnitLabel = product.custom_unit_label || null;
  
  // Create cart item with variant info if selected
  const cartItem = {
    ...product,
    quantity: quantity,
    quantityUnit: quantityUnit,
    quantityStep: quantityStep,
    customUnitLabel: customUnitLabel
  };
  
  if (selectedVariant) {
    // Use variant's own price if set, otherwise use base price
    const basePrice = window.productBasePrice;
    const variantPrice = selectedVariant.price ? parseFloat(selectedVariant.price) : null;
    const finalPrice = variantPrice !== null ? variantPrice : basePrice;
    
    // Add variant info to cart item
    cartItem.selectedVariant = {
      id: selectedVariant.id,
      name: selectedVariant.name,
      sku: selectedVariant.sku,
      attributes: selectedVariant.attributes,
      price: variantPrice
    };
    cartItem.variantName = selectedVariant.name;
    cartItem.displayPrice = finalPrice;
    // Override price for cart calculations
    cartItem.price = finalPrice.toString();
    cartItem.sale_price = null; // Clear sale price when variant has its own price
    // Use variant SKU if available
    if (selectedVariant.sku) {
      cartItem.variantSku = selectedVariant.sku;
    }
  }
  
  // Add to cart (addToCart handles merging with existing items)
  window.zappyAddToCart(cartItem);
}

async function loadRelatedProducts(currentProduct, t) {
  const section = document.getElementById('related-products-section');
  const grid = document.getElementById('related-products-grid');
  if (!section || !grid) return;
  
  const websiteId = window.ZAPPY_WEBSITE_ID;
  try {
    // Fetch products from same category or random products, with language support
    let url = buildApiUrlWithLang('/api/ecommerce/storefront/products?websiteId=' + websiteId + '&limit=4');
    if (currentProduct.category_id) {
      url += '&categoryId=' + currentProduct.category_id;
    }
    
    const res = await fetch(url);
    const data = await res.json();
    
    if (!data.success || !data.data?.length) return;
    
    // Filter out current product and limit to 4
    const related = data.data.filter(p => p.id !== currentProduct.id).slice(0, 4);
    if (related.length === 0) return;
    
    renderProductGrid(grid, related, t);
    section.style.display = 'block';
  } catch (e) {
    console.error('Failed to load related products', e);
  }
}
/* ==ZAPPY E-COMMERCE JS END== */

/* Cookie Consent */

// Helper function to check cookie consent
function hasConsentFor(category) {
  if (typeof window.CookieConsent === 'undefined') {
    return false; // Default to no consent if cookie consent not loaded
  }
  
  return window.CookieConsent.validConsent(category);
}

// Helper function to execute code only with consent
function withConsent(category, callback) {
  if (hasConsentFor(category)) {
    callback();
  } else {
    console.log(`[WARNING] Skipping ${category} code - no user consent`);
  }
}

// Cookie Consent Initialization

(function() {
  'use strict';
  
  let initAttempts = 0;
  const maxAttempts = 50; // 5 seconds max wait
  
  // Wait for DOM and vanilla-cookieconsent to be ready
  function initCookieConsent() {
    initAttempts++;
    
    
    if (typeof window.CookieConsent === 'undefined') {
      if (initAttempts < maxAttempts) {
        setTimeout(initCookieConsent, 100);
      } else {
      }
      return;
    }

    const cc = window.CookieConsent;
    
    
    // Initialize cookie consent
    try {
      cc.run({
  "autoShow": true,
  "mode": "opt-in",
  "revision": 0,
  "categories": {
    "necessary": {
      "enabled": true,
      "readOnly": true
    },
    "analytics": {
      "enabled": false,
      "readOnly": false,
      "autoClear": {
        "cookies": [
          {
            "name": "_ga"
          },
          {
            "name": "_ga_*"
          },
          {
            "name": "_gid"
          },
          {
            "name": "_gat"
          }
        ]
      }
    },
    "marketing": {
      "enabled": false,
      "readOnly": false,
      "autoClear": {
        "cookies": [
          {
            "name": "_fbp"
          },
          {
            "name": "_fbc"
          },
          {
            "name": "fr"
          }
        ]
      }
    }
  },
  "language": {
    "default": "he",
    "translations": {
      "he": {
        "consentModal": {
          "title": "אנחנו משתמשים בעוגיות 🍪",
          "description": "Kolen משתמש בעוגיות כדי לשפר את החוויה שלך, לנתח שימוש באתר ולסייע במאמצי השיווק שלנו.",
          "acceptAllBtn": "אשר הכל",
          "acceptNecessaryBtn": "רק הכרחי",
          "showPreferencesBtn": "נהל העדפות",
          "footer": "<a href=\"#privacy-policy\">מדיניות פרטיות</a> | <a href=\"#terms-conditions\">תנאי שימוש</a>"
        },
        "preferencesModal": {
          "title": "העדפות עוגיות",
          "acceptAllBtn": "אשר הכל",
          "acceptNecessaryBtn": "רק הכרחי",
          "savePreferencesBtn": "שמור העדפות",
          "closeIconLabel": "סגור",
          "sections": [
            {
              "title": "עוגיות חיוניות",
              "description": "עוגיות אלה הכרחיות לתפקוד האתר ולא ניתן להשבית אותן.",
              "linkedCategory": "necessary"
            },
            {
              "title": "עוגיות ניתוח",
              "description": "עוגיות אלה עוזרות לנו להבין איך המבקרים מתקשרים עם האתר שלנו.",
              "linkedCategory": "analytics"
            },
            {
              "title": "עוגיות שיווקיות",
              "description": "עוגיות אלה משמשות להצגת פרסומות מותאמות אישית.",
              "linkedCategory": "marketing"
            }
          ]
        }
      }
    }
  },
  "guiOptions": {
    "consentModal": {
      "layout": "box",
      "position": "bottom right",
      "equalWeightButtons": true,
      "flipButtons": false
    },
    "preferencesModal": {
      "layout": "box",
      "equalWeightButtons": true,
      "flipButtons": false
    }
  }
});
      
      // Google Consent Mode v2 integration
      // Update consent state based on accepted cookie categories
      function updateGoogleConsentMode() {
        if (typeof gtag !== 'function') {
          // Define gtag if not already defined (needed for consent updates)
          window.dataLayer = window.dataLayer || [];
          window.gtag = function(){dataLayer.push(arguments);};
        }
        
        var analyticsAccepted = cc.acceptedCategory('analytics');
        var marketingAccepted = cc.acceptedCategory('marketing');
        
        gtag('consent', 'update', {
          'analytics_storage': analyticsAccepted ? 'granted' : 'denied',
          'ad_storage': marketingAccepted ? 'granted' : 'denied',
          'ad_user_data': marketingAccepted ? 'granted' : 'denied',
          'ad_personalization': marketingAccepted ? 'granted' : 'denied'
        });
      }
      
      // Update consent on initial load (if user previously accepted)
      updateGoogleConsentMode();
      
      // Handle consent changes via onChange callback
      if (typeof cc.onChange === 'function') {
        cc.onChange(function(cookie, changed_preferences) {
          updateGoogleConsentMode();
        });
      }

      // Note: Cookie Preferences button removed per marketing guidelines
      // Footer should be clean and minimal - users can manage cookies via banner
    } catch (error) {
    }
  }

  // Initialize when DOM is ready - multiple approaches for reliability
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCookieConsent);
    // Backup timeout in case DOMContentLoaded doesn't fire
    setTimeout(initCookieConsent, 1000);
  } else if (document.readyState === 'interactive' || document.readyState === 'complete') {
    initCookieConsent();
  } else {
    // Fallback - try after a short delay
    setTimeout(initCookieConsent, 500);
  }
  
  // Additional fallback - try after page load
  if (typeof window !== 'undefined') {
    if (window.addEventListener) {
      window.addEventListener('load', initCookieConsent, { once: true });
    }
  }
})();

/* Accessibility Features */

/* Mickidum Accessibility Toolbar Initialization - Zappy Style */

window.onload = function() {
    
    try {
        window.micAccessTool = new MicAccessTool({
            buttonPosition: 'left', // Position on left side
            forceLang: 'he-IL', // Force language
            icon: {
                position: {
                    bottom: { size: 50, units: 'px' },
                    left: { size: 20, units: 'px' },
                    type: 'fixed'
                },
                backgroundColor: 'transparent', // Transparent to allow CSS styling
                color: 'transparent', // Let CSS handle coloring
                img: 'accessible',
                circular: false // Square button for consistent styling
            },
            menu: {
                dimensions: {
                    width: { size: 300, units: 'px' },
                    height: { size: 'auto', units: 'px' }
                }
            }
        });
        
    } catch (error) {
    }
    
    // Keyboard shortcut handler: ALT+A (Option+A on Mac) to toggle accessibility widget visibility (desktop only)
    document.addEventListener('keydown', function(event) {
        // Check if ALT+A is pressed (ALT on Windows/Linux, Option on Mac)
        var isAltOrOption = event.altKey;
        // Use event.code for reliable physical key detection (works regardless of Option key character output)
        var isAKey = event.code === 'KeyA' || event.keyCode === 65 || event.which === 65 || 
                      (event.key && (event.key.toLowerCase() === 'a' || event.key === 'å' || event.key === 'Å'));
        
        if (isAltOrOption && isAKey) {
            // Only work on desktop (screen width > 768px)
            if (window.innerWidth > 768) {
                event.preventDefault();
                event.stopPropagation();
                
                // Toggle visibility class on body
                var isVisible = document.body.classList.contains('accessibility-widget-visible');
                
                if (isVisible) {
                    // Hide the widget
                    document.body.classList.remove('accessibility-widget-visible');
                } else {
                    // Show the widget
                    document.body.classList.add('accessibility-widget-visible');
                    
                    // After a short delay, click the button to open the menu
                    setTimeout(function() {
                        var accessButton = document.getElementById('mic-access-tool-general-button');
                        if (accessButton) {
                            accessButton.click();
                        }
                    }, 200);
                }
            }
        }
    }, true);
};


// Zappy Contact Form API Integration (Fallback)
(function() {
    if (window.zappyContactFormLoaded) {
        console.log('📧 Zappy contact form already loaded');
        return;
    }
    window.zappyContactFormLoaded = true;

    function initContactFormIntegration() {
        console.log('📧 Zappy: Initializing contact form API integration...');

        // Find the contact form (try multiple selectors for flexibility)
        const contactForm = document.querySelector('.contact-form') || 
                           document.querySelector('form[action*="contact"]') ||
                           document.querySelector('form#contact') ||
                           document.querySelector('form#contactForm') ||
                           document.getElementById('contactForm') ||
                           document.querySelector('section.contact form') ||
                           document.querySelector('section#contact form') ||
                           document.querySelector('form');
        
        if (!contactForm) {
            console.log('⚠️ Zappy: No contact form found on page');
            return;
        }
        
        console.log('✅ Zappy: Contact form found:', contactForm.className || contactForm.id || 'unnamed form');

        // Store original submit handler if exists
        const originalOnSubmit = contactForm.onsubmit;

    // Add Zappy API integration using capture phase to run before other handlers
    contactForm.addEventListener('submit', async function(e) {
        // Get form data
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);

        // Send to Zappy backend API (don't prevent default, let other handlers run)
        try {
            console.log('📧 Zappy: Sending contact form to backend API...');
            const response = await fetch('https://api.zappy5.com/api/email/contact-form', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    websiteId: 'ffc261c4-1031-4b7b-a9bd-f8b95e9acf4f',
                    name: data.name || '',
                    email: data.email || '',
                    subject: data.subject || 'Contact Form Submission',
                    message: data.message || '',
                    phone: data.phone || null
                })
            });

            const result = await response.json();
            
            if (result.success) {
                console.log('✅ Zappy: Contact form data sent successfully to backend');
            } else {
                console.log('⚠️ Zappy: Backend returned error:', result.error);
            }
        } catch (error) {
            console.error('❌ Zappy: Failed to send to backend API:', error);
            // Don't break the existing form submission
        }
        }, true); // Use capture phase to run before other handlers

        console.log('✅ Zappy: Contact form API integration initialized');
    } // End of initContactFormIntegration
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initContactFormIntegration);
    } else {
        // DOM is already ready, initialize immediately
        initContactFormIntegration();
    }
})();


/* ZAPPY_PUBLISHED_LIGHTBOX_RUNTIME */
(function(){
  try {
    if (window.__zappyPublishedLightboxInit) return;
    window.__zappyPublishedLightboxInit = true;

    function safeText(s){ try { return String(s || '').replace(/"/g,'&quot;'); } catch(e){ return ''; } }

    function ensureOverlayForToggle(toggle){
      try {
        if (!toggle || !toggle.id) return;
        if (toggle.id.indexOf('zappy-lightbox-toggle-') !== 0) return;
        var elementId = toggle.id.replace('zappy-lightbox-toggle-','');
        var label = document.querySelector('label.zappy-lightbox-trigger[for="' + toggle.id + '"]');
        if (!label) return;

        // If toggle is inside the label (corrupted), move it before the label so the for attribute works consistently.
        try {
          if (label.contains(toggle) && label.parentNode) {
            label.parentNode.insertBefore(toggle, label);
          }
        } catch (e0) {}

        var lightboxId = 'zappy-lightbox-' + elementId;
        var lb = document.getElementById(lightboxId);
        if (lb && lb.parentNode !== document.body) {
          try { document.body.appendChild(lb); } catch (eMove) {}
        }

        if (!lb) {
          var img = null;
          try { img = label.querySelector('img'); } catch (eImg0) {}
          if (!img) {
            try { img = document.querySelector('img[data-element-id="' + elementId + '"]'); } catch (eImg1) {}
          }
          if (!img) return;

          lb = document.createElement('div');
          lb.id = lightboxId;
          lb.className = 'zappy-lightbox';
          lb.setAttribute('data-zappy-image-lightbox','true');
          lb.style.display = 'none';
          lb.innerHTML =
            '<label class="zappy-lightbox-backdrop" for="' + toggle.id + '" aria-label="Close"></label>' +
            '<div class="zappy-lightbox-content">' +
              '<label class="zappy-lightbox-close" for="' + toggle.id + '" aria-label="Close">×</label>' +
              '<img class="zappy-lightbox-image" src="' + safeText(img.currentSrc || img.src || img.getAttribute('src')) + '" alt="' + safeText(img.getAttribute('alt') || 'Image') + '">' +
            '</div>';
          document.body.appendChild(lb);
        }

        // Keep overlay image in sync at open time (in case src changed / responsive currentSrc)
        function syncOverlayImage(){
          try {
            var imgCur = label.querySelector('img');
            var imgLb = lb.querySelector('img');
            if (imgCur && imgLb) {
              imgLb.src = imgCur.currentSrc || imgCur.src || imgLb.src;
              imgLb.alt = imgCur.alt || imgLb.alt;
            }
          } catch (eSync) {}
        }

        if (!toggle.__zappyLbBound) {
          toggle.addEventListener('change', function(){
            if (toggle.checked) syncOverlayImage();
            lb.style.display = toggle.checked ? 'flex' : 'none';
          });
          toggle.__zappyLbBound = true;
        }

        if (!lb.__zappyLbBound) {
          lb.addEventListener('click', function(ev){
            try {
              var t = ev.target;
              if (!t) return;
              if (t.classList && (t.classList.contains('zappy-lightbox-backdrop') || t.classList.contains('zappy-lightbox-close'))) {
                ev.preventDefault();
                toggle.checked = false;
                lb.style.display = 'none';
              }
            } catch (e2) {}
          });
          lb.__zappyLbBound = true;
        }

        if (!label.__zappyLbClick) {
          label.addEventListener('click', function(ev){
            try {
              if (document.body && document.body.classList && document.body.classList.contains('zappy-edit-mode')) return;
              if (ev && ev.target && ev.target.closest && ev.target.closest('a[href],button,input,select,textarea')) return;
              ev.preventDefault();
              ev.stopPropagation();
              toggle.checked = true;
              syncOverlayImage();
              lb.style.display = 'flex';
            } catch (e3) {}
          }, true);
          label.__zappyLbClick = true;
        }
      } catch (e) {}
    }

    function initZappyPublishedLightboxes(){
      try {
        // Repair orphaned labels (label has for=toggleId but input is missing)
        var orphanLabels = document.querySelectorAll('label.zappy-lightbox-trigger[for^="zappy-lightbox-toggle-"]');
        for (var i=0;i<orphanLabels.length;i++){
          var lbl = orphanLabels[i];
          var forId = lbl && lbl.getAttribute ? lbl.getAttribute('for') : null;
          if (!forId) continue;
          if (!document.getElementById(forId)) {
            var t = document.createElement('input');
            t.type = 'checkbox';
            t.id = forId;
            t.className = 'zappy-lightbox-toggle';
            t.setAttribute('data-zappy-image-lightbox','true');
            if (lbl.parentNode) lbl.parentNode.insertBefore(t, lbl);
          }
        }

        var toggles = document.querySelectorAll('input.zappy-lightbox-toggle[id^="zappy-lightbox-toggle-"]');
        for (var j=0;j<toggles.length;j++){
          ensureOverlayForToggle(toggles[j]);
        }

        // Close on ESC if any lightbox is open
        if (!document.__zappyLbEscBound) {
          document.addEventListener('keydown', function(ev){
            try {
              if (!ev || ev.key !== 'Escape') return;
              var openLb = document.querySelector('.zappy-lightbox[style*="display: flex"]');
              if (openLb) {
                var openToggle = null;
                try {
                  var id = openLb.id || '';
                  if (id.indexOf('zappy-lightbox-') === 0) {
                    openToggle = document.getElementById('zappy-lightbox-toggle-' + id.replace('zappy-lightbox-',''));
                  }
                } catch (e4) {}
                if (openToggle) openToggle.checked = false;
                openLb.style.display = 'none';
              }
            } catch (e5) {}
          });
          document.__zappyLbEscBound = true;
        }
      } catch (eInit) {}
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initZappyPublishedLightboxes, { once: true });
    } else {
      initZappyPublishedLightboxes();
    }
  } catch (eOuter) {}
})();
/* END ZAPPY_PUBLISHED_LIGHTBOX_RUNTIME */


/* ZAPPY_FAQ_ACCORDION_TOGGLE */
(function(){
  try {
    if (window.__zappyFaqToggleInit) return;
    window.__zappyFaqToggleInit = true;

    function initFaqToggle() {
      // Match both exact (.faq-item) and page-prefixed (e.g. .home-faq-item) classes
      var items = document.querySelectorAll('[class*="faq-item"], .accordion-item');
      if (!items.length) return;

      items.forEach(function(item) {
        var question = item.querySelector(
          '[class*="faq-question"], [class*="faq-header"], .accordion-header, .accordion-toggle'
        );
        if (!question) return;
        if (question.__zappyFaqBound) return;
        question.__zappyFaqBound = true;

        question.addEventListener('click', function(e) {
          e.preventDefault();

          // Close sibling items in the same accordion group
          var parent = item.parentElement;
          if (parent) {
            var siblings = parent.querySelectorAll('[class*="faq-item"], .accordion-item');
            siblings.forEach(function(sib) {
              if (sib !== item && sib.classList.contains('active')) {
                sib.classList.remove('active');
                var sibQ = sib.querySelector('[class*="faq-question"], [class*="faq-header"], .accordion-header');
                if (sibQ) sibQ.setAttribute('aria-expanded', 'false');
              }
            });
          }

          // Toggle current item
          var isActive = item.classList.toggle('active');
          question.setAttribute('aria-expanded', isActive ? 'true' : 'false');
        });
      });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initFaqToggle, { once: true });
    } else {
      initFaqToggle();
    }
  } catch (e) {}
})();
/* END ZAPPY_FAQ_ACCORDION_TOGGLE */


/* ZAPPY_PUBLISHED_GRID_CENTERING */
(function(){
  try {
    if (window.__zappyGridCenteringInit) return;
    window.__zappyGridCenteringInit = true;

    function centerPartialGridRows() {
      var grids = document.querySelectorAll('[data-zappy-explicit-columns="true"], [data-zappy-auto-grid="true"]');
      for (var g = 0; g < grids.length; g++) {
        try {
          var container = grids[g];
          // Skip if already processed
          if (container.getAttribute('data-zappy-grid-centered') === 'true') continue;

          var items = [];
          for (var c = 0; c < container.children.length; c++) {
            var ch = container.children[c];
            if (!ch || !ch.tagName) continue;
            var tag = ch.tagName.toLowerCase();
            if (tag === 'script' || tag === 'style') continue;
            items.push(ch);
          }
          var totalItems = items.length;
          if (totalItems === 0) continue;

          var cs = window.getComputedStyle(container);
          if (cs.display !== 'grid') continue;
          var gtc = (cs.gridTemplateColumns || '').trim();
          if (!gtc || gtc === 'none') continue;
          var colWidths = gtc.split(' ').filter(function(v) { return v && parseFloat(v) > 0; });
          var colCount = colWidths.length;
          if (colCount <= 1) continue;

          var itemsInLastRow = totalItems % colCount;
          if (itemsInLastRow === 0) continue;

          var colWidth = parseFloat(colWidths[0]) || 0;
          var gap = parseFloat(cs.columnGap);
          if (isNaN(gap)) gap = parseFloat(cs.gap) || 0;

          var missingCols = colCount - itemsInLastRow;
          var offset = missingCols * (colWidth + gap) / 2;

          // Detect RTL
          var dir = cs.direction || 'ltr';
          var el = container;
          while (el && dir === 'ltr') {
            if (el.getAttribute && el.getAttribute('dir')) { dir = el.getAttribute('dir'); break; }
            if (el.style && el.style.direction) { dir = el.style.direction; break; }
            el = el.parentElement;
          }
          var translateValue = dir === 'rtl' ? -offset : offset;

          // Apply transform to last-row items
          // Temporarily disable CSS transitions to prevent visible animation
          // Preserve any existing transforms (e.g., scale, rotate) by composing
          var startIndex = totalItems - itemsInLastRow;
          var savedTransitions = [];
          for (var i = startIndex; i < totalItems; i++) {
            var item = items[i];
            savedTransitions.push(item.style.transition);
            item.style.transition = 'none';
            var existingTransform = item.style.transform || '';
            var newTransform = existingTransform
              ? existingTransform + ' translateX(' + translateValue + 'px)'
              : 'translateX(' + translateValue + 'px)';
            item.style.transform = newTransform;
          }

          // Force synchronous reflow so the transform is applied instantly
          void container.offsetHeight;

          // Restore original transitions
          for (var j = startIndex; j < totalItems; j++) {
            items[j].style.transition = savedTransitions[j - startIndex];
          }

          // Mark grid as processed so we don't double-apply
          container.setAttribute('data-zappy-grid-centered', 'true');
        } catch(e) {}
      }
    }

    // Run once after DOM is fully loaded (fonts, images, layout complete)
    if (document.readyState === 'complete') {
      centerPartialGridRows();
    } else {
      window.addEventListener('load', centerPartialGridRows);
    }
  } catch(e) {}
})();
