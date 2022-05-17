import { getCtxItem } from 'pickled-cucumber/context';
import { AxiosRequest } from './common';

export default (request: AxiosRequest) => {
  const endpointIsMocked = getCtxItem<boolean>('MOCKED_ENDPOINT');

  if (endpointIsMocked) {
    const muraApiMockedUrlResponse = JSON.parse(
      getCtxItem<string>('MOCKED_URL_RESPONSE'),
    );
    const mocked = muraApiMockedUrlResponse.filter((mock: { url: string }) => {
      return request.url?.includes(mock.url);
    });

    if (mocked.length === 0) {
      throw new Error('FOUND NO MOCKED RESPONSES');
    }
    const { status, data } = mocked[0];

    return {
      status,
      data,
    };
  }
  const ctxStatus = getCtxItem<string>('AXIOS_RESPONSE_STATUS');
  const status = ctxStatus ? parseInt(ctxStatus, 10) : 200;
  return {
    status,
    data: JSON.parse(getCtxItem<string>('AXIOS_RESPONSE_PAYLOAD') || '{}'),
  };
};
