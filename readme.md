# EchoLag

**A browser-based speech coaching lab that helps you master conversations through immersive practice, real-time feedback, and zero judgment.**

**Built at ConestogaHacks 2025**

---

## Team Members

- **Faiz**
- **Lina**
- **Hamza**

---

## Project Overview

EchoLag is an interactive speech training platform designed to help users practice high-pressure conversations in a safe, judgment-free environment. The application simulates real-world scenarios (such as ordering at a busy coffee shop), provides live transcription with filler word detection, and delivers AI-powered feedback to help users improve their communication skills.

Whether you're preparing for job interviews, sales pitches, or customer service interactions, EchoLag gives you a realistic practice environment with instant, actionable coaching.

---

## Key Features

- **Real-Time Transcription**: Live speech-to-text using the Web Speech API
- **Filler Word Detection**: Automatically identifies and highlights hesitations like "um," "uh," "like," and "you know"
- **Pressure Simulation**: Countdown timer creates realistic time constraints
- **AI-Powered Feedback**: Personalized coaching on pace, clarity, and confidence using Google Gemini
- **Interactive Scenarios**: Visual 2D barista simulator keeps users engaged
- **Realistic Voice Responses**: ElevenLabs text-to-speech creates lifelike conversation partners
- **Auto-Submit Workflow**: Hands-free submission when timer expires to maintain immersion

---

## Tech Stack

### Frontend
- Next.js 16
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion (animations)

### Backend & APIs
- Node.js
- Express
- Google Gemini API (AI feedback generation)
- ElevenLabs API (text-to-speech)
- Web Speech API (browser-based transcription)

### State Management
- React Context API
- Custom hooks for speech recognition lifecycle

### Visualization
- HTML5 Canvas (2D interactive timer and scenario graphics)


---

## Installation

### Prerequisites
- Node.js 18.0 or higher
- npm or yarn
- Modern browser (Chrome or Edge recommended for best speech recognition support)

### Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/yourusername/echolag.git
cd echolag
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd backend
npm install
cd ..
```

4. Configure environment variables:

Create `.env` in the `backend/` directory:
```env
PORT=3001
NODE_ENV=development
GEMINI_API_KEY=your_gemini_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

Create `.env.local` in the root directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

5. Start the backend server:
```bash
cd backend
npm run dev
```

6. In a new terminal, start the frontend development server:
```bash
npm run dev
```

7. Navigate to `http://localhost:3000` in your browser

---

## Usage

### Starting a Practice Session

1. Click "Start Practice" on the home screen
2. Allow microphone permissions when prompted
3. Wait for the scenario to load (barista appears, countdown begins)
4. Speak clearly as if in a real conversation
5. Watch your words appear live with filler word highlighting
6. When the timer expires, feedback generates automatically

### Understanding Feedback

**Filler Word Analysis:**
- 0-2 fillers: Excellent clarity
- 3-5 fillers: Room for improvement  
- 6+ fillers: Practice reducing hesitations

**Pace Analysis:**
- Words per minute (WPM): Ideal range is 140-160
- Pause patterns: Natural pauses vs. hesitation silences

---

## How It Works

### Speech Recognition Pipeline
1. User speaks into microphone
2. Web Speech API transcribes in real-time
3. Custom algorithm detects filler words instantly
4. Transcript updates live with highlighted fillers
5. Timer expires and auto-submits transcript
6. Gemini API analyzes performance
7. Feedback displayed with actionable insights

### Filler Word Detection
The application monitors transcription output for common filler patterns:
- "um", "uh", "er"
- "like" (when used as filler, not comparison)
- "you know", "I mean"
- "basically", "actually" (overuse detection)

Detection happens client-side with zero latency for immediate visual feedback.

---

## Challenges Overcome

### Cross-Browser Speech Recognition
Different browsers implement the Web Speech API with varying behavior. We built custom fallbacks and error handling to maintain stability across Chrome, Safari, and Edge.

### Performance Optimization
Running live transcription, countdown animations, filler highlighting, and canvas graphics simultaneously required careful React rendering optimization to prevent frame drops.

### Auto-Submit Synchronization
Coordinating speech recognition shutdown, transcript finalization, and API submission timing required robust state management to avoid race conditions.

---

## Future Improvements

### Additional Scenarios
- Job interview preparation with behavioral questions
- Investor pitch simulation with time pressure
- Customer service difficult conversation handling

### Advanced Analytics
- Personal dashboard tracking filler trends over time
- Pace improvement metrics and confidence scoring
- Daily practice streak system with goals

### Social Features
- Practice rooms for friends to compare performance
- Peer feedback and encouragement system
- Leaderboards for friendly competition


## Contribution Guidelines

```bash
git checkout -b your-name/feature
git add .
git commit -m "Add new feature description"
git push --set-upstream origin your-name/feature
# Create pull request on GitHub
git checkout main
git pull  # After PR is merged
```

---

## License

This project is licensed under the MIT License. See the LICENSE file for details.

---

## Acknowledgments

- ConestogaHacks 2025 for the platform and opportunity
- Google Gemini for AI feedback capabilities
- ElevenLabs for realistic voice synthesis
- The open-source community for tools like Next.js and Tailwind CSS

---

## Links

- **Live Demo**: [Coming Soon]
- **Devpost**: [devpost.com/software/echolag](https://devpost.com/software/echolag)

---

## Contact

For questions or feedback, reach out to the team at: [your-email@example.com]

---

**Built in 24 hours. Polished for a lifetime of better conversations.**
