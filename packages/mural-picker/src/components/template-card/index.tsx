import React from "react";
import moment from "moment";
import classnames from "classnames";
import { Grid, Card, CardActionArea, CardMedia } from "@material-ui/core";
import { Template } from "@tactivos/mural-integrations-mural-client";
import "./styles.scss";

// todo Need to ask about sizes for this template cards.

export interface PropTypes {
  template: Template;
  isSelected: boolean;
  onClickSelectTemplate: (template: Template) => void;
};

export default function TemplateCard(props: PropTypes) {
  const { template, isSelected, onClickSelectTemplate } = props;
  const thumbnailUrl =
    template.thumbUrl === "https://app.mural.co/static/images/mural-thumb.svg"
      ? ""
      : template.thumbUrl;
};
