import { AxiosRequest, Method } from '../../requests/common';

const fetchToAxiosResponse = (response: Response) => {
  return {
    data: response.json(),
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  };
};

// We are converting axios calls to fetch calls because fetch call are easier to mock with our current setup
export const axios = {
  get: async (url: string) => {
    const response = await fetch(url, {
      method: Method.GET,
    });
    return fetchToAxiosResponse(response);
  },
  delete: async (url: string) => {
    const response = await fetch(url, {
      method: Method.DELETE,
    });
    return fetchToAxiosResponse(response);
  },
  put: async (url: string, data: {}) => {
    const response = await fetch(url, {
      method: Method.PUT,
      body: JSON.stringify(data),
      headers: { 'content-type': 'application/json' },
    });
    return fetchToAxiosResponse(response);
  },
  post: async (url: string, data: {}) => {
    const response = await fetch(url, {
      method: Method.POST,
      body: JSON.stringify(data),
      headers: { 'content-type': 'application/json' },
    });
    return fetchToAxiosResponse(response);
  },
  request: async (request: AxiosRequest) => {
    const response = await fetch(request.url, {
      method: request.method,
      body: JSON.stringify(request.data),
      headers: { 'content-type': 'application/json' },
    });
    return fetchToAxiosResponse(response);
  },
  interceptors: {
    request: {
      use: () => {},
    },
  },
  create: () => {
    return axios;
  },
};
