/* 
1. Use the inquirer npm package to get user input.
2. Use the qr-image npm package to turn the user entered URL into a QR code image.
3. Create a txt file to save the user input using the native fs node module.
*/

import inquirer from 'inquirer';
import qr from 'qr-image'
import fs from 'fs'


// Function to prompt for a URL, generate a QR code, and save user input
async function generateQRCode() {
    try {
        // 1. Get user input
        const { url } = await inquirer.prompt([
            {
                type: 'input',
                name: 'url',
                message: 'Enter a URL to generate a QR code:',
                validate: input => input ? true : 'URL cannot be empty!'
            }
        ]);

        // 2. Generate QR code image
        const qrImage = qr.image(url, { type: 'png' });
        const qrFileName = 'qr_code_test1.png';
        qrImage.pipe(fs.createWriteStream(qrFileName));

        console.log(`QR code image has been saved as ${qrFileName}`);

        // 3. Save URL to a text file
        fs.writeFileSync('user_url.txt', url, 'utf8');
        console.log('The entered URL has been saved in user_url.txt');
    } catch (error) {
        console.error('Error:', error);
    }
}

generateQRCode();