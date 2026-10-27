import crypto from 'crypto';

import { PcqParameters } from '@services/pcq/pcq-parameters';

const algorithm = 'aes-256-gcm';
const bufferSize = 16;
const iv = Buffer.alloc(bufferSize, 0); // Initialization vector.
const keyLength = 32;

export const createToken = (params: PcqParameters, tokenKey: string): string => {
  const key = crypto.scryptSync(tokenKey, 'salt', keyLength);

  // Convert all params to string before encrypting
  const stringParams = Object.fromEntries(Object.entries(params).map(([name, value]) => [name, String(value)]));
  const strParams = JSON.stringify(stringParams);
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(strParams, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return encrypted;
};
