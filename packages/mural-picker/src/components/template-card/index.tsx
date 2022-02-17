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
  return (
    <Grid item className="template-preview">
      <Card
        variant="outlined"
        className={classnames("mural-card", {
          "selected-card": isSelected,
        })}
        onClick={() => onClickSelectTemplate(template)}
      >
        <CardActionArea>
          <CardMedia
            // replacing blank mural temp thumbnail with blank canvas per mocks
            image={thumbnailUrl}
            component="div"
            className="template-thumbnail"
          />
          <div className="template-info">
            <div className="template-title" data-qa="template-title">
              {template.name}
            </div>
            <div className="template-description" data-qa="template-description">
              {template.description}
            </div>
          </div>
        </CardActionArea>
      </Card>
    </Grid>
  );
};
