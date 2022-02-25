import * as React from 'react';
import { debounce } from 'lodash';
import { FormControl, InputLabel, TextField } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { ApiClient, Mural, Workspace } from 'mural-integrations-mural-client';
import { DELAYS } from '../../common/delays';

interface PropTypes {
  apiClient: ApiClient;
  workspace: Workspace | null;
  murals: Mural[];
  mural?: Mural;
  searchedMurals: Mural[];
  searchingMurals: boolean;
  onMuralPick: (mural: Mural | null) => void;
  onMuralSearch: (searchedMurals: Mural[]) => void;
  handleError: (e: Error, displayMsg: string) => void;
  disabled: boolean;
}

// eslint-disable-next-line no-shadow
enum ERRORS {
  ERR_SEARCH_MURALS = 'Error searching for murals.',
  NO_MURAL_SELECTED = 'No mural selected.',
  ERROR_SELECTING_MURAL = 'Error selecting mural.',
}

export default class MuralSelect extends React.Component<PropTypes> {
  state = {
    searchingMurals: false,
  };

  onMuralPick = (_: React.ChangeEvent<{}>, mural: Mural | null) => {
    if (!mural) {
      this.props.onMuralPick(null);
    } else {
      try {
        this.props.onMuralPick(mural);
      } catch (e) {
        this.props.handleError(e, ERRORS.ERROR_SELECTING_MURAL);
      }
    }
  };

  onMuralSearch = debounce(async (title: string) => {
    if (this.props.workspace && title.length > 2) {
      try {
        this.setState({ searchingMurals: true });
        const murals: Mural[] = await this.props.apiClient.searchWorkspaceMurals(
          this.props.workspace.id,
          title,
        );
        this.setState({ searchedMurals: murals, searchingMurals: false });
        this.props.onMuralSearch(murals);
      } catch (e) {
        this.setState({ searchingMurals: false });
        this.props.handleError(e, ERRORS.ERR_SEARCH_MURALS);
      }
    } else {
      this.props.onMuralSearch([]);
      this.setState({ searchingMurals: false });
    }
  }, DELAYS.DEBOUNCE_SEARCH);

  render() {
    return (
      <React.Fragment>
        <FormControl className="mural-picker-select" data-qa="mural-select">
          <div className="select-label">
            <InputLabel shrink>MURAL</InputLabel>
          </div>
          <div>
            <Autocomplete
              id="mural-select"
              options={
                this.props.searchedMurals.length === 0
                  ? this.props.murals
                  : this.props.searchedMurals
              }
              getOptionLabel={option => {
                return option.title || '';
              }}
              renderInput={params => (
                <TextField
                  {...params}
                  placeholder="Find a mural..."
                  variant="outlined"
                />
              )}
              value={this.props.mural}
              disabled={this.props.disabled}
              groupBy={() => 'SELECT'}
              onChange={this.onMuralPick}
              onInputChange={(event: React.ChangeEvent<{}>, input: string) => {
                if (event?.type === 'change') {
                  this.onMuralSearch(input);
                }
              }}
              onClose={(_event: React.ChangeEvent<{}>, _reason: string) => {
                // clear searched murals on autocomplete close
                this.props.onMuralSearch([]);
              }}
              getOptionSelected={(option: Mural, value: Mural) =>
                option.id === value.id
              }
              loading={this.state.searchingMurals}
              clearOnEscape={true}
              noOptionsText={'No results'}
            />
          </div>
        </FormControl>
      </React.Fragment>
    );
  }
}
