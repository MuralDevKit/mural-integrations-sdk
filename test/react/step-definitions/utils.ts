import { fireEvent, getByText, screen, within } from '@testing-library/react';
import { fail } from 'assert';
import { getElement, getElementAt } from '../pages';

export const ORDINAL_TO_INDEX_MAP: Record<string, number> = {
  first: 0,
  second: 1,
  third: 2,
  fourth: 3,
  fifth: 4,
  sixth: 5,
  seventh: 6,
  eighth: 7,
  ninth: 8,
  tenth: 9,
};

export const elementAt = async (
  descriptor: string,
  index: string,
): Promise<HTMLElement> => {
  let element;
  const elementIdx = parseInt(index, 10);

  if (Number.isNaN(elementIdx)) {
    element = await getElement(descriptor);
  } else {
    // If we define an index, then we are looking at a list of elements
    element = await getElementAt(descriptor, elementIdx);
    if (!element) {
      fail(`No element with index ${index} at descriptor ${descriptor}`);
    }
  }

  return element;
};

export const getSelectOption = async (
  descriptor: string,
  option: string,
  clickOn?: boolean,
) => {
  const element = await getElement(descriptor);
  const isOurSelect = element?.classList.contains('ui-dropdown');
  const isMuiSelect = element?.classList.contains('MuiFormControl-root');
  const isMuiSelect2 = element?.classList.contains('MuiInputBase-root');
  const isReactSelect = !!element?.querySelector('.Select');
  let selectOption: HTMLElement;

  if (isOurSelect) {
    const dropdownControl = element.querySelector('.ui-dropdown-select-box');
    if (!dropdownControl) {
      fail(`${descriptor} has no select element`);
    }
    fireEvent.click(dropdownControl);

    selectOption = getByText(element, option);
  } else if (isMuiSelect) {
    const autocomplete = await within(element).findByRole('combobox');
    fireEvent.keyDown(autocomplete, { key: 'ArrowDown', keyCode: 40 }); // Trigger the dropdown

    selectOption = await screen.findByText(option);
  } else if (isMuiSelect2) {
    const select = await within(element).findByRole('button', { hidden: true });
    fireEvent.keyDown(select, { key: 'ArrowDown', keyCode: 40 });

    selectOption = await screen.findByText(option);
  } else if (isReactSelect) {
    const dropdownElement = element?.querySelector('.Select');
    const dropdownControl = dropdownElement?.querySelector('.Select-control');

    if (!dropdownElement || !dropdownControl) {
      fail(`${descriptor} has no select element`);
    }
    fireEvent.keyDown(dropdownControl, { key: 'ArrowDown', keyCode: 40 }); // Trigger the dropdown

    selectOption = getByText(element, option);
  } else {
    fail(`${descriptor} has no select element`);
  }

  if (clickOn) {
    if (!selectOption) {
      fail(`${descriptor} has no select option "${option}"`);
    }

    if (isOurSelect || isMuiSelect || isMuiSelect2) {
      fireEvent.click(selectOption);
    } else if (isReactSelect) {
      fireEvent.mouseDown(selectOption);
    }
  } else {
    return selectOption;
  }
};
