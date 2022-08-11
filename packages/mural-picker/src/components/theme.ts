import { createMuiTheme, ThemeOptions } from '@material-ui/core/styles';

export type Preset = 'light' | 'dark';

export const THEMES: Record<Preset, ThemeOptions> = {
  light: {
    palette: {
      type: 'light',
      text: { primary: '#585858' },
      primary: {
        main: '#FF0066',
      },
    },
    typography: {
      fontFamily: 'Proxima Nova',
    },
  },
  dark: {
    palette: {
      type: 'light',
      text: { primary: '#a7a7a7' },
      primary: {
        main: '#FF0066',
      },
    },
    typography: {
      fontFamily: 'Proxima Nova',
    },
  },
};

export default (preset: Preset) => createMuiTheme(THEMES[preset]);
