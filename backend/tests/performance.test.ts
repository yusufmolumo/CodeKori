import axios from 'axios';

const API = 'http://localhost:5000';
const RESPONSE_TIME_TARGET = 2000; // 2 seconds target

function measureResponseTime(startTime: number): number {
    return Date.now() - startTime;
}

describe('Performance & Response Time Tests', () => {

    describe('API Response Time (Target: < 2 seconds)', () => {
        test('GET /health responds within target', async () => {
            const start = Date.now();
            await axios.get(`${API}/health`);
            const responseTime = measureResponseTime(start);
            console.log(`    ⏱  /health: ${responseTime}ms`);
            expect(responseTime).toBeLessThan(RESPONSE_TIME_TARGET);
        });

        test('GET /api/courses responds within target', async () => {
            const start = Date.now();
            await axios.get(`${API}/api/courses`);
            const responseTime = measureResponseTime(start);
            console.log(`    ⏱  /api/courses: ${responseTime}ms`);
            expect(responseTime).toBeLessThan(RESPONSE_TIME_TARGET);
        });

        test('GET /api/challenges responds within target', async () => {
            const start = Date.now();
            await axios.get(`${API}/api/challenges`);
            const responseTime = measureResponseTime(start);
            console.log(`    ⏱  /api/challenges: ${responseTime}ms`);
            expect(responseTime).toBeLessThan(RESPONSE_TIME_TARGET);
        });

        test('POST /api/auth/login responds within target', async () => {
            const start = Date.now();
            await axios.post(`${API}/api/auth/login`, {
                email: 'admin@codekori.com',
                password: 'AdminPassword123!'
            });
            const responseTime = measureResponseTime(start);
            console.log(`    ⏱  /api/auth/login: ${responseTime}ms`);
            expect(responseTime).toBeLessThan(RESPONSE_TIME_TARGET);
        });

        test('GET /api/skill-lab/modes responds within target', async () => {
            const start = Date.now();
            await axios.get(`${API}/api/skill-lab/modes`);
            const responseTime = measureResponseTime(start);
            console.log(`    ⏱  /api/skill-lab/modes: ${responseTime}ms`);
            expect(responseTime).toBeLessThan(RESPONSE_TIME_TARGET);
        });

        test('GET /api/admin/users responds within target (authenticated)', async () => {
            const loginRes = await axios.post(`${API}/api/auth/login`, {
                email: 'admin@codekori.com',
                password: 'AdminPassword123!'
            });
            const token = loginRes.data.accessToken;

            const start = Date.now();
            await axios.get(`${API}/api/admin/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const responseTime = measureResponseTime(start);
            console.log(`    ⏱  /api/admin/users: ${responseTime}ms`);
            expect(responseTime).toBeLessThan(RESPONSE_TIME_TARGET);
        });
    });

    describe('Average Response Time Analysis', () => {
        test('average API response time is below 1.5 seconds', async () => {
            const endpoints = [
                { method: 'get', url: `${API}/health` },
                { method: 'get', url: `${API}/api/courses` },
                { method: 'get', url: `${API}/api/challenges` },
                { method: 'get', url: `${API}/api/skill-lab/modes` },
            ];

            let totalTime = 0;
            for (const ep of endpoints) {
                const start = Date.now();
                await axios.get(ep.url);
                totalTime += measureResponseTime(start);
            }

            const avgTime = totalTime / endpoints.length;
            console.log(`\n    📊 Average Response Time: ${avgTime.toFixed(0)}ms`);
            console.log(`    📊 Target: < 1500ms`);
            console.log(`    📊 Result: ${avgTime < 1500 ? '✅ PASSED' : '⚠️ ABOVE TARGET'}`);
            expect(avgTime).toBeLessThan(1500);
        });
    });

    describe('Concurrent Request Handling', () => {
        test('handles 5 concurrent requests without errors', async () => {
            const requests = Array.from({ length: 5 }, () =>
                axios.get(`${API}/health`)
            );

            const start = Date.now();
            const responses = await Promise.all(requests);
            const totalTime = measureResponseTime(start);

            console.log(`    ⏱  5 concurrent requests: ${totalTime}ms`);
            responses.forEach(res => {
                expect(res.status).toBe(200);
            });
        });

        test('handles 10 concurrent requests without errors', async () => {
            const requests = Array.from({ length: 10 }, () =>
                axios.get(`${API}/api/challenges`)
            );

            const start = Date.now();
            const responses = await Promise.all(requests);
            const totalTime = measureResponseTime(start);

            console.log(`    ⏱  10 concurrent requests: ${totalTime}ms`);
            responses.forEach(res => {
                expect(res.status).toBe(200);
            });
        });
    });
});
