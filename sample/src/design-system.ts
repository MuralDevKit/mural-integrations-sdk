import { defineCustomElements as defineMrlButton } from '@muraldevkit/ds-component-button/loader';
import { defineCustomElements as defineMrlSvg } from '@muraldevkit/ds-component-svg/loader';

/**
 * Bundle for all design system component Stencil loaders
 * We pass undefined to the window as we are not trying to override the window object. We add an options
 * object so that we can set a resourcesUrl in the test rig.
 *
 * @param {Record<string, unknown>} options - Additional options to pass to the custom element definitions
 * @returns {void} Imported loaders for custom elements
 */
export const defineDSComponents = (
  options: Record<string, unknown> = {},
): void => {
  defineMrlButton(undefined, options);
  defineMrlSvg(undefined, options);
};
