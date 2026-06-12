import './style.css'

// --- Language Data (Fallback / Static UI elements) ---
const translations = {
  tr: {
    "nav.product": "Cardiolife AED-3100",
    "nav.regulations": "Yönetmelik ve Mevzuat",
    "nav.faq": "Sıkça Sorulan Sorular",
    "nav.contact": "İletişim",
    "hero.cta": "Detaylı Bilgi",
    "product.download_btn": "Teknik Şartnameyi İndir",
    "regulations.download_reg": "Yönetmeliği İndir",
    "regulations.download_annex": "Zorunlu Yerler Listesi (EK-1)",
    "faq.title": "Sıkça Sorulan Sorular",
    "contact.title": "Bize Ulaşın",
    "contact.address": "Adres",
    "contact.phone": "Telefon",
    "contact.email": "E-Mail",
    "contact.form_title": "Bilgi Talep Formu",
    "contact.name_label": "Adınız",
    "contact.email_label": "Email",
    "contact.message_label": "Mesaj",
    "contact.send_btn": "Gönder"
  },
  en: {
    "nav.product": "Cardiolife AED-3100",
    "nav.regulations": "Regulations",
    "nav.faq": "FAQ",
    "nav.contact": "Contact",
    "hero.cta": "More Details",
    "product.download_btn": "Download Specs",
    "regulations.download_reg": "Download Regulation",
    "regulations.download_annex": "Mandatory Places List",
    "faq.title": "Frequently Asked Questions",
    "contact.title": "Contact Us",
    "contact.address": "Address",
    "contact.phone": "Phone",
    "contact.email": "E-Mail",
    "contact.form_title": "Information Request Form",
    "contact.name_label": "Your Name",
    "contact.email_label": "Email",
    "contact.message_label": "Message",
    "contact.send_btn": "Send"
  }
};

let currentLang = localStorage.getItem('lang') || 'tr';
let siteContent = null;

// Helper to safely get text based on current language
const getTxt = (textObj) => {
  if (!textObj) return "";
  if (typeof textObj === 'string') return textObj; // Backward compatibility
  return textObj[currentLang] || textObj['tr'] || ""; // Fallback to TR
};

// --- Fetch Content from API ---
async function fetchContent() {
  try {
    const response = await fetch('/api/content');
    if (response.ok) {
      siteContent = await response.json();
      renderContent();
    } else {
      console.error("Failed to fetch content, using static fallback if available");
    }
  } catch (error) {
    console.error("Error fetching content:", error);
  }
}

