/**
 * Input Validation & Data Sanitization Tests
 * Tests form validation, input sanitization, and data integrity checks
 */

// ── Email Validation ──
function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ── Password Strength ──
interface PasswordCheck {
    valid: boolean;
    errors: string[];
}

function validatePassword(password: string): PasswordCheck {
    const errors: string[] = [];
    if (password.length < 8) errors.push('Must be at least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('Must contain uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('Must contain lowercase letter');
    if (!/[0-9]/.test(password)) errors.push('Must contain a number');
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('Must contain special character');
    return { valid: errors.length === 0, errors };
}

// ── Username Validation ──
function isValidUsername(username: string): boolean {
    return /^[a-zA-Z0-9_]{3,30}$/.test(username);
}

// ── Input Sanitization ──
function sanitizeInput(input: string): string {
    return input.replace(/<[^>]*>/g, '').trim();
}

// ── Challenge Difficulty ──
function isValidDifficulty(difficulty: string): boolean {
    return ['EASY', 'MEDIUM', 'HARD'].includes(difficulty);
}

// ── XP Reward Validation ──
function isValidXpReward(xp: number): boolean {
    return Number.isInteger(xp) && xp > 0 && xp <= 500;
}

// ── Role Validation ──
function isValidRole(role: string): boolean {
    return ['learner', 'mentor', 'admin'].includes(role);
}

// ═══════════════════════════════════
// TEST SUITES
// ═══════════════════════════════════

describe('Input Validation & Data Integrity', () => {

    describe('Email Validation', () => {
        test('accepts valid email format', () => {
            expect(isValidEmail('user@example.com')).toBe(true);
        });
        test('rejects email without @ symbol', () => {
            expect(isValidEmail('userexample.com')).toBe(false);
        });
        test('rejects email without domain', () => {
            expect(isValidEmail('user@')).toBe(false);
        });
    });

    describe('Password Strength Validation', () => {
        test('accepts strong password with all requirements', () => {
            const result = validatePassword('SecurePass123!');
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
        test('rejects password shorter than 8 characters', () => {
            const result = validatePassword('Sh1!');
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Must be at least 8 characters');
        });
        test('rejects password without uppercase letter', () => {
            const result = validatePassword('lowercase123!');
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Must contain uppercase letter');
        });
        test('rejects password without number', () => {
            const result = validatePassword('NoNumbers!Here');
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Must contain a number');
        });
        test('rejects password without special character', () => {
            const result = validatePassword('NoSpecial123');
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Must contain special character');
        });
    });

    describe('Username Validation', () => {
        test('accepts alphanumeric username with underscores', () => {
            expect(isValidUsername('john_doe_99')).toBe(true);
        });
        test('rejects username shorter than 3 characters', () => {
            expect(isValidUsername('ab')).toBe(false);
        });
        test('rejects username with special characters', () => {
            expect(isValidUsername('invalid@user!')).toBe(false);
        });
    });

    describe('Input Sanitization', () => {
        test('strips HTML tags and trims whitespace from input', () => {
            expect(sanitizeInput('<b>Bold</b> text')).toBe('Bold text');
            expect(sanitizeInput('  clean input  ')).toBe('clean input');
            expect(sanitizeInput('<div>Hello</div>')).toBe('Hello');
        });
    });

    describe('Data Integrity Checks', () => {
        test('validates challenge difficulty enum values', () => {
            expect(isValidDifficulty('EASY')).toBe(true);
            expect(isValidDifficulty('MEDIUM')).toBe(true);
            expect(isValidDifficulty('HARD')).toBe(true);
            expect(isValidDifficulty('IMPOSSIBLE')).toBe(false);
        });
        test('validates XP reward is positive integer within range', () => {
            expect(isValidXpReward(25)).toBe(true);
            expect(isValidXpReward(0)).toBe(false);
            expect(isValidXpReward(-10)).toBe(false);
            expect(isValidXpReward(501)).toBe(false);
        });
        test('validates user role enum values', () => {
            expect(isValidRole('learner')).toBe(true);
            expect(isValidRole('mentor')).toBe(true);
            expect(isValidRole('admin')).toBe(true);
            expect(isValidRole('superadmin')).toBe(false);
        });
    });
});
