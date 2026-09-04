import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import AES from 'crypto-js/aes';
import Utf8 from 'crypto-js/enc-utf8';

const NOTE_KEY_NAME = 'bookmark-note-key';

const getNoteKey = async (): Promise<string> => {
  const existing = await SecureStore.getItemAsync(NOTE_KEY_NAME);
  if (existing) {
    return existing;
  }
  const key = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${Date.now()}:${Math.random()}:tripare-spacex`,
  );
  await SecureStore.setItemAsync(NOTE_KEY_NAME, key);
  return key;
};

export const encryptNote = async (note: string): Promise<string> => {
  const key = await getNoteKey();
  return AES.encrypt(note, key).toString();
};

export const decryptNote = async (encryptedNote: string | null): Promise<string> => {
  if (!encryptedNote) {
    return '';
  }
  const key = await getNoteKey();
  return AES.decrypt(encryptedNote, key).toString(Utf8);
};
