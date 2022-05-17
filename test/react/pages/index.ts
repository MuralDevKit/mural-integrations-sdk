import {
  cleanup,
  render,
  RenderResult,
  screen,
  wait,
} from '@testing-library/react';
import { fail } from 'assert';
import { getCtxItem, setCtxItem } from 'pickled-cucumber/context';
import { delay } from '../utils';
import { Page, PageName } from './types';
import createMuralFromTemplate from './create-mural-from-template';
import muralPicker from './mural-picker';
import muralView from './mural-view';
import oAuthSessionActivation from './oauth-session-activation';
import homePage from './homepage';

const CURRENT_PAGE_NAME = '$currentPageName';
export const CURRENT_PAGE = '$currentPage';
export const ADDITIONAL_PAGE_ITEMS = '$additionalPageItems';
const ROUTE_ELEMENT = '$routeElement';

const PAGES: Record<PageName, Page> = {
  'create mural from template': createMuralFromTemplate,
  'home page': homePage,
  'mural picker': muralPicker,
  'mural view': muralView,
  'oauth session activation': oAuthSessionActivation,
};

const getErrorMessage = (header: string, body?: string) => `
  ${header}${
  body
    ? `

  ${body}`
    : ''
}

  You can take a look at the 'src/test/react/pages/index.ts' file to get an idea
  about how to solve this or reach out to #test-automation in Slack for help.
  `;

export const findPage = (name: PageName) => {
  // We get all defined pages
  const page = PAGES[name];

  // If there's no page with the given name, we fail with a nice error message.
  if (!page) {
    const header = `Cannot find the page [${name}]`;
    const body = `Available pages are:
      ${Object.keys(PAGES)
        .map(l => `\n      - ${l}`)
        .join()}`;
    fail(getErrorMessage(header, body));
  }
  return page;
};

export const queueRenderPage = (name: PageName) => {
  setCtxItem(CURRENT_PAGE_NAME, name);
};

// This function will render the component in the page and will also store the
// metadata in the context so we can access it later.
const renderPage = () => {
  const name = getCtxItem<PageName>(CURRENT_PAGE_NAME);
  const page = findPage(name);

  let result = getCtxItem(ROUTE_ELEMENT);

  if (!result) {
    // Otherwise, we render it on the screen
    result = render(page.element());
    // And then we store the `RenderResult` and the `Page` in the ctx
    setCtxItem(ROUTE_ELEMENT, result);
    setCtxItem(CURRENT_PAGE, page);
  }

  return page;
};

// This function is for adding page items that are created at runtime
export const addPageItems = (name: string, dataQa: string) => {
  const additionalPageItems =
    getCtxItem<Record<string, string>>(ADDITIONAL_PAGE_ITEMS) || {};
  additionalPageItems[name] = dataQa;
  setCtxItem(ADDITIONAL_PAGE_ITEMS, additionalPageItems);
};

const getCurrentPage = async (): Promise<Page> => {
  // We get the current page
  const currentPage = getCtxItem<Page>(CURRENT_PAGE);

  // If there's no page with the given name, we fail with a nice error message.
  if (!currentPage) {
    const pageName = getCtxItem<PageName>(CURRENT_PAGE_NAME);
    if (!pageName) {
      const header = `There's no current page set.`;
      const body = `In order to have a Page you need to render it first. Did you call the right step?`;

      fail(getErrorMessage(header, body));
    }
  }

  const page = await renderPage();

  if (page.renderDelay) {
    // We wait for a bit for the old rendered component to actually cleanup
    // removing this wait makes some tests flaky (some runs use the old component
    // which is in a broken / inconsistent state).
    await delay(page.renderDelay);
  }

  return page;
};

const getDataQa = (currentPage: Page, descriptor: string) => {
  const additionalPageItems =
    getCtxItem<Record<string, string>>(ADDITIONAL_PAGE_ITEMS) || {};
  const pageItems = { ...currentPage.items, ...additionalPageItems };
  const dataQa = pageItems[descriptor];

  // No `dataQa`, we fail with a nice error message.
  if (!dataQa) {
    const header = `Cannot find the data-qa for [${descriptor}]`;
    const body = `Available items are:
      ${JSON.stringify(pageItems, null, 2).replace('{', '').replace('}', '')}`;
    fail(getErrorMessage(header, body));
  }

  return dataQa;
};

// This function will do it's best to return a HTMLElement. If we don't pass a
// `descriptor`, it'll look for the `defaultElement` and default to the
// `container` element if there's no default. If we pass a `descriptor` it'll
// try to fetch it. This is similar to `getElements`.
export const getElement = async (
  elementDescriptor?: string,
  timeout?: number,
): Promise<HTMLElement> => {
  const page = await getCurrentPage();

  const descriptor = elementDescriptor || page.defaultElement;

  if (!descriptor) {
    // We default to the `container`
    return getRouteElement().container;
  }

  const dataQa = getDataQa(page, descriptor);
  return screen.findByTestId(dataQa, undefined, { timeout });
};

