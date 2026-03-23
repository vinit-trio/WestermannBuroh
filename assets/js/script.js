// Get current year

document.getElementById("current_year").textContent = new Date().getFullYear();

// Gallery swiper

var swiper = new Swiper(".heroSwiper", {
    effect: "fade",
    loop: true,
    autoplay: {
        delay: 5000,
    },
    navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
    },
});

// Mobile menu toggle

const navIcon = document.getElementById("nav-icon");
const mobileMenu = document.getElementById("header");
const mobile_menu = document.getElementById("mobile_menu");

navIcon.addEventListener("click", function () {
    const isOpen = navIcon.classList.toggle("open");
    mobileMenu.classList.toggle("open");
    mobile_menu.classList.toggle("open");

    navIcon.setAttribute("aria-expanded", isOpen);

    if (isOpen) {
        mobile_menu.removeAttribute("aria-hidden");
        mobile_menu.removeAttribute("inert");
        setTimeout(() => {
            const firstLink = mobile_menu.querySelector('a');
            if (firstLink) firstLink.focus();
        }, 100);
    } else {
        mobile_menu.setAttribute("aria-hidden", "true");
        mobile_menu.setAttribute("inert", "");
    }
});

document.addEventListener('keydown', function (e) {
    const isOpen = navIcon.classList.contains("open");

    if (e.key === 'Escape' && isOpen) {
        navIcon.classList.remove("open");
        mobileMenu.classList.remove("open");
        mobile_menu.classList.remove("open");

        navIcon.setAttribute("aria-expanded", "false");
        mobile_menu.setAttribute("aria-hidden", "true");
        mobile_menu.setAttribute("inert", "");
        navIcon.focus();
    }

    if (isOpen && e.key === 'Tab') {
        const focusables = Array.from(mobile_menu.querySelectorAll('a[href], button'));
        focusables.unshift(navIcon);

        const firstElement = focusables[0];
        const lastElement = focusables[focusables.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    }
});

// GSAP Animations
gsap.registerPlugin(ScrollTrigger);

gsap.set(".gallery-item", {
    opacity: 0,
    y: 150
});

ScrollTrigger.batch(".gallery-item", {
    onEnter: (batch) => {
        gsap.to(batch, {
            opacity: 1,
            y: 0,
            stagger: 0.15,
            duration: 0.8,
            ease: "power2.out"
        });
    },
    start: "top 100%",
    once: true
});

// Fancybox Initialization
if (typeof Fancybox !== "undefined") {
    const galleryItems = document.querySelectorAll('.fancybox_container .gallery-item');

    galleryItems.forEach(item => {
        item.style.cursor = 'pointer';

        // Add keyboard accessibility
        item.setAttribute('tabindex', '0');
        item.setAttribute('role', 'button');
        const title = item.querySelector('h3')?.innerText || 'Gallery image';
        item.setAttribute('aria-label', `View ${title}`);

        item.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                item.click();
            }
        });

        item.addEventListener("click", (e) => {
            e.preventDefault();
            const fancyboxImages = [];

            // Find the main image inside this item
            const mainImg = item.querySelector('img:not(.inner-gallery img)');
            if (mainImg) {
                fancyboxImages.push({
                    src: mainImg.src,
                    type: "image",
                    caption: item.querySelector('h3')?.innerText || ''
                });
            }

            // Add inner gallery images to the same Fancybox group
            const innerImages = item.querySelectorAll('.inner-gallery img');
            innerImages.forEach(innerImg => {
                fancyboxImages.push({
                    src: innerImg.src,
                    type: "image",
                    caption: innerImg.alt || ''
                });
            });

            if (fancyboxImages.length > 0) {
                Fancybox.show(fancyboxImages, {
                    infinite: true,
                    keyboard: {
                        Escape: "close",
                        Delete: "close",
                        Backspace: "close",
                        PageUp: "next",
                        PageDown: "prev",
                        ArrowUp: "next",
                        ArrowDown: "prev",
                        ArrowRight: "next",
                        ArrowLeft: "prev",
                    },
                });
            }
        });
    });
}

// 1. Select all gallery items across the site
const allGalleryItemsSelector = '.gallery-item';
document.querySelectorAll('.portrait_gallery .gallery-item').forEach(item => {
    // This maintains backward compatibility for portrait gallery item focus setup
    item.setAttribute('tabindex', '0');
});

