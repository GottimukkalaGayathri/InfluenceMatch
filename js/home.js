/**
 * Home page functionality for the InfluConnect platform
 */

document.addEventListener('DOMContentLoaded', () => {
  // Add smooth scroll for navigation links
  setupSmoothScroll();
  
  // Add animations on scroll
  setupScrollAnimations();
  
  // Setup testimonial slider
  setupTestimonialSlider();
});

/**
 * Setup smooth scrolling for navigation links
 */
function setupSmoothScroll() {
  // Get all links with hash
  const links = document.querySelectorAll('a[href^="#"]');
  
  links.forEach(link => {
    link.addEventListener('click', function(e) {
      // Only if the hash is not empty
      if (this.getAttribute('href') !== '#') {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
          // Get the target's offset
          const offset = targetElement.getBoundingClientRect().top + window.pageYOffset;
          
          // Account for fixed header
          const headerHeight = document.querySelector('header').offsetHeight;
          const offsetPosition = offset - headerHeight;
          
          // Smooth scroll to target
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  });
}

/**
 * Setup scroll animations for elements
 */
function setupScrollAnimations() {
  // Get all elements with data-aos attribute
  const animatedElements = document.querySelectorAll('[data-aos]');
  
  // Observer options
  const options = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };
  
  // Create intersection observer
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Add animation class
        entry.target.classList.add('animated');
        
        // Stop observing this element
        observer.unobserve(entry.target);
      }
    });
  }, options);
  
  // Start observing elements
  animatedElements.forEach(element => {
    observer.observe(element);
  });
}

/**
 * Setup testimonial slider
 */
function setupTestimonialSlider() {
  const testimonials = document.querySelectorAll('.testimonial');
  if (testimonials.length <= 1) return;
  
  let currentSlide = 0;
  const maxSlides = testimonials.length;
  
  // Hide all testimonials except the first one
  testimonials.forEach((testimonial, index) => {
    if (index !== 0) {
      testimonial.style.display = 'none';
    }
  });
  
  // Change slide every 5 seconds
  setInterval(() => {
    // Hide current slide
    testimonials[currentSlide].style.display = 'none';
    
    // Calculate next slide index
    currentSlide = (currentSlide + 1) % maxSlides;
    
    // Show next slide
    testimonials[currentSlide].style.display = 'block';
    testimonials[currentSlide].style.animation = 'fadeIn 0.5s';
  }, 5000);
}