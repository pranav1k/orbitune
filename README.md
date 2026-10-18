# Orbitune

A modern, feature-rich music streaming and player web application built with Next.js, React, Tailwind CSS, and Bun.

Live at: [https://orbitune.pkk.in.eu.org](https://orbitune.pkk.in.eu.org)

## Screenshots

| Desktop | Mobile |
| :---: | :---: |
| ![Desktop](./images/desktop.avif) | ![Mobile](./images/mobile.avif) |

## Features

- **Music Streaming**: Search and stream high-quality songs, albums, artists, and playlists.
- **Dual Download Modes**: In-app offline caching (IndexedDB) and direct file downloads.
- **Liked Songs & Playlists**: Save favorite tracks and organize custom playlists.
- **Nice UI**: Responsive dark theme with player controls and animated visual touches.
- **PWA supported**: Installable with offline support.

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/)

### 1. Clone & Install

```bash
git clone https://github.com/pranav1k/orbitune.git
cd orbitune
bun install
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Open `.env.local` and set your backend API URL:

```env
NEXT_PUBLIC_API_BASE_URL= your_hosted_api_url
```

> **Note**: Orbitune uses custom fork of [sumitkolhe/jiosaavn-api](https://github.com/sumitkolhe/jiosaavn-api) (API compatible).

### 3. Run Locally

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.