// eslint-disable-next-line no-shadow
export enum Method {
  GET = 'GET',
  PUT = 'PUT',
  POST = 'POST',
  DELETE = 'DELETE',
}

export interface MockRequest {
  method: Method;
  url: (url: string) => boolean;
  handler: (request: AxiosRequest) => any;
}

export interface AxiosRequest {
  data?: {};
  headers?: {};
  method: Method;
  url: string;
}
