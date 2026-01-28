# PrepTime

An intelligent task scheduling system that learns from your Week 1 schedule and automatically generates the rest of your month using AI-powered pattern analysis and productivity techniques.

## Features

- **Manual Week 1 Creation**: Create your ideal first week schedule
- **AI Month Generation**: Automatically generate Weeks 2-4 based on your patterns
- **Pattern Analysis**: Extracts work hours, task distribution, energy patterns, and preferences
- **Productivity Techniques**: Applies Pomodoro, time blocking, energy management, and break optimization
- **Smart Scheduling**: ML-powered slot scoring for optimal task placement
- **Conflict Detection**: Automatic rescheduling when conflicts arise
- **Explainable AI**: Clear explanations for every scheduling decision
- **Comprehensive Metrics**: Analytics on productivity and time utilization

## Project Structure

```
/web            # Next.js frontend and API routes
/ml_service     # FastAPI inference service
/ml             # ML training pipeline
/shared         # Shared type definitions (TypeScript + Python)
/demo           # Demo scenarios
```

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: FastAPI, Python 3.11+
- **ML**: CatBoost for slot scoring
- **Testing**: Vitest, pytest, property-based testing

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- npm or yarn

### Installation

1. **Clone the repository:**

```bash
git clone https://github.com/yourusername/PrepTime.git
cd PrepTime
```

2. **Install frontend dependencies:**

```bash
cd web
npm install
```

3. **Install backend dependencies:**

```bash
cd ../ml_service
pip install -r requirements.txt
```

### Running the Application

You need to run both the backend and frontend servers simultaneously.

#### Option 1: Using the Restart Script (Windows)

```bash
# From the project root directory
.\restart_services.bat
```

This will start both servers automatically.

#### Option 2: Manual Start (All Platforms)

**Terminal 1 - Backend Server:**

```bash
# From project root
cd ml_service
python -m uvicorn main:app --reload --port 8000
```

The backend API will be available at `http://localhost:8000`

**Terminal 2 - Frontend Server:**

```bash
# From project root
cd web
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Testing the AI Month Generator

1. **Open the application:**
   - Navigate to `http://localhost:3000` in your browser

2. **Add Demo Week (Quick Test):**
   - Click the **"🎯 Add Demo Week"** button
   - This populates Week 1 with realistic tasks from 7 AM to 11 PM
   - Tasks include: workouts, work sessions, meetings, meals, and relaxation

3. **Generate the Month:**
   - Click **"✨ Generate Rest of Month"** button
   - Watch the AI analyze your Week 1 patterns
   - The AI will generate Weeks 2-4 with:
     - Same tasks on matching days (Monday tasks on all Mondays)
     - Similar times (within 7 AM - 11 PM)
     - Preserved colors and labels
     - Intelligent scheduling based on your patterns

4. **Review the Results:**
   - Navigate through the calendar to see generated weeks
   - Each task maintains its color, label, and approximate timing
   - Tasks are scheduled to match your Week 1 routine

### Manual Testing (Without Demo Week)

1. **Create Week 1 manually:**
   - Click on time slots in the calendar
   - Add tasks with names, durations, and colors
   - Fill out at least 5-7 tasks across different days

2. **Generate the month:**
   - Follow step 3 above

### Troubleshooting

**Backend not starting:**
- Make sure Python 3.11+ is installed: `python --version`
- Install dependencies: `pip install -r ml_service/requirements.txt`
- Check if port 8000 is available

**Frontend not starting:**
- Make sure Node.js 18+ is installed: `node --version`
- Install dependencies: `npm install` in the `web` directory
- Check if port 3000 is available

**AI generation not working:**
- Ensure both servers are running
- Check browser console for errors (F12)
- Verify backend is accessible at `http://localhost:8000`

### Quick Start

1. **Install dependencies:**

```bash
# Web frontend
cd web
npm install

# ML service
cd ../ml_service
pip install -r requirements.txt
```

2. **Start the services:**

```bash
# Terminal 1: Start FastAPI service
cd ml_service
uvicorn main:app --reload

# Terminal 2: Start Next.js frontend
cd web
npm run dev
```

