import {Grid, createStyles, WithStyles, withStyles, Theme, Hidden} from '@material-ui/core';
import * as React                                                  from 'react';

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
    padding: theme.spacing(2),
  },
  item: {},
});

const MainLayout: React.FC<WithStyles<typeof styles>> = (props) => {
  const {classes, children} = props;
  return (
    <Grid container className={classes.root}>
      <Hidden xsDown>
        <Grid item sm={2} md={3} lg={4}/>
      </Hidden>
      <Grid item
            xs={12}
            sm={8}
            md={6}
            lg={4}
            container
            direction={'column'}
            justify-content={'flex-start'}
            alignItems={'stretch'}>
        {React.Children.map(children, (child) =>
          <Grid item className={classes.item}>
            {child}
          </Grid>,
        )}
      </Grid>
      <Hidden xsDown>
        <Grid item sm={2} md={3} lg={4}/>
      </Hidden>
    </Grid>

  );
};

export default withStyles(styles)(MainLayout);