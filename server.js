/**
 * Smarty Learn - Local Development Server
 * Provides API endpoints for admin interface to save data
 */

import express from 'express';
import cors from 'cors';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Client as FTPClient } from 'basic-ftp';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// API endpoint to save deutsch-words.json
app.post('/api/save-words', async (req, res) => {
    try {
        const data = req.body;

        // Validate data structure
        if (!data.words || !Array.isArray(data.words)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid data structure'
            });
        }

        // Update metadata
        data.lastUpdated = new Date().toISOString().split('T')[0];
        data.totalWords = data.words.length;

        // Write to file
        const filePath = path.join(__dirname, 'data', 'deutsch-words.json');
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');

        console.log(`✅ Saved ${data.words.length} words to deutsch-words.json`);

        res.json({
            success: true,
            message: 'Daten erfolgreich gespeichert!',
            totalWords: data.words.length
        });

    } catch (error) {
        console.error('Error saving words:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// API endpoint to get current words
app.get('/api/get-words', async (req, res) => {
    try {
        const filePath = path.join(__dirname, 'data', 'deutsch-words.json');
        const data = await fs.readFile(filePath, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error('Error reading words:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// API endpoint to upload to FTP server
app.post('/api/upload-to-ftp', async (req, res) => {
    try {
        const data = req.body;

        // Validate data structure
        if (!data.words || !Array.isArray(data.words)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid data structure'
            });
        }

        // Update metadata
        data.lastUpdated = new Date().toISOString().split('T')[0];
        data.totalWords = data.words.length;

        // First save locally
        const localPath = path.join(__dirname, 'data', 'deutsch-words.json');
        await fs.writeFile(localPath, JSON.stringify(data, null, 2), 'utf8');

        // Check if FTP credentials are configured
        if (!process.env.FTP_HOST || !process.env.FTP_USER) {
            console.log('⚠️  FTP not configured, saved locally only');
            return res.json({
                success: true,
                message: 'Lokal gespeichert (FTP nicht konfiguriert)',
                totalWords: data.words.length,
                ftpUploaded: false
            });
        }

        // Upload to FTP
        const client = new FTPClient();
        client.ftp.verbose = true;

        try {
            await client.access({
                host: process.env.FTP_HOST,
                user: process.env.FTP_USER,
                password: process.env.FTP_PASSWORD,
                secure: process.env.FTP_SECURE === 'true'
            });

            // Upload file
            const remotePath = process.env.FTP_REMOTE_PATH || '/data/deutsch-words.json';
            await client.uploadFrom(localPath, remotePath);

            console.log(`✅ Uploaded to FTP: ${remotePath}`);

            res.json({
                success: true,
                message: 'Erfolgreich zu FTP hochgeladen!',
                totalWords: data.words.length,
                ftpUploaded: true
            });

        } catch (ftpError) {
            console.error('FTP upload failed:', ftpError);
            res.json({
                success: true,
                message: 'Lokal gespeichert, aber FTP-Upload fehlgeschlagen',
                totalWords: data.words.length,
                ftpUploaded: false,
                ftpError: ftpError.message
            });
        } finally {
            client.close();
        }

    } catch (error) {
        console.error('Error in upload-to-ftp:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║  🎓 Smarty Learn - Development Server                      ║
║                                                            ║
║  Server running at: http://localhost:${PORT}                 ║
║                                                            ║
║  📝 Main App:       http://localhost:${PORT}/index.html      ║
║  🔧 Admin:          http://localhost:${PORT}/admin.html      ║
║  📖 German:         http://localhost:${PORT}/deutsch-silben.html ║
║  🎯 Math:           http://localhost:${PORT}/mathe-aufgaben.html ║
║                                                            ║
║  Press Ctrl+C to stop the server                          ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    `);
});
