// const express = require('express');
// const path = require('path');
// const multer = require('multer');
// const fs = require('fs');
// const axios = require('axios');
// const FormData = require('form-data');
// const Datastore = require('nedb');
// require('dotenv').config();

// const app = express();
// const PORT = process.env.PORT || 3000;

// // Initialize local database to store Email/Phone alongside Cloud UUID
// const db = new Datastore({ filename: './users.db', autoload: true });

// // Configuration
// const API_TOKEN = process.env.LUXAND_API_TOKEN;
// const API_URL = "https://api.luxand.cloud";

// app.use(express.json());
// app.use(express.static('public')); // Serve your CSS/JS
// app.set('view engine', 'ejs');

// const upload = multer({ dest: 'uploads/' });

// // --- ROUTES ---

// app.get('/registration', (req, res) => res.render('registration', { title: 'Face Registration' }));

// /**
//  * 1. REGISTER FACE
//  * Logic: Create Person in Cloud -> Add extra photos -> Save metadata to local DB
//  */
// app.post('/api/register-face', upload.array('images[]'), async (req, res) => {
//     try {
//         const { name, email, phone } = req.body;
//         const files = req.files;

//         if (!files || files.length === 0) return res.status(400).json({ message: 'No photos received' });

//         // Step A: Create Person in Luxand with the FIRST photo
//         const form = new FormData();
//         form.append('name', name);
//         form.append('photos', fs.createReadStream(files[0].path));
        
//         const luxandResponse = await axios.post(`${API_URL}/v2/person`, form, {
//             headers: { ...form.getHeaders(), 'token': API_TOKEN }
//         });

//         const uuid = luxandResponse.data.uuid;

//         // Step B: Add additional photos to the SAME person for higher accuracy
//         for (let i = 1; i < files.length; i++) {
//             const extraForm = new FormData();
//             extraForm.append('photos', fs.createReadStream(files[i].path));
//             await axios.post(`${API_URL}/v2/person/${uuid}`, extraForm, {
//                 headers: { ...extraForm.getHeaders(), 'token': API_TOKEN }
//             });
//         }

//         // Step C: Save local record (Email, Phone, UUID)
//         db.insert({ name, email, phone, luxand_uuid: uuid, createdAt: new Date() });
 
//         // Cleanup temp files
//         files.forEach(f => fs.unlinkSync(f.path));

//         res.json({ success: true, message: 'Registration Complete!' });

//     } catch (err) {
//         console.error("Cloud Error:", err.response?.data || err.message);
//         res.status(500).json({ success: false, message: 'Cloud API failure' });
//     }
// });

// app.post('/api/register-face', upload.array('images', 10), async (req, res) => {
//     try {
//         const { name, email, phone } = req.body;
//         const files = req.files;

//         console.log('📝 Registration attempt:', { name, email, phone, fileCount: files?.length });
//         console.log('🔑 API Token present:', !!API_TOKEN);
//         console.log('🔑 API Token (first 10 chars):', API_TOKEN?.substring(0, 10));

//         if (!files || files.length === 0) {
//             return res.status(400).json({ message: 'No photos received' });
//         }

//         // Step A: Create Person in Luxand with the FIRST photo
//         const form = new FormData();
//         form.append('name', name);
//         form.append('photos', fs.createReadStream(files[0].path));
        
//         console.log('📤 Sending request to Luxand...');
        
//         const luxandResponse = await axios.post(`${API_URL}/v2/person`, form, {
//             headers: { 
//                 ...form.getHeaders(), 
//                 'token': API_TOKEN 
//             }
//         });

//         console.log('✅ Luxand response:', luxandResponse.data);

//         const uuid = luxandResponse.data.uuid;

//         // Step B: Add additional photos
//         for (let i = 1; i < files.length; i++) {
//             console.log(`📤 Adding photo ${i + 1}/${files.length}...`);
//             const extraForm = new FormData();
//             extraForm.append('photos', fs.createReadStream(files[i].path));
//             await axios.post(`${API_URL}/v2/person/${uuid}`, extraForm, {
//                 headers: { ...extraForm.getHeaders(), 'token': API_TOKEN }
//             });
//         }

//         // Step C: Save local record
//         db.insert({ name, email, phone, luxand_uuid: uuid, createdAt: new Date() });
 
//         // Cleanup temp files
//         files.forEach(f => fs.unlinkSync(f.path));

