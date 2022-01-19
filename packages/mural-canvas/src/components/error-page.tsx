import * as React from 'react';
import MuralLogo from '../pages/mural-logo';
import './style.sass';

export interface PropTypes {
  headTitle?: string;
  title?: string;
}

const ErrorPage: React.StatelessComponent<PropTypes> = ({
  children,
  headTitle,
  title,
}) => (
  <div className="ui-error-page-box">
    <MuralLogo />
    <div className="ui-error-page-box-content">
      {title && <h1>{title}</h1>}
      {children}
    </div>
  </div>
);

export default ErrorPage;
