import { client } from '../client/client.gen';
import { API_BASE_URL } from '../constants/config';

let accessToken: string | undefined;

export function setAccessToken(token: string | undefined) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

client.setConfig({
  baseUrl: API_BASE_URL,
  auth: async () => accessToken,
});

export { client };