// Helper function to get the exact center point of an element on the screen
function getElementCenter(el) {
    const rect = el.getBoundingClientRect();
    return {
        x: rect.left + (rect.width / 2),
        y: rect.top + (rect.height / 2)
    };
}

// Helper function to get all focusable elements
function getFocusableElements() {
    return Array.from(document.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )).filter(el => {
        return !el.closest('[inert]') && !el.closest('[aria-hidden="true"]') && el.offsetWidth > 0 && el.offsetHeight > 0;
    });
}

// 2. Listen for keyboard navigation
document.addEventListener('keydown', (e) => {
    const currentFocus = document.activeElement;

    // Check if the currently focused element is one of our gallery items
    if (!currentFocus || !currentFocus.classList.contains('gallery-item')) return;
    
    // Handle Tab navigation for Left-to-Right visual order in Masonry layouts
    if (e.key === 'Tab') {
        const gallery = currentFocus.closest('.gallery');
        if (!gallery) return;
        
        const itemsInGallery = Array.from(gallery.querySelectorAll('.gallery-item'));
        
        // Sort items by their visual position: Top to Bottom, then Left to Right
        itemsInGallery.sort((a, b) => {
            const aRect = a.getBoundingClientRect();
            const bRect = b.getBoundingClientRect();
            
            // Treat as the same "row" if the top difference is less than 150px
            if (Math.abs(aRect.top - bRect.top) < 150) {
                return aRect.left - bRect.left;
            }
            return aRect.top - bRect.top;
        });
        
        const currentIndex = itemsInGallery.indexOf(currentFocus);
        
        if (e.shiftKey) {
            if (currentIndex > 0) {
                e.preventDefault();
                itemsInGallery[currentIndex - 1].focus();
                itemsInGallery[currentIndex - 1].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } else {
                e.preventDefault();
                const allFocusable = getFocusableElements();
                const firstGalleryFocusable = itemsInGallery[0];
                const globalIndex = allFocusable.indexOf(firstGalleryFocusable);
                if (globalIndex > 0) {
                    allFocusable[globalIndex - 1].focus();
                }
            }
        } else {
            if (currentIndex < itemsInGallery.length - 1) {
                e.preventDefault();
                itemsInGallery[currentIndex + 1].focus();
                itemsInGallery[currentIndex + 1].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } else {
                e.preventDefault();
                const allFocusable = getFocusableElements();
                const galleryFocusables = Array.from(gallery.querySelectorAll('.gallery-item, [tabindex="0"], a, button'));
                const lastGalleryFocusable = galleryFocusables[galleryFocusables.length - 1];
                
                const globalIndex = allFocusable.indexOf(lastGalleryFocusable);
                if (globalIndex > -1 && globalIndex < allFocusable.length - 1) {
                    allFocusable[globalIndex + 1].focus();
                }
            }
        }
        return;
    }

    // We only care about arrow keys for this down here
    const arrowKeys = ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'];
    if (!arrowKeys.includes(e.key)) return;

    // Prevent default scrolling when using arrows on the gallery
    e.preventDefault();

    const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
    const currentCenter = getElementCenter(currentFocus);
    let nextItem = null;
    let bestScore = Infinity; // Lower score means a "closer" visual match

    galleryItems.forEach(item => {
        if (item === currentFocus) return;

        const itemCenter = getElementCenter(item);
        let isCandidate = false;

        // Determine if the item sits in the direction the user pressed
        // (Added a 10px buffer to account for minor layout alignment quirks)
        if (e.key === 'ArrowRight' && itemCenter.x > currentCenter.x + 10) isCandidate = true;
        if (e.key === 'ArrowLeft' && itemCenter.x < currentCenter.x - 10) isCandidate = true;
        if (e.key === 'ArrowDown' && itemCenter.y > currentCenter.y + 10) isCandidate = true;
        if (e.key === 'ArrowUp' && itemCenter.y < currentCenter.y - 10) isCandidate = true;

        if (isCandidate) {
            const distanceX = Math.abs(itemCenter.x - currentCenter.x);
            const distanceY = Math.abs(itemCenter.y - currentCenter.y);
            let score;

            // Score calculation: heavily penalize jumping rows when moving horizontally, 
            // and penalize jumping columns when moving vertically.
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                score = distanceX + (distanceY * 5);
            } else {
                score = distanceY + (distanceX * 5);
            }

            if (score < bestScore) {
                bestScore = score;
                nextItem = item;
            }
        }
    });

    // If we found a valid item in that direction, focus it!
    if (nextItem) {
        nextItem.focus();

        // Optional: Ensure the new item scrolls smoothly into view
        nextItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
});

