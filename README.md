# 🧪 Space Agency

<div align="center">

**An Interactive Periodic Table for Chemistry Students**

[![Made with JavaScript](https://img.shields.io/badge/Made%20with-JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)](https://www.w3.org/Style/CSS/)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)

*Master Chemistry. Visually & Instantly.*

</div>

---

> [!NOTE]
> Space Agency is an interactive chemistry platform featuring an interactive periodic table, 3D atom models, and a virtual chemistry laboratory.

---

## ✨ Features

### 🔬 Interactive Periodic Table
- **118 Elements** with detailed information
- Click any element to view comprehensive data
- Smooth 3D atom visualization with electron shells
- Category-based color coding (Alkali Metal, Noble Gas, etc.)

### ⚡ Ion Engine
- **Monatomic & Polyatomic Ions** database
- Custom animations for each ion's properties
- Visual hints for flame tests, solubility, and more
- Real-time charge calculations

### 🛠️ Chemistry Tools
| Tool | Description | Grade Level |
|------|-------------|-------------|
| **Equation Balancer** | Balance chemical equations with step-by-step solutions | 9-12 |
| **Molar Mass Calculator** | Calculate molar mass with element breakdown | 10-11 |
| **Empirical & Molecular Formula** | Derive formulas from mass data | 10-11 |
| **Solubility Table** | Quick reference for ionic compounds | 9-12 |

---

## 🆕 Recent Updates (April 2026)

- Mobile-first landing refreshed with softer background motion text stream.
- Mobile landing no longer triggers desktop onboarding/welcome flow.
- Element modal export/download button was removed.
- Custom mobile assets were organized into the `images/` folder:
	- `images/mobile-bg-1.png`
	- `images/mobile-atom-2.png`

### 📝 Worksheet Generator
- Generate balanced equation practice problems
- Multiple reaction types (Synthesis, Decomposition, Combustion, etc.)
- Adjustable difficulty levels
- Print-ready PDF export

### ⌨️ Keyboard Navigation
- **Arrow Keys** (← →) - Navigate between info slides
- **Space Bar** - Next slide
- Fully accessible modal navigation

---

## 🚀 Quick Start

### Local Development
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/space-agency.git

# Navigate to project directory
cd space-agency

# Install dependencies
npm install

# Start dev server (with hot reload)
npm run dev
```

### Quality Checks
```bash
# Lint + syntax check + production build
npm run check
```

### Production Build
```bash
# Build static files to dist/
npm run build

# Preview production build locally
npm run preview
```

---

## 📁 Project Structure

```
space-agency/
├── .github/workflows/ci.yml # CI pipeline
├── package.json            # Vite scripts and dependencies
├── index.html              # Main HTML file
├── script.js               # Main JavaScript logic
├── three.min.js            # Legacy local Three.js copy
├── logo.svg                # Project logo
├── public/                 # Static files copied directly by Vite
├── css/
│   ├── base.css            # Design tokens, layout, navigation
│   ├── grid.css            # Periodic table grid
│   ├── modal.css           # Element detail modals
│   ├── tools.css           # Chemistry tools styles
│   ├── ions.css            # Ion engine styles
│   ├── ion-animations.css  # Ion-specific animations
│   ├── mobile-landing.css  # Mobile landing page
│   └── worksheet-styles.css
├── js/
│   ├── ion-animations.js   # Ion animation logic
│   ├── worksheet-generator.js
│   ├── data/
│   │   ├── elementsData.js # Element database
│   │   └── ionsData.js     # Ion database
│   └── modules/
│       ├── chemistryTools.js
│       ├── ionsController.js
│       ├── threeRenderer.js
│       └── uiController.js
├── images/                 # Preview screenshots
└── README.md
```

---

## 🎨 Design Philosophy

Space Agency follows modern design principles:

- **Minimal & Clean** - Inspired by Apple's design language
- **Glassmorphism** - Subtle frosted glass effects
- **Responsive** - Works on all screen sizes
- **Dark/Light Friendly** - Neutral color palette
- **Micro-animations** - Smooth, delightful interactions

---

## 🎓 Target Audience

- **Grade 9-12 Chemistry Students**
- **AP Chemistry / IB Chemistry**
- **Teachers** looking for classroom tools
- **Anyone** interested in chemistry visualization

---

## 📸 Screenshots

<details>
<summary>Click to expand screenshots</summary>

### Periodic Table View
*The main interactive periodic table with category legends*

![Periodic Table](images/preview-table.png)

### Element Detail Modal
*Comprehensive element information with 3D atom model*

![Element Modal](images/preview-modal.png)

### Mobile Welcome Stream Style
*Subtle multilingual background stream style used on the mobile-first landing experience*

![Mobile Welcome Stream](images/mobile-bg-1.png)

### Mobile Atom Card Visual
*Custom Atom Models card visual used in the mobile landing feature preview*

![Mobile Atom Card](images/mobile-atom-2.png)

### Equation Balancer
*Balance chemical equations with real-time scale visualization*

![Equation Balancer](images/preview-tools.png)

### Worksheet Generator
*Generate print-ready balanced equation worksheets*

![Worksheet Generator](images/preview-worksheet.png)

</details>

---

## 🛡️ License

This project is open source under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

- **Three.js** - 3D graphics library
- **Google Fonts (Inter)** - Typography
- **The Chemistry Community** - For inspiration

---

<div align="center">

*Stop memorizing — start visualizing.*

</div>
