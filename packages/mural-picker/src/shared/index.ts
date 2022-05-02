import {
  Button as BaseButton,
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
})(BaseButton);

export const SecondaryButton = withStyles({
  label: {
    textTransform: 'capitalize',
    borderBottom: '1px dashed #393939',
    color: '#393939',
    fontWeight: 700,
  },
})(BaseButton);

export const ListSubheader = withStyles({
  root: {
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
    lineHeight: '27px',
    color: '#333',
    padding: 0,
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