// Fancybox Initialization
if (typeof Fancybox !== "undefined") {
    const galleryItems = document.querySelectorAll('.portrait_gallery .gallery-item');

    galleryItems.forEach((item) => {
        item.style.cursor = 'pointer';

        // Add keyboard accessibility
        item.setAttribute('tabindex', '0');
        item.setAttribute('role', 'button');
        const title = item.querySelector('h3')?.innerText || 'Gallery image';
        item.setAttribute('aria-label', `View ${title}`);

        item.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                item.click();
            }
        });

        item.addEventListener("click", (e) => {
            e.preventDefault();

            const allFancyboxImages = [];
            let startingIndex = 0;

            // Loop through ALL gallery items on the page
            document.querySelectorAll('.portrait_gallery .gallery-item').forEach((globalItem) => {

                // Record the index if this is the item the user clicked
                if (globalItem === item) {
                    startingIndex = allFancyboxImages.length;
                }

                // Find the single image inside this gallery item
                const img = globalItem.querySelector('img');
                if (img) {
                    allFancyboxImages.push({
                        src: img.src,
                        type: "image",
                        // Fallback to the image's alt text if there is no h3 title
                        caption: globalItem.querySelector('h3')?.innerText || img.alt || ''
                    });
                }
            });

            // Show the unified gallery
            if (allFancyboxImages.length > 0) {
                Fancybox.show(allFancyboxImages, {
                    startIndex: startingIndex,
                    infinite: true,
                    keyboard: {
                        Escape: "close",
                        Delete: "close",
                        Backspace: "close",
                        PageUp: "next",
                        PageDown: "prev",
                        ArrowUp: "next",
                        ArrowDown: "prev",
                        ArrowRight: "next",
                        ArrowLeft: "prev",
                    },
                });
            }
        });
    });
}

document.querySelectorAll('.portrait_gallery .gallery-item img').forEach((item) => {
    // Ideally, we would know the image size or aspect ratio beforehand...
    if (item.naturalHeight) {
        setItemRatio.call(item);
    } else {
        item.addEventListener('load', setItemRatio);
    }
});

function setItemRatio() {
    this.parentNode.style.setProperty('--ratio', this.naturalHeight / this.naturalWidth);
}



// -----------------------------------------------------------
// Swiper for team
// -----------------------------------------------------------

var swiper = new Swiper(".teamSwiper", {
    slidesPerView: 2,
    loop: true,
    pagination: {
        el: ".swiper-pagination",
        clickable: true,
    },
    autoplay: {
        delay: 3500,
        disableOnInteraction: false,
    },
    breakpoints: {
        576: {
            slidesPerView: 3,
        },
        992: {
            slidesPerView: 4,
        },
        1400: {
            slidesPerView: 5,
        },
    },
});

// -----------------------------------------------------------
// Animation for team swiper
// -----------------------------------------------------------

gsap.utils.toArray(".teamSwiper .swiper-slide").forEach((item, i) => {
    gsap.set(item, {
        scale: 0,
        opacity: 0
    });

    gsap.to(item, {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        delay: i * 0.15,
        ease: "power2.out",
        scrollTrigger: {
            trigger: item,
            start: "top 100%",
            once: true
        }
    });
});


// -----------------------------------------------------------
// Animation for services
// -----------------------------------------------------------

gsap.utils.toArray(".services .service").forEach((item, i) => {
    gsap.set(item, {
        opacity: 0,
        y: 150
    });

    gsap.to(item, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay: i * 0.15,
        ease: "power2.out",
        scrollTrigger: {
            trigger: item,
            start: "top 150%",
            once: true
        }
    });
});


// -----------------------------------------------------------
// Fancybox for team swiper
// -----------------------------------------------------------