// This function will do it's best to return a collection of HTMLElement. If we don't pass a
// `descriptor`, it'll look for the `defaultElement` and default to the
// `container` element if there's no default. If we pass a `descriptor` it'll
// try to fetch it. This is similar to `getElement`.
export const getElements = async (
  elementDescriptor?: string,
  timeout?: number,
) => {
  const page = await getCurrentPage();

  const descriptor = elementDescriptor || page.defaultElement;

  if (!descriptor) {
    // We default to the `container`
    return [getRouteElement().container];
  }

  const dataQa = getDataQa(page, descriptor);
  return screen.findAllByTestId(dataQa, undefined, { timeout });
};

const getRouteElement = () => {
  const routeElement = getCtxItem<RenderResult | null>(ROUTE_ELEMENT);
  // If there's no `routeElement`, we fail with a nice error message.
  if (!routeElement) {
    const header = `There's no route element set.`;
    const body = `In order to have a Page you need to render it first. Did you call the right step?`;
    fail(getErrorMessage(header, body));
  }
  return routeElement;
};

export const getElementAt = async (descriptor: string, index: number) => {
  const elements = await getElements(descriptor);
  return elements && elements.length > index ? elements[index] : undefined;
};

export const queryElement = async (descriptor: string) => {
  const currentPage = await getCurrentPage();

  // This awaits an event loop tick such that the VDOM has a chance to update. False positives result otherwise.
  await wait();

  const dataQa = getDataQa(currentPage, descriptor);
  return screen.queryByTestId(dataQa);
};

export const elementExists = async (descriptor?: string) => {
  let result;
  try {
    await getElement(descriptor, 0);
    result = true;
  } catch (e) {
    result = false;
  }
  return result;
};

export const waitForElementToDisappear = async (
  descriptor: string,
  timeout?: number,
) => {
  return waitFor(
    async () => {
      const result = await elementExists(descriptor);
      return !result;
    },
    { timeout },
  );
};

// If your element is not found and you need to debug, just add:
// {
//   onTimeout: async (error: Error) => {
//     screen.debug(getElement('something'));
//     // or screen.debug(document); although this might be too large
//     // so consider using the non-found element's parent
//     throw error;
//   }
// }
export const waitForElement = async (descriptor?: string) => {
  return waitFor(async () => {
    return getElement(descriptor);
  });
};

// Wait for element's text content to match provided text.
// TODO (denise) implement deep search in element tree
export const waitForElementWithText = async (
  text: string,
  descriptor?: string,
  timeout?: number,
) => {
  let element: HTMLElement;
  return waitFor(
    async () => {
      element = await waitForElement(descriptor);
      if (element?.textContent === text) {
        return element.textContent;
      }
      const errorMessage = element
        ? `Element `
        : `Element with descriptor ${descriptor} not found.`;
      throw new Error(errorMessage);
    },
    {
      onTimeout: (error: Error) => {
        if (element) {
          return element.textContent;
        }
        throw error;
      },
      timeout,
    },
  );
};

type WaitForOptions<T> = {
  timeout?: number;
  interval?: number;
  /*
   * Function that gets called after the last unsuccessful try.
   * If it returns/resolves to a value, then `waitFor` finishes successfully resolving to this value.
   * Otherwise, throw an error (could be the generic error produced by `waitFor`, received as a param, or a new one),
   * and `waitFor` will reject with this one.
   *
   * This is useful not only for providing more specific errors, but also to be able to return a 'last resort'
   * value.
   * In the case of waitForElementWithText, if try returns an error if element's text does not match the desired
   * text, in order to waitFor to keep trying. But, if never found, we want to return the actual text of the
   * element, so the text can handle the comparison/assertion.
   */
  onTimeout?: (error: Error) => T | Promise<T>;
};

const waitFor = <T>(
  callback: () => T | Promise<T>,
  { timeout = 100, interval = 10, onTimeout }: WaitForOptions<T> = {},
): Promise<T> => {
  function checkTimeout(
    remaining: number,
    intervalId: NodeJS.Timeout,
    resolve: (value?: any) => void,
    reject: (reason?: any) => void,
  ) {
    if (remaining < 1) {
      const error = new Error(`Failed to fulfill promise in ${timeout}ms.`);
      clearInterval(intervalId);
      if (onTimeout) {
        try {
          const result = onTimeout(error);
          resolve(result);
        } catch (e) {
          reject(e);
        }
      } else {
        reject(error);
      }
    }
  }

  let remaining = timeout;
  return new Promise<T>(async (resolve, reject) => {
    const intervalId = setInterval(async () => {
      try {
        const result = await callback();
        if (result) {
          clearInterval(intervalId);
          resolve(result);
        } else {
          remaining -= interval;
          checkTimeout(remaining, intervalId, resolve, reject);
        }
      } catch (e) {
        remaining -= interval;
        checkTimeout(remaining, intervalId, resolve, reject);
      }
    }, interval);
  });
};

export const rerenderPage = async () => {
  const page = getCtxItem<PageName>(CURRENT_PAGE_NAME);
  if (!page) return;
  if (getCtxItem<Page>(CURRENT_PAGE) || getCtxItem(ROUTE_ELEMENT)) {
    cleanup();
    setCtxItem(CURRENT_PAGE, undefined);
    setCtxItem(ROUTE_ELEMENT, undefined);
  }
};
