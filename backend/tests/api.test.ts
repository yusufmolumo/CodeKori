import axios from 'axios';

const API = 'http://localhost:5000';

describe('API Endpoint Tests', () => {

    // ── Health Check ──
    describe('GET /health', () => {
        test('returns server health status with timestamp', async () => {
            const response = await axios.get(`${API}/health`);
            expect(response.status).toBe(200);
            expect(response.data).toHaveProperty('status', 'ok');
            expect(response.data).toHaveProperty('timestamp');
        });
    });

    // ── Server Info ──
    describe('Server Info', () => {
        test('health response includes uptime information', async () => {
            const response = await axios.get(`${API}/health`);
            expect(response.data).toHaveProperty('status');
            expect(typeof response.data.timestamp).toBe('string');
        });
    });

    // ── Course Endpoints ──
    describe('GET /api/courses', () => {
        test('returns list of published courses with details', async () => {
            const response = await axios.get(`${API}/api/courses`);
            expect(response.status).toBe(200);
            expect(response.data).toHaveProperty('data');
            expect(Array.isArray(response.data.data)).toBe(true);
            if (response.data.data.length > 0) {
                expect(response.data.data[0]).toHaveProperty('title');
            }
        }, 10000);
    });

    // ── Challenge Endpoints ──
    describe('GET /api/challenges', () => {
        test('returns published challenges array', async () => {
            const response = await axios.get(`${API}/api/challenges`);
            expect(response.status).toBe(200);
            expect(Array.isArray(response.data.data)).toBe(true);
        });

        test('challenges contain required fields', async () => {
            const response = await axios.get(`${API}/api/challenges`);
            if (response.data.data.length > 0) {
                const challenge = response.data.data[0];
                expect(challenge).toHaveProperty('title');
                expect(challenge).toHaveProperty('difficulty');
                expect(challenge).toHaveProperty('xpReward');
            }
        });
    });

    // ── Protected Route Access ──
    describe('Protected Route Authentication', () => {
        test('rejects unauthenticated access to user profile', async () => {
            try {
                await axios.get(`${API}/api/users/profile`);
                fail('Should have thrown');
            } catch (error: any) {
                expect(error.response.status).toBe(401);
            }
        });

        test('rejects unauthenticated access to gamification data', async () => {
            try {
                await axios.get(`${API}/api/gamification/me`);
                fail('Should have thrown');
            } catch (error: any) {
                expect(error.response.status).toBe(401);
            }
        });

        test('rejects unauthenticated access to admin panel', async () => {
            try {
                await axios.get(`${API}/api/admin/users`);
                fail('Should have thrown');
            } catch (error: any) {
                expect(error.response.status).toBe(401);
            }
        });
    });

    // ── Skill Lab ──
    describe('GET /api/skill-lab/modes', () => {
        test('returns available skill lab modes', async () => {
            const response = await axios.get(`${API}/api/skill-lab/modes`);
            expect(response.status).toBe(200);
            expect(response.data).toHaveProperty('data');
        });
    });

    // ── Admin Flow ──
    describe('Admin Authentication & Access', () => {
        test('admin can login and access user management', async () => {
            const loginRes = await axios.post(`${API}/api/auth/login`, {
                email: 'admin@codekori.com',
                password: 'AdminPassword123!'
            });
            expect(loginRes.status).toBe(200);
            expect(loginRes.data).toHaveProperty('accessToken');

            const token = loginRes.data.accessToken;
            const response = await axios.get(`${API}/api/admin/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            expect(response.status).toBe(200);
            expect(response.data).toHaveProperty('data');
            expect(Array.isArray(response.data.data)).toBe(true);
        });
    });
});