if (typeof Fancybox !== "undefined") {
    const galleryItems = document.querySelectorAll('.teamSwiper .swiper-slide');

    galleryItems.forEach((item) => {
        item.style.cursor = 'pointer';

        // Add keyboard accessibility
        item.setAttribute('tabindex', '0');
        item.setAttribute('role', 'button');
        const title = item.querySelector('h3')?.innerText || 'Gallery image';
        item.setAttribute('aria-label', `View ${title}`);

        item.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                item.click();
            }
        });

        item.addEventListener("click", (e) => {
            e.preventDefault();

            const allFancyboxImages = [];
            let startingIndex = 0;

            // Loop through ALL gallery items on the page
            document.querySelectorAll('.teamSwiper .swiper-slide').forEach((globalItem) => {

                // Record the index if this is the item the user clicked
                if (globalItem === item) {
                    startingIndex = allFancyboxImages.length;
                }

                // Find the single image inside this gallery item
                const img = globalItem.querySelector('img');
                if (img) {
                    const title = globalItem.querySelector('h3')?.innerText || '';
                    const desc = globalItem.querySelector('p')?.innerText || img.alt || '';

                    allFancyboxImages.push({
                        src: img.src,
                        type: "image",
                        caption: `<strong>${title}</strong><br>${desc}`
                    });
                }
            });

            // Show the unified gallery
            if (allFancyboxImages.length > 0) {
                Fancybox.show(allFancyboxImages, {
                    startIndex: startingIndex,
                    infinite: true,
                    keyboard: {
                        Escape: "close",
                        Delete: "close",
                        Backspace: "close",
                        PageUp: "next",
                        PageDown: "prev",
                        ArrowUp: "next",
                        ArrowDown: "prev",
                        ArrowRight: "next",
                        ArrowLeft: "prev",
                    },
                });
            }
        });
    });
}



// -----------------------------------------------------------
// Counter animation for team stats
// -----------------------------------------------------------

document.querySelectorAll(".counter").forEach(counter => {
    const target = parseFloat(counter.dataset.target);

    // detect decimal places dynamically
    const decimals = (counter.dataset.target.split(".")[1] || "").length;

    let obj = { val: 0 };

    gsap.to(obj, {
        val: target,
        duration: 2,
        ease: "power1.out",
        scrollTrigger: {
            trigger: counter,
            start: "top 80%",
            once: true
        },
        onUpdate: () => {
            counter.textContent = obj.val.toFixed(decimals);
        }
    });
});


// -----------------------------------------------------------
// Swiper for contact
// -----------------------------------------------------------

if (document.querySelector('.kontaktSwiper')) {

    var swiper = new Swiper(".kontaktSwiper", {
        effect: "fade",
        loop: true,
        autoplay: {
            delay: 3500,
            disableOnInteraction: false,
        },
        pagination: {
            el: ".swiper-pagination",
        },
    });

}


// -----------------------------------------------------------
// Animation for social media links
// -----------------------------------------------------------

gsap.utils.toArray(".social_media .link").forEach((item, i) => {
    gsap.set(item, {
        opacity: 0,
        scale: 0
    });

    gsap.to(item, {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        delay: i * 0.15,
        ease: "power2.out",
        scrollTrigger: {
            trigger: item,
            start: "top 100%",
            once: true
        }
    });
});


// -----------------------------------------------------------
// Animation for contact links
// -----------------------------------------------------------

gsap.utils.toArray(".contact_links .link").forEach((item, i) => {
    gsap.set(item, {
        opacity: 0,
        y: 150
    });

    gsap.to(item, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay: i * 0.15,
        ease: "power2.out",
        scrollTrigger: {
            trigger: item,
            start: "top 100%",
            once: true
        }
    });
});

// -----------------------------------------------------------
// Accordion
// -----------------------------------------------------------

const accordions = document.querySelectorAll(".accordion");

accordions.forEach(accordion => {
    const titles = accordion.querySelectorAll(".title");

    titles.forEach(title => {
        title.addEventListener("click", () => {
            const content = title.nextElementSibling;
            const isOpen = content.style.maxHeight;

            // Close only inside this accordion
            accordion.querySelectorAll(".content").forEach(c => {
                c.style.maxHeight = null;
            });

            accordion.querySelectorAll(".title").forEach(t => {
                t.classList.remove("open");
            });

            // Open clicked one if it was closed
            if (!isOpen) {
                content.style.maxHeight = content.scrollHeight + "px";
                title.classList.add("open");
            }
        });
    });
});


// -----------------------------------------------------------
// Back to top
// -----------------------------------------------------------

const btn = document.getElementById("scrollTopBtn");

// Show button when scrolled down
window.addEventListener("scroll", () => {
    if (window.scrollY > 200) {
        btn.style.opacity = 1;
    } else {
        btn.style.opacity = 0;
    }
});

// Scroll to top when clicked
btn.addEventListener("click", () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});