import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// Path definitions
const dataDir = path.join(process.cwd(), 'data');
const siteContentPath = path.join(dataDir, 'site_content.json');
const registrationsPath = path.join(dataDir, 'registrations.json');

// Ensure data directory and files exist
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Fallback password if process.env.ADMIN_PASSWORD is empty
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '678@redSPSC.Qn';

// Middleware for Admin authentication
function authenticateAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${ADMIN_PASSWORD}`) {
    return res.status(401).json({ error: 'Unauthorized: Invalid admin key' });
  }
  next();
}

// Ensure files are populated at startup
function initDatabase() {
  if (!fs.existsSync(siteContentPath)) {
    console.log('Site content data is missing, should be populated via create_file');
  }
  if (!fs.existsSync(registrationsPath)) {
    fs.writeFileSync(registrationsPath, JSON.stringify([], null, 2));
  }
}
initDatabase();

// --- API ENDPOINTS ---

// Server health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// GET site content
app.get('/api/content', (req, res) => {
  try {
    if (fs.existsSync(siteContentPath)) {
      const data = fs.readFileSync(siteContentPath, 'utf8');
      res.json(JSON.parse(data));
    } else {
      res.status(500).json({ error: 'Database content is unpopulated' });
    }
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to read content: ' + err.message });
  }
});

// POST update site content (Admin only)
app.post('/api/content', authenticateAdmin, (req, res) => {
  try {
    const updatedContent = req.body;
    if (!updatedContent || typeof updatedContent !== 'object') {
      return res.status(400).json({ error: 'Invalid content format' });
    }
    fs.writeFileSync(siteContentPath, JSON.stringify(updatedContent, null, 2), 'utf8');
    res.json({ success: true, message: 'Website content updated successfully!' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save content: ' + err.message });
  }
});

// POST submit membership registration
app.post('/api/register', (req, res) => {
  try {
    const { fullName, classVal, studentId, phone, email, whyJoin, agreement } = req.body;

    if (!fullName || !classVal || !studentId || !phone || !email || !agreement) {
      return res.status(400).json({ error: 'Please fill in all required fields and accept the agreement.' });
    }

    const registrations = JSON.parse(fs.readFileSync(registrationsPath, 'utf8'));

    // Prevent duplicate entries by studentId + class
    const duplicate = registrations.find((r: any) => r.studentId === studentId && r.classVal === classVal);
    if (duplicate) {
      return res.status(400).json({ error: 'An application with this Student ID has already been received.' });
    }

    const newAttendee = {
      id: 'reg_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now(),
      fullName,
      classVal,
      studentId,
      phone,
      email,
      whyJoin: whyJoin || '',
      status: 'Submitted',
      createdAt: new Date().toISOString(),
    };

    registrations.push(newAttendee);
    fs.writeFileSync(registrationsPath, JSON.stringify(registrations, null, 2), 'utf8');

    // Real-time automatic sync to Google Sheets if configured
    try {
      if (fs.existsSync(siteContentPath)) {
        const siteContentData = JSON.parse(fs.readFileSync(siteContentPath, 'utf8'));
        if (siteContentData.googleSheetsUrl) {
          console.log(`[Google Sheets API Sync] Forwarding new recruit: ${fullName}`);
          fetch(siteContentData.googleSheetsUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'single',
              ...newAttendee
            })
          }).catch((err: any) => {
            console.error('[Google Sheets API Sync] Fail: ', err.message);
          });
        }
      }
    } catch (e: any) {
      console.error('[Google Sheets API Sync] Exception parsing URL configurations: ', e.message);
    }

    // Simulate Option A: Email dispatcher log to senacollegeredcrescent@gmail.com
    console.log('\n=========================================');
    console.log('🚨 NEW RED CRESCENT APPLICANT RECEIVED 🚨');
    console.log(`To: senacollegeredcrescent@gmail.com`);
    console.log(`Subject: New SPSCRCS Registration: ${fullName} (${studentId})`);
    console.log(`Body:`);
    console.log(`Name: ${fullName}`);
    console.log(`Class: ${classVal}`);
    console.log(`ID: ${studentId}`);
    console.log(`Phone: ${phone}`);
    console.log(`Email: ${email}`);
    console.log(`Why Join: ${whyJoin}`);
    console.log('=========================================\n');

    res.json({
      success: true,
      message: 'Thank you for applying. Your application has been received.',
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Registration failed: ' + err.message });
  }
});

// POST submit member feedback
app.post('/api/feedback', (req, res) => {
  try {
    const { name, role, quote, rating } = req.body;
    if (!name || !role || !quote) {
      return res.status(400).json({ error: 'Please provide name, role, and feedback content.' });
    }

    if (fs.existsSync(siteContentPath)) {
      const siteContent = JSON.parse(fs.readFileSync(siteContentPath, 'utf8'));
      if (!siteContent.feedbacks) {
        siteContent.feedbacks = [];
      }

      const newFeedback = {
        id: 'fb_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now(),
        name,
        role,
        quote,
        rating: typeof rating === 'number' ? rating : 5,
        createdAt: new Date().toISOString()
      };

      siteContent.feedbacks.push(newFeedback);
      fs.writeFileSync(siteContentPath, JSON.stringify(siteContent, null, 2), 'utf8');
      res.json({ success: true, message: 'Thank you! Your feedback has been published.' });
    } else {
      res.status(500).json({ error: 'Database site_content is missing' });
    }
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save feedback: ' + err.message });
  }
});

// Admin login verification
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ error: 'Password required' });
  }

  if (password === ADMIN_PASSWORD) {
    res.json({ success: true, token: ADMIN_PASSWORD });
  } else {
    res.status(401).json({ error: 'Invalid admin passcode. Please try again.' });
  }
});

// GET registrations list (Admin only)
app.get('/api/registrations', authenticateAdmin, (req, res) => {
  try {
    const list = JSON.parse(fs.readFileSync(registrationsPath, 'utf8'));
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to load registrations: ' + err.message });
  }
});

// POST modify applicant status (Admin only)
app.post('/api/registrations/:id/status', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Submitted', 'Under Review', 'Approved'].includes(status)) {
      return res.status(400).json({ error: 'Invalid application status option.' });
    }

    const list = JSON.parse(fs.readFileSync(registrationsPath, 'utf8'));
    const index = list.findIndex((item: any) => item.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Applicant registration records not found' });
    }

    list[index].status = status;
    fs.writeFileSync(registrationsPath, JSON.stringify(list, null, 2), 'utf8');

    res.json({ success: true, applicant: list[index] });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update status: ' + err.message });
  }
});

// GET Export registrations inside CSV format (Admin only)
app.get('/api/registrations/export', authenticateAdmin, (req, res) => {
  try {
    const list = JSON.parse(fs.readFileSync(registrationsPath, 'utf8'));
    
    // Convert to CSV
    const headers = ['ID', 'Full Name', 'Class', 'Student ID', 'Phone', 'Email', 'Why Join', 'Status', 'Applied At'];
    const csvRows = [
      headers.join(','),
      ...list.map((r: any) => {
        return [
          r.id,
          `"${(r.fullName || '').replace(/"/g, '""')}"`,
          `"${(r.classVal || '').replace(/"/g, '""')}"`,
          `"${(r.studentId || '').replace(/"/g, '""')}"`,
          `"${(r.phone || '').replace(/"/g, '""')}"`,
          `"${(r.email || '').replace(/"/g, '""')}"`,
          `"${(r.whyJoin || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
          r.status,
          r.createdAt,
        ].join(',');
      })
    ];

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=SPSCRCS_Registrations_' + Date.now() + '.csv');
    res.status(200).send(csvRows.join('\r\n'));
  } catch (err: any) {
    res.status(500).send('Failed to generate CSV: ' + err.message);
  }
});

// --- CLIENT STATIC / VITE ROUTING ---

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SPSC Red Crescent backend app running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
