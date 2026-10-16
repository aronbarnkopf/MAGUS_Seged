# M.A.G.U.S. Segéd

**A digital rulebook, spell reference, and character manager for the Hungarian M.A.G.U.S. tabletop role-playing game.**

[**Live Application**](https://magus-seged.web.app/spells) · [**GitHub Repository**](https://github.com/aronbarnkopf/MAGUS_Seged)

M.A.G.U.S. Segéd is a web application built to make accessing game information and managing characters easier during tabletop RPG sessions. Instead of searching through physical rulebooks or keeping character information in separate documents, players can browse spells, navigate game rules, and manage their characters in one place.

## Features

### Spellbook

- Browse a digital catalogue of M.A.G.U.S. spells.
- Search spells by name.
- Filter spells by magic type and subtype.
- Narrow results by minimum and maximum mana-point costs.
- View spell details, including mana cost, range, duration, casting time, and description.

### Digital Rulebook

- Browse game rules organized into chapters and sections.
- Search the rulebook interface.
- Navigate through an expandable table of contents.
- Jump directly to individual chapters and sections.
- Read rule descriptions in a dedicated reading interface.

### Character Management

- Create and manage multiple character sheets.
- Edit character attributes and progression information.
- Track combat statistics, including attack and defence-related values.
- Manage character resources, including health, fatigue, mana, and psi points.
- Keep track of skills, equipment, armour, currency, and skill points.
- Save character data to Firestore under the authenticated user's account.

### Authentication

- Register an account using email and password.
- Sign in using email and password.
- Authenticate using Google.
- Access personal character data through an authenticated account.

### Data Administration

- Import spell and rulebook data from JSON files.
- Upload data in batches to Cloud Firestore.
- Validate basic data structure requirements before importing.
- Provide upload progress and error feedback.

## Technology Stack

| Technology | Purpose |
|---|---|
| React 19 | Component-based user interface |
| JavaScript (ES modules) | Application logic |
| Vite 7 | Development server and production build |
| React Router 7 | Client-side navigation |
| Firebase Authentication | User registration and authentication |
| Cloud Firestore | Spell, rulebook, and character data storage |
| Lucide React | Interface icons |
| CSS Modules | Component-specific styling |
| ESLint | Code quality and linting |

## Getting Started

### Prerequisites

- Node.js and npm
- A Firebase project
- A modern web browser

### Installation

Clone the repository and install the dependencies:

```bash
git clone https://github.com/aronbarnkopf/MAGUS_Seged.git
cd MAGUS_Seged
npm install
```

### Run Locally

Start the Vite development server:

```bash
npm run dev
```

Open the local URL printed in the terminal, typically `http://localhost:5173`.

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the local development server |
| `npm run build` | Build the application for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## Project Structure

```text
MAGUS_Seged/
├── public/
├── src/
│   ├── components/
│   │   ├── admin/          # Data administration tools
│   │   ├── layout/         # Shared application layout
│   │   └── ui/             # Reusable UI components
│   ├── contexts/
│   │   └── AuthContext.jsx # Authentication state and actions
│   ├── pages/
│   │   ├── spellbook/      # Spell catalogue and filtering
│   │   ├── rulebook/       # Digital rulebook
│   │   ├── characters/     # Character management
│   │   ├── Login.jsx
│   │   └── Signup.jsx
│   ├── firebase.js         # Firebase initialization
│   ├── App.jsx             # Routes and application providers
│   └── App.css
├── firestore.rules
├── firestore.indexes.json
├── firebase.json
├── package.json
└── README.md
```

## Deployment

The application is configured for Firebase Hosting.

Create a production build:

```bash
npm run build
```

The generated files are placed in the `dist/` directory. To deploy, install the Firebase CLI, authenticate, select your Firebase project, and deploy the hosting build:

```bash
npm install -g firebase-tools
firebase login
firebase use YOUR_FIREBASE_PROJECT_ID
firebase deploy --only hosting
```

Ensure the selected Firebase project and its authentication and Firestore configuration are set up correctly before deployment.

## Future Improvements

Potential areas for further development include:

- Expanding character-sheet functionality and progression management.
- Improving search and filtering across game reference material.
- Adding more character-management utilities.
- Enhancing mobile usability and accessibility.

## License and Attribution

This is an independent fan project created to support players of M.A.G.U.S.

M.A.G.U.S. and its associated intellectual property belong to their respective rights holders. Before redistributing the application or its reference content, review the applicable rights and the repository's license.

