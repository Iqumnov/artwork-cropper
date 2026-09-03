# ARTEI Studio — Artwork Cropper & Lightroom Suite

A client-side image perspective cropping and Adobe Lightroom-style color grading application designed for mobile and desktop, matching the luxury design system of ARTEI CRM.

## ✨ Features

- **Mobile-First & Fixed Viewport**: Locked `100dvh` container with zero page scrolling (`overflow: hidden; touch-action: none`), smooth pan, pinch-to-zoom, and double-tap zoom reset.
- **Universal Image Importer**:
  - **Photo Library**: Select from local files with broad format support (JPEG, PNG, HEIC/HEIF, WebP, AVIF, BMP, GIF, TIFF, SVG).
  - **Camera Capture**: Directly capture photos using device cameras on mobile or webcam on desktop.
  - **Drag & Drop & Clipboard**: Drag files or paste directly (`Ctrl+V` / `Cmd+V`).
  - **Quick Test Artworks**: 1-click built-in test images for instant evaluation.
- **Perspective Scanner Crop (`CropStudio`)**:
  - 4-pin quadrilateral scanner perspective warp with large 120px hitboxes for mobile touch.
  - 3x magnifying loupe zoom circle with crosshairs following touch/cursor.
  - Dual perspective engine: OpenCV.js contour detection + pure Canvas Homography matrix transform (100% offline).
  - Fixed aspect ratio presets (`Free`, `1:1`, `4:3`, `3:4`, `16:9`, `9:16`, `3:2`, `2:3`), rotation (90° CW), and horizontal/vertical flipping.
- **Adobe Lightroom Color Correction Suite (`LightroomStudio`)**:
  - **Light**: Exposure (-4 to +4 EV), Contrast, Highlights, Shadows, Whites, Blacks.
  - **Color & HSL**: Temperature (Warmth), Tint, Vibrance, Saturation, and 8-channel HSL Color Mixer (Red, Orange, Yellow, Green, Aqua, Blue, Purple, Magenta).
  - **Color Grading**: Split toning with separate Shadows and Highlights hue/saturation tinting.
  - **Effects & Detail**: Clarity (local contrast), Dehaze, Texture, Vignette, Film Grain, Sharpening, and Noise Reduction.
  - **Tone Curves**: Interactive RGB, Red, Green, and Blue curves.
  - **Presets**: 12 Lightroom presets (*Portra Film*, *Teal & Orange*, *Warm Cinema*, *Vivid Art*, *High Contrast B&W*, *Matte Vintage*, *Noir Film*, *Golden Hour*, *Cyberpunk Neon*, *Clean Studio*, *Ethereal Glow*) + Custom user presets saved to `localStorage`.
- **Workflow Tools**:
  - Real-time RGB + Luminance live histogram.
  - Press & hold **Before** button for instantaneous comparison with unedited artwork.
  - 30-step Undo / Redo history.
  - Export as JPEG (with quality slider), PNG, WebP, or Copy to Clipboard.

## 🚀 Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Production build
pnpm run build
```

## 🛠️ Tech Stack

- React 18 + TypeScript + Vite
- Tailwind CSS (OKLCH color system & custom squircles)
- Lucide React Icons
- HTML5 Canvas & WebGL pixel manipulation
- OpenCV.js & pure mathematical 3x3 Homography perspective warp
- `heic2any` on-demand HEIC/HEIF decoding
