/**
 * JWT Encoder & Decoder
 * Like jwt.io - Encode and decode JSON Web Tokens easily
 */

class JWTApp {
    constructor() {
        this.currentJWT = '';
        this.init();
    }

    init() {
        this.initThemeToggle();
        this.bindEncodedEvents();
        this.bindDecodedEvents();
        this.bindAlgorithmEvents();
        this.bindSecretEvents();
        this.bindCopyButtons();
        this.bindClearButton();
        this.setCurrentYear();
        this.setDefaultExample();
    }

    // ==================== Default Example ====================
    setDefaultExample() {
        // Default JWT token (same as jwt.io default)
        const defaultJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

        this.setEncodedJWT(defaultJWT);
        this.decodeAndDisplay();

        // Set default secret
        document.getElementById('secret-input').value = 'your-256-bit-secret';
        this.verifySignature();
    }

    // ==================== Theme Toggle ====================
    initThemeToggle() {
        const themeSwitch = document.getElementById('theme-switch');
        const themeIcon = document.getElementById('theme-icon');

        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.body.classList.toggle('dark-mode', savedTheme === 'dark');
        this.updateThemeIcon(themeIcon, savedTheme);

        themeSwitch.addEventListener('click', () => {
            const isDark = document.body.classList.toggle('dark-mode');
            const newTheme = isDark ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme);
            this.updateThemeIcon(themeIcon, newTheme);
        });
    }

    updateThemeIcon(iconElement, theme) {
        iconElement.innerHTML = theme === 'dark'
            ? `<svg class="sun-icon" viewBox="0 0 24 24" width="28" height="28"><path d="M12 7a5 5 0 100 10 5 5 0 000-10zM2 13h2a1 1 0 100-2H2a1 1 0 100 2zm18 0h2a1 1 0 100-2h-2a1 1 0 100 2zM11 2v2a1 1 0 102 0V2a1 1 0 10-2 0zm0 18v2a1 1 0 102 0v-2a1 1 0 10-2 0zM5.99 4.58a1 1 0 10-1.41 1.41l1.06 1.06a1 1 0 101.41-1.41L5.99 4.58zm12.37 12.37a1 1 0 10-1.41 1.41l1.06 1.06a1 1 0 101.41-1.41l-1.06-1.06zm1.06-10.96a1 1 0 10-1.41-1.41l-1.06 1.06a1 1 0 101.41 1.41l1.06-1.06zM7.05 18.36a1 1 0 10-1.41-1.41l-1.06 1.06a1 1 0 101.41 1.41l1.06-1.06z" fill="currentColor"></path></svg>`
            : `<svg class="moon-icon" viewBox="0 0 24 24" width="28" height="28"><path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" fill="currentColor"></path></svg>`;
    }

    // ==================== Encoded JWT (Left Column) ====================
    bindEncodedEvents() {
        const jwtColored = document.getElementById('jwt-colored');

        // Handle paste
        jwtColored.addEventListener('paste', (e) => {
            e.preventDefault();
            const text = (e.clipboardData || window.clipboardData).getData('text');
            this.setEncodedJWT(text.trim());
            this.decodeAndDisplay();
            this.verifySignature();
        });

        // Handle input (typing)
        jwtColored.addEventListener('input', () => {
            const text = this.getPlainTextFromColored();
            this.currentJWT = text;
            this.decodeAndDisplay();
            this.verifySignature();
        });

        // Handle keydown for preventing formatting
        jwtColored.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
            }
        });
    }

    setEncodedJWT(jwt) {
        this.currentJWT = jwt;
        this.updateColoredDisplay();
        // If encoded JWT is changed programmatically, ensure decoding
        // and signature verification happen as if the user updated it.
        this.decodeAndDisplay();
        this.verifySignature();
    }

    getPlainTextFromColored() {
        const jwtColored = document.getElementById('jwt-colored');
        return jwtColored.textContent || '';
    }

    updateColoredDisplay() {
        const jwtColored = document.getElementById('jwt-colored');
        const parts = this.currentJWT.split('.');

        if (parts.length === 3) {
            jwtColored.innerHTML = `<span class="jwt-header-text">${this.escapeHtml(parts[0])}</span>.<span class="jwt-payload-text">${this.escapeHtml(parts[1])}</span>.<span class="jwt-signature-text">${this.escapeHtml(parts[2])}</span>`;
        } else {
            jwtColored.textContent = this.currentJWT;
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ==================== Decoded JWT (Right Column) ====================
    bindDecodedEvents() {
        const headerTextarea = document.getElementById('decoded-header');
        const payloadTextarea = document.getElementById('decoded-payload');

        // Live update when editing header
        let headerTimeout;
        headerTextarea.addEventListener('input', () => {
            clearTimeout(headerTimeout);
            headerTimeout = setTimeout(() => {
                this.encodeFromDecoded();
            }, 300);
        });

        // Live update when editing payload
        let payloadTimeout;
        payloadTextarea.addEventListener('input', () => {
            clearTimeout(payloadTimeout);
            payloadTimeout = setTimeout(() => {
                this.encodeFromDecoded();
            }, 300);
        });
    }

    decodeAndDisplay() {
        const parts = this.currentJWT.split('.');

        if (parts.length !== 3) {
            this.clearDecodedOutput();
            return;
        }

        try {
            // Decode header
            const header = this.base64UrlDecode(parts[0]);
            const headerObj = JSON.parse(header);
            document.getElementById('decoded-header').value = JSON.stringify(headerObj, null, 2);

            // Show algorithm badge
            const algorithmBadge = document.getElementById('algorithm-badge');
            if (headerObj.alg) {
                algorithmBadge.textContent = headerObj.alg;
                algorithmBadge.className = 'jwt-part-algorithm';

                // Update algorithm select
                const algorithmSelect = document.getElementById('jwt-algorithm');
                if (algorithmSelect) {
                    algorithmSelect.value = headerObj.alg;
                }

                // Update signature formula
                this.updateSignatureFormula(headerObj.alg);
            }

            // Decode payload
            const payload = this.base64UrlDecode(parts[1]);
            const payloadObj = JSON.parse(payload);
            document.getElementById('decoded-payload').value = JSON.stringify(payloadObj, null, 2);

            // Show expiry badge
            this.updateExpiryBadge(payloadObj);

        } catch (error) {
            console.error('Decode error:', error);
        }
    }

    updateExpiryBadge(payloadObj) {
        const expiryBadge = document.getElementById('expiry-badge');
        if (payloadObj.exp) {
            const expDate = new Date(payloadObj.exp * 1000);
            const now = new Date();
            const isExpired = expDate < now;

            expiryBadge.textContent = isExpired ? 'EXPIRED' : 'VALID';
            expiryBadge.className = `jwt-part-expiry ${isExpired ? 'expired' : 'valid'}`;
            expiryBadge.title = `Expires: ${expDate.toLocaleString()}`;
        } else {
            expiryBadge.textContent = '';
            expiryBadge.className = 'jwt-part-expiry';
        }
    }

    updateSignatureFormula(algorithm) {
        const formula = document.querySelector('.signature-formula');
        if (formula) {
            const fnSpans = formula.querySelectorAll('.sig-fn');
            if (fnSpans.length > 0) {
                fnSpans[0].textContent = `${algorithm.replace('HS', 'HMACSHA')}(`;
            }
        }
    }

    clearDecodedOutput() {
        document.getElementById('decoded-header').value = '';
        document.getElementById('decoded-payload').value = '';
        document.getElementById('algorithm-badge').textContent = '';
        document.getElementById('expiry-badge').textContent = '';
    }

    async encodeFromDecoded() {
        try {
            const headerText = document.getElementById('decoded-header').value.trim();
            const payloadText = document.getElementById('decoded-payload').value.trim();
            const secret = document.getElementById('secret-input').value;

            if (!headerText || !payloadText) return;

            const header = JSON.parse(headerText);
            const payload = JSON.parse(payloadText);

            // Create JWT parts
            const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
            const encodedPayload = this.base64UrlEncode(JSON.stringify(payload));

            // Create signature if secret is provided
            let signature = '';
            if (secret) {
                const dataToSign = `${encodedHeader}.${encodedPayload}`;
                signature = await this.createSignature(dataToSign, secret, header.alg);
            } else {
                // Keep the old signature or empty
                const parts = this.currentJWT.split('.');
                signature = parts.length === 3 ? parts[2] : '';
            }

            // Update JWT
            this.currentJWT = `${encodedHeader}.${encodedPayload}.${signature}`;
            this.updateColoredDisplay();
            this.verifySignature();

            // Update badges
            if (header.alg) {
                document.getElementById('algorithm-badge').textContent = header.alg;
                this.updateSignatureFormula(header.alg);
            }
            this.updateExpiryBadge(payload);

        } catch (error) {
            // Invalid JSON, ignore
        }
    }

    // ==================== Algorithm Selection ====================
    bindAlgorithmEvents() {
        const algorithmSelect = document.getElementById('jwt-algorithm');
        const keyInputs = document.getElementById('key-inputs');
        const privateKeySection = document.getElementById('private-key-section');
        const publicKeySection = document.getElementById('public-key-section');
        const secretInput = document.getElementById('secret-input');

        function showKeyInputs(alg) {
            if (alg.startsWith('RS') || alg.startsWith('PS')) {
                keyInputs.style.display = '';
                privateKeySection.style.display = '';
                publicKeySection.style.display = '';
                secretInput.parentElement.style.display = 'none';
            } else if (alg.startsWith('ES')) {
                keyInputs.style.display = '';
                privateKeySection.style.display = '';
                publicKeySection.style.display = '';
                secretInput.parentElement.style.display = 'none';
            } else if (alg === 'none') {
                keyInputs.style.display = 'none';
                secretInput.parentElement.style.display = 'none';
            } else {
                keyInputs.style.display = 'none';
                secretInput.parentElement.style.display = '';
            }
        }

        showKeyInputs(algorithmSelect.value);
        algorithmSelect.addEventListener('change', () => {
            const newAlg = algorithmSelect.value;
            showKeyInputs(newAlg);
            try {
                const headerText = document.getElementById('decoded-header').value.trim();
                if (headerText) {
                    const header = JSON.parse(headerText);
                    header.alg = newAlg;
                    document.getElementById('decoded-header').value = JSON.stringify(header, null, 2);
                    this.encodeFromDecoded();
                }
            } catch (error) {
                // Invalid JSON
            }
        });
    }

    // ==================== Secret & Signature Verification ====================
    bindSecretEvents() {
        const secretInput = document.getElementById('secret-input');
        const toggleBtn = document.getElementById('toggle-secret-inline');
        const base64Checkbox = document.getElementById('secret-base64');

        // Verify on secret change (do not re-encode the token using the
        // provided secret, which would make any wrong secret appear valid)
        let secretTimeout;
        secretInput.addEventListener('input', () => {
            clearTimeout(secretTimeout);
            secretTimeout = setTimeout(() => {
                this.verifySignature();
            }, 300);
        });

        // Toggle secret visibility
        toggleBtn.addEventListener('click', () => {
            const type = secretInput.type === 'password' ? 'text' : 'password';
            secretInput.type = type;

            const eyeIcon = document.getElementById('eye-icon-inline');
            if (type === 'text') {
                eyeIcon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
            } else {
                eyeIcon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
            }
        });

        // Base64 checkbox affects verification too
        base64Checkbox.addEventListener('change', () => {
            this.verifySignature();
        });
    }

    async verifySignature() {
        const parts = this.currentJWT.split('.');
        if (parts.length !== 3) {
            this.updateVerificationStatus('invalid', 'Invalid token format');
            return;
        }
        const algorithm = document.getElementById('jwt-algorithm').value;
        if (algorithm === 'none') {
            this.updateVerificationStatus('valid', 'No signature (alg: none)');
            return;
        }
        if (algorithm.startsWith('HS')) {
            // HMAC
            const secret = document.getElementById('secret-input').value;
            if (!secret) {
                this.updateVerificationStatus('warning', 'Enter a secret to verify signature');
                return;
            }
            try {
                const headerText = document.getElementById('decoded-header').value.trim();
                const header = JSON.parse(headerText);
                const dataToSign = `${parts[0]}.${parts[1]}`;
                const expectedSignature = await this.createSignature(dataToSign, secret, header.alg);
                if (expectedSignature === parts[2]) {
                    this.updateVerificationStatus('valid', 'Signature Verified');
                } else {
                    this.updateVerificationStatus('invalid', 'Invalid Signature');
                }
            } catch (error) {
                this.updateVerificationStatus('invalid', 'Verification failed');
            }
            return;
        }
        // RSA/ECDSA/PS
        const pubKey = document.getElementById('public-key').value.trim();
        if (!pubKey) {
            this.updateVerificationStatus('warning', 'Public key required');
            return;
        }
        let sigAlg = '';
        if (algorithm.startsWith('RS')) sigAlg = algorithm.replace('RS', 'SHA') + 'withRSA';
        if (algorithm.startsWith('PS')) sigAlg = algorithm.replace('PS', 'SHA') + 'withRSAandMGF1';
        if (algorithm.startsWith('ES')) sigAlg = algorithm.replace('ES', 'SHA') + 'withECDSA';
        try {
            const sig = new KJUR.crypto.Signature({alg: sigAlg});
            sig.init(pubKey);
            sig.updateString(`${parts[0]}.${parts[1]}`);
            const isValid = sig.verify(b64utohex(b64utob64(parts[2])));
            if (isValid) {
                this.updateVerificationStatus('valid', 'Signature Verified');
            } else {
                this.updateVerificationStatus('invalid', 'Invalid Signature');
            }
        } catch (e) {
            this.updateVerificationStatus('invalid', 'Verification failed');
        }
    }

    updateVerificationStatus(status, message) {
        const statusDiv = document.getElementById('verification-status');
        const statusIcon = document.getElementById('status-icon');
        const statusText = document.getElementById('status-text');

        statusDiv.className = `verification-status ${status}`;
        statusText.textContent = message;

        if (status === 'valid') {
            statusIcon.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
        } else if (status === 'invalid') {
            statusIcon.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
        } else {
            statusIcon.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
        }
    }

    // ==================== Copy Buttons ====================
    bindCopyButtons() {
        // Copy JWT
        document.getElementById('copy-jwt').addEventListener('click', () => {
            this.copyToClipboard(this.currentJWT, 'JWT copied!');
        });

        // Copy header
        document.getElementById('copy-header').addEventListener('click', () => {
            const header = document.getElementById('decoded-header').value;
            this.copyToClipboard(header, 'Header copied!');
        });

        // Copy payload
        document.getElementById('copy-payload').addEventListener('click', () => {
            const payload = document.getElementById('decoded-payload').value;
            this.copyToClipboard(payload, 'Payload copied!');
        });

        // Copy all
        document.getElementById('copy-all').addEventListener('click', () => {
            try {
                const header = document.getElementById('decoded-header').value;
                const payload = document.getElementById('decoded-payload').value;
                const parts = this.currentJWT.split('.');

                const all = {
                    header: JSON.parse(header),
                    payload: JSON.parse(payload),
                    signature: parts[2] || ''
                };

                this.copyToClipboard(JSON.stringify(all, null, 2), 'All data copied!');
            } catch (error) {
                this.showStatus('Nothing to copy', 'error');
            }
        });
    }

    bindClearButton() {
        document.getElementById('clear-jwt').addEventListener('click', () => {
            this.currentJWT = '';
            document.getElementById('jwt-colored').textContent = '';
            this.clearDecodedOutput();
            document.getElementById('secret-input').value = '';
            this.updateVerificationStatus('warning', 'Enter a secret to verify signature');
        });
    }

    copyToClipboard(text, successMessage) {
        if (!text) {
            this.showStatus('Nothing to copy', 'error');
            return;
        }

        navigator.clipboard.writeText(text).then(() => {
            this.showStatus(successMessage, 'success');
        }).catch(() => {
            this.showStatus('Failed to copy to clipboard', 'error');
        });
    }

    // ==================== Base64 URL Encoding/Decoding ====================
    base64UrlDecode(str) {
        let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
        const padding = base64.length % 4;
        if (padding) {
            base64 += '='.repeat(4 - padding);
        }

        const decoded = atob(base64);

        try {
            return decodeURIComponent(escape(decoded));
        } catch {
            return decoded;
        }
    }

    base64UrlEncode(str) {
        const utf8Bytes = unescape(encodeURIComponent(str));
        const base64 = btoa(utf8Bytes);

        return base64
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    }

    // ==================== Signature Creation ====================
    async createSignature(data, secret, algorithm) {
        // none
        if (algorithm === 'none') return '';
        // HMAC
        if (algorithm.startsWith('HS')) {
            return await this.createHMACSignature(data, secret, algorithm);
        }
        // RSA/ECDSA/PS
        const privKey = document.getElementById('private-key').value.trim();
        if (!privKey) throw new Error('Private key required');
        let sigAlg = '';
        if (algorithm.startsWith('RS')) sigAlg = algorithm.replace('RS', 'SHA') + 'withRSA';
        if (algorithm.startsWith('PS')) sigAlg = algorithm.replace('PS', 'SHA') + 'withRSAandMGF1';
        if (algorithm.startsWith('ES')) sigAlg = algorithm.replace('ES', 'SHA') + 'withECDSA';
        const sig = new KJUR.crypto.Signature({alg: sigAlg});
        sig.init(privKey);
        sig.updateString(data);
        let signature = hextob64u(sig.sign());
        return signature;
    }

    async createHMACSignature(data, secret, algorithm) {
        const isBase64 = document.getElementById('secret-base64').checked;
        const algoMap = {
            'HS256': { name: 'HMAC', hash: 'SHA-256' },
            'HS384': { name: 'HMAC', hash: 'SHA-384' },
            'HS512': { name: 'HMAC', hash: 'SHA-512' }
        };
        const algo = algoMap[algorithm];
        if (!algo) throw new Error(`Unsupported algorithm: ${algorithm}`);
        let keyData;
        if (isBase64) {
            try {
                const binaryStr = atob(secret);
                keyData = new Uint8Array(binaryStr.length);
                for (let i = 0; i < binaryStr.length; i++) {
                    keyData[i] = binaryStr.charCodeAt(i);
                }
            } catch {
                keyData = new TextEncoder().encode(secret);
            }
        } else {
            keyData = new TextEncoder().encode(secret);
        }
        const key = await crypto.subtle.importKey(
            'raw',
            keyData,
            algo,
            false,
            ['sign']
        );
        const dataBuffer = new TextEncoder().encode(data);
        const signatureBuffer = await crypto.subtle.sign(
            algo.name,
            key,
            dataBuffer
        );
        const signatureArray = new Uint8Array(signatureBuffer);
        let binary = '';
        signatureArray.forEach(byte => binary += String.fromCharCode(byte));

        return btoa(binary)
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    }

    // ==================== Status Messages ====================
    showStatus(message, type = 'info') {
        const status = document.getElementById('status');
        status.textContent = message;
        status.className = `status ${type}`;
        status.classList.remove('hidden');

        setTimeout(() => {
            status.classList.add('hidden');
        }, 3000);
    }

    // ==================== Utility ====================
    setCurrentYear() {
        const yearElem = document.getElementById('currentYear');
        if (yearElem) {
            yearElem.textContent = new Date().getFullYear();
        }
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new JWTApp();
});

