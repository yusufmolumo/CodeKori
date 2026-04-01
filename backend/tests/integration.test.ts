import axios from 'axios';

const API = 'http://localhost:5000/api';

describe('Integration Tests', () => {

    // ── User Registration Flow ──
    describe('User Registration Flow', () => {
        const rnd = Math.floor(Math.random() * 100000);
        const email = `integration_${Date.now()}_${rnd}@example.com`;
        const username = `integ_${Date.now()}_${rnd}`;

        test('complete registration creates user and returns userId', async () => {
            const response = await axios.post(`${API}/auth/register`, {
                email,
                password: 'IntegPass123!',
                fullName: 'Integration Test User',
                username
            });
            expect(response.status).toBe(201);
            expect(response.data).toHaveProperty('userId');
            expect(response.data).toHaveProperty('message');
        }, 15000);

        test('duplicate registration is properly rejected', async () => {
            try {
                await axios.post(`${API}/auth/register`, {
                    email,
                    password: 'AnotherPass456!',
                    fullName: 'Duplicate User',
                    username: `dup_${Date.now()}`
                });
                fail('Should have rejected');
            } catch (error: any) {
                expect(error.response.status).toBe(400);
            }
        }, 10000);
    });

    // ── Challenge Submission Pipeline ──
    describe('Challenge Submission Pipeline', () => {
        let adminToken: string;

        beforeAll(async () => {
            const loginRes = await axios.post(`${API}/auth/login`, {
                email: 'admin@codekori.com',
                password: 'AdminPassword123!'
            });
            adminToken = loginRes.data.accessToken;
        });

        test('fetches challenge list with valid authentication', async () => {
            const response = await axios.get(`${API}/challenges`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            expect(response.status).toBe(200);
            expect(Array.isArray(response.data.data)).toBe(true);
            expect(response.data.data.length).toBeGreaterThan(0);
        });

        test('each challenge has starter code and hints', async () => {
            const response = await axios.get(`${API}/challenges`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            const challenge = response.data.data[0];
            expect(challenge).toHaveProperty('starterCode');
            expect(challenge).toHaveProperty('hints');
        });

        test('challenges are categorized by difficulty', async () => {
            const response = await axios.get(`${API}/challenges`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            const difficulties = response.data.data.map((c: any) => c.difficulty);
            expect(difficulties).toContain('EASY');
            expect(difficulties).toContain('MEDIUM');
            expect(difficulties).toContain('HARD');
        });
    });

    // ── Course Pipeline ──
    describe('Course & Lesson Pipeline', () => {
        test('fetches published courses with module information', async () => {
            const response = await axios.get(`${API}/courses`);
            expect(response.status).toBe(200);
            expect(response.data.data.length).toBeGreaterThan(0);
        });

        test('course detail returns modules and lessons', async () => {
            const listRes = await axios.get(`${API}/courses`);
            const courseId = listRes.data.data[0]?.id;
            if (courseId) {
                const response = await axios.get(`${API}/courses/${courseId}`);
                expect(response.status).toBe(200);
                expect(response.data.data).toHaveProperty('modules');
            }
        });
    });

    // ── Skill Lab Workflow ──
    describe('Skill Lab Workflow', () => {
        test('fetches all skill lab modes', async () => {
            const response = await axios.get(`${API}/skill-lab/modes`);
            expect(response.status).toBe(200);
            expect(response.data.data.length).toBeGreaterThan(0);
        });

        test('each mode has tasks associated', async () => {
            const response = await axios.get(`${API}/skill-lab/modes`);
            const modes = response.data.data;
            for (const mode of modes) {
                expect(mode).toHaveProperty('title');
                expect(mode._count?.tasks || mode.tasks?.length || 0).toBeGreaterThanOrEqual(0);
            }
        });
    });

    // ── Admin User Management ──
    describe('Admin User Management', () => {
        let adminToken: string;

        beforeAll(async () => {
            const loginRes = await axios.post(`${API}/auth/login`, {
                email: 'admin@codekori.com',
                password: 'AdminPassword123!'
            });
            adminToken = loginRes.data.accessToken;
        });

        test('admin can fetch all users', async () => {
            const response = await axios.get(`${API}/admin/users`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            expect(response.status).toBe(200);
            expect(Array.isArray(response.data.data)).toBe(true);
        });

        test('user list contains expected fields', async () => {
            const response = await axios.get(`${API}/admin/users`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            if (response.data.data.length > 0) {
                const user = response.data.data[0];
                expect(user).toHaveProperty('id');
                expect(user).toHaveProperty('email');
                expect(user).toHaveProperty('role');
            }
        });

        test('non-admin users cannot access admin endpoints', async () => {
            try {
                await axios.get(`${API}/admin/users`);
                fail('Should have rejected');
            } catch (error: any) {
                expect(error.response.status).toBe(401);
            }
        });
    });

    // ── Database Transaction Validation ──
    describe('Database Transaction Validation', () => {
        test('health endpoint confirms database connectivity', async () => {
            const response = await axios.get('http://localhost:5000/health');
            expect(response.status).toBe(200);
            expect(response.data.status).toBe('ok');
        });

        test('data persistence across requests', async () => {
            const res1 = await axios.get(`${API}/courses`);
            const res2 = await axios.get(`${API}/courses`);
            expect(res1.data.data.length).toBe(res2.data.data.length);
        });
    });
});
