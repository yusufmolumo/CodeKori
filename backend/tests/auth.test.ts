import axios from 'axios';

const API = 'http://localhost:5000/api';
const randomNum = Math.floor(Math.random() * 100000);
const testEmail = `testuser_${Date.now()}_${randomNum}@example.com`;
const testUsername = `user_${Date.now()}_${randomNum}`;
const testPassword = 'SecurePass123!';

const adminEmail = 'admin@codekori.com';
const adminPassword = 'AdminPassword123!';

describe('Authentication Functions', () => {

    describe('User Registration', () => {
        test('registers new user with valid credentials', async () => {
            const response = await axios.post(`${API}/auth/register`, {
                email: testEmail,
                password: testPassword,
                fullName: 'Test User',
                username: testUsername
            });
            expect(response.status).toBe(201);
            expect(response.data).toHaveProperty('userId');
        }, 15000);

        test('rejects registration with duplicate email', async () => {
            try {
                await axios.post(`${API}/auth/register`, {
                    email: testEmail,
                    password: 'DifferentPass456!',
                    fullName: 'Duplicate User',
                    username: `dup_${Date.now()}`
                });
                fail('Should have thrown');
            } catch (error: any) {
                expect(error.response.status).toBe(400);
            }
        }, 10000);

        test('returns success message on registration', async () => {
            const rnd = Math.floor(Math.random() * 100000);
            const response = await axios.post(`${API}/auth/register`, {
                email: `msg_test_${Date.now()}_${rnd}@example.com`,
                password: 'ValidPass123!',
                fullName: 'Message Test',
                username: `msg_${Date.now()}_${rnd}`
            });
            expect(response.data).toHaveProperty('message');
            expect(typeof response.data.message).toBe('string');
        }, 15000);
    });

    describe('User Login', () => {
        test('authenticates admin with valid credentials', async () => {
            const response = await axios.post(`${API}/auth/login`, {
                email: adminEmail,
                password: adminPassword
            });
            expect(response.status).toBe(200);
            expect(response.data).toHaveProperty('accessToken');
        });

        test('returns user object without password hash', async () => {
            const response = await axios.post(`${API}/auth/login`, {
                email: adminEmail,
                password: adminPassword
            });
            expect(response.data).toHaveProperty('user');
            expect(response.data.user).not.toHaveProperty('passwordHash');
            expect(response.data.user).toHaveProperty('email');
            expect(response.data.user).toHaveProperty('role');
        });

        test('returns JWT access token on login', async () => {
            const response = await axios.post(`${API}/auth/login`, {
                email: adminEmail,
                password: adminPassword
            });
            const token = response.data.accessToken;
            expect(typeof token).toBe('string');
            expect(token.split('.').length).toBe(3); // JWT has 3 parts
        });

        test('rejects login with incorrect password', async () => {
            try {
                await axios.post(`${API}/auth/login`, {
                    email: adminEmail,
                    password: 'TotallyWrongPassword!'
                });
                fail('Should have thrown');
            } catch (error: any) {
                expect(error.response.status).toBe(401);
            }
        });

        test('rejects login with non-existent email', async () => {
            try {
                await axios.post(`${API}/auth/login`, {
                    email: 'ghost_user_nonexistent@example.com',
                    password: 'AnyPassword123!'
                });
                fail('Should have thrown');
            } catch (error: any) {
                expect(error.response.status).toBe(401);
            }
        });

        test('returns user role in login response', async () => {
            const response = await axios.post(`${API}/auth/login`, {
                email: adminEmail,
                password: adminPassword
            });
            expect(response.data.user.role).toBeDefined();
            expect(['learner', 'mentor', 'admin']).toContain(response.data.user.role);
        });

        test('returns user ID in login response', async () => {
            const response = await axios.post(`${API}/auth/login`, {
                email: adminEmail,
                password: adminPassword
            });
            expect(response.data.user).toHaveProperty('id');
            expect(typeof response.data.user.id).toBe('string');
        });
    });
});
