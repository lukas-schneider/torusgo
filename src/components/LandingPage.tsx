import * as React                 from 'react';
import {Link}                     from 'react-router-dom';
import {createStyles, withStyles} from '@material-ui/core';

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
        /game/:id for public server games. Anyone with the id can join as black/white if a slot is
        free. <br/>
        /createGame for public server games. Anyone with the id can join as black/white if a slot is
        free. <br/>
      </p>
      <form action={'/createGame'} method={'post'}>
        <label>
          Komi
          <input type={'number'} defaultValue={'5.5'} name={'komi'}/>
        </label><br/>
        <label>
          Handicap
          <input type={'number'} defaultValue={'0'} name={'handicap'}/>
        </label><br/>
        <label>
          Size X
          <input type={'number'} defaultValue={'19'} name={'x'}/>
        </label><br/>
        <label>
          Size Y
          <input type={'number'} defaultValue={'19'} name={'y'}/>
        </label><br/>
        <input type={'submit'}/>
      </form>
    </div>
  );
};

export default withStyles(style)(LandingPage);