//         res.json({ success: true, message: 'Registration Complete!' });

//     } catch (err) {
//         console.error("❌ FULL ERROR:", err);
//         console.error("❌ Response data:", err.response?.data);
//         console.error("❌ Response status:", err.response?.status);
//         console.error("❌ Response headers:", err.response?.headers);
        
//         files?.forEach(f => {
//             if (fs.existsSync(f.path)) fs.unlinkSync(f.path);
//         });
        
//         res.status(500).json({ 
//             success: false, 
//             message: 'Cloud API failure',
//             error: err.response?.data || err.message 
//         });
//     }
// });
// /**
//  * 2. RECOGNIZE FACE
//  * Logic: Search Cloud -> If UUID found, get details from local DB
//  */
// app.post('/api/recognize', upload.single('photo'), async (req, res) => {
//     try {
//         const form = new FormData();
//         form.append('photo', fs.createReadStream(req.file.path));

//         const searchRes = await axios.post(`${API_URL}/photo/search/v2`, form, {
//             headers: { ...form.getHeaders(), 'token': API_TOKEN }
//         });

//         fs.unlinkSync(req.file.path);

//         if (searchRes.data && searchRes.data.length > 0) {
//             const cloudUser = searchRes.data[0];
            
//             // Find extra details (Email/Phone) in local DB using the UUID
//             db.findOne({ luxand_uuid: cloudUser.uuid }, (err, localUser) => {
//                 res.json({ 
//                     success: true, 
//                     name: localUser ? localUser.name : cloudUser.name,
//                     email: localUser ? localUser.email : 'N/A',
//                     probability: cloudUser.probability 
//                 });
//             });
//         } else {
//             res.json({ success: false, message: 'Unknown person' });
//         }
//     } catch (err) {
//         res.status(500).json({ success: false, error: err.message });
//     }
// });

// app.listen(PORT, () => console.log(`Server: http://localhost:${PORT}`));
const express = require('express');
const path = require('path');
const multer = require('multer');

const fs = require('fs'); // Added for folder creation
const { spawn } = require('child_process');
const { check, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();
let streamProc = null;

// Helper: Run Python Script (robust spawn with error/timeout handling)
async function runPythonScript(command, args) {
    const scriptPath = path.join(__dirname, 'scripts', 'face_service.py');
    function windowsPythonPaths() {
        const found = [];
        try {
            const localApp = process.env.LOCALAPPDATA;
            const progFiles = process.env['ProgramFiles'] || 'C:\\Program Files';
            const progFilesX86 = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)';
            const candidatesDirs = [
                localApp ? path.join(localApp, 'Programs', 'Python') : null,
                path.join(progFiles, 'Python'),
                path.join(progFilesX86, 'Python')
            ].filter(Boolean);
            for (const dir of candidatesDirs) {
                if (fs.existsSync(dir)) {
                    const entries = fs.readdirSync(dir, { withFileTypes: true });
                    for (const d of entries) {
                        if (d.isDirectory() && /^Python3\d+/.test(d.name)) {
                            const exe = path.join(dir, d.name, 'python.exe');
                            if (fs.existsSync(exe)) found.push(exe);
                        }
                    }
                }
            }
        } catch (_) {}
        return found;
    }
    const candidates = [
        process.env.PYTHON_EXE,
        process.platform === 'win32' ? 'py' : null,
        'python',
        'python3',
        ...windowsPythonPaths()
    ].filter(Boolean);
    
    function trySpawn(exe) {
        return new Promise((resolve, reject) => {
            let resolved = false;
            const pythonProcess = spawn(exe, [scriptPath, command, ...args], { stdio: ['ignore', 'pipe', 'pipe'] });
            
            let stdoutData = '';
            let stderrData = '';
            
            const timeoutMs = 60000;
            const timeout = setTimeout(() => {
                try { pythonProcess.kill('SIGTERM'); } catch (_) {}
                if (!resolved) {
                    resolved = true;
                    reject(new Error(`Python process timeout after ${timeoutMs}ms`));
                }
            }, timeoutMs);
            
            pythonProcess.stdout.on('data', (data) => { stdoutData += data.toString(); });
            pythonProcess.stderr.on('data', (data) => { stderrData += data.toString(); });
            
            pythonProcess.on('error', (err) => {
                clearTimeout(timeout);
                if (!resolved) {
                    resolved = true;
                    reject(new Error(`Failed to start Python (${exe}): ${err.message}`));
                }
            });
            
            pythonProcess.on('close', (code) => {
                clearTimeout(timeout);
                if (resolved) return;
                if (code !== 0) {
                const tailStdout = stdoutData.split('\n').slice(-5).join('\n').trim();
                const tailStderr = stderrData.split('\n').slice(-5).join('\n').trim();
                const message = `Python exited with code ${code}.\nstdout:\n${tailStdout}\nstderr:\n${tailStderr}`;
                return reject(new Error(message));
            }
                try {
                    const lines = stdoutData.trim().split('\n');
                    let result = null;
                    for (let i = lines.length - 1; i >= 0; i--) {
                        try {
                            result = JSON.parse(lines[i]);
                            break;
                        } catch (_) {}
                    }
                    if (result) {
                        resolved = true;
                        resolve(result);
                    } else {
                        reject(new Error(`Failed to parse Python output: ${stdoutData}`));
                    }
                } catch (e) {
                    reject(new Error(`Failed to parse Python output: ${stdoutData} | Error: ${e.message}`));
                }
            });
        });
    }
    
    let lastErr = null;
    for (const exe of candidates) {
        try {
            return await trySpawn(exe);
        } catch (err) {
            lastErr = err;
        }
    }
    throw lastErr || new Error('No Python executable found. Set PYTHON_EXE in .env');
}

