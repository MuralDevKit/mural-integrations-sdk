import { SetupFnArgs } from 'pickled-cucumber/types';
import { fail } from 'assert';
import { fireEvent, screen, within } from '@testing-library/react';
import { getElement, queryElement, waitForElementWithText } from '../../pages';
import { elementAt } from '../utils';

export default function registerThen({ Then, compare }: SetupFnArgs) {
  // USAGE:
  //
  // Then [password field] is shown
  // Then [start a free trial button] is shown
  // Then [${SOME_VAR}] is shown
  Then(`{descriptor} is shown`, async descriptor => {
    compare('is', !!(await getElement(descriptor)), 'true');
  });

  // USAGE:
  //
  // Then [password field] is not shown
  // Then [start a free trial button] is not shown
  // Then [${SOME_VAR}] is not shown
  Then(`{descriptor} is not shown`, async descriptor => {
    const element = await queryElement(descriptor);
    if (element) {
      fail(`${descriptor} is unintentionally shown`);
    }
  });

  // USAGE:
  //
  // Then the [widget editor] content is "This is a value"
  Then(
    'the {descriptor}(?: at index {int})? content {op}',
    async (descriptor, index, op, payload) => {
      const element = await elementAt(descriptor, index);

      const value =
        isInputElement(element) || isTextAreaElement(element)
          ? element.value
          : element.textContent;

      compare(op, value, payload);
    },
    { inline: true },
  );

  const isInputElement = (el: HTMLElement): el is HTMLInputElement =>
    el.tagName === 'INPUT';
  const isTextAreaElement = (el: HTMLElement): el is HTMLTextAreaElement =>
    el.tagName === 'TEXTAREA';

  // USAGE:
  //
  // the [some input] input is checked
  // the [some input] input is unchecked
  Then(
    'the {descriptor} input is (checked|unchecked)',
    async (descriptor, state) => {
      const input = await getElement(descriptor);
      const flag = state === 'checked' ? 'true' : 'false';
      compare('is', (input as HTMLInputElement).checked, flag);
    },
    { inline: true },
  );

  // USAGE:
  //
  // Then [some element] is (enabled|disabled)
  Then('{descriptor} is (enabled|disabled)', async (descriptor, state) => {
    const el = await getElement(descriptor);
    const flag = state === 'disabled' ? 'true' : 'false';
    compare('is', el.hasAttribute('disabled'), flag);
  });

  // USAGE:
  //
  // Then [${SOME_VAR}] is empty
  // Then [${SOME_VAR}] is not empty
  Then(`{descriptor} is( not)? empty`, async (descriptor, not) => {
    const element = await getElement(descriptor);
    compare('is', element.childElementCount === 0, not ? 'false' : 'true');
  });

  // USAGE:
  //
  // Then attribute "href" of element [mural glyph] is "https://example.com/"
  // Then attribute "${SOME_VAR}" of element [${SOME_VAR}] is "${SOME_VAR}"
  Then(
    'attribute "(.+)" of element {descriptor} {op}',
    async (attribute, descriptor, op, payload) => {
      const pageElement = await getElement(descriptor);
      compare(op, pageElement.getAttribute(attribute), payload);
    },
    { inline: true },
  );

  // USAGE:
  //
  // Then [some element] is (focused|unfocused)
  Then('{descriptor} is (focused|unfocused)', async (descriptor, state) => {
    const element = await getElement(descriptor);
    const flag = state === 'focus' ? 'true' : 'false';
    compare('is', element.dataset.focus === 'true', flag);
  });

  // USAGE:
  //
  // Then [data qa field] text is "Test"
  // Then [data qa field] text contains "Test"
  Then(
    '{descriptor} text {op} "(.*)"',
    async (descriptor, op, text) => {
      const currentText = await waitForElementWithText(text, descriptor);
      compare(op, currentText, JSON.stringify(text));
    },
    { inline: true },
  );

  // USAGE:
  //
  // Then [${SOME_VAR}] has 1 option
  // Then [${SOME_VAR}] has 3 options
  Then('{descriptor} has {int} options?', async (descriptor, choiceCount) => {
    const element = await getElement(descriptor);
    const isMuiSelect = element?.classList.contains('MuiFormControl-root');
    const isMuiSelect2 = element?.classList.contains('MuiInputBase-root');
    let selectControlElement;
    if (isMuiSelect) {
      selectControlElement = await within(element).findByRole('combobox');
    } else if (isMuiSelect2) {
      selectControlElement = await within(element).findByRole('button', {
        hidden: true,
      });
    }

    if (!selectControlElement) {
      fail(`${descriptor} has no select element`);
    }

    // Trigger the dropdown - the dropdown need to be opened for the options to be rendered
    fireEvent.keyDown(selectControlElement, { key: 'ArrowDown', keyCode: 40 });
    const selectOptionsLength = screen.queryAllByRole('option').length;

    // Close the dropdown
    fireEvent.keyDown(selectControlElement, { key: 'Escape', keyCode: 27 });

    compare('is', selectOptionsLength, choiceCount);
  });

  // USAGE:
  //
  // Then the [background color options] has 1 child
  // Then the [background color options] has 2 children
  Then(
    'the {descriptor} has {int} child(?:ren)?',
    async (descriptor, value) => {
      const element = await getElement(descriptor);
      compare('is', element.childNodes.length, value);
    },
  );
}
