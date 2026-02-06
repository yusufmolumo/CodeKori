import request from 'supertest';
import app from '../src/app';

describe('Auth Endpoints', () => {
    const randomNum = Math.floor(Math.random() * 10000); // Shorter than Date.now() to ensure username limit compliance if any
    const randomEmail = `test_${Date.now()}_${randomNum}@example.com`;
    const password = 'Password123!';
    const username = `user_${Date.now()}_${randomNum}`;

    it('should register a new user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                email: randomEmail,
                password: password,
                fullName: 'Test User',
                username: username
            });

        if (res.status !== 201) {
            console.log('Register Error:', res.body);
        }
        expect(res.status).toBe(201);
        expect(res.body.data).toHaveProperty('token');
    });

    it('should login the user', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: randomEmail,
                password: password
            });

        if (res.status !== 200) {
            console.log('Login Error:', res.body);
        }
        expect(res.status).toBe(200);
        expect(res.body.data).toHaveProperty('accessToken');
    });
});