// --- Render Content ---
function renderContent() {
  if (!siteContent) return;

  // 1. Hero Carousel
  if (siteContent.hero) {
    const carouselContainer = document.getElementById('carousel');
    const existingSlides = carouselContainer.querySelectorAll('.carousel-slide');
    existingSlides.forEach(slide => slide.remove());

    // Insert new slides
    const prevBtn = document.getElementById('prev-btn');

    siteContent.hero.forEach((slide, index) => {
      const slideDiv = document.createElement('div');
      slideDiv.className = `carousel-slide ${index === 0 ? 'active' : ''}`;

      slideDiv.innerHTML = `
        <div class="slide-bg" style="background-image: url('${slide.image}')"></div>
        <img src="${slide.image}" alt="${getTxt(slide.title)}">
        <div class="slide-content">
          <h2 class="slide-title">${getTxt(slide.title)}</h2>
          <p class="slide-desc">${getTxt(slide.desc)}</p>
          ${index === 0 ? `<a href="#product" class="btn" data-i18n="hero.cta">${translations[currentLang]['hero.cta']}</a>` : ''}
        </div>
      `;
      carouselContainer.insertBefore(slideDiv, prevBtn);
    });
  }

  // 2. About
  if (siteContent.about) {
    const aboutMedi = document.querySelector('[data-i18n="about.medipro"]');
    if (aboutMedi) aboutMedi.textContent = getTxt(siteContent.about.medipro);

    const aboutDist = document.querySelector('[data-i18n="about.distributor"]');
    if (aboutDist) aboutDist.textContent = getTxt(siteContent.about.distributor);
  }

  // 3. Product Features
  if (siteContent.product) {
    document.querySelector('[data-i18n="product.title"]').textContent = getTxt(siteContent.product.title);
    document.querySelector('[data-i18n="product.desc"]').textContent = getTxt(siteContent.product.desc);

    const featuresGrid = document.getElementById('features-container');
    featuresGrid.innerHTML = ''; // Clear

    // Use the dynamic features array from JSON
    if (siteContent.product.features && Array.isArray(siteContent.product.features)) {
      siteContent.product.features.forEach(f => {
        const div = document.createElement('div');
        div.className = 'card';
        div.style.background = 'var(--card-bg)';
        div.style.padding = '2rem';
        div.style.borderRadius = '8px';
        div.style.boxShadow = 'var(--shadow)';

        div.innerHTML = `
          <h3 style="color: var(--primary-color); margin-bottom: 0.5rem;">${getTxt(f.title)}</h3>
          <p>${getTxt(f.desc)}</p>
        `;
        featuresGrid.appendChild(div);
      });
    }
  }

  // 4. Regulations
  if (siteContent.regulations) {
    document.querySelector('[data-i18n="regulations.title"]').textContent = getTxt(siteContent.regulations.title);
    document.querySelector('[data-i18n="regulations.desc"]').textContent = getTxt(siteContent.regulations.desc);

    const regList = document.getElementById('regulations-list');
    regList.innerHTML = '';
    siteContent.regulations.items.forEach(item => {
      const li = document.createElement('li');
      li.textContent = getTxt(item);
      li.style.marginBottom = '0.5rem';
      regList.appendChild(li);
    });
  }

  // 5. FAQ
  if (siteContent.faq) {
    const faqContainer = document.getElementById('faq-accordion');
    faqContainer.innerHTML = '';

    siteContent.faq.forEach(item => {
      const div = document.createElement('div');
      div.className = 'accordion'; // Add wrapper class if needed by CSS
      // Structure for Accordion
      div.innerHTML = `
        <div class="accordion-header">
          ${getTxt(item.question)}
          <span class="accordion-icon">+</span>
        </div>
        <div class="accordion-content">
          <p>${getTxt(item.answer)}</p>
        </div>
      `;

      const header = div.querySelector('.accordion-header');
      const content = div.querySelector('.accordion-content');
      const icon = div.querySelector('.accordion-icon');

      header.addEventListener('click', () => {
        const isOpen = content.classList.contains('open');

        // Optional: Close others?
        // faqContainer.querySelectorAll('.accordion-content').forEach(c => c.classList.remove('open'));
        // faqContainer.querySelectorAll('.accordion-icon').forEach(i => i.textContent = '+');

        if (isOpen) {
          content.classList.remove('open');
          icon.textContent = '+';
        } else {
          content.classList.add('open');
          icon.textContent = '-';
        }
      });

      faqContainer.appendChild(div);
    });
  }

  // 6. Contact Staff & Footer
  if (siteContent.contact && siteContent.contact.staff) {
    const staffList = document.querySelector('.staff-list');
    if (staffList) {
      staffList.innerHTML = '';
      siteContent.contact.staff.forEach(p => {
        const div = document.createElement('div');
        div.className = 'staff-member';
        div.innerHTML = `
           <strong>${getTxt(p.title)}:</strong><br>
           <a href="tel:${p.phone.replace(/\s/g, '')}">${p.phone}</a> - 
           <a href="mailto:${p.email}">${p.email}</a>
         `;
        staffList.appendChild(div);
      });
    }
  }

  // 7. Contact Info (Address, Phone, Email)
  if (siteContent.contact && siteContent.contact.info) {
    const info = siteContent.contact.info;
    const addrText = document.getElementById('contact-address-text');
    if (addrText) addrText.textContent = getTxt(info.address);

    const footerAddrText = document.getElementById('footer-address-text');
    if (footerAddrText) footerAddrText.innerHTML = getTxt(info.address).replace(/\n/g, '<br>');

    // Phone
    const phoneText = document.getElementById('contact-phone-text');
    if (phoneText && info.phone) {
      // Assume info.phone can be array or string. Admin panel ideally saves array or just multiple lines strings?
      // Let's assume it's a string with newlines or we handle it simply.
      // For now, let's treat it as a text field that supports HTML or just split by newline.
      const phones = getTxt(info.phone).split('\n');
      phoneText.innerHTML = phones.map(p => {
        const clean = p.replace(/[^0-9]/g, '');
        return `<a href="tel:${clean}">${p}</a>`;
      }).join('<br>');
    }

    // Email
    const emailText = document.getElementById('contact-email-text');
    if (emailText && info.email) {
      const mail = getTxt(info.email);
      emailText.innerHTML = `<a href="mailto:${mail}">${mail}</a>`;
    }
  }

  updateLanguage(currentLang);
}


