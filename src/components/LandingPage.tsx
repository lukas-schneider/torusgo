import {createStyles, withStyles} from '@material-ui/core';
import * as React                 from 'react';
import {Link}                     from 'react-router-dom';

const style = createStyles({
  root: {
    margin: 30,
  },
});

const LandingPage: React.FC = (props: any) => {
  const {classes} = props;
  return (
    <div className={classes.root}>
      <h2>torusgo-minimal</h2>
      <p>
        / should be a static landing page <br/>
        <Link to={'/local'}>/local</Link> for local games (no server connection) <br/>
        <Link to={'/game/asdf'}>/game/asdf</Link> for public server games. Anyone with the id can
        join as black/white if a slot is free. <br/>
        /createGame for public server games. Anyone with the id can join as black/white if a slot is
        free. <br/>
      </p>
    </div>
  );
};

export default withStyles(style)(LandingPage);