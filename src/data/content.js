// ─────────────────────────────────────────────────────────────────────────────
//  ALL SITE CONTENT LIVES HERE.
//  Edit text, links, skills, projects, experience and certifications in this
//  file only. Components read from it, so you never need to touch them.
//  Lines marked  // TODO  are placeholders for you to replace.
// ─────────────────────────────────────────────────────────────────────────────

export const profile = {
  name: "Harshit Abhinav",
  firstName: "Harshit",
  lastName: "Abhinav",
  // The hero cycles through these, so the page works for any role you apply to.
  roles: ["Software Engineer", "AI / ML Engineer", "Full Stack Developer", "Systems Tinkerer", "IoT Builder"],
  tagline: "I build things that think, ship and survive real use: ML models, operating systems, and web apps people actually open.",
  location: "India", // TODO: e.g. "Visakhapatnam, IN"
  timezone: "Asia/Kolkata",
  education: {
    degree: "B.Tech, Computer Science & Engineering",
    school: "GITAM University",
    year: "2026",
  },
  email: "gompaharshit7@gmail.com",
  links: {
    github: "https://github.com/abhi68402",
    linkedin: "https://www.linkedin.com/in/harshit-abhinav-29ba54232/",
  },
  resume: "/resume/Harshit_Abhinav_Resume.pdf", // drop your PDF at public/resume/
  status: "Open to full-time roles · 2026",
  // Formspree form ID (the part after formspree.io/f/). Leave "" to use mailto instead.
  formspreeId: "", // TODO: create a free form at formspree.io and paste the ID
};

export const about = {
  lines: [
    "I'm a CSE student at GITAM who likes the whole stack, from a RISC-V kernel up to the pixels on screen.",
    "I've predicted jet-engine failures with LSTMs, wired ESP32 sensors into smart bins, and built a 3D cinema seat viewer that people actually use.",
    "I care about software that is fast, accessible and honest about what it does.",
    "Right now I'm looking for a team where I can ship, learn fast and own real problems.",
  ],
  hobbies: [
    { icon: "🐕", label: "Befriending every street dog", note: "rain or shine" },
    { icon: "🌌", label: "Star Wars & sci-fi", note: "can quote the original trilogy on demand" },
    { icon: "🎮", label: "Gaming", note: "hence the minigame" },
    { icon: "📷", label: "Photography & travel", note: "mostly cities and skies" },
  ],
};

// level: 0–100. Be honest; recruiters respect calibrated numbers.
export const skillGroups = [
  { id: "lang", name: "Languages", level: 85, skills: [
    { name: "Python", level: 90 }, { name: "Java", level: 78 }, { name: "JavaScript", level: 85 }, { name: "SQL", level: 75 }, { name: "C", level: 70 },
  ] },
  { id: "web", name: "Web", level: 82, skills: [
    { name: "HTML / CSS", level: 88 }, { name: "React", level: 82 }, { name: "Tailwind CSS", level: 80 }, { name: "three.js", level: 62 },
  ] },
  { id: "ai", name: "AI / ML", level: 80, skills: [
    { name: "TensorFlow / Keras", level: 82 }, { name: "PyTorch", level: 65 }, { name: "Pandas / NumPy", level: 85 }, { name: "Computer Vision", level: 72 },
  ] },
  { id: "db", name: "Databases", level: 72, skills: [
    { name: "MongoDB", level: 70 }, { name: "SQL (MySQL)", level: 76 },
  ] },
  { id: "iot", name: "IoT", level: 70, skills: [
    { name: "ESP32", level: 75 }, { name: "Sensors", level: 72 }, { name: "ThingSpeak", level: 66 },
  ] },
  { id: "tools", name: "Tools", level: 86, skills: [
    { name: "Git", level: 85 }, { name: "GitHub", level: 88 }, { name: "VS Code", level: 90 }, { name: "QEMU", level: 60 },
  ] },
];

// Nova, the astro-pup mascot. Rename her or change what she says here.
export const mascot = {
  name: "Nova",
  greeting: "Hi! I'm Nova, Harshit's co-pilot. Click me, or click anywhere to throw a ball!",
  // said once per visit when each section scrolls into view
  lines: {
    about: "That's my human. He shares his umbrella with every street dog he meets.",
    skills: "Python at 90%. My fetch skills are at 100%.",
    projects: "Sigrun is an operating system he wrote from scratch. Like, the whole thing.",
    experience: "He led a team at Intel Unnati. I led a squirrel chase. Same energy.",
    certifications: "Clearances checked. All systems go.",
    contact: "Hire him and I come free. Mostly.",
  },
  // random facts when you click Nova
  facts: [
    "Psst: press ` for the secret terminal.",
    "Vyu lets you see a cinema seat in 3D before you book it. Try it live!",
    "He predicted jet engine failures with LSTMs. I predict snack time.",
    "Try typing 'sudo hire harshit' in the terminal.",
    "Triple-click me. Go on.",
    "I'm a street dog in a space helmet. Ask me anything (I'll just wag).",
    "Hit 'Play a Game' and help me dodge bugs!",
    "His resume is one click away, top of the page.",
  ],
};

