const SESSION_STORAGE_KEY = 'mural.oauth.session';
const STATE_STORAGE_KEY = 'mural.oauth.state';

export interface Session {
  accessToken: string;
  refreshToken: string;
}

export interface AccessTokenPayload {
  exp: number;
  iat: number;
  scopes: string[];
  sessionId: string;
  username: string;
}

export function setSession(session: Session, storage: Storage) {
  storage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function getSession(storage: Storage): Session | null {
  const session = storage.getItem(SESSION_STORAGE_KEY);
  if (session) return JSON.parse(session);
  return null;
}

export function deleteSession(storage: Storage) {
  storage.removeItem(SESSION_STORAGE_KEY);
}

export const setupSessionStore = (storage: Storage) => ({
  get: () => getSession(storage),
  set: (session: Session) => setSession(session, storage),
  delete: () => deleteSession(storage),
});

export function storeState(state: string) {
  sessionStorage.setItem(STATE_STORAGE_KEY, state);
}

// Get or set the OAuth state
export function generateState(opts = { store: false }): string {
  let buffer = new Uint8Array(4);
  buffer = crypto.getRandomValues(buffer);

  const state = Buffer.from(buffer).toString('hex');

  if (opts.store) {
    storeState(state);
  }

  return state;
}

export function validateState(state: string): boolean {
  try {
    const storedState = sessionStorage.getItem(STATE_STORAGE_KEY);
    // if no state has been set we can skip the validation
    if (!storedState) return true;
    return state === storedState;
  } finally {
    sessionStorage.removeItem(STATE_STORAGE_KEY);
  }
}
