/**
 * Smarty Learn - Admin Interface
 * Manages word database and emojis
 */

class AdminInterface {
    constructor() {
        this.words = [];
        this.filteredWords = [];
        this.showOnlyMissingEmojis = false;
        this.editingIndex = null;

        // GitHub settings
        this.githubToken = localStorage.getItem('smarty-github-token') || '';
        this.githubOwner = 'reinkes';
        this.githubRepo = 'smarty';
        this.githubBranch = 'feature/admin-interface';

        // Common emojis for picker
        this.commonEmojis = [
            '🐱', '🐕', '🐘', '🐯', '🦁', '🐼', '🐵', '🦒', '🐷', '🐸',
            '🦋', '🐦', '🐟', '🌳', '🌸', '🌱', '🌙', '☀️', '⭐', '❄️',
            '🏠', '🏫', '🏖️', '🛝', '🏊', '🚗', '🚜', '✈️', '🚢', '🚁',
            '🍎', '🍌', '🍕', '🍰', '🍦', '🍪', '🍞', '🍫', '☕', '🥛',
            '📖', '📱', '💡', '🪑', '🎹', '🎺', '🥁', '⚽', '🔧', '👑',
            '👶', '👨', '👩', '👸', '🐉', '👻', '⭕', '🧅', '🧦', '🦘'
        ];

        this.init();
    }

    async init() {
        try {
            await this.loadWords();
            this.renderWords();
            this.updateStats();
            this.populateCategoryFilter();
            this.populateEmojiPicker();
        } catch (error) {
            console.error('Init error:', error);
            this.showError('Fehler beim Laden der Daten');
        }
    }

    async loadWords() {
        try {
            const response = await fetch('data/deutsch-words.json');
            if (!response.ok) throw new Error('Failed to load words');
            const data = await response.json();
            this.words = data.words || [];
            this.filteredWords = [...this.words];
        } catch (error) {
            console.error('Load error:', error);
            throw error;
        }
    }

    renderWords() {
        const tbody = document.getElementById('wordsTableBody');

        if (this.filteredWords.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="no-words-message">Keine Wörter gefunden</td></tr>';
            return;
        }

        tbody.innerHTML = this.filteredWords.map((word, index) => {
            const hasEmoji = word.emoji && word.emoji.trim() !== '';
            const rowClass = !hasEmoji ? 'no-emoji' : '';
            const originalIndex = this.words.indexOf(word);

            return `
                <tr class="${rowClass}">
                    <td class="emoji-display">${word.emoji || '❌'}</td>
                    <td>${this.escapeHtml(word.word)}</td>
                    <td>${this.escapeHtml(word.syllable)}</td>
                    <td>${this.escapeHtml(word.category)}</td>
                    <td>${this.getDifficultyLabel(word.difficulty)}</td>
                    <td class="action-buttons">
                        <button class="btn-small btn-primary" onclick="admin.editWord(${originalIndex})">
                            ✏️ Bearbeiten
                        </button>
                        <button class="btn-small btn-danger" onclick="admin.deleteWord(${originalIndex})">
                            🗑️ Löschen
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    getDifficultyLabel(difficulty) {
        const labels = {
            'easy': '😊 Einfach',
            'medium': '🤔 Mittel',
            'hard': '🔥 Schwer'
        };
        return labels[difficulty] || difficulty;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    updateStats() {
        const totalWords = this.words.length;
        const missingEmojis = this.words.filter(w => !w.emoji || w.emoji.trim() === '').length;

        document.getElementById('totalWords').textContent = `${totalWords} Wörter`;
        document.getElementById('missingEmojis').textContent = `${missingEmojis} ohne Emoji`;
    }

    populateCategoryFilter() {
        const categories = [...new Set(this.words.map(w => w.category))].sort();
        const select = document.getElementById('categoryFilter');

        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            select.appendChild(option);
        });

        // Also populate category datalist for autocomplete
        const datalist = document.getElementById('categories');
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            datalist.appendChild(option);
        });
    }

    populateEmojiPicker() {
        const picker = document.getElementById('emojiPicker');
        picker.innerHTML = this.commonEmojis.map(emoji =>
            `<span class="emoji-option" onclick="admin.selectEmoji('${emoji}')">${emoji}</span>`
        ).join('');
    }

    selectEmoji(emoji) {
        document.getElementById('modalEmoji').value = emoji;
    }

    applyFilters() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const difficultyFilter = document.getElementById('difficultyFilter').value;
        const categoryFilter = document.getElementById('categoryFilter').value;

        this.filteredWords = this.words.filter(word => {
            // Search filter
            const matchesSearch = !searchTerm ||
                word.word.toLowerCase().includes(searchTerm) ||
                word.syllable.toLowerCase().includes(searchTerm) ||
                word.category.toLowerCase().includes(searchTerm);

            // Difficulty filter
            const matchesDifficulty = !difficultyFilter || word.difficulty === difficultyFilter;

            // Category filter
            const matchesCategory = !categoryFilter || word.category === categoryFilter;

            // Missing emoji filter
            const matchesMissingEmoji = !this.showOnlyMissingEmojis ||
                !word.emoji || word.emoji.trim() === '';

            return matchesSearch && matchesDifficulty && matchesCategory && matchesMissingEmoji;
        });

        this.renderWords();
    }

    toggleMissingEmojis() {
        this.showOnlyMissingEmojis = !this.showOnlyMissingEmojis;

        const btn = event.target;
        if (this.showOnlyMissingEmojis) {
            btn.textContent = '📋 Alle anzeigen';
            btn.classList.remove('btn-warning');
            btn.classList.add('btn-primary');
        } else {
            btn.textContent = '🔍 Nur fehlende Emojis';
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-warning');
        }

        this.applyFilters();
    }

    showAddWordModal() {
        this.editingIndex = null;
        document.getElementById('modalTitle').textContent = 'Neues Wort hinzufügen';
        document.getElementById('modalWord').value = '';
        document.getElementById('modalSyllable').value = '';
        document.getElementById('modalEmoji').value = '';
        document.getElementById('modalCategory').value = '';
        document.getElementById('modalDifficulty').value = 'easy';
        document.getElementById('wordModal').classList.add('active');
    }

    editWord(index) {
        this.editingIndex = index;
        const word = this.words[index];

        document.getElementById('modalTitle').textContent = 'Wort bearbeiten';
        document.getElementById('modalWord').value = word.word;
        document.getElementById('modalSyllable').value = word.syllable;
        document.getElementById('modalEmoji').value = word.emoji || '';
        document.getElementById('modalCategory').value = word.category;
        document.getElementById('modalDifficulty').value = word.difficulty;
        document.getElementById('wordModal').classList.add('active');
    }

    closeModal() {
        document.getElementById('wordModal').classList.remove('active');
        this.editingIndex = null;
    }

    showSettingsModal() {
        document.getElementById('githubToken').value = this.githubToken;
        document.getElementById('settingsModal').classList.add('active');
    }

    closeSettingsModal() {
        document.getElementById('settingsModal').classList.remove('active');
    }

    saveSettings() {
        const token = document.getElementById('githubToken').value.trim();
        this.githubToken = token;
        localStorage.setItem('smarty-github-token', token);
        this.closeSettingsModal();
        this.showSuccess(token ? '✅ GitHub Token gespeichert!' : 'Token entfernt');
    }

    clearToken() {
        if (confirm('GitHub Token wirklich löschen?')) {
            this.githubToken = '';
            localStorage.removeItem('smarty-github-token');
            document.getElementById('githubToken').value = '';
            this.showSuccess('Token gelöscht');
        }
    }

    saveWord() {
        const word = document.getElementById('modalWord').value.trim();
        const syllable = document.getElementById('modalSyllable').value.trim();
        const emoji = document.getElementById('modalEmoji').value.trim();
        const category = document.getElementById('modalCategory').value.trim();
        const difficulty = document.getElementById('modalDifficulty').value;

        // Validation
        if (!word) {
            alert('Bitte gib ein Wort ein!');
            return;
        }

        if (!syllable) {
            alert('Bitte gib eine Silbe ein!');
            return;
        }

        if (!category) {
            alert('Bitte gib eine Kategorie ein!');
            return;
        }

        const wordData = {
            word,
            syllable,
            emoji,
            difficulty,
            category
        };

        // Add image field if it exists in the word being edited
        if (this.editingIndex !== null && this.words[this.editingIndex].image) {
            wordData.image = this.words[this.editingIndex].image;
        }

        if (this.editingIndex !== null) {
            // Update existing word
            this.words[this.editingIndex] = wordData;
        } else {
            // Add new word
            this.words.push(wordData);
        }

        this.closeModal();
        this.applyFilters();
        this.updateStats();
        this.showSuccess(this.editingIndex !== null ? 'Wort aktualisiert!' : 'Neues Wort hinzugefügt!');
    }

    deleteWord(index) {
        const word = this.words[index];
        if (confirm(`Möchtest du "${word.word}" wirklich löschen?`)) {
            this.words.splice(index, 1);
            this.applyFilters();
            this.updateStats();
            this.showSuccess('Wort gelöscht!');
        }
    }

    async saveData() {
        const data = {
            version: "1.0.4",
            lastUpdated: new Date().toISOString().split('T')[0],
            description: "German syllable training word database",
            totalWords: this.words.length,
            words: this.words
        };

        // Method 1: Try local dev server API first
        try {
            const response = await fetch('http://localhost:3000/api/save-words', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                const result = await response.json();
                this.showSuccess('✅ Lokal gespeichert! ' + result.message);
                return;
            }
        } catch (error) {
            console.log('Dev server not running, trying GitHub API...');
        }

        // Method 2: Try GitHub API (for online deployment)
        if (this.githubToken) {
            try {
                await this.saveViaGitHub(data);
                this.showSuccess('✅ Direkt zu GitHub committed!');
                return;
            } catch (error) {
                console.error('GitHub save failed:', error);
                this.showError('GitHub Fehler: ' + error.message);
            }
        }

        // Method 3: Fallback to download
        this.downloadJSON(data);
    }

    async saveViaGitHub(data) {
        const filePath = 'data/deutsch-words.json';
        const content = JSON.stringify(data, null, 2);
        const message = `feat: Update word database via admin interface

Updated ${data.totalWords} words

🤖 Auto-committed from admin interface`;

        // Get current file SHA
        const fileUrl = `https://api.github.com/repos/${this.githubOwner}/${this.githubRepo}/contents/${filePath}?ref=${this.githubBranch}`;

        const fileResponse = await fetch(fileUrl, {
            headers: {
                'Authorization': `Bearer ${this.githubToken}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!fileResponse.ok) {
            throw new Error('Konnte Datei nicht laden von GitHub');
        }

        const fileData = await fileResponse.json();
        const sha = fileData.sha;

        // Update file
        const updateUrl = `https://api.github.com/repos/${this.githubOwner}/${this.githubRepo}/contents/${filePath}`;

        const updateResponse = await fetch(updateUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${this.githubToken}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                content: btoa(unescape(encodeURIComponent(content))),
                sha: sha,
                branch: this.githubBranch
            })
        });

        if (!updateResponse.ok) {
            const error = await updateResponse.json();
            throw new Error(error.message || 'GitHub commit fehlgeschlagen');
        }

        return await updateResponse.json();
    }

    downloadJSON(data) {
        if (!data) {
            data = {
                version: "1.0.4",
                lastUpdated: new Date().toISOString().split('T')[0],
                description: "German syllable training word database",
                totalWords: this.words.length,
                words: this.words
            };
        }

        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'deutsch-words.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showSuccess('📥 JSON heruntergeladen! Ersetze die Datei in data/deutsch-words.json');
    }

    async resetData() {
        if (confirm('Möchtest du alle Änderungen verwerfen und die Originaldaten neu laden?')) {
            await this.loadWords();
            this.applyFilters();
            this.updateStats();
            this.showSuccess('Daten neu geladen!');
        }
    }

    showSuccess(message) {
        // Create temporary success notification
        const notification = document.createElement('div');
        notification.className = 'milestone-celebration show';
        notification.textContent = message;
        notification.style.position = 'fixed';
        notification.style.top = '50%';
        notification.style.left = '50%';
        notification.style.transform = 'translate(-50%, -50%) scale(1)';
        notification.style.zIndex = '20000';
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 2000);
    }

    showError(message) {
        // Create temporary error notification
        const notification = document.createElement('div');
        notification.className = 'milestone-celebration show';
        notification.textContent = message;
        notification.style.position = 'fixed';
        notification.style.top = '50%';
        notification.style.left = '50%';
        notification.style.transform = 'translate(-50%, -50%) scale(1)';
        notification.style.background = 'linear-gradient(135deg, #E74C3C, #EC7063)';
        notification.style.zIndex = '20000';
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 2000);
    }
}

// Initialize admin interface
const admin = new AdminInterface();

// Close modals on outside click
document.getElementById('wordModal').addEventListener('click', (e) => {
    if (e.target.id === 'wordModal') {
        admin.closeModal();
    }
});

document.getElementById('settingsModal').addEventListener('click', (e) => {
    if (e.target.id === 'settingsModal') {
        admin.closeSettingsModal();
    }
});

// ESC key to close modals
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        admin.closeModal();
        admin.closeSettingsModal();
    }
});