// ========== CONFIGURATION ==========
const PORT = parseInt(process.env.PORT || '3000', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';

// Ensure 'uploads' directory exists on startup
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('Created uploads directory');
}

// Simple in-memory user storage
const users = {
    admin: { username: 'admin', password: 'admin123' }
};

const sessions = {};

// ========== MIDDLEWARE ==========
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: NODE_ENV === 'production' ? '1d' : 0
}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
    maxAge: NODE_ENV === 'production' ? '1d' : 0
}));
app.use('/models', express.static(path.join(__dirname, 'models'), {
    maxAge: NODE_ENV === 'production' ? '7d' : 0
}));

// Session Middleware
app.use((req, res, next) => {
    const sessionId = req.headers.cookie?.split('sessionId=')[1]?.split(';')[0];
    if (sessionId && sessions[sessionId]) {
        req.user = sessions[sessionId];
    }
    next();
});

const requireLogin = (req, res, next) => {
    if (req.user) {
        next();
    } else {
        const isApi = req.path && req.path.startsWith('/api/');
        if (isApi) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        res.redirect('/');
    }
};

// ========== MULTER CONFIGURATION ==========
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        try {
            const raw = (req.body && req.body.name) ? String(req.body.name) : 'user';
            const slug = raw.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-_]/g, '');
            const dir = path.join('uploads', slug || 'user');
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            // Track dir and counter on request object
            req._uploadDir = dir;
            if (typeof req._fileCounter !== 'number') {
                // Initialize from existing files count
                try {
                    const existing = fs.readdirSync(dir).filter(n => n.toLowerCase().endsWith('.png'));
                    req._fileCounter = existing.length + 1;
                } catch {
                    req._fileCounter = 1;
                }
            }
            cb(null, dir);
        } catch (e) {
            cb(e);
        }
    },
    filename: function (req, file, cb) {
        try {
            const raw = (req.body && req.body.name) ? String(req.body.name) : 'user';
            const slug = raw.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-_]/g, '');
            const index = req._fileCounter || 1;
            req._fileCounter = index + 1;
            cb(null, `${slug || 'user'}-${index}.png`);
        } catch (e) {
            cb(e);
        }
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Increased to 5MB per photo for better quality
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// ========== ROUTES ==========

// Login & Home Routes
app.get('/', (req, res) => {
    if (req.user) return res.redirect('/admin');
    res.render('index', { title: 'Face Recognition - Login' });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users[username];
    if (user && user.password === password) {
        const sessionId = Math.random().toString(36).substring(2, 15);
        sessions[sessionId] = { username: user.username };
        res.cookie('sessionId', sessionId, { httpOnly: true, maxAge: 3600000 });
        res.redirect('/admin');
    } else {
        res.status(401).render('index', { title: 'Login', error: 'Invalid credentials' });
    }
});

