# Social Banner Generator

A React application for creating branded product banners in three social-media formats, with live previews and export tools.

## Overview

The Social Banner Generator reduces repetitive manual image editing by letting users configure a banner once and export assets in the required formats.

## Features

- Three predefined banner formats
- Live preview while editing
- Multiple decorative image layers with independent positioning and sizing per format
- Magnetic horizontal and vertical center guides for logos and decorative images
- Custom HTML5 Canvas renderer
- Text rendering with mixed fonts, shadows, and bevel effects
- High-resolution PNG export
- ZIP export for all generated formats
- Persistent settings using `localStorage`

## Tech Stack

- React 19
- JavaScript
- Vite
- HTML5 Canvas
- `localStorage`
- ZIP export tooling

## Implementation Highlights

The rendering logic uses a custom Canvas-based renderer to produce the final image rather than relying only on DOM screenshots. The interface separates editing controls from preview and export behavior.

## My Contribution

I built the application independently, including the React interface, canvas rendering logic, configurable layouts, preview flow, and export features.

## Live Demo

The application was deployed to Netlify.

https://publigenerator-kitchentools.netlify.app/

## Run Locally

```bash
npm install
npm run dev
```

Use the scripts in `package.json` if the commands differ in your version of the repository.
