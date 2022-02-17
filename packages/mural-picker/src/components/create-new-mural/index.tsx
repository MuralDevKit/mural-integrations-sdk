/**
 * NOTE:
 * The MURAL public API does not currently support template retrieval
 * and selection, so this component is not yet being used (and is not quite
 * finished). However, it's a functional start to the component, so I've left
 * this in here for when the API endpoints are available and we can flesh this
 * out.
 */

import * as React from "react";
import {
  Button,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  List,
  ListItem,
  TextField,
} from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { Template } from "@tactivos/mural-integrations-mural-client";

export interface PropTypes {
  token: string;
  templates: Template[];
  onCancelAndGoBack: () => void;
  onCreateMural: (title: string, template: Template | null) => void;
  room: string;
}

interface StateTypes {
  selectedTemplate: Template | null;
  muralTitle: string;
}

const INITIAL_STATE: StateTypes = {
  selectedTemplate: null,
  muralTitle: "",
};

export default class CreateNewMural extends React.Component<PropTypes> {
  state: StateTypes = INITIAL_STATE;

  async createMural() {
    console.log(
      "========= Template and Title before creation========",
      this.state.muralTitle,
      this.state.selectedTemplate
    );
    await this.props.onCreateMural(
      this.state.muralTitle,
      this.state!.selectedTemplate
    );

    this.setState({
      muralTitle: "",
    });
  }

  templateSelectHandler(_: React.ChangeEvent<{}>, template: Template) {
    this.setState({ selectedTemplate: template });
  }
  titleHandler(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ muralTitle: event.target.value });
    console.log("====== Title State ======", this.state);
  }

  render() {
    return (
      <>
        <div className={"mural-picker-selects"}>
        <List component="nav">
          <ListItem button selected>
            All templates
          </ListItem>
          <Divider />
          <FormControl
            className="mural-picker-select"
            data-qa="workspace-select"
          >
            <div className="select-label">
              <InputLabel shrink>TITLE</InputLabel>
            </div>
            <TextField
              id="title-mural"
              label="Title"
              variant="outlined"
              value={this.state.muralTitle}
              onChange={this.titleHandler.bind(this)}
            />
          </FormControl>
          <FormControl
            className="mural-picker-select"
            data-qa="workspace-select"
          >
            <div className="select-label">
              <InputLabel shrink>TEMPLATE</InputLabel>
            </div>
            <div className="template-list">
              <Autocomplete
                id="template-select"
                options={this.props.templates}
                getOptionLabel={(option) => {
                  return option.name || "";
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Find a template..."
                    variant="outlined"
                  />
                )}
                groupBy={() => "SWITCH TO"}
                onChange={this.templateSelectHandler.bind(this)}
                noOptionsText={"No results"}
              />
            </div>
          </FormControl>

          {/* TODO: get all templates when public API includes route */}
          <ListItem>BROWSE BY CATEGORY</ListItem>
          <ListItem button>MURAL</ListItem>
          <ListItem button>Icebreaker</ListItem>
        </List>
        </div>
        <Grid container>
          {/* TODO: iterate over templates and display them
           * TODO: include horizontal scroll */}
        </Grid>
        <Button onClick={this.props.onCancelAndGoBack}>Cancel & go back</Button>
        <Button onClick={this.createMural.bind(this)} variant="contained">
          Create Mural
        </Button>
      </>
    );
  }
}


{/* <>
        <div className={"mural-picker-selects"}>
          <FormControl
            className="mural-picker-select"
            data-qa="workspace-select"
          >
            <div className="select-label">
              <InputLabel shrink>TITLE</InputLabel>
            </div>
            <TextField
              id="title-mural"
              label="Title"
              variant="outlined"
              value={this.state.muralTitle}
              onChange={this.titleHandler.bind(this)}
            />
          </FormControl>
          <FormControl
            className="mural-picker-select"
            data-qa="workspace-select"
          >
            <div className="select-label">
              <InputLabel shrink>TEMPLATE</InputLabel>
            </div>
            <div className="template-list">
              <Autocomplete
                id="template-select"
                options={this.props.templates}
                getOptionLabel={(option) => {
                  return option.name || "";
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Find a template..."
                    variant="outlined"
                  />
                )}
                groupBy={() => "SWITCH TO"}
                onChange={this.templateSelectHandler.bind(this)}
                noOptionsText={"No results"}
              />
            </div>
          </FormControl>

          {/* TODO: get all templates when public API includes route */}
        {/*</div>
        <Grid container>*/}
          {/* TODO: iterate over templates and display them
           * TODO: include horizontal scroll */}
        {/*</Grid>
        <Button onClick={this.props.onCancelAndGoBack}>Cancel & go back</Button>
        <Button onClick={this.createMural.bind(this)} variant="contained">
          Create Mural
        </Button>
      </> }*/}