// Skills that fall in the minigame (short labels fit the capsules best).
export const gameSkills = ["Python", "React", "Java", "JS", "SQL", "C", "Keras", "PyTorch", "ESP32", "Git", "MongoDB", "Tailwind", "three.js", "Pandas", "Linux"];

export const projectFilters = [
  { id: "all", label: "All" },
  { id: "ai", label: "AI / ML" },
  { id: "web", label: "Web" },
  { id: "iot", label: "IoT" },
  { id: "systems", label: "Systems" },
];

// status: "LIVE" | "SHIPPED" | "R&D"   ·   featured: shown larger at the top
export const projects = [
  {
    id: "vyu",
    nova: "Sniff sniff… smells like popcorn. Vyu shows you the view from any cinema seat in 3D.", // what Nova says when you hover this card
    title: "Vyu",
    subtitle: "See your cinema seat in 3D before you book it",
    category: ["web"],
    status: "LIVE",
    featured: true,
    year: "2026",
    problem: "Booking-site seat maps are grids of squares that hide neck strain, blocked views and balcony overhangs.",
    solution: "A three.js explorer: pick a Hyderabad theatre and seat, then fly into the hall to see that exact view.",
    tech: ["JavaScript", "three.js", "HTML/CSS", "WCAG 2.1"],
    github: "https://github.com/abhi68402/vyu",
    demo: "https://www.cinevyu.site/",
    details: [
      "Seat-by-seat 3D views for 50 Hyderabad cinemas, built with ES modules and three.js.",
      "Runs fully offline and targets WCAG 2.1 AA accessibility.",
      "Deliberately not a booking app: no showtimes, payments or tickets, just the view.",
    ],
  },
  {
    id: "sigrun",
    nova: "A whole operating system, written from scratch. I can't even open doors.", // what Nova says when you hover this card
    title: "Sigrun",
    subtitle: "A RISC-V OS where the CPU asks before anything touches something new",
    category: ["systems"],
    status: "R&D",
    featured: true,
    year: "2026",
    problem: "AI agents and programs act first and ask later, because 'ask before acting' lives inside the app.",
    solution: "A kernel in C for 64-bit RISC-V that traps on first access and freezes the program until you allow it.",
    tech: ["C", "RISC-V", "QEMU", "OpenSBI"],
    github: "https://github.com/abhi68402/sigrun",
    demo: "",
    details: [
      "Written from scratch: no libraries, no OS underneath. Boots on QEMU's virt machine through OpenSBI.",
      "'Consent faults': permission works like memory paging. The first touch of a new resource traps, the kernel freezes the program mid-instruction and resumes the exact same instruction if you allow it.",
      "Works on unmodified programs, because the hardware forces the question, not the app.",
    ],
  },
  {
    id: "nasa-rul",
    nova: "This one predicts when jet engines will fail. I predict dinner.", // what Nova says when you hover this card
    title: "Jet Engine RUL Prediction",
    subtitle: "NASA C-MAPSS predictive maintenance",
    category: ["ai"],
    status: "SHIPPED",
    featured: true,
    year: "2025",
    problem: "Engines get serviced on fixed schedules, either too early (wasted money) or too late (failures).",
    solution: "A BiLSTM model reads multivariate sensor time series and predicts each engine's Remaining Useful Life.",
    tech: ["Python", "TensorFlow / Keras", "BiLSTM", "Pandas"],
    github: "https://github.com/abhi68402/NASA-CMAPSS-RUL-Predictions",
    demo: "",
    details: [
      "Trained on NASA's C-MAPSS FD001 turbofan degradation dataset.",
      "Sliding-window sequences, sensor selection and normalisation feed a bidirectional LSTM regressor.",
      "Evaluated with RMSE and the asymmetric NASA scoring function that punishes late predictions harder.", // TODO verify metrics/add numbers
    ],
  },
  {
    id: "hyd-days",
    nova: "A pixel Hyderabad with traffic and the metro! I'd chase every auto.", // what Nova says when you hover this card
    title: "8bitHyd",
    subtitle: "A living pixel-art city on real map data",
    category: ["web"],
    status: "R&D",
    year: "2026",
    problem: "Maps show where things are, not what a city feels like.",
    solution: "A 2:1 dimetric pixel-art simulation of real Hyderabad geography with traffic, metro and live weather.",
    tech: ["TypeScript", "Canvas 2D", "OpenStreetMap"],
    github: "https://github.com/abhi68402/8bithyd",
    demo: "",
    details: [
      "~51 × 46 km of real OpenStreetMap building footprints streamed as binary tiles.",
      "38 hand-drawn pixel landmarks, from Charminar to Cyber Towers.",
      "Simulated traffic signals, emergency vehicles, the three metro lines, festivals, and real-time weather and air quality.",
    ],
  },
  {
    id: "clearsight",
    nova: "Makes blurry video calls sharp. He led the team for Intel Unnati.", // what Nova says when you hover this card
    title: "Project ClearSight",
    subtitle: "Real-time image sharpening via knowledge distillation",
    category: ["ai"],
    status: "SHIPPED",
    year: "2025",
    problem: "Video calls get blurry on weak networks, and good restoration models are too heavy for real time.",
    solution: "Distil a SwinIR teacher into a tiny IMDN student that sharpens frames at 30–60 FPS.",
    tech: ["PyTorch", "SwinIR", "IMDN", "Computer Vision"],
    github: "https://github.com/abhi68402/Team-ClearSight",
    demo: "",
    details: [
      "Intel Unnati Industrial Training project; I led a team of three.",
      "Teacher–student knowledge distillation keeps most of the teacher's quality at a fraction of the compute.",
      "Targets real-time video conferencing workloads.",
    ],
  },
  {
    id: "ecobin",
    nova: "Smart bins that report when they're full. Finally, no overflow to sniff through.", // what Nova says when you hover this card
    title: "EcoBin Smart Dustbins",
    subtitle: "IoT fill-level monitoring for a whole campus",
    category: ["iot", "web"],
    status: "SHIPPED",
    year: "2024",
    problem: "Bins overflow in some places while trucks visit empty ones in others.",
    solution: "ESP32 + ultrasonic modules stream fill levels to ThingSpeak; a dashboard maps them for smarter pickup routes.",
    tech: ["ESP32", "HC-SR04", "ThingSpeak", "Python", "HTML/JS"],
    github: "https://github.com/abhi68402/EcoBin",
    demo: "",
    details: [
      "Custom sensor module installed inside each bin measures fill level ultrasonically.",
      "Readings go to ThingSpeak in real time; the web dashboard shows every bin on a campus map.",
      "Helps plan collection routes around bins that are actually full.",
    ],
  },
  {
    id: "fer",
    nova: "It reads 7 emotions from a face. Mine is always 'happy'.", // what Nova says when you hover this card
    title: "Facial Emotion Recognition",
    subtitle: "CNN that reads 7 emotions from a face",
    category: ["ai"],
    status: "SHIPPED",
    year: "2025",
    problem: "Apps can't respond to how a person feels without understanding their expression.",
    solution: "A convolutional network trained on FER-2013 classifies faces into seven emotions.",
    tech: ["TensorFlow / Keras", "OpenCV", "scikit-learn"],
    github: "https://github.com/abhi68402/Facial_emotion_recognition",
    demo: "",
    details: [
      "48×48 grayscale faces, 7 classes: angry, disgust, fear, happy, sad, surprise, neutral.",
      "Conv + pooling feature extractor, evaluated with confusion matrices and classification reports.",
    ],
  },
];

