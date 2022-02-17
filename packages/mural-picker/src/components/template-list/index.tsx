import React from "react";
import { Card, CardActionArea, CardContent, Grid } from "@material-ui/core";
import { Template } from "@tactivos/mural-integrations-mural-client";
import TemplateCard from "../template-card";
import "./styles.scss";

interface PropTypes {
  templates: Template[];
  selectedTemplate?: Template;
  onTemplateSelect: (template: Template) => void;
  handleError (e: Error, displayMsg: string) => void;
}

interface StateTypes {
  templates: Template[];
}

const INITIAL_STATE: StateTypes = { templates: []};