// bookRoutes.test.js
const request = require('supertest');
const app = require("../index")

describe('POST /addBook', () => {

    // ISBN validation tests
    describe('ISBN validation', () => {
        it('should reject ISBN with less than 10 characters', async () => {
            const response = await request(app)
                .post('/addBook')
                .send({
                    isbn: '123456789', // 9 chars
                    title: 'Test Book',
                    date: '2023-01-01'
                });

            expect(response.statusCode).toBe(400);
            expect(response.body.errors).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        msg: 'Invalid ISBN format. Must be exactly 10 characters.'
                    })
                ])
            );
        });

        it('should reject ISBN with invalid format', async () => {
            const response = await request(app)
                .post('/addBook')
                .send({
                    isbn: '123456789A', // Contains letter A
                    title: 'Test Book',
                    date: '2023-01-01'
                });

            expect(response.statusCode).toBe(400);
        });

        it('should reject invalid ISBN ending with X', async () => {
            const response = await request(app)
                .post('/addBook')
                .send({
                    isbn: '123456789X',
                    title: 'Test Book',
                    date: '2023-01-01'
                });

            expect(response.statusCode).toBe(400);
        });
    });

    // Title validation tests
    describe('Title validation', () => {
        it('should reject title shorter than 2 characters', async () => {
            const response = await request(app)
                .post('/addBook')
                .send({
                    isbn: '0123456789',
                    title: 'A', // 1 char
                    date: '2023-01-01'
                });

            expect(response.statusCode).toBe(400);
        });

        it('should reject title longer than 150 characters', async () => {
            const longTitle = 'A'.repeat(151);
            const response = await request(app)
                .post('/addBook')
                .send({
                    isbn: '0123456789',
                    title: longTitle,
                    date: '2023-01-01'
                });

            expect(response.statusCode).toBe(400);
        });
    });

    // Date validation tests
    describe('Date validation', () => {
        it('should reject invalid date format', async () => {
            const response = await request(app)
                .post('/addBook')
                .send({
                    isbn: '0123456789',
                    title: 'Test Book',
                    date: '01-01-2023' // Wrong format
                });

            expect(response.statusCode).toBe(400);
        });
    });

    // Optional fields tests
    describe('Optional fields validation', () => {

        it('should validate note when provided', async () => {
            const longNote = 'A'.repeat(501);
            const response = await request(app)
                .post('/addBook')
                .send({
                    isbn: '0123456789',
                    title: 'Test Book',
                    date: '2023-01-01',
                    note: longNote
                });

            expect(response.statusCode).toBe(400);
        });

        it('should validate coverUrl when provided', async () => {
            const response = await request(app)
                .post('/addBook')
                .send({
                    isbn: '0123456789',
                    title: 'Test Book',
                    date: '2023-01-01',
                    coverUrl: 'invalid-url' // Not a URL
                });

            expect(response.statusCode).toBe(400);
        });

        it('should validate book_rating when provided', async () => {
            const response = await request(app)
                .post('/addBook')
                .send({
                    isbn: '0123456789',
                    title: 'Test Book',
                    date: '2023-01-01',
                    book_rating: 6 // Out of range
                });

            expect(response.statusCode).toBe(400);
        });
    });

    // Test multiple validation errors
    it('should return all validation errors when multiple fields are invalid', async () => {
        const response = await request(app)
            .post('/addBook')
            .send({
                isbn: '123', // Too short
                title: 'A', // Too short
                date: 'invalid-date'
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.errors.length).toBeGreaterThan(1);
    });
});