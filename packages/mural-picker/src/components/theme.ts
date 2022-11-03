import { createMuiTheme, ThemeOptions } from '@material-ui/core/styles';

export type Preset = 'light' | 'dark';

const base = createMuiTheme({
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: 'Proxima Nova',
    button: {
      lineHeight: 1.2,
      textTransform: 'none',
    },
  },
  overrides: {
    // @ts-ignore
    MuiAutocomplete: {
      inputRoot: {
        '&[class*=MuiOutlinedInput-root]': {
          padding: '0 6px',
        },
        '& fieldset': {
          borderWidth: 2,
        },
      },
      listbox: {
        border: '1px solid lightgray',
      },
    },
    MuiFormLabel: {
      root: {
        fontWeight: 600,
      },
    },
    MuiCardActionArea: {
      root: {
        padding: '0.8rem',
      },
    },
    MuiButton: {
      root: {
        height: '2.8em',
      },
      label: {
        fontWeight: 600,
      },
    },
    MuiPaper: {
      root: {
        transitionProperty: 'translate,box-shadow',
        transitionDelay: '30ms',
      },
    },
    MuiTouchRipple: {
      root: {
        opacity: 0.06,
      },
      child: {
        backgroundColor: 'red',
      },
    },
  },
});

export const THEMES: Record<Preset, ThemeOptions> = {
  light: createMuiTheme(base, {
    palette: {
      type: 'light',
      text: {
        primary: '#2F2F2F',
      },
      primary: {
        main: '#e8005a',
        light: '#d7004b',
      },
    },
  }),
  dark: createMuiTheme(base, {
    palette: {
      type: 'dark',
      text: {
        primary: '#a7a7a7',
        secondary: '#a7a7a7',
        action: '#fff',
      },
      primary: {
        main: '#e8005a',
        light: '#d7004b',
      },
      background: {
        paper: '#424242',
      },
    },
  }),
};

export default (preset: Preset) => THEMES[preset];
