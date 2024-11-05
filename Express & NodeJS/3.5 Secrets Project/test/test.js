import * as chai from 'chai';
import chaiHttp from 'chai-http';
import { expect } from 'chai';
import supertest from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRootDir = resolve(__dirname, '..');
console.log(projectRootDir);

// Create an instance of your express app to use in tests
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(projectRootDir + "/public"));

// Define the checkPassword function for testing
function checkPassword(req, res) {
    const password = req.body["password"];
    if (password === 'ILoveProgramming') {
        res.sendFile(projectRootDir + "/public/secret.html");
    } else {
        res.redirect('/');
    }
}

// Attach the checkPassword route for testing
app.post("/check", checkPassword);
app.get("/", (req, res) => {
    res.sendFile(projectRootDir + "/public/index.html");
});

// Initialize Supertest for the app
const request = supertest(app);

// Use Chai HTTP with Chai
chai.use(chaiHttp);

// Unit tests
describe('Password Protected Routes', () => {
    it('should load the homepage at GET /', (done) => {
        request
            .get('/')
            .expect(200)
            .end((err, res) => {

                if (err) return done(err);
                expect(res.text).to.include('Secrets'); // Adjust if homepage content differs
                done();
            });
    });

    it('should redirect to the homepage if password is incorrect on POST /check', (done) => {
        request
            .post('/check')
            .send({ password: 'WrongPassword' })
            .expect(302)  // Expect a redirect status code
            .expect('Location', '/')  // Verify redirection to homepage
            .end((err) => {
                if (err) return done(err);
                done();
            });
    });

    it('should serve the secret page if password is correct on POST /check', (done) => {
        request
            .post('/check')
            .type('form')  // Ensures form URL encoding
            .send({ password: 'ILoveProgramming' })
            .expect(200)
            .end((err, res) => {
                console.log(res.text);  // Log response to check content

                if (err) return done(err);
                expect(res.text).to.include('chocolate desserts');  // Adjust to actual content
                done();
            });
    });
});