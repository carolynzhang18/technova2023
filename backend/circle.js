const crypto = require('crypto')
const secret = crypto.randomBytes(32).toString('hex')
// console.log(secret);
const forge = require('node-forge');

const axios = require('axios').default;

require('dotenv').config();

const { v4: uuidv4 } = require('uuid');

let myuuid = uuidv4();

module.exports = async (app) => {
    const options = {
        method: 'GET',
        url: 'https://api.circle.com/v1/w3s/config/entity/publicKey',
        headers: {'Content-Type': 'application/json', Authorization: process.env.CIRCLE_API_KEY}
      };
      
      try {
        const { data } = await axios.request(options);
        console.log(data.data.publicKey);
        const entitySecret = forge.util.hexToBytes(secret);
        const publicKey = forge.pki.publicKeyFromPem(data.data.publicKey)
        const encryptedData = publicKey.encrypt(entitySecret, 'RSA-OAEP', {
        md: forge.md.sha256.create(),
        mgf1: {
            md: forge.md.sha256.create(),
        },
        })

        console.log(forge.util.encode64(encryptedData));
        const cipherText = forge.util.encode64(encryptedData);

        const options2 = {
            method: 'POST',
            url: 'https://api.circle.com/v1/w3s/developer/walletSets',
            headers: {'Content-Type': 'application/json', Authorization: process.env.CIRCLE_API_KEY},
            data: {
              idempotencyKey: myuuid,
              entitySecretCipherText: process.env.CIRCLE_CIPHER_TEXT,
              name: 'cz_wallet_set'
            }
          };
          
          try {
            const { data } = await axios.request(options2);
            console.log(data);
          } catch (error) {
            console.error(error);
          }

      } catch (error) {
        console.error(error);
      }

    

}