3. **Open the app:**
- Main Calendar: http://localhost:3000
- Create your Week 1 schedule
- Click "Generate Rest of Month" to let AI create Weeks 2-4

### How It Works

1. **Create Week 1**: Manually schedule your first week with tasks and events
2. **AI Analyzes**: System extracts patterns (work hours, task types, energy levels)
3. **Generate Month**: AI creates Weeks 2-4 using productivity techniques
4. **Review & Apply**: Preview generated schedule before applying to calendar

See [MONTH_GENERATION.md](docs/MONTH_GENERATION.md) for detailed documentation.

## Development

This project follows a structured development workflow with small, incremental commits. Each component is built and tested independently before integration.

### Git Commit Guidelines

We use **Conventional Commits** to keep our commit history clean and meaningful. This helps with:
- Automatic changelog generation
- Easier code reviews
- Better understanding of project history
- Semantic versioning

#### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Code style changes (formatting, missing semicolons, etc.)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Changes to build process, dependencies, or tooling

#### Examples

**Good commits:**
```bash
feat(web): add task sidebar component with drag-and-drop

- Implement TaskSidebar component with task list
- Add drag-and-drop functionality for task reordering
- Include task filtering by type and priority
- Add unit tests for task interactions

Closes #123
```

```bash
fix(ml-service): correct slot generation for multi-day ranges

Fixed bug where generate_free_slots would fail when date range
spans multiple days. Now properly iterates through each day and
generates slots within day boundaries.
```

```bash
docs(readme): add installation instructions for ML pipeline

Added step-by-step guide for setting up the ML training environment
including Python dependencies and data generation.
```

**Bad commits (avoid these):**
```bash
# Too vague
git commit -m "fixed stuff"
git commit -m "updates"
git commit -m "wip"

# No context
git commit -m "changed index.tsx"

# Multiple unrelated changes
git commit -m "added feature X, fixed bug Y, updated docs"
```

#### Scopes

Use these scopes to indicate which part of the project is affected:

- `web` - Frontend (Next.js, React components)
- `ml-service` - FastAPI backend service
- `ml` - ML training pipeline
- `shared` - Shared types and models
- `demo` - Demo scripts and examples
- `docs` - Documentation
- `ci` - CI/CD configuration

#### Quick Reference

```bash
# 1. Stage your changes
git add <files>

# 2. Commit with a descriptive message
git commit -m "feat(web): add calendar view component"

# 3. For multi-line commits (recommended for larger changes)
git commit
# This opens your editor where you can write:
# Line 1: feat(ml): implement CatBoost model training
# Line 2: (blank)
# Line 3+: Detailed description of changes...

# 4. Push to remote
git push origin main
```

#### Before Committing

- ✅ Test your changes locally
- ✅ Run linters/formatters if available
- ✅ Make sure commit message is descriptive
- ✅ Keep commits focused (one logical change per commit)
- ✅ Pull latest changes before pushing: `git pull origin main`

#### Commit Message Tips

1. **Use imperative mood**: "add feature" not "added feature"
2. **Be specific**: "fix slot generation bug" not "fix bug"
3. **Explain why, not just what**: Include context in the body
4. **Reference issues**: Use "Closes #123" or "Fixes #456"
5. **Keep subject line under 72 characters**

#### Example Workflow

```bash
# Pull latest changes
git pull origin main

# Make your changes
# ... edit files ...

# Check what changed
git status
git diff

# Stage specific files (not everything at once)
git add web/components/TaskSidebar.tsx
git add web/components/TaskSidebar.test.tsx

# Commit with good message
git commit -m "feat(web): add TaskSidebar component with task filtering

- Implement TaskSidebar component with task list display
- Add filtering by task type (deep, study, admin, relax)
- Add filtering by priority level
- Include unit tests for filtering logic
- Style with Tailwind CSS for responsive design

Closes #45"

# Push to remote
git push origin main
```

#### Need Help?

- Check recent commits for examples: `git log --oneline -10`
- See detailed commit: `git show <commit-hash>`
- Amend last commit if needed: `git commit --amend`

**Remember:** Good commits make code reviews easier and help everyone understand the project's evolution!

## License

MIT