export const experience = [
  {
    role: "Team Lead, AI Project Intern",
    org: "Intel Unnati Industrial Training",
    period: "2025",
    location: "Remote",
    bullets: [
      "Led a 3-person team building a real-time image sharpening model with knowledge distillation (SwinIR → IMDN).",
      "Delivered a lightweight student model aimed at 30–60 FPS for video conferencing.",
    ],
  },
  {
    role: "Software Engineering Intern", // TODO: fill from resume (SmartKnower internship)
    org: "SmartKnower",
    period: "Month 2025 – Month 2025", // TODO: fill from resume
    location: "City / Remote", // TODO: fill from resume
    bullets: [
      "What you built, with a number if you can (users, speed-up, accuracy).", // TODO: fill from resume
      "The tech you used and what you owned end to end.", // TODO: fill from resume
    ],
  },
];

// Leave this array empty ([]) to hide the section entirely.
export const certifications = [
  { name: "Certification name", issuer: "Issuer", year: "2025", url: "" }, // TODO
  { name: "Certification name", issuer: "Issuer", year: "2025", url: "" }, // TODO
  { name: "Certification name", issuer: "Issuer", year: "2024", url: "" }, // TODO
  { name: "Certification name", issuer: "Issuer", year: "2024", url: "" }, // TODO
];

// Navbar + section order. Each section is a "level" in Nova's journey from
// the street to the Moon; `altitude` feeds the meter on the right edge (metres).
export const sections = [
  { id: "hero", code: "01", label: "Home", codename: "Street level", altitude: 0 },
  { id: "about", code: "02", label: "About", codename: "Monsoon lane", altitude: 30 },
  { id: "skills", code: "03", label: "Skills", codename: "The lab", altitude: 2000 },
  { id: "projects", code: "04", label: "Projects", codename: "Launch pad", altitude: 10000 },
  { id: "experience", code: "05", label: "Experience", codename: "Orbit", altitude: 400000 },
  { id: "certifications", code: "06", label: "Certs", codename: "Deep space", altitude: 36000000 },
  { id: "contact", code: "07", label: "Contact", codename: "Moon base", altitude: 384400000 },
];
