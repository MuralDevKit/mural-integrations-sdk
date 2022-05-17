import mockRequest from '../requests';
import { AxiosRequest, Method } from '../requests/common';

export const axios = {
  get: (url: string) => mockRequest({ method: Method.GET, url }),
  delete: (url: string) => mockRequest({ method: Method.DELETE, url }),
  put: (url: string, data: {}) =>
    mockRequest({ method: Method.PUT, url, data }),
  post: (url: string, data: {}) =>
    mockRequest({ method: Method.POST, url, data }),
  request: async (request: AxiosRequest) => mockRequest(request),
  interceptors: {
    request: {
      use: () => {},
    },
  },
  create: () => {
    return axios;
  },
};
