//import CryptoJS from 'crypto-js';


const secretKey = process.env.NEXT_PUBLIC_ENCRY_TOKEN;

if (!secretKey) {
    throw new Error('ENCRY_TOKEN is not defined in the environment variables');
}

export function encryptToken(token: string) {
    //TODO
    return token
}

export function decryptToken(ciphertext: string) {
    //TODO
    return ciphertext
}
