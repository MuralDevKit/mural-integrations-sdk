import { EventType, fireEvent, wait } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { fail } from 'assert';
import { SetupFnArgs } from 'pickled-cucumber/types';
import { getElement } from '../../pages';
import { elementAt, getSelectOption, ORDINAL_TO_INDEX_MAP } from '../utils';

interface PressedKeys {
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
}

export default function registerWhen({
  When,
  getCtx,
  setCtx,
  onTearDown,
}: SetupFnArgs) {
  const getPressedKeys = () => {
    let pressedKeys = getCtx<PressedKeys>('$pressedKeys');
    if (!pressedKeys) {
      pressedKeys = {
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
      };
    }
    return pressedKeys;
  };

  const fireMouseEvent = async (
    mouseEvent: EventType,
    node?: Element | null,
  ) => {
    const pressedKeys = getPressedKeys();
    const target = node || (await getElement());
    const options = {
      ...pressedKeys,
    };

    fireEvent[mouseEvent](target, options);
  };

  const KEY_ALIAS: Record<string, keyof PressedKeys> = {
    ALT: 'altKey',
    CMD: 'metaKey',
    CTRL: 'ctrlKey',
    SHIFT: 'shiftKey',
    WIN: 'metaKey',
  };
  const KEY_NAMES: Record<string, string> = {
    altKey: 'Alt',
    ctrlKey: 'Control',
    metaKey: 'Meta',
    shiftKey: 'Shift',
  };
  const NUMBERS_SHIFT_MAP: Record<string, string> = {
    '0': ')',
    '1': '!',
    '2': '@',
    '3': '#',
    '4': '$',
    '5': '%',
    '6': '^',
    '7': '&',
    '8': '*',
    '9': '(',
  };
  const KEY = Object.keys(KEY_ALIAS).join('|');
  const KEYS = `(?:${KEY})(?:(?:, | and )(?:${KEY}))*`; // 'ALT, CTRL and SHIFT'
  const getKeys = (s: string, hold = true, descriptor?: string): PressedKeys =>
    s
      .replace(/ and /g, ',')
      .replace(/ /g, '')
      .split(',')
      .map(k => KEY_ALIAS[k])
      .reduce((acc, k) => {
        if (acc[k] !== hold) {
          fireKeyboardEvent(
            KEY_NAMES[k],
            hold ? 'keyDown' : 'keyUp',
            descriptor,
          );
        }
        acc[k] = hold;
        return acc;
      }, getPressedKeys());

  const getKeyAndKeyCode = (key: string) => {
    // If we are pressing a non-char key, we don't use the `keyCode` in our app
    // (even if we are using mac), so we just return the key as-is. Examples of
    // this would be `Enter` `PageUp` `ArrowLeft` etc
    if (key.length > 1) {
      return { key, keyCode: 0 };
    }

    const { shiftKey } = getPressedKeys();

    // In order to replicate reality, when the step is asking something like
    // "pressing 2 while holding SHIFT" we need to send the `keyCode` for [2]
    // but the actual `key` would be [@]
    if (shiftKey) {
      const numberWithShift = NUMBERS_SHIFT_MAP[key];

      // This is a scenario where a number is pressed with SHIFT
      if (numberWithShift) {
        return {
          key: numberWithShift,
          keyCode: key.toUpperCase().charCodeAt(0),
        };
      }

      // At this point, we either have an alpha char (a-z) or a symbol. We will
      // return the upper case version of that char and the corresponding code.
      // Eventually, we should also have a map with non-alpha chars to lookup,
      // so things like "pressing \ while holding SHIFT" return { key: "|" } as
      // the real world would do.
      const upperCaseLetter = key.toUpperCase();

      return { key: upperCaseLetter, keyCode: upperCaseLetter.charCodeAt(0) };
    }

    // At this point, no modifiers were used and the key has nothing special, we
    // will return it as-is and calculate the keyCode from its upper case
    // version.
    return { key, keyCode: key.toUpperCase().charCodeAt(0) };
  };

  const fireKeyboardEvent = async (
    k: string,
    type: 'keyDown' | 'keyUp',
    descriptor?: string,
  ) => {
    const target = await getElement(descriptor);
    const { key, keyCode } = getKeyAndKeyCode(k);

    fireEvent[type](target, {
      key,
      keyCode,
      ...getPressedKeys(),
    });
  };

  const setKeys = (keys: string, press = true, descriptor = '') =>
    setCtx('$pressedKeys', getKeys(keys, press, descriptor));

  const clickAt = async (keys: string | undefined, node?: Element) => {
    if (keys) setKeys(keys, true);
    await fireMouseEvent('mouseDown', node);
    await fireMouseEvent('click', node);
    await fireMouseEvent('mouseUp', node);
    if (keys) setKeys(keys, false);
  };

  // USAGE:
  //
  // When clicking the [sidebar icons button]
  // When clicking the [sidebar icons button] while holding SHIFT
  When(
    `clicking the {descriptor}(?: while holding (${KEYS}))?`,
    async (descriptor, keys) => {
      const target = await getElement(descriptor);
      await clickAt(keys, target);
    },
  );

  // USAGE:
  //
  // When holding [Delete]
  // When holding [A]
  // When holding [Enter] on the [widget editor]
  // When pressing [d] while holding ALT and SHIFT
  When(
    `(pressing|holding|releasing) {descriptor}(?: (?:at|on)(?: the)? {descriptor})?(?: while holding (${KEYS}))?`,
    async (state, key, descriptor, keys) => {
      if (keys) setKeys(keys, true);

      // 'pressing' means the user was _typing_ so if we want to replicate the
      // real world, there should be two events fired.
      if (state === 'pressing') {
        await fireKeyboardEvent(key, 'keyDown', descriptor);
        await fireKeyboardEvent(key, 'keyUp', descriptor);
      } else {
        await fireKeyboardEvent(
          key,
          state === 'holding' ? 'keyDown' : 'keyUp',
          descriptor,
        );
      }
    },
  );

  // Adds some text to an editor
  //
  // USAGE:
  //
  // When typing 'hello' on the [widget editor]
  // When typing '{enter}' on the [widget editor]
  // When typing 'hello' on the [widget editor] at the end
  // When typing 'hello' on the [widget editor] at the start
  When(
    `typing "(.*)"(?: (?:at|on)(?: the)? {descriptor})?( at the end| at the start)?`,
    async (value, descriptor, position) => {
      const append = !!position && position.trim() === 'at the end';
      const prepend = !!position && position.trim() === 'at the start';
      const target = (await getElement(descriptor)) as HTMLInputElement;

      if (append) {
        target.setSelectionRange(target.value.length, target.value.length);
      }
      if (prepend) {
        target.setSelectionRange(0, 0);
      }
      userEvent.type(target, value);
    },
  );

  const restoreWindowSize = () => {
    const originalSize = getCtx<{ innerWidth: number; innerHeight: number }>(
      '$windowSize',
    );
    if (originalSize) {
      const { innerWidth, innerHeight } = originalSize;
      (window as any).innerWidth = innerWidth;
      (window as any).innerHeight = innerHeight;
    }
  };

  // Triggers a resize event on window
  //
  // USAGE:
  //
  // When resizing the window to 600 600
  When(`resizing the window to {int} {int}`, async (width, height) => {
    const w = parseInt(width, 10);
    const h = parseInt(height, 10);

    // Save original window size once (so that if resize gets called on several
    // steps, we'll hold on to the original window size), then restore it on tearDown
    const windowSize = getCtx('$windowSize');
    if (!windowSize) {
      const { innerWidth, innerHeight } = window;
      setCtx('$windowSize', {
        innerWidth,
        innerHeight,
      });
      onTearDown(() => {
        restoreWindowSize();
        setCtx('$windowSize', null);
      });
    }

    (window as any).innerWidth = w;
    (window as any).innerHeight = h;

    await new Promise((resolve, _reject) => {
      const fakeHandler = () => {
        window.removeEventListener('resize', fakeHandler);
        resolve(null);
      };

      window.addEventListener('resize', fakeHandler);

      window.dispatchEvent(new Event('resize'));
    });
  });

  // USAGE: select an option for react-select dropdown one
  //
  // when I select "option" in [descriptor]
  When(`I select "(.*)" in {descriptor}`, async (option, descriptor) => {
    await getSelectOption(descriptor, option, true);
  });

  // USAGE:
  //
  // When I select the first item in [element]
  // When I select the second item in [element]
  When(
    `I select the (${Object.keys(ORDINAL_TO_INDEX_MAP).join(
      '|',
    )}) item in {descriptor}`,
    async (ordinal, descriptor) => {
      const idx = ORDINAL_TO_INDEX_MAP[ordinal] + 1;
      const element = await getElement(descriptor);

      const selectControlElement = element.querySelector('.Select-control');
      if (!selectControlElement) {
        fail(`${descriptor} has no select element`);
      }

      for (let i = 0; i < idx; i += 1) {
        fireEvent.keyDown(selectControlElement, {
          key: 'ArrowDown',
          keyCode: 40,
          code: 40,
        });
      }
      await wait();
      fireEvent.keyDown(selectControlElement, {
        key: 'Enter',
        keyCode: 13,
        code: 13,
      });
    },
  );

  // USAGE:
  //
  // When I click on [sign in button]
  // When I click on [${SOME_VAR}]
  // When I click on [color item button] at index 0
  When(
    `I click on {descriptor}(?: at index {int})?`,
    async (descriptor, index) => {
      const element = await elementAt(descriptor, index);
      const isDisabled = element.hasAttribute('disabled');
      if (isDisabled) {
        fail(`${descriptor} has no side-effect because it is disabled`);
      }
      fireEvent.click(element);
    },
  );

  // USAGE:
  //
  // When I (focus|unfocus) [some element]
  When('I (focus|unfocus) {descriptor}', async (state, descriptor) => {
    const element = await getElement(descriptor);
    const isFocus = state === 'focused';
    if (isFocus) {
      element.focus();
    } else {
      element.blur();
    }
  });

  // USAGE:
  //
  // When I input "" in [some element] - (no value)
  // When I input "some value" in [some element]
  // When I input "some/path/value.png" in [some element]
  When(`I input "(.*)" in {descriptor}`, async (value, descriptor) => {
    return inputValueByDescriptor({ descriptor, value });
  });

  const inputValueByDescriptor = async ({
    descriptor,
    value,
  }: Record<string, string>) => {
    const element = (await getElement(descriptor)) as HTMLInputElement;
    element.focus();
    const isChange = element.value !== value;
    if (isChange) {
      fireEvent.change(element, { target: { value } });
    }
  };

  // When I hover over [capabilities hidden button]
  // When I hover over [${SOME_VAR}]
  When(`I hover over {descriptor}`, async descriptor => {
    fireEvent.mouseOver(await getElement(descriptor));
  });
}
