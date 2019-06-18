import {createStyles, WithStyles, LinearProgress, Typography, withStyles} from '@material-ui/core';
import * as React                                                         from 'react';
import MainLayout                                                         from './MainLayout';

const styles = createStyles({
  root: {},
});

const Connecting: React.FC<WithStyles<typeof styles>> = ({classes}) => (
  <MainLayout>
    <Typography variant={'h5'} align={'center'}>
      Connecting to the Game Server...
    </Typography>
    <LinearProgress/>
  </MainLayout>
);

export default withStyles(styles)(Connecting);