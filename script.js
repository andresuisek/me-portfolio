// Smooth scrolling for navigation links
document.addEventListener("DOMContentLoaded", function () {
  // Get all navigation links
  const navLinks = document.querySelectorAll(".navbar a");

  // Add smooth scrolling to all navigation links
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("href");
      const targetSection = document.querySelector(targetId);

      if (targetSection) {
        const headerHeight = document.querySelector(".header").offsetHeight;
        const targetPosition = targetSection.offsetTop - headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });
      }
    });
  });

  // Highlight active navigation item based on scroll position
  window.addEventListener("scroll", function () {
    const scrollPosition = window.scrollY + 100;
    const sections = document.querySelectorAll("section");

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute("id");

      if (
        scrollPosition >= sectionTop &&
        scrollPosition < sectionTop + sectionHeight
      ) {
        // Remove active class from all links
        navLinks.forEach((link) => link.classList.remove("active"));

        // Add active class to current section link
        const activeLink = document.querySelector(
          `.navbar a[href="#${sectionId}"]`
        );
        if (activeLink) {
          activeLink.classList.add("active");
        }
      }
    });
  });

  // Add typing animation to hero title
  const heroTitle = document.querySelector(".hero-title");
  if (heroTitle) {
    // Remove the typing animation to fix HTML display issue
    // The title will display normally without character-by-character animation
    heroTitle.style.opacity = "0";
    setTimeout(() => {
      heroTitle.style.opacity = "1";
      heroTitle.style.transition = "opacity 0.8s ease-in-out";
    }, 500);
  }

  // Add parallax effect to hero section
  // window.addEventListener("scroll", function () {
  //   const scrolled = window.pageYOffset;
  //   const hero = document.querySelector(".hero");
  //   const profileImage = document.querySelector(".profile-image");

  //   if (hero && profileImage) {
  //     const rate = scrolled * -0.5;
  //     profileImage.style.transform = `translateY(${rate}px)`;
  //   }
  // });

  // Add hover effects to project cards
  const projectCards = document.querySelectorAll(".project-card");
  projectCards.forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-8px) scale(1.02)";
    });

    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0) scale(1)";
    });
  });

  // Add hover effects to language cards
  const languageCards = document.querySelectorAll(".language-card");
  languageCards.forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-4px)";
      this.style.boxShadow = "0 8px 25px rgba(25, 118, 210, 0.2)";
    });

    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0)";
      this.style.boxShadow = "none";
    });
  });

  // Button click handlers
  const contactBtn = document.querySelector(".btn-primary");
  const downloadBtn = document.querySelector(".btn-secondary");

  if (contactBtn) {
    contactBtn.addEventListener("click", function () {
      // Scroll to footer for contact info
      const footer = document.querySelector(".footer");
      if (footer) {
        footer.scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  if (downloadBtn) {
    downloadBtn.addEventListener("click", function () {
      // You can replace this with actual CV download functionality
      alert("CV download functionality can be implemented here!");
    });
  }

  // Add fade-in animation for sections on scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -100px 0px",
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  }, observerOptions);

  // Observe all sections for fade-in animation
  const sections = document.querySelectorAll("section");
  sections.forEach((section) => {
    section.style.opacity = "0";
    section.style.transform = "translateY(30px)";
    section.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    observer.observe(section);
  });

  // Add loading animation
  window.addEventListener("load", function () {
    document.body.classList.add("loaded");
  });

  // Typewriter effect for "technology!" word
  const typewriterElement = document.getElementById("typewriter");
  if (typewriterElement) {
    const text = "technology!";
    let index = 0;

    // Hide the original text
    typewriterElement.textContent = "";
    typewriterElement.style.borderRight = "3px solid #1976d2";

    // Start typing after 1 second delay
    setTimeout(() => {
      const typeInterval = setInterval(() => {
        if (index < text.length) {
          typewriterElement.textContent += text.charAt(index);
          index++;
        } else {
          clearInterval(typeInterval);
          // Start blinking cursor
          setInterval(() => {
            typewriterElement.style.borderRight =
              typewriterElement.style.borderRight === "3px solid transparent"
                ? "3px solid #1976d2"
                : "3px solid transparent";
          }, 1000);
        }
      }, 150); // 150ms per character
    }, 1000);
  }
});

// Add CSS class for active navigation
const style = document.createElement("style");
style.textContent = `
    .navbar a.active {
        color: #1976D2 !important;
        position: relative;
    }
    
    .navbar a.active::after {
        content: '';
        position: absolute;
        bottom: -8px;
        left: 50%;
        transform: translateX(-50%);
        width: 6px;
        height: 6px;
        background-color: #1976D2;
        border-radius: 50%;
    }
    
    body:not(.loaded) {
        overflow: hidden;
    }
    
    body.loaded .hero {
        animation: fadeInUp 1s ease-out;
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .project-card {
        transition: transform 0.3s ease, box-shadow 0.3s ease !important;
    }
    
    .language-card {
        transition: transform 0.3s ease, box-shadow 0.3s ease !important;
    }
`;
document.head.appendChild(style);
