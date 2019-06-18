import {createStyles, WithStyles, Typography, withStyles} from '@material-ui/core';
import * as React                                         from 'react';
import MainLayout                                         from './MainLayout';

const styles = createStyles({
  root: {},
});

const Disconnected: React.FC<WithStyles<typeof styles>> = ({classes}) => (
  <MainLayout>
    <Typography variant={'h5'}>
      Connection Failed
    </Typography>
    <hr/>
    <Typography variant={'body1'}>
      A connection to the game server could not be established. Try reloading the page.
    </Typography>
  </MainLayout>
);

export default withStyles(styles)(Disconnected);