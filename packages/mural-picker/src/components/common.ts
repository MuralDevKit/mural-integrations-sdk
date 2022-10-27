import {
  Button,
  ButtonBase,
  ListItem as BaseListItem,
  ListSubheader as BaseListSubheader,
  Divider as BaseDivider,
} from '@material-ui/core';
import { darken } from '@material-ui/core/styles';
import { withStyles } from '@material-ui/styles';

/**
 * Evaluates a value in the context of computing breakpoints
 *
 * For each provided breakpoint, the returning object will be `true` iif:
 *
 * - `value` is falsy (fallback logic)
 * - `value` >= breakpoint threshold (when breakpoint > 0)
 * - `value` < breakpoint threshold (when breakpoint < 0)
 *
 * @example
 * const BP = { s: -120, m: 120, l: 200 }
 * threshold(100, BP)
 * > { s: true, m: false, l: false }
 * threshold(120, BP)
 * > { s: false, m: true, l: false }
 */
export const threshold = <T extends { [k: string]: number }>(
  value: number | undefined | null,
  breakpoints: T,
): Record<keyof T, boolean> => {
  if (value && value < 0) {
    throw new Error("'value' must be a positive number");
  }

  const ops = {
    ge: (a: number, b: number) => a >= b,
    lt: (a: number, b: number) => a < b,
  };

  let res = {};

  for (const [k, v] of Object.entries(breakpoints)) {
    const limit = Math.abs(v);
    const op = v >= 0 ? ops.ge : ops.lt;
    // @ts-ignore
    res[k] = !value || op(value, limit);
  }

  return res as any;
};

export const BackButton = withStyles({
  root: {
    height: '100%',
    marginRight: '0.66rem',
    minWidth: '2em',
  },
})(Button);

export const PrimaryButton = withStyles(theme => ({
  root: {
    backgroundColor: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: darken(
        theme.palette.primary.main,
        theme.palette.action.hoverOpacity,
      ),
    },
    '&:focus': {
      backgroundColor: darken(
        theme.palette.primary.main,
        theme.palette.action.focusOpacity,
      ),
    },
  },
  label: {
    color: theme.palette.common.white,
  },
  disabled: {
    backgroundColor: theme.palette.action.disabledBackground,
  },
}))(Button);

export const SecondaryButton = withStyles(theme => ({
  root: {
    '&:focus': {
      background: theme.palette.secondary.light,
    },
  },
  label: {
    borderBottom: '1px dashed #000000',
    borderColor: theme.palette.text.secondary,
    color: theme.palette.text.secondary,
    fontWeight: 700,
  },
}))(Button);

export const Ripple = withStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
    marginBottom: '1rem',
    borderRadius: '5px',
  },
})(ButtonBase);

export const ListSubheader = withStyles(theme => ({
  root: {
    marginTop: '1.2em',
    whiteSpace: 'nowrap',
    textTransform: 'uppercase',
    fontSize: 13,
    lineHeight: '13px',
    fontWeight: 700,
    color: theme.palette.text.secondary,
    padding: 0,
    marginBottom: 12,
  },
}))(BaseListSubheader);

export const ListItem = withStyles(theme => ({
  root: {
    fontSize: 15,
    fontWeight: 400,
    lineHeight: '1.3em',
    color: theme.palette.text.secondary,
    padding: '0.4rem',
    marginBottom: '0.4rem',
    borderRight: 'solid 0.2em #ececec',
    borderColor: theme.palette.divider,
  },
  selected: {
    backgroundColor: 'transparent !important',
    color: theme.palette.text.primary,
  },
}))(BaseListItem);

export const Divider = withStyles({
  root: {
    marginTop: 10,
    marginBottom: 20,
  },
})(BaseDivider);
