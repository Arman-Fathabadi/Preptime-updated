# PrepTime - Team Instructions

## Running the Application

### Prerequisites
Make sure you have installed:
- **Node.js 18+** (check with `node --version`)
- **Python 3.11+** (check with `python --version`)

### Setup Steps

1. **Clone the repository:**
```bash
git clone https://github.com/Arz472/PrepTime.git
cd PrepTime
```

2. **Install frontend dependencies:**
```bash
cd web
npm install
cd ..
```

3. **Install backend dependencies:**
```bash
cd ml_service
pip install -r requirements.txt
cd ..
```

### Running the App

**You need TWO terminal windows open:**

**Terminal 1 - Backend Server:**
```bash
cd ml_service
python -m uvicorn main:app --reload --port 8000
```
Keep this running. You should see: `Uvicorn running on http://127.0.0.1:8000`

**Terminal 2 - Frontend Server:**
```bash
cd web
npm run dev
```
Keep this running. You should see: `Ready on http://localhost:3000`

**Open the app:** Go to `http://localhost:3000` in your browser

### Quick Demo Test

1. Click the **"🎯 Add Demo Week"** button - this adds a full week of sample tasks
2. Click **"✨ Generate Rest of Month"** - watch the AI generate weeks 2-4
3. Navigate through the calendar to see the generated schedule

---

## Video Script Guidelines

### Video Structure (3-4 minutes total)

**1. Introduction (30 seconds)**
- Each team member introduces themselves briefly
- State your role in the project (if applicable)
- Keep it casual and friendly

**2. Demo Video (1-2 minutes)**
- Play the demo video that was created
- This shows the core functionality in action
- No need to talk over it, let the demo speak for itself

**3. Feature Walkthrough (1-2 minutes)**
- Use screenshots to highlight key features:
  - **Calendar Interface**: Show the clean, modern UI
  - **Manual Scheduling**: Drag-and-drop task creation
  - **Color Coding**: Tasks organized by category/type
  - **Demo Week Button**: One-click sample data
  - **AI Generation**: The magic button that creates your month

**4. AI Explanation (1 minute)**
- **One team member should explain:**
  
  "Our AI analyzes your Week 1 schedule and learns your patterns. It looks at:
  - What tasks you do on which days
  - What times you prefer for different activities
  - Your task categories and how you organize them
  
  Then it intelligently replicates this across the entire month. It schedules the same tasks on matching days - so if you have 'Gym' on Monday in Week 1, it puts 'Gym' on all Mondays. It keeps your colors, labels, and timing preferences consistent.
  
  The AI uses smart scheduling algorithms to find the best time slots and ensures everything fits within your preferred hours (7 AM to 11 PM by default).
  
  Like any AI system, it can make mistakes, so you can always review and adjust the generated schedule before applying it."

**5. Closing (30 seconds)**
- Summarize the value: "PrepTime saves you hours of manual scheduling"
- Mention it's perfect for students, professionals, anyone with recurring schedules
- Thank the viewers

### Important Notes

- **Keep it professional but conversational**
- **Show enthusiasm** - this is a cool project!
- **Don't go into technical implementation details** (no need to mention FastAPI, React, etc.)
- **Focus on user benefits**, not code
- **Practice your sections** so it flows smoothly
- **Keep total video under 4 minutes**

### What NOT to Include

- Don't discuss specific technical limitations
- Don't mention bugs or issues
- Don't talk about what features are missing
- Keep it positive and focused on what it DOES do

### Recording Tips

- Use screen recording software (OBS, Loom, etc.)
- Record in 1080p if possible
- Make sure audio is clear
- Use a quiet environment
- Smile! Energy comes through on camera

---

## Troubleshooting

**Backend won't start:**
- Make sure Python 3.11+ is installed
- Run `pip install -r ml_service/requirements.txt` again
- Check if port 8000 is already in use

**Frontend won't start:**
- Make sure Node.js 18+ is installed
- Delete `node_modules` and run `npm install` again
- Check if port 3000 is already in use

**AI generation not working:**
- Make sure BOTH servers are running
- Check browser console (F12) for errors
- Refresh the page and try again

**Need help?**
- Check the README.md for more details
- Contact the team lead
- Review the demo video for expected behavior

Good luck with the video! 🎥
