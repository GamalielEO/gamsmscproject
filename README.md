# Face Recognition Security System

A professional, web-based face recognition application designed for security and surveillance. This system allows for user registration with face data collection and real-time surveillance using state-of-the-art deep learning models.

## 🚀 Features

### 1. User Registration
-   **Face Capture**: Captures multiple face samples via webcam.
-   **Auto-Alignment**: Ensures captured faces are aligned for better accuracy.
-   **Organization**: Stores user images in dedicated subfolders (e.g., `uploads/JohnDoe/`).
-   **Robustness**: Includes retry logic for network stability and client-side image compression for performance.

### 2. Real-Time Surveillance
-   **DeepFace Integration**: Uses the powerful `DeepFace` library for recognition.
-   **Live Stream**: Features a dedicated surveillance mode using `DeepFace.stream`.
-   **Lightweight UI**: Minimalist interface focused on the video feed and control buttons.

### 3. Admin Dashboard
-   **Statistics**: Displays the total count of registered individuals.
-   **Management**: Allows administrators to unregister users, automatically deleting their associated data and images.

### 4. System Architecture
-   **Hybrid Stack**: Combines a Node.js/Express web server with a Python-based AI engine.
-   **Accuracy**: Tuned for high accuracy using `SFace` model and `RetinaFace` detector.
-   **Performance**: Optimized with atomic file operations and efficient image handling.

## 🛠️ Tech Stack

-   **Backend**: Node.js, Express.js
-   **Frontend**: EJS (Embedded JavaScript templates), CSS (Navy Blue Theme)
-   **AI/ML Engine**: Python, DeepFace, TensorFlow (CPU), OpenCV (Headless)
-   **Storage**: Local file system (JSON database + Image directories)

## 📋 Prerequisites

Ensure you have the following installed:
-   **Node.js** (v14 or higher)
-   **Python** (v3.8 or higher)
-   **Git**

## 📦 Installation

1.  **Clone the Repository**
    ```bash
    git clone <repository-url>
    cd face-recognition-app
    ```

2.  **Install Node.js Dependencies**
    ```bash
    npm install
    ```

3.  **Install Python Dependencies**
    It is recommended to use a virtual environment.
    ```bash
    # Windows
    python -m venv venv
    .\venv\Scripts\activate

    # Install requirements
    pip install -r requirements.txt
    ```
    *Note: If you encounter path issues on Windows, try using `py` instead of `python`.*

## 🚀 Usage

1.  **Start the Server**
    You can start the server using npm. It handles both the Node.js server and Python script management.
    ```bash
    npm start
    ```
    *Or for development with auto-restart:*
    ```bash
    npm run dev
    ```

2.  **Access the Application**
    Open your browser and navigate to:
    `http://localhost:3000`

3.  **Workflow**
    -   **Register**: Go to the Registration page. Enter a name and capture face samples. The system will save these in the `uploads` folder.
    -   **Surveillance**: Go to the Surveillance page. Click "Start DeepFace Stream" to launch the recognition window. The system will identify faces from the `uploads` database in real-time.
    -   **Admin**: Visit the Admin page to view registered user counts or remove users.

## 📂 Project Structure

```
face-recognition-app/
├── public/             # Static assets (CSS, client-side JS)
├── scripts/            # Python scripts for face recognition
│   └── face_service.py # Core logic for DeepFace stream & operations
├── uploads/            # Database of registered user images (auto-generated)
├── views/              # EJS templates (UI)
│   ├── index.ejs       # Home page
│   ├── registration.ejs# User registration interface
│   ├── surveillance.ejs# Surveillance control interface
│   └── admin.ejs       # Admin dashboard
├── index.js            # Main Node.js server entry point
├── package.json        # Node.js dependencies
├── requirements.txt    # Python dependencies
└── README.md           # Project documentation
```

## ⚙️ Configuration

-   **Port**: Defaults to `3000`. Can be changed in `index.js`.
-   **Model**: Currently configured to use `SFace` with `RetinaFace` backend for optimal balance of speed and accuracy on CPU.

## 🤝 Contributing

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License.
