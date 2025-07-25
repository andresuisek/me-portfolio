# Andres Ontiveros Portfolio

A modern, responsive, and **fully accessible** portfolio website showcasing my expertise as a Software Developer and Tech Lead. Built with Bootstrap 5, following WCAG 2.1 guidelines, and implementing inclusive design principles.

## 🎨 Design Reference

This portfolio is built based on the Figma design specifications:  
**Design Link**: [Figma - Portfolio Andres Ontiveros](https://www.figma.com/design/lFQBAJelnl5beCIG5p9yaN/Portfolio---Andres-Ontiveros?node-id=2032-1868&t=y7JWhXwC3GiUP40W-1)

## 🌐 Live Demo

**🚀 Visit the live website**: [https://andresuisek.github.io/me-portfolio/](https://andresuisek.github.io/me-portfolio/)

## ♿ Accessibility & Inclusion Features

This portfolio has been thoroughly enhanced to meet WCAG 2.1 AA standards and provide an inclusive experience for all users:

### 🏗️ Semantic HTML Structure

- ✅ **HTML5 Semantic Elements**: Proper use of `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`
- ✅ **Heading Hierarchy**: Logical h1-h6 structure for screen readers
- ✅ **Landmark Roles**: ARIA roles for better navigation (`banner`, `navigation`, `contentinfo`)
- ✅ **Skip Navigation**: Skip-to-main-content link for keyboard users

### 🎯 ARIA Accessibility

- ✅ **ARIA Labels**: Descriptive labels for interactive elements
- ✅ **ARIA Descriptions**: Context for buttons and complex interactions
- ✅ **ARIA Live Regions**: Dynamic content announcements for screen readers
- ✅ **ARIA Current**: Proper navigation state indication
- ✅ **ARIA Hidden**: Decorative elements hidden from assistive technologies

### 🖱️ Keyboard Navigation

- ✅ **Full Keyboard Support**: All interactive elements accessible via keyboard
- ✅ **Visible Focus Indicators**: High-contrast focus outlines (3px blue with white border)
- ✅ **Tab Order**: Logical tabulation sequence
- ✅ **Keyboard Shortcuts**: Removed for simplicity
- ✅ **Enter/Space Support**: Project cards respond to keyboard activation

### 🎨 Visual Accessibility

- ✅ **Color Contrast**: WCAG AA compliant contrast ratios (4.5:1 minimum)
  - Hero description: Improved from #c5c5c5 to #e0e0e0
  - Language levels: Enhanced to #d0d0d0
  - Experience descriptions: Upgraded to #e0e0e0
- ✅ **Focus Indicators**: High-contrast, prominent focus styles
- ✅ **Color Independence**: No information conveyed by color alone
- ✅ **High Contrast Mode**: System preference support with enhanced styles

### 📱 Responsive & Adaptive Design

- ✅ **Font Size Controls**: Adjustable text size (A-, A, A+)
  - Small (87.5%), Medium (100%), Large (112.5%), Extra Large (125%)
  - Persistent user preferences via localStorage
- ✅ **Reduced Motion Support**: Respects `prefers-reduced-motion` setting
- ✅ **Mobile Accessibility**: Touch-friendly targets (minimum 44px)
- ✅ **Responsive Focus**: Focus indicators scale with content

### 🔤 Typography & Readability

- ✅ **Readable Fonts**: Clear, sans-serif typography (Poppins, Plus Jakarta Sans)
- ✅ **Adequate Line Height**: 1.6 for body text
- ✅ **Scalable Text**: CSS custom properties for consistent scaling
- ✅ **Language Declaration**: Proper `lang` attribute

### 🖼️ Image Accessibility

- ✅ **Descriptive Alt Text**: Meaningful descriptions for all images
  - Profile: "Professional headshot of Andres Ontiveros, Software Developer and Tech Lead"
  - Projects: Detailed descriptions of functionality shown
  - Logos: Company identification
- ✅ **Decorative Images**: SVG icons marked with `aria-hidden="true"`
- ✅ **Context-Rich Descriptions**: Alt text provides context, not just identification

### 📢 Screen Reader Support

- ✅ **Semantic Structure**: Proper heading hierarchy and landmarks
- ✅ **Live Announcements**: Section changes announced during navigation
- ✅ **Screen Reader Only Content**: `.sr-only` class for additional context
- ✅ **Form Labels**: All interactive elements properly labeled
- ✅ **Status Updates**: Dynamic content changes communicated

### 🎮 Interactive Elements

- ✅ **Button Accessibility**: Clear purposes and states
- ✅ **Link Context**: Descriptive link text (no "click here")
- ✅ **Project Cards**: Keyboard accessible with proper roles
- ✅ **Social Links**: Descriptive aria-labels
- ✅ **Form Validation**: Clear error messaging (when applicable)

### 🎛️ User Control Features

- ✅ **Font Size Toggle**: User-controlled text scaling
- ✅ **High Contrast Toggle**: Optional enhanced contrast mode
- ✅ **Motion Preferences**: Automatic reduced motion support
- ✅ **Persistent Preferences**: Settings saved across sessions

### 🔍 Testing & Validation

- ✅ **Keyboard Only Navigation**: Fully tested without mouse
- ✅ **Screen Reader Testing**: Compatible with NVDA, JAWS, VoiceOver
- ✅ **Color Contrast Analysis**: All text meets WCAG AA standards
- ✅ **Mobile Accessibility**: Touch targets and responsive focus
- ✅ **Automated Testing**: Lighthouse accessibility score optimization

## 👤 About Me

**Andres Ontiveros**  
Software Developer & Tech Lead at Jelou  
📧 Email: [andres.ontiveros@uisek.edu.ec](mailto:andres.ontiveros@uisek.edu.ec)  
💻 GitHub: [github.com/andresuisek](https://github.com/andresuisek)  
📍 Location: Ecuador, Guayaquil.

I'm a passionate software developer and tech lead at Jelou, studying Software Engineering. With over 8 years of experience leading teams and creating impactful products, I specialize in building innovative web solutions with AI.

## ✨ Features

- **Fully Responsive Design**: Optimized for all devices using Bootstrap 5 grid system
- **Modern UI/UX**: Clean and professional design matching Figma specifications
- **Accessibility First**: WCAG 2.1 AA compliant with inclusive design principles
- **Smooth Animations**: Hover effects, transitions, and scroll animations (with reduced motion support)
- **Fixed Navigation**: Responsive header with smooth scroll to sections
- **Gradient Typography**: Beautiful gradient text effects for highlights
- **Interactive Cards**: Hover effects on language and project cards
- **Professional Layout**: Grid-based layout with proper spacing and alignment
- **Cross-browser Compatible**: Works seamlessly across all modern browsers
- **Performance Optimized**: Fast loading with optimized assets
- **Keyboard Accessible**: Full keyboard navigation support
- **Screen Reader Friendly**: Comprehensive screen reader support

## 📋 Sections

### 1. **Header Navigation**

- Fixed position with backdrop blur effect
- Logo and responsive navigation menu
- Smooth scroll to page sections
- Active section highlighting

### 2. **Hero Section**

- Professional profile image with circular border
- Dynamic typewriter effect on highlight text
- Call-to-action buttons (Contact Me, Download CV)
- Responsive layout: horizontal on desktop, vertical on mobile

### 3. **Languages Section**

- Programming languages showcase with custom icons
- Skill level indicators (Advanced, Intermediate, etc.)
- Grid layout: 4 columns on desktop, 2 on tablet, 1 on mobile
- Hover effects with shadow animations

### 4. **Recent Projects Section**

- Project portfolio with image overlays
- Project descriptions and technologies used
- Hover effects with smooth transitions
- Responsive grid layout

### 5. **Experience Section**

- Professional timeline with company logos
- Job titles, descriptions, and date ranges
- Bootstrap grid system for responsive layout
- Clean typography hierarchy

### 6. **Footer**

- Personal branding and contact information
- Social media links with hover effects
- Consistent spacing and typography

## 📁 File Structure

```
me-portfolio/
├── index.html              # Main HTML file with Bootstrap structure
├── styles.css              # Custom CSS styles matching Figma design
├── script.js               # JavaScript for interactive features
├── README.md               # Project documentation
└── images/                 # Image assets directory
    ├── logo.png            # Personal/company logo (217x56px)
    ├── profile.jpg         # Professional headshot (circular crop)
    ├── project1.jpg        # Biometric Agent Chatbot screenshot
    ├── project2.jpg        # Amicloud project screenshot
    ├── project3.jpg        # AMI Management screenshot
    ├── jelou-logo.png      # Jelou company logo
    ├── easymetering-logo.png # Easymetering company logo
    ├── github-icon.svg     # GitHub social icon
    ├── linkedin-icon.svg   # LinkedIn social icon
    ├── twitter-icon.svg    # Twitter social icon
    ├── javascript-icon.svg # JavaScript technology icon
    ├── nodejs-icon.svg     # Node.js technology icon
    └── python-icon.svg     # Python technology icon
```

## 🌐 Browser Support

| Browser | Version | Status             |
| ------- | ------- | ------------------ |
| Chrome  | 90+     | ✅ Fully Supported |
| Firefox | 88+     | ✅ Fully Supported |
| Safari  | 14+     | ✅ Fully Supported |
| Edge    | 90+     | ✅ Fully Supported |
| Opera   | 76+     | ✅ Fully Supported |

## 📱 Responsive Breakpoints

| Device Type             | Screen Size     | Layout               | Grid Columns                   |
| ----------------------- | --------------- | -------------------- | ------------------------------ |
| **Extra Large Desktop** | ≥ 1400px        | Full width container | 4 columns (Languages/Projects) |
| **Large Desktop**       | 1200px - 1399px | Responsive container | 4 columns (Languages/Projects) |
| **Medium Desktop**      | 1100px - 1199px | Reduced padding      | 2x2 grid (Languages/Projects)  |
| **Small Desktop**       | 992px - 1099px  | Compact layout       | 2x2 grid                       |
| **Tablet**              | 768px - 991px   | Stacked sections     | 2 columns                      |
| **Mobile Large**        | 576px - 767px   | Single column        | 1 column                       |
| **Mobile Small**        | < 576px         | Minimal padding      | 1 column                       |

## 🔧 Technologies Used

- **HTML5**: Semantic markup structure
- **CSS3**: Custom styles with Flexbox/Grid
- **Bootstrap 5.3.2**: Responsive grid system and utilities
- **JavaScript**: Interactive features and animations
- **Google Fonts**: Poppins and Plus Jakarta Sans
- **SVG Icons**: Scalable vector graphics for technologies

## 📄 License

This project is for portfolio purposes. Feel free to use as inspiration for your own portfolio.

---

**Built with ❤️ and ♿ Inclusivity by Andres Ontiveros**  
_Software Developer & Tech Lead_
