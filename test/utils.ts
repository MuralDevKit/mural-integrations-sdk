import jwt from 'jsonwebtoken';

export const FAKE_CLIENT_ID = '00000000-00000000-00000000-00000000';
export const FAKE_MURAL_HOST = 'murally.testing.rig';

export const get = <T>(obj: unknown, path: string): T =>
  path
    .split('.')
    .reduce((k, o) => (o === undefined || o === null ? o : o[k]), obj as any);

export const set = (obj: unknown, path: string, value: unknown): void => {
  const setWithPathArray = (o: any, [head, ...items]: string[]) => {
    if (items.length === 0) {
      // eslint-disable-next-line no-param-reassign
      o[head] = value;
      return;
    }
    // eslint-disable-next-line no-param-reassign
    if (!o[head]) o[head] = {};
    setWithPathArray(o[head], items);
  };

  setWithPathArray(obj, path.split('.'));
};

export const dummyToken = (claims?: object) => {
  return jwt.sign(
    {
      username: 'dummy_username',
      sessionId: '',
      scopes: [],
      ...claims,
    },
    'dummy_secret_key',
    { expiresIn: 5000 },
  );
};