// --- Theme Logic ---
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const htmlEl = document.documentElement;

const savedTheme = localStorage.getItem('theme') || 'light';
htmlEl.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

themeToggle.addEventListener('click', () => {
  const currentTheme = htmlEl.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  htmlEl.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
  themeIcon.textContent = theme === 'light' ? '◐' : '☀';
}

// --- Language Logic ---
const langToggle = document.getElementById('lang-toggle');
const langText = document.getElementById('lang-text');

langToggle.addEventListener('click', () => {
  currentLang = currentLang === 'tr' ? 'en' : 'tr';
  localStorage.setItem('lang', currentLang);
  // Re-render whole content to switch dynamic text
  renderContent();
  updateLanguage(currentLang);
});

function updateLanguage(lang) {
  langText.textContent = lang.toUpperCase();

  // Update static data-i18n elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang] && translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });
}

// --- Carousel Auto Play ---
let autoPlayInterval;

function startAutoPlay() {
  stopAutoPlay();
  autoPlayInterval = setInterval(() => moveSlide('next'), 5000);
}

function stopAutoPlay() {
  clearInterval(autoPlayInterval);
}

function moveSlide(direction) {
  const slides = document.querySelectorAll('.carousel-slide');
  if (slides.length === 0) return;

  let activeIndex = Array.from(slides).findIndex(s => s.classList.contains('active'));
  slides[activeIndex].classList.remove('active');

  if (direction === 'next') {
    activeIndex = (activeIndex + 1) % slides.length;
  } else {
    activeIndex = (activeIndex - 1 + slides.length) % slides.length;
  }
  slides[activeIndex].classList.add('active');
}

document.getElementById('next-btn')?.addEventListener('click', () => {
  moveSlide('next');
  startAutoPlay();
});

document.getElementById('prev-btn')?.addEventListener('click', () => {
  moveSlide('prev');
  startAutoPlay();
});


// --- Other Logic ---
// Scroll to Top
const scrollToTopBtn = document.getElementById('scrollToTopBtn');
window.addEventListener('scroll', () => {
  if (window.scrollY > 300) {
    scrollToTopBtn.classList.add('show');
  } else {
    scrollToTopBtn.classList.remove('show');
  }
});
// --- Smooth Scroll Logic ---
function smoothScrollTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Logo Click
const logoContainer = document.getElementById('top-logo-container');
// Fallback if ID is different in some versions
const logoSelector = logoContainer || document.querySelector('.logo-container');

if (logoSelector) {
  logoSelector.addEventListener('click', (e) => {
    e.preventDefault(); // Stop any default link behavior
    e.stopPropagation(); // Stop bubbling
    smoothScrollTop();
  });
  // Ensure all children also don't trigger anything weird
  logoSelector.querySelectorAll('*').forEach(child => {
    child.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      smoothScrollTop();
    });
  });
}

// Scroll Button Click
scrollToTopBtn.addEventListener('click', smoothScrollTop);

// --- Mobile Menu Logic ---
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const navLinks = document.getElementById('nav-links');

if (mobileMenuBtn && navLinks) {
  mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    // Optional: Toggle icon between hamburger and X
    const span = mobileMenuBtn.querySelector('span');
    if (navLinks.classList.contains('active')) {
      span.textContent = '✕';
    } else {
      span.textContent = '☰';
    }
  });

  // Close menu when a link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      mobileMenuBtn.querySelector('span').textContent = '☰';
    });
  });
}

// Init
fetchContent();
startAutoPlay();
