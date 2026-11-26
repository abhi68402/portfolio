// ─────────────────────────────────────────────────────────────────────────────
//  RECEIPTS: which project proves each skill, and how it was used.
//  Keys are skill names from `skillGroups` in content.js; `project` is a
//  project id from `projects` (or "site" for this portfolio itself).
//  Skills without an entry still show up, just without a receipt.
// ─────────────────────────────────────────────────────────────────────────────
export const proof = {
  "TensorFlow / Keras": [{ project: "nasa-rul", how: "Built and trained the BiLSTM regressor that predicts remaining engine life." }],
  "PyTorch": [{ project: "clearsight", how: "Trained the IMDN student to mimic a SwinIR teacher for real-time sharpening." }],
  "Pandas / NumPy": [{ project: "nasa-rul", how: "Sliding-window sequences, sensor selection and normalisation over C-MAPSS time series." }],
  "CNNs": [{ project: "clearsight", how: "IMDN, a lightweight convolutional network, does the sharpening at 30–60 FPS." }],
  "LSTM / BiLSTM": [{ project: "nasa-rul", how: "A bidirectional LSTM reads multivariate sensor histories to estimate cycles left." }],
  "Knowledge distillation": [{ project: "clearsight", how: "Distilled a heavy SwinIR teacher into a tiny student that keeps most of its quality." }],
  "Computer vision": [{ project: "clearsight", how: "Image restoration for blurry video-call frames on weak networks." }],
  "Python": [
    { project: "nasa-rul", how: "The full ML pipeline: data prep, training and evaluation." },
    { project: "clearsight", how: "Training and distillation code." },
    { project: "ecobin", how: "Glue between the sensors, ThingSpeak and the dashboard." },
  ],
  "JavaScript": [
    { project: "vyu", how: "ES-module app that flies you into a 3D cinema hall." },
    { project: "ecobin", how: "Web dashboard that maps every bin's fill level." },
  ],
  "C": [{ project: "sigrun", how: "A whole RISC-V kernel, written from scratch with no libraries." }],
  "HTML / CSS": [
    { project: "vyu", how: "Accessible UI targeting WCAG 2.1 AA." },
    { project: "site", how: "This notebook, every page of it." },
  ],
  "React": [{ project: "site", how: "This portfolio: React 19, Vite, motion." }],
  "Tailwind CSS": [{ project: "site", how: "Every card, tape strip and highlighter on this page." }],
  "three.js": [{ project: "vyu", how: "Seat-by-seat 3D views for 50 Hyderabad cinemas." }],
  "ESP32": [{ project: "ecobin", how: "One per bin, streaming fill levels over Wi-Fi." }],
  "Sensors": [{ project: "ecobin", how: "HC-SR04 ultrasonic modules measure how full each bin is." }],
  "ThingSpeak": [{ project: "ecobin", how: "Real-time cloud channel behind the campus dashboard." }],
  "QEMU": [{ project: "sigrun", how: "Boots the kernel on QEMU's virt machine through OpenSBI." }],
  "Git": [{ project: "site", how: "Every version of this site is in the commit history." }],
  "GitHub": [{ project: "site", how: "All projects above are public on github.com/abhi68402." }],
};
