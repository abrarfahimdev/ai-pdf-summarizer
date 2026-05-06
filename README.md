# 📄 AI PDF Summarizer — React + Groq AI

A modern, fully responsive AI-powered PDF summarizer built with React and Groq AI. Upload any PDF and get an instant intelligent summary in seconds.


---

## 🚀 Live Demo

https://wondrous-pudding-9a8ae7.netlify.app/

---

## ✨ Features

- 📋 **4 Summary Modes** — Bullet Points, Short, Detailed, Key Facts
- 📊 **PDF Stats** — Word count, page count, reading time
- 🌐 **Language Detection** — Automatically detects document language
- 📥 **Download Summary** — Save as TXT or PDF
- 🕒 **Summary History** — Last 5 summaries saved locally
- 🌙 **Dark / Light Mode** — Smooth theme toggle
- 📱 **Fully Responsive** — Works on mobile, tablet and desktop
- ⬆️ **Drag & Drop Upload** — Easy PDF upload experience
- 📋 **Copy Button** — One click copy for any summary
- ⚡ **Fast** — Powered by Groq AI (LLaMA 3.3 70B)

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| React 18 | Frontend UI framework |
| Vite | Fast build tool and dev server |
| Groq API | AI inference (LLaMA 3.3 70B) |
| PDF.js | PDF text extraction |
| react-markdown | Markdown rendering for summaries |
| localStorage | Persistent summary history |
| CSS Variables | Dynamic dark/light theming |

---

## 📦 Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/abrarfahimdev/ai-pdf-summarizer.git
cd ai-pdf-summarizer
```

### 2. Install dependencies

```bash
npm install
```

### 3. Get your Groq API key

- Go to [console.groq.com](https://console.groq.com)
- Sign up for a free account
- Navigate to **API Keys** and create a new key

### 4. Create your `.env` file

Create a `.env` file in the root of the project:

```env
VITE_GROQ_API_KEY=your_groq_api_key_here
```

> ⚠️ Never share or commit your API key. The `.env` file is already in `.gitignore`.

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🚀 Deployment (Netlify)

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com) and import your repository
3. Add your environment variable:
   - Key: `VITE_GROQ_API_KEY`
   - Value: your Groq API key
4. Click **Deploy**

Your app will be live in under 2 minutes. ✅

---

## 📁 Project Structure

```
ai-pdf-summarizer/
├── public/
│   └── favicon.svg
├── src/
│   ├── App.jsx        # Main app component — all logic and UI
│   ├── App.css        # All styles including themes and responsive design
│   ├── index.css      # Base reset styles
│   └── main.jsx       # React entry point
├── .env               # Your API key (never commit this)
├── .gitignore
├── index.html
├── package.json
└── vite.config.js
```

---

## 🎨 Screenshots

### Dark Mode
![Dark Mode] !(screencapture-wondrous-pudding-9a8ae7-netlify-app-2026-05-05-23_26_31.png)

### Light Mode
![Light Mode] ! (screencapture-wondrous-pudding-9a8ae7-netlify-app-2026-05-05-23_26_58.png)
### Mobile View
![Mobile View] ! (image.png)

---

## 📋 Summary Modes Explained

| Mode | Description |
|------|-------------|
| 📋 Bullet Points | Clean bullet point summary covering main topics |
| ⚡ Short | 3-5 sentence quick overview |
| 📖 Detailed | Comprehensive in-depth summary |
| 🎯 Key Facts | Important facts, numbers and dates only |

---

## 🔧 Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build locally
```

---

## 🤝 Use Cases

This project is a solid foundation for:

- 📚 **Students** summarizing research papers and textbooks
- ⚖️ **Law firms** reviewing contracts quickly
- 🏢 **Businesses** summarizing reports and documents
- 🏥 **Healthcare** reviewing medical documents
- 📰 **Journalists** quickly processing press releases

---

## 👨‍💻 Author

**Abrar Fahim**
- GitHub: https://github.com/abrarfahimdev
- Fiverr: https://www.fiverr.com/sellers/abrar7780/
- Email: fahimabrarcse7780@gmail.com

---

## 📄 License

MIT License — free to use for personal and commercial projects.

---

## ⭐ Support

If you found this project helpful, please give it a ⭐ on GitHub!

---

*Built as part of a freelance portfolio to demonstrate React + AI integration skills.*
