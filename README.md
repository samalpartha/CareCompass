# CareCompass

CareCompass is a simple, private, and secure AI companion designed to assist families and caregivers of individuals with dementia and Alzheimer's disease. It provides tools to log daily observations, track symptoms, monitor well-being, and generate AI-powered summaries for doctor visits, all while ensuring user data remains entirely on their local device.

## Project Description

### The Problem
Caring for a loved one with dementia or Alzheimer's is a challenging journey filled with moments of uncertainty. Caregivers often struggle to track the subtle day-to-day changes, recall specific incidents during doctor visits, and manage their own emotional well-being. This can lead to stress, incomplete information for healthcare providers, and a feeling of being overwhelmed.

### Our Approach
CareCompass is a hyper-focused, client-side application that empowers caregivers with simple tools for daily logging and insightful data visualization. By leveraging AI, it transforms raw notes into a structured summary for doctor visits, helping to facilitate more effective conversations about care. The app prioritizes privacy and ease of use, with all data stored locally on the user's device.

## Hackathon Submission Details

- **Working Demo:** [Link to Deployed Prototype]
- **Project Description:** You're reading it! This README provides a comprehensive overview of the problem, our approach, and the technology used.
- **Demo Video (3-5 mins):** [Link to Demo Video]
- **GitHub Repository:** The code for this project is available in this repository, with setup instructions below.

## Features

- **Onboarding:** A simple setup process to personalize the dashboard for the care recipient.
- **Daily Logging:** Easily record daily events, observations, and activities.
- **Symptom Tagging:** Quickly tag logs with common symptoms like confusion, memory issues, mood changes, and more.
- **Caregiver Mood Tracking:** A simple slider to log your own emotional state, helping you keep an eye on your well-being too.
- **Data Visualization:** Interactive charts display trends in logged symptoms and caregiver mood over time, helping to identify patterns.
- **AI-Generated Visit Summaries:** Leverage Google's Gemini models to create structured, insightful summaries of recent logs to prepare for doctor's appointments.
- **100% Private & Secure:** All data is stored exclusively in your browser's local storage. No data ever leaves your computer.
- **Reset Functionality:** Start over at any time with a clean slate.

## Tech Stack

This project is built with a modern, production-ready tech stack:

- **Framework:** [Next.js](https://nextjs.org/) (with App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **UI:** [React](https://react.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [ShadCN UI](https://ui.shadcn.com/)
- **AI Integration:** Google's Gemini API (via direct HTTPS requests)
- **Charts:** [Recharts](https://recharts.org/)
- **Forms:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/) for validation

## Getting Started

To run this project locally, follow these steps:

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Set up environment variables:**
    Create a `.env` file in the root of the project and add your Google AI API key:
    ```
    GEMINI_API_KEY=your_google_ai_api_key
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  **Open your browser:**
    Navigate to [http://localhost:9002](http://localhost:9002) to see the application in action.

## Project Structure

- `src/app/`: Contains the main pages and layout of the application.
- `src/components/`: Reusable React components, including UI components from ShadCN and custom application components.
- `src/ai/`: Houses the Genkit flows and AI-related logic.
  - `src/ai/flows/`: Defines the AI-powered workflows, such as generating the doctor visit summary.
- `src/lib/`: Contains shared utilities, type definitions, and constants.
- `public/`: Static assets.
