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

// Accessibility and inclusive design features
document.addEventListener("DOMContentLoaded", function () {
  // Font size control functionality
  let currentFontSize = 1; // 1 = medium, 0.875 = small, 1.125 = large, 1.25 = xl
  const fontSizes = [0.875, 1, 1.125, 1.25];
  const fontSizeClasses = [
    "font-size-small",
    "font-size-medium",
    "font-size-large",
    "font-size-xl",
  ];

  // Create font size controls
  function createFontSizeControls() {
    const controlsContainer = document.createElement("div");
    controlsContainer.className = "font-size-controls";
    controlsContainer.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      z-index: 1001;
      background: rgba(0, 0, 0, 0.8);
      padding: 10px;
      border-radius: 8px;
      display: flex;
      gap: 8px;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;

    controlsContainer.innerHTML = `
      <button id="font-decrease" aria-label="Decrease font size" title="Decrease font size">A-</button>
      <button id="font-reset" aria-label="Reset font size" title="Reset font size">A</button>
      <button id="font-increase" aria-label="Increase font size" title="Increase font size">A+</button>
    `;

    const buttons = controlsContainer.querySelectorAll("button");
    buttons.forEach((button) => {
      button.style.cssText = `
        background: #1976d2;
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.3s ease;
      `;

      button.addEventListener("mouseenter", () => {
        button.style.background = "#1565c0";
      });

      button.addEventListener("mouseleave", () => {
        button.style.background = "#1976d2";
      });
    });

    document.body.appendChild(controlsContainer);

    // Show controls on keyboard navigation or mouse near top-right
    let showTimeout;

    document.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        controlsContainer.style.opacity = "1";
        clearTimeout(showTimeout);
        showTimeout = setTimeout(() => {
          controlsContainer.style.opacity = "0";
        }, 5000);
      }
    });

    document.addEventListener("mousemove", (e) => {
      if (e.clientX > window.innerWidth - 200 && e.clientY < 200) {
        controlsContainer.style.opacity = "1";
        clearTimeout(showTimeout);
        showTimeout = setTimeout(() => {
          controlsContainer.style.opacity = "0";
        }, 3000);
      }
    });

    // Font size control handlers
    document.getElementById("font-decrease").addEventListener("click", () => {
      if (currentFontSize > 0) {
        currentFontSize--;
        updateFontSize();
      }
    });

    document.getElementById("font-reset").addEventListener("click", () => {
      currentFontSize = 1;
      updateFontSize();
    });

    document.getElementById("font-increase").addEventListener("click", () => {
      if (currentFontSize < 3) {
        currentFontSize++;
        updateFontSize();
      }
    });
  }

  function updateFontSize() {
    document.body.className = document.body.className.replace(
      /font-size-\w+/g,
      ""
    );
    document.body.classList.add(fontSizeClasses[currentFontSize]);
    document.documentElement.style.setProperty(
      "--font-size-multiplier",
      fontSizes[currentFontSize]
    );

    // Save preference
    localStorage.setItem("portfolioFontSize", currentFontSize.toString());
  }

  // Load saved font size preference
  const savedFontSize = localStorage.getItem("portfolioFontSize");
  if (savedFontSize !== null) {
    currentFontSize = parseInt(savedFontSize);
    updateFontSize();
  }

  createFontSizeControls();

  // Keyboard navigation for project cards
  const projectCards = document.querySelectorAll(
    '.project-card[role="button"]'
  );
  projectCards.forEach((card) => {
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        card.click();
      }
    });
  });

  // Announce page changes for screen readers
  function announcePageChange(sectionName) {
    const announcement = document.createElement("div");
    announcement.setAttribute("aria-live", "polite");
    announcement.setAttribute("aria-atomic", "true");
    announcement.className = "sr-only";
    announcement.textContent = `Navigated to ${sectionName} section`;

    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

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

        // Respect user's motion preferences
        const shouldReduceMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches;

        window.scrollTo({
          top: targetPosition,
          behavior: shouldReduceMotion ? "auto" : "smooth",
        });

        // Announce section change
        const sectionTitle =
          targetSection.querySelector("h1, h2, h3")?.textContent || "section";
        announcePageChange(sectionTitle);

        // Set focus to the section for screen readers
        targetSection.setAttribute("tabindex", "-1");
        targetSection.focus();

        // Remove tabindex after focus
        setTimeout(() => {
          targetSection.removeAttribute("tabindex");
        }, 100);
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
        navLinks.forEach((link) => {
          link.classList.remove("active");
          link.removeAttribute("aria-current");
        });

        // Add active class to current section link
        const activeLink = document.querySelector(
          `.navbar a[href="#${sectionId}"]`
        );
        if (activeLink) {
          activeLink.classList.add("active");
          activeLink.setAttribute("aria-current", "page");
        }
      }
    });
  });

  // Add typing animation to hero title with respect for reduced motion
  const heroTitle = document.querySelector(".hero-title");
  if (heroTitle) {
    const shouldReduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (shouldReduceMotion) {
      // Just show the title without animation
      heroTitle.style.opacity = "1";
    } else {
      // Remove the typing animation to fix HTML display issue
      heroTitle.style.opacity = "0";
      setTimeout(() => {
        heroTitle.style.opacity = "1";
        heroTitle.style.transition = "opacity 0.8s ease-in-out";
      }, 500);
    }
  }

  // Add hover effects to project cards with keyboard support
  projectCards.forEach((card) => {
    const addHoverEffect = () => {
      card.style.transform = "translateY(-8px) scale(1.02)";
      card.style.boxShadow = "0 8px 25px rgba(25, 118, 210, 0.3)";
    };

    const removeHoverEffect = () => {
      card.style.transform = "translateY(0) scale(1)";
      card.style.boxShadow = "none";
    };

    card.addEventListener("mouseenter", addHoverEffect);
    card.addEventListener("mouseleave", removeHoverEffect);
    card.addEventListener("focus", addHoverEffect);
    card.addEventListener("blur", removeHoverEffect);
  });

  // Add hover effects to language cards
  const languageCards = document.querySelectorAll(".language-card");
  languageCards.forEach((card) => {
    const addHoverEffect = () => {
      card.style.transform = "translateY(-4px)";
      card.style.boxShadow = "0 8px 25px rgba(25, 118, 210, 0.2)";
    };

    const removeHoverEffect = () => {
      card.style.transform = "translateY(0)";
      card.style.boxShadow = "none";
    };

    card.addEventListener("mouseenter", addHoverEffect);
    card.addEventListener("mouseleave", removeHoverEffect);

    // Add focus support for language cards
    card.addEventListener("focusin", addHoverEffect);
    card.addEventListener("focusout", removeHoverEffect);
  });

  // Button click handlers
  const contactBtn = document.querySelector(".btn-primary");
  const downloadBtn = document.querySelector(".btn-secondary");

  if (contactBtn) {
    contactBtn.addEventListener("click", function () {
      // Scroll to footer for contact info
      const footer = document.querySelector(".footer");
      if (footer) {
        const shouldReduceMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches;
        footer.scrollIntoView({
          behavior: shouldReduceMotion ? "auto" : "smooth",
        });

        // Announce navigation
        announcePageChange("Contact");

        // Focus the footer for screen readers
        footer.setAttribute("tabindex", "-1");
        footer.focus();
        setTimeout(() => {
          footer.removeAttribute("tabindex");
        }, 100);
      }
    });
  }

  if (downloadBtn) {
    downloadBtn.addEventListener("click", function () {
      // You can replace this with actual CV download functionality
      const announcement = document.createElement("div");
      announcement.setAttribute("aria-live", "polite");
      announcement.className = "sr-only";
      announcement.textContent =
        "CV download functionality will be implemented here";
      document.body.appendChild(announcement);

      alert("CV download functionality can be implemented here!");

      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    });
  }

  // Add fade-in animation for sections on scroll with reduced motion support
  const shouldReduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -100px 0px",
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        if (!shouldReduceMotion) {
          entry.target.style.transform = "translateY(0)";
        }
      }
    });
  }, observerOptions);

  // Observe all sections for fade-in animation
  const sections = document.querySelectorAll("section");
  sections.forEach((section) => {
    section.style.opacity = "0";
    if (!shouldReduceMotion) {
      section.style.transform = "translateY(30px)";
      section.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    } else {
      section.style.transition = "opacity 0.6s ease";
    }
    observer.observe(section);
  });

  // Add loading animation
  window.addEventListener("load", function () {
    document.body.classList.add("loaded");
  });

  // Typewriter effect for "technology!" word with reduced motion support
  const typewriterElement = document.getElementById("typewriter");
  if (typewriterElement && !shouldReduceMotion) {
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

  // High contrast mode toggle (optional feature)
  function createHighContrastToggle() {
    const toggle = document.createElement("button");
    toggle.textContent = "Toggle High Contrast";
    toggle.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      background: #1976d2;
      color: white;
      border: none;
      padding: 12px 16px;
      border-radius: 4px;
      cursor: pointer;
      z-index: 1001;
      font-weight: 600;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;

    toggle.setAttribute("aria-label", "Toggle high contrast mode");

    let isHighContrast = localStorage.getItem("highContrast") === "true";

    function updateHighContrast() {
      if (isHighContrast) {
        document.body.classList.add("high-contrast");
        toggle.textContent = "Disable High Contrast";
      } else {
        document.body.classList.remove("high-contrast");
        toggle.textContent = "Enable High Contrast";
      }
      localStorage.setItem("highContrast", isHighContrast.toString());
    }

    updateHighContrast();

    toggle.addEventListener("click", () => {
      isHighContrast = !isHighContrast;
      updateHighContrast();
    });

    // Show toggle on keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        toggle.style.opacity = "1";
        setTimeout(() => {
          toggle.style.opacity = "0";
        }, 5000);
      }
    });

    document.body.appendChild(toggle);
  }

  createHighContrastToggle();
});
