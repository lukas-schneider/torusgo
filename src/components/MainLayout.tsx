import {Grid, createStyles, WithStyles, withStyles, Theme} from '@material-ui/core';
import * as React                                          from 'react';

const styles = (theme: Theme) => createStyles({
  root: {
    position: 'absolute',
    right: 0,
    left: 0,
    top: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    backgroundColor: theme.palette.background.default,
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  item: {
    width: 680,
  },
});

const MainLayout: React.FC<WithStyles<typeof styles>> = (props) => {
  const {classes, children} = props;
  return (
    <Grid container
          direction={'column'}
          justify={'flex-start'}
          alignItems={'center'}
          className={classes.root}>
      {React.Children.map(children, (child) =>
        <Grid item className={classes.item}>
          {child}
        </Grid>,
      )}
    </Grid>
  );
};

export default withStyles(styles)(MainLayout);