app.get('/logout', (req, res) => {
    const sessionId = req.headers.cookie?.split('sessionId=')[1]?.split(';')[0];
    if (sessionId) delete sessions[sessionId];
    res.clearCookie('sessionId');
    res.redirect('/');
});

// Protected Pages
app.get('/admin', requireLogin, (req, res) => {
    res.render('admin', { title: 'Admin Dashboard' });
});

app.get('/surveillance', requireLogin, (req, res) => {
    res.render('surveillance', { title: 'Live Surveillance' });
});

app.get('/registration', requireLogin, (req, res) => {
    res.render('registration', { title: 'Register New Face' });
});

// ========== API: FACE REGISTRATION ==========
// Notes: 
// 1. 'images[]' matches the formData.append('images[]', ...) from frontend
// 2. We put validation AFTER 'upload' middleware because Multer parses the body first
app.post('/api/register-face', 
    requireLogin, 
    upload.array('images'), // Matches Frontend FormData name
    [
        check('name').not().isEmpty().withMessage('Name is required'),
        check('email').isEmail().withMessage('Valid email is required'),
        check('phone').optional().isLength({ min: 10 }).withMessage('Valid phone number is required')
    ],
    async (req, res) => {
        try {
            // 1. Check for Validation Errors (Text fields)
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                // If validation fails, we should delete uploaded files to save space
                if (req.files) {
                    req.files.forEach(f => fs.unlinkSync(f.path));
                }
                return res.status(400).json({ success: false, errors: errors.array() });
            }

            // 2. Extract Data
            const { name, email, phone } = req.body;
            const images = req.files;

            // 3. Validate Images exist
            if (!images || images.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'At least one image is required. Please capture photos.'
                });
            }

            console.log(`Processing registration for: ${name}`);
            console.log(`Received ${images.length} images.`);

            const imagePaths = images.map(f => f.path);

            // Save Metadata to DB
            const faceData = {
                name,
                email,
                phone,
                imagePaths: images.map(f => `/${req._uploadDir.replace(/\\+/g,'/')}/${f.filename}`),
                createdAt: new Date()
            };

            const dbPath = path.join(__dirname, 'faces.json');
            let dbData = [];
            if (fs.existsSync(dbPath)) {
                dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
            }
            dbData.push(faceData);
            fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2));

            // Success Response
            res.json({
                success: true,
                message: `${name} registered successfully`,
                data: {
                    name,
                    email,
                    imageCount: images.length,
                    folder: `/${req._uploadDir.replace(/\\+/g,'/')}/`
                }
            });

        } catch (err) {
            console.error('Registration error:', err);
            res.status(500).json({
                success: false,
                message: 'Registration failed: ' + err.message
            });
        }
});

// ========== API: FACE RECOGNITION ==========
app.post('/api/recognize', requireLogin, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No image uploaded' });
        }

        const result = await runPythonScript('recognize', [req.file.path]);
        
        // Cleanup
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

        res.json(result);
    } catch (err) {
        console.error('Recognition error:', err);
        // Cleanup
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        
        res.status(500).json({ success: false, message: 'Recognition failed: ' + err.message });
    }
});

// ========== API: START/STOP DEEPFACE STREAM ==========
app.post('/api/stream/start', requireLogin, async (req, res) => {
    try {
        if (streamProc && !streamProc.killed) {
            return res.json({ success: true, message: 'Stream already running' });
        }
        const scriptPath = path.join(__dirname, 'scripts', 'face_service.py');
        streamProc = spawn(process.env.PYTHON_EXE || 'python', [scriptPath, 'stream'], { stdio: ['ignore', 'pipe', 'pipe'] });
        let started = false;
        streamProc.stdout.on('data', (d) => {
            const s = d.toString();
            if (!started) {
                started = true;
                console.log('DeepFace stream started');
            }
            console.log('[stream]', s.trim());
        });
        streamProc.stderr.on('data', (d) => console.error('[stream err]', d.toString().trim()));
        streamProc.on('close', () => {
            console.log('DeepFace stream closed');
            streamProc = null;
        });
        res.json({ success: true, message: 'Stream starting' });
    } catch (e) {
        console.error('Start stream error:', e);
        res.status(500).json({ success: false, message: 'Failed to start stream: ' + e.message });
    }
});

