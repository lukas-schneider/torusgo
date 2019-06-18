import {createStyles, withStyles, Paper, Typography, Theme, Link} from '@material-ui/core';
import * as React                                                 from 'react';
import {Link as RouterLink}                                       from 'react-router-dom';
import MainLayout                                                 from './MainLayout';

const style = (theme: Theme) => createStyles({
  paper: {
    padding: theme.spacing(3, 2),
  },
});

const LandingPage: React.FC = (props: any) => {
  const {classes} = props;
  return (
    <MainLayout>
      <Paper className={classes.paper}>
        <Typography variant={'h4'}>
          Torus Go
        </Typography>
        <hr/>
        <Typography variant={'body1'}>
          Click <Link component={RouterLink} to={'/local'}>here</Link> to play a local game
        </Typography>
        <Typography variant={'body1'}>
          Click <Link component={RouterLink} to={'/game/asdf'}>here</Link> to play an online game
        </Typography>
      </Paper>
    </MainLayout>
  );
};

export default withStyles(style)(LandingPage);