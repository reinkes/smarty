/**
 * Singleton AudioContext manager for efficient audio playback
 * Reuses a single AudioContext instance to avoid performance issues
 */
class AudioManager {
    constructor() {
        // Enforce singleton pattern
        if (AudioManager.instance) {
            return AudioManager.instance;
        }

        this.context = null;
        this.enabled = true;
        AudioManager.instance = this;
    }

    /**
     * Gets or creates the AudioContext instance
     * @returns {AudioContext|null} The audio context or null if not supported
     */
    getContext() {
        if (!this.context && this.enabled) {
            try {
                this.context = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                console.warn('AudioContext not supported:', e);
                this.enabled = false;
            }
        }
        return this.context;
    }

    /**
     * Plays a success sound effect
     * Uses Web Audio API to generate a pleasant tone
     */
    playSuccessSound() {
        if (!this.enabled) return;

        const context = this.getContext();
        if (!context) return;

        try {
            // Resume context if suspended (required by some browsers)
            if (context.state === 'suspended') {
                context.resume();
            }

            const oscillator = context.createOscillator();
            const gainNode = context.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(context.destination);

            // Pleasant success tone
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            // Fade out envelope
            gainNode.gain.setValueAtTime(0.1, context.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1);

            oscillator.start(context.currentTime);
            oscillator.stop(context.currentTime + 0.1);
        } catch (e) {
            // Silently handle audio errors (browser might not support it)
            if (!(e instanceof DOMException)) {
                console.warn('Unexpected audio error:', e);
            }
        }
    }
}

// Export singleton instance
const audioManager = new AudioManager();
