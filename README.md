# Bunq AI Financial Assistant Frontend

This project is the frontend for the Bunq AI Financial Assistant, built using Next.js and v0.dev.

## Overview

The application provides a user interface to interact with Bunq account data and an AI assistant for financial planning. Users can view their account balances, initiate payments/requests, and generate personalized financial goals through a chat interface.

## Features

*   **Account Overview:** Displays Total, Main, and Savings account balances.
*   **Bunq Style:** Aims to replicate the og bunq experience.
*   **AI Chat Assistant:** Interact with an AI to get financial advice and generate savings plans.
*   **Financial Plan Display:** Renders AI-generated financial plans with actionable steps.
*   **Financial Plan Storage:** (Planned) Backend API to save and manage user-generated financial plans.

## Tech Stack

*   **Framework:** Next.js
*   **Language:** TypeScript
*   **UI:** React, Tailwind CSS, shadcn/ui
*   **Development:** v0.dev

## Getting Started

### Prerequisites

*   Node.js (version specified in `.nvmrc` or latest LTS)
*   npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```

### Running Locally

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Routes

*   `/api/chat`: Handles interactions with the AI chat assistant.
*   (Planned) `/api/goals`: Endpoints for creating, reading, updating, and deleting saved financial goals.

## Deployment

This project is configured for deployment on Vercel. The latest deployment can be accessed here:

**[https://vercel.com/adamcretu36-gmailcoms-projects/v0-new-project-ul4s8obpkvs](https://vercel.com/adamcretu36-gmailcoms-projects/v0-new-project-ul4s8obpkvs)**

*(Note: This link might be outdated if the project name or deployment configuration has changed since the initial v0 setup.)*

## Development with v0.dev

This project was initially scaffolded and iterated upon using [v0.dev](https://v0.dev).

Continue building your app on:

**[https://v0.dev/chat/projects/UL4S8obPkvS](https://v0.dev/chat/projects/UL4S8obPkvS)**

*(Note: Changes made directly in the code might need to be synced back or reconciled with v0.dev if you continue using it for UI generation.)*
