import {
  Button,
  ButtonBase,
  ListItem as BaseListItem,
  ListSubheader as BaseListSubheader,
  Divider as BaseDivider,
} from '@material-ui/core';
import { withStyles } from '@material-ui/styles';

export const PrimaryButton = withStyles({
  root: {
    backgroundColor: '#FF0061',
  },
  label: {
    color: '#fff',
    textTransform: 'uppercase',
  },
})(Button);

export const SecondaryButton = withStyles({
  label: {
    textTransform: 'capitalize',
    borderBottom: '1px dashed #393939',
    color: '#393939',
    fontWeight: 700,
  },
})(Button);

export const Ripple = withStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
    marginBottom: 16,
    borderRadius: '5px',
    border: 'solid 1px #ffffff',
  },
})(ButtonBase);

export const ListSubheader = withStyles({
  root: {
    marginTop: '1.2em',
    whiteSpace: 'nowrap',
    textTransform: 'uppercase',
    fontSize: 13,
    lineHeight: '13px',
    fontWeight: 700,
    color: '#ccc',
    padding: 0,
    marginBottom: 12,
  },
})(BaseListSubheader);

export const ListItem = withStyles({
  root: {
    fontSize: 15,
    fontWeight: 400,
    lineHeight: '18px',
    color: '#333',
    padding: '0.4em',
    marginBottom: '0.4em',
    borderRight: 'solid 0.2em #ececec',
  },
  selected: {
    backgroundColor: 'transparent !important',
    color: '#FF0061',
  },
})(BaseListItem);

export const Divider = withStyles({
  root: {
    marginTop: 10,
    marginBottom: 20,
  },
})(BaseDivider);
