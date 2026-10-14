import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'auth_token';
let cachedToken: string | null | undefined = undefined;

export async function getToken(): Promise<string | null> {
  if (cachedToken !== undefined) {
    return cachedToken;
  }
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        cachedToken = window.localStorage.getItem(TOKEN_KEY);
        return cachedToken;
      }
      cachedToken = null;
      return null;
    }
    cachedToken = await SecureStore.getItemAsync(TOKEN_KEY);
    return cachedToken;
  } catch (error) {
    console.error('Error reading token:', error);
    cachedToken = null;
    return null;
  }
}

export async function setToken(token: string): Promise<void> {
  cachedToken = token;
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(TOKEN_KEY, token);
      }
      return;
    }
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch (error) {
    console.error('Error setting token:', error);
  }
}

export async function clearToken(): Promise<void> {
  cachedToken = null;
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(TOKEN_KEY);
      }
      return;
    }
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('Error clearing token:', error);
  }
}

