import { FormControl, InputLabel, TextField } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { EventHandler } from '@muraldevkit/mural-integrations-common/src/types';
import {
  ApiClient,
  Mural,
  Workspace,
} from '@muraldevkit/mural-integrations-mural-client';
import debounce from 'lodash/debounce';
import * as React from 'react';
import { DELAYS } from '../../common/delays';
import './styles.scss';

interface PropTypes {
  apiClient: ApiClient;
  workspace: Workspace | null;
  murals: Mural[];

  // TODO: handle in state?
  onSelect: EventHandler<[mural: Mural | null]>;
  onError: EventHandler<[e: Error, displayMsg: string]>;

  disabled?: boolean;
  mural?: Mural | null;
}

// eslint-disable-next-line no-shadow
enum ERRORS {
  ERR_SEARCH_MURALS = 'Error searching for murals.',
  NO_MURAL_SELECTED = 'No mural selected.',
  ERROR_SELECTING_MURAL = 'Error selecting mural.',
}

export default class MuralSelect extends React.Component<PropTypes> {
  state = {
    isSearchingMurals: false,
    searchedMurals: [],
  };

  handleChange = (_: React.ChangeEvent<{}>, mural: Mural | null) => {
    if (!mural) {
      this.props.onSelect(null);
    } else {
      try {
        this.props.onSelect(mural);
      } catch (e: any) {
        this.props.onError(e, ERRORS.ERROR_SELECTING_MURAL);
      }
    }
  };

  // TODO — handle the room ID
  handleSearch = debounce(async (title: string) => {
    if (!this.props.workspace) return;
    if (title.length <= 2) return;

    try {
      this.setState({ isSearchingMurals: true });
      const eMurals = await this.props.apiClient.searchMuralsByWorkspace({
        workspaceId: this.props.workspace.id,
        title,
      });

      this.setState({
        searchedMurals: eMurals.value,
      });
    } catch (e: any) {
      this.props.onError(e, ERRORS.ERR_SEARCH_MURALS);
    } finally {
      this.setState({ isSearchingMurals: false });
    }
  }, DELAYS.DEBOUNCE_SEARCH);

  cancelSearch = () => {
    this.setState({ isSearchingMurals: false, searchedMurals: [] });
  };

  render() {
    return (
      <FormControl className="mural-select" data-qa="mural-select">
        <div className="select-label">
          <InputLabel shrink>MURAL</InputLabel>
        </div>
        <div>
          <Autocomplete
            id="mural-select"
            options={
              this.state.searchedMurals.length === 0
                ? this.props.murals
                : this.state.searchedMurals
            }
            getOptionLabel={option => {
              return option.title || 'Untitled Mural';
            }}
            renderInput={params => (
              <TextField
                {...params}
                placeholder="Find a mural..."
                variant="outlined"
              />
            )}
            value={this.props.mural}
            disabled={!this.props.workspace || this.props.disabled}
            onChange={this.handleChange}
            onInputChange={(event: React.ChangeEvent<{}>, input: string) => {
              if (event?.type === 'change') {
                this.handleSearch(input);
              }
            }}
            onClose={this.cancelSearch}
            getOptionSelected={(option: Mural, value: Mural) =>
              option.id === value.id
            }
            loading={this.state.isSearchingMurals}
            clearOnEscape={true}
            noOptionsText={'No results'}
          />
        </div>
      </FormControl>
    );
  }
}
