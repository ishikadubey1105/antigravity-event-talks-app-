# BigQuery Release Notes Hub & Tweet Composer 🚀

A lightweight, modern web application designed for developer advocates, cloud architects, and engineers to easily track, search, and share Google Cloud BigQuery release updates. Built from scratch with a **Python Flask** backend and a custom **Vanilla HTML, CSS, and JavaScript** frontend.

🔗 **GitHub Repository:** [https://github.com/ishikadubey1105/antigravity-event-talks-app-](https://github.com/ishikadubey1105/antigravity-event-talks-app-)  
👉 **Live Local Host:** `http://127.0.0.1:5000`

---

## ✨ Features

*   **Real-time XML Feed Integration:** Dynamically fetches and parses Google's official BigQuery Atom/RSS feed.
*   **In-Memory Smart Caching:** Implements a 5-minute server-side cache to keep load times instantaneous while minimizing load on Google's feed servers.
*   **Aesthetic Glassmorphic UI:** A responsive, dark-mode design with glowing states, smooth transitions, custom scrollbars, and skeleton loading screens.
*   **Type-Based Update Pills:** Auto-parses release notes to categorize updates into *Feature*, *Changed*, or *Deprecated* tags.
*   **Search & Filter:** Client-side fuzzy search that filters updates in real-time as you type.
*   **Interactive Tweet Composer:** Easily select multiple updates via custom checkboxes. The app automatically compiles and formats a draft tweet, handles X/Twitter intent URL encoding, and tracks the 280-character limit with warning states.

---

## 🛠️ Tech Stack & Architecture

*   **Backend:** Python 3.12, Flask 3.0
*   **Frontend:** Plain HTML5, Vanilla CSS3, Vanilla JavaScript (ES6)
*   **APIs & Data:** Atom/XML Feed Parsing, X/Twitter Web Intent Integration
*   **Dependency Management:** Pip / Virtual Environment (`.venv`)

---

## 📂 Project Directory Structure

```text
C:\Users\Lenovo\bigquery-release-notes\
├── app.py                  # Flask backend with caching logic & feed parser
├── requirements.txt        # Backend dependencies
├── .gitignore              # Clean env/IDE exclusions
├── templates/
│   └── index.html          # Semantic HTML5 layout
└── static/
    ├── style.css           # Custom glassmorphic CSS theme & animations
    └── script.js           # Client-side state, search & Tweet composer logic
```

---

## 👨‍💻 Quick Start Guide

Get the app running locally in less than a minute:

1.  **Clone and navigate to the project directory:**
    ```bash
    git clone https://github.com/ishikadubey1105/antigravity-event-talks-app-.git
    cd bigquery-release-notes
    ```

2.  **Activate the virtual environment & install requirements:**
    *   **Windows:**
        ```bash
        .venv\Scripts\activate
        pip install -r requirements.txt
        ```
    *   **Mac/Linux:**
        ```bash
        source .venv/bin/activate
        pip install -r requirements.txt
        ```

3.  **Run the Flask application:**
    ```bash
    python app.py
    ```

4.  **Open in your browser:**
    Go to [http://127.0.0.1:5000](http://127.0.0.1:5000)

---

## 💡 Why This Project Matters (For Recruiters)

This project demonstrates core full-stack capabilities without hiding behind complex frameworks or heavy boilerplates:

1.  **Aesthetic Frontend Design:** Shows a deep appreciation for UI/UX. Includes modern design elements like glassmorphism, responsive grids, custom CSS variables, keyframe animations, and custom checkbox UI elements.
2.  **Performance Optimization:** Includes server-side caching to reduce HTTP request overhead, coupled with client-side loading states (shimmer cards) to ensure a high-quality user experience.
3.  **State Management:** Written in clean, modular Vanilla JavaScript. Dynamically updates selected items, computes string truncation for X/Twitter limits, and updates search filters in real-time.
4.  **Production Readiness:** Follows best development standards by containerizing dependency files (`requirements.txt`), organizing clean folder layouts, and setting up strict environment exclusions via `.gitignore`.
