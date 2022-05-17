// import { LocationDescriptorObject } from 'history';
import { setLastUrl } from '../helpers/jsdom-navigate';

type LocationDescriptorObject = { pathname: string; search: string };

const setLastUrlFromHistory = (url: string | LocationDescriptorObject) => {
  if (typeof url === 'object') {
    setLastUrl(`${url.pathname}${url.search}`);
  } else {
    setLastUrl(url);
  }
};

const reactRouterMock = {
  useHistory: () => {
    return {
      push: (url: string | LocationDescriptorObject) => {
        setLastUrlFromHistory(url);
      },
      replace: (url: string | LocationDescriptorObject) => {
        setLastUrlFromHistory(url);
      },
    };
  },
  useLocation: () => {
    return { search: `?${window.location.search}` };
  },
};

export default reactRouterMock;