app.post('/api/stream/stop', requireLogin, async (req, res) => {
    try {
        if (streamProc && !streamProc.killed) {
            try { streamProc.kill('SIGTERM'); } catch (_) {}
            streamProc = null;
            return res.json({ success: true, message: 'Stream stopped' });
        }
        res.json({ success: true, message: 'No active stream' });
    } catch (e) {
        res.status(500).json({ success: false, message: 'Failed to stop stream: ' + e.message });
    }
});

// ========== API: GET REGISTERED FACES ==========
app.get('/api/faces', requireLogin, (req, res) => {
    const dbPath = path.join(__dirname, 'faces.json');
    if (fs.existsSync(dbPath)) {
        const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        res.json(data); 
    } else {
        res.json([]);
    }
});

// ========== API: UNREGISTER FACE ==========
app.post('/api/unregister', requireLogin, async (req, res) => {
    try {
        const { label_id, name } = req.body || {};
        const dbPath = path.join(__dirname, 'faces.json');
        let data = [];
        if (fs.existsSync(dbPath)) {
            data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        }
        const toRemove = [];
        const remain = [];
        for (const entry of data) {
            const match = (label_id && entry.label_id === label_id) || (name && entry.name === name);
            if (match) {
                toRemove.push(entry);
            } else {
                remain.push(entry);
            }
        }
        // Delete image files for removed entries
        for (const entry of toRemove) {
            for (const webPath of entry.imagePaths || []) {
                const local = webPath.startsWith('/uploads/')
                    ? path.join(__dirname, 'uploads', path.basename(webPath))
                    : path.join(__dirname, webPath.replace('/', path.sep));
                try {
                    if (fs.existsSync(local)) fs.unlinkSync(local);
                } catch (_) {}
            }
        }
        // Persist updated faces.json
        fs.writeFileSync(dbPath, JSON.stringify(remain, null, 2));
        // Update label_map.json
        const lmPath = path.join(__dirname, 'label_map.json');
        let lm = {};
        if (fs.existsSync(lmPath)) {
            lm = JSON.parse(fs.readFileSync(lmPath, 'utf8'));
        }
        if (label_id && lm[String(label_id)]) {
            delete lm[String(label_id)];
        }
        if (name) {
            for (const k of Object.keys(lm)) {
                if (lm[k] === name) delete lm[k];
            }
        }
        fs.writeFileSync(lmPath, JSON.stringify(lm, null, 2));
        // Rebuild model from remaining entries
        const result = await runPythonScript('rebuild', []);
        res.json({ success: true, removed: toRemove.length, remaining: remain.length, rebuild: result });
    } catch (err) {
        console.error('Unregister error:', err);
        res.status(500).json({ success: false, message: 'Unregister failed: ' + err.message });
    }
});

// ========== API: SYSTEM STATS ==========
app.get('/api/stats', requireLogin, (req, res) => {
    try {
        // Count registered faces
        const dbPath = path.join(__dirname, 'faces.json');
        let registeredFaces = 0;
        if (fs.existsSync(dbPath)) {
            const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
            registeredFaces = data.length;
        }

        res.json({
            activeCameras: 1, // Mock value
            registeredFaces: registeredFaces,
            recentDetections: 0 // Mock value
        });
    } catch (err) {
        console.error('Stats error:', err);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// ========== ERROR HANDLING ==========
// API 404 (ensure JSON for missing endpoints)
app.use('/api', (req, res) => {
    res.status(404).json({ success: false, message: 'API route not found' });
});

app.use((req, res) => {
    res.status(404).render('404', { title: 'Page Not Found' });
});

app.use((err, req, res, next) => {
    console.error('Global Error:', err);
    // Handle Multer Errors specifically
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ success: false, message: 'Upload error: ' + err.message });
    }
    const isApi = req.path && req.path.startsWith('/api/');
    if (isApi) {
        return res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
    }
    res.status(err.status || 500).render('error', { title: 'Error', message: err.message });
});

// ========== START SERVER ==========
function startServer(port, attempts = 0) {
    try {
        const srv = app.listen(port, () => {
            console.log(`[${NODE_ENV.toUpperCase()}] Server running on http://localhost:${port}`);
        });
        srv.on('error', (err) => {
            if (err && err.code === 'EADDRINUSE' && attempts < 10) {
                const next = Number(port) + 1;
                console.error(`Port ${port} in use, trying ${next}...`);
                startServer(next, attempts + 1);
            } else {
                console.error('Server error:', err);
                process.exit(1);
            }
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}
startServer(PORT);
