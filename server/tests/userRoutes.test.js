// used chatGPT to help learn about jest + Supertest since i wanted to learn how to test routes
import request from 'supertest'
import app from '../src/app.js'
import { jest } from '@jest/globals';
import { users } from '../src/config/mongoCollection.js';

describe('POST /api/users/create', () => {
    
    // error testing 
    it('should return 400 if the inputs are missing', async () => {
        const res = await request(app)
            .post('/user/create')
            .send({})
            .set('Accept', 'application/json');

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBeDefined();
    });

    it('should return 400 if birthday is missing', async () => {
        const res = await request(app)
            .post('/user/create')
            .send({
                username: 'testuser',
                isUnder18: true
            })
            .set('Accept', 'application/json');

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBeDefined();
    });

    it('should return 400 if isUnder18 is missing', async () => {
        const res = await request(app)
            .post('/user/create')
            .send({
                username: 'testuser',
                birthday: '2000-01-01'
            })
            .set('Accept', 'application/json');

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBeDefined();
    });

    it('should return 400 if isUnder18 is not a boolean', async () => {
        const res = await request(app)
            .post('/user/create')
            .send({
                username: 'testuser',
                isUnder18: 'true',
                birthday: '2000-01-01'
            })
            .set('Accept', 'application/json');

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBeDefined();
    });

    it('should return 400 if birthday is not a valid date format', async () => {
        const res = await request(app)
            .post('/user/create')
            .send({
                username: 'testuser',
                isUnder18: true,
                birthday: 'invalid-date'
            })
            .set('Accept', 'application/json');

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBeDefined();
    });

    it('should return 400 if birthday is a future date', async () => {
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 1);
        const res = await request(app)
            .post('/user/create')
            .send({
                username: 'testuser',
                isUnder18: true,
                birthday: futureDate.toISOString().split('T')[0]
            })
            .set('Accept', 'application/json');

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBeDefined();
    });

    // Success tests
    it('should return 200 and success true for valid input', async () => {
        try {
            const res = await request(app)
                .post('/user/create')
                .send({
                    username: 'uniqueuser',
                    isUnder18: false,
                    birthday: '2000-01-01'
                })
                .set('Accept', 'application/json');

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual({ success: true });
        } catch (error) {
            console.error('Error in valid input test:', error);
            throw error;
        }
    });

    it('should return 400 since isUnder18 and date out of sync', async () => {
        try {
            const res = await request(app)
                .post('/user/create')
                .send({
                    username: 'adultuser',
                    isUnder18: true,
                    birthday: '1990-01-01'
                })
                .set('Accept', 'application/json');

            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBeDefined();
        } catch (error) {
            console.error('Error in over 18 test:', error);
            throw error;
        }
    });



    it('should return 200 for user over 18', async () => {
        try {
            const res = await request(app)
                .post('/user/create')
                .send({
                    username: 'adultuser',
                    isUnder18: false,
                    birthday: '1990-01-01'
                })
                .set('Accept', 'application/json');

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual({ success: true });
        } catch (error) {
            console.error('Error in over 18 test:', error);
            throw error;
        }
    });

    it('should return 400 for invalid date', async () => {
        try {
            const today = new Date();
            const res = await request(app)
                .post('/user/create')
                .send({
                    username: 'recentuser',
                    isUnder18: true,
                    birthday: today.toISOString().split('T')[0]
                })
                .set('Accept', 'application/json');

            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBeDefined();
        } catch (error) {
            console.error('Error in recent birthday test:', error);
            throw error;
        }
    });

    it('should return 200 for user with leap year birthday', async () => {
        try {
            const res = await request(app)
                .post('/user/create')
                .send({
                    username: 'leapuser',
                    isUnder18: false,
                    birthday: '2000-02-29'
                })
                .set('Accept', 'application/json');

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual({ success: true });
        } catch (error) {
            console.error('Error in leap year test:', error);
            throw error;
        }
    });

    // Duplicate username test
    it('should return 400 for duplicate username', async () => {
        try {
            // First create a user
            await request(app)
                .post('/user/create')
                .send({
                    username: 'duplicateuser',
                    isUnder18: false,
                    birthday: '2000-01-01'
                })
                .set('Accept', 'application/json');

            // Try to create another user with same username
            const res = await request(app)
                .post('/user/create')
                .send({
                    username: 'duplicateuser',
                    isUnder18: false,
                    birthday: '2001-01-01'
                })
                .set('Accept', 'application/json');

            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBeDefined();
        } catch (error) {
            console.error('Error in duplicate username test:', error);
            throw error;
        }
    });

    afterEach(async () => {
        jest.restoreAllMocks();
        // Drop the users collection after each test
        const usersCollection = await users();
        await usersCollection.drop();
    });
});

describe('GET /api/users/:uid', () => {
    // Setup: Create a test user before running tests
    beforeEach(async () => {
        const usersCollection = await users();
        await usersCollection.insertOne({
            personal: {
                username: 'testuser',
                underAge: false,
                birthday: '2000-01-01',
                uid: 'test-uid-1'
            }
        });
    });

    it('should return 404 if uid is not provided', async () => {
        const res = await request(app)
            .get('/api/users/')
            .set('Accept', 'application/json');

        expect(res.statusCode).toBe(404);
    });

    it('should return 404 if user with uid does not exist', async () => {
        const res = await request(app)
            .get('/api/users/nonexistent-uid')
            .set('Accept', 'application/json');

        expect(res.statusCode).toBe(404);
        expect(res.body.error).toBeDefined();
    });

    it('should return 200 and user data for valid uid', async () => {
        const res = await request(app)
            .get('/api/users/test-uid-1')
            .set('Accept', 'application/json');

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            personal: {
                username: 'testuser',
                underAge: false,
                birthday: '2000-01-01',
                uid: 'test-uid-1'
            }
        });
    });

    it('should return 400 if uid is empty string', async () => {
        const res = await request(app)
            .get('/api/users/')
            .set('Accept', 'application/json');

        expect(res.statusCode).toBe(400);
    });

    it('should return 400 if uid contains invalid characters', async () => {
        const res = await request(app)
            .get('/api/users/invalid@uid')
            .set('Accept', 'application/json');

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBeDefined();
    });

    afterEach(async () => {
        jest.restoreAllMocks();
        // Drop the users collection after each test
        const usersCollection = await users();
        await usersCollection.drop();
    });
});






