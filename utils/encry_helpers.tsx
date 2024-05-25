import CryptoJS from 'crypto-js';


const secretKey = process.env.NEXT_PUBLIC_ENCRY_TOKEN;

if (!secretKey) {
    throw new Error('ENCRY_TOKEN is not defined in the environment variables');
}

export function encryptToken(token: string) {
    const ciphertext = CryptoJS.AES.encrypt(token, secretKey).toString();
    return ciphertext;
}

export function decryptToken(ciphertext: string) {
    const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
    const decryptedToken = bytes.toString(CryptoJS.enc.Utf8);
    return decryptedToken;
}
