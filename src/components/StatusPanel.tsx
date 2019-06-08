import {createStyles, Paper, Typography, WithStyles, withStyles, Theme} from '@material-ui/core';
import {
  green,
  amber,
}                                                                       from '@material-ui/core/colors';
import {SignalCellularAlt}                                              from '@material-ui/icons';
import * as React                                                       from 'react';
import {EStatus}                                                        from '../types/utils';

const styles = (theme: Theme) => createStyles({
  root: {
    position: 'relative',
    padding: theme.spacing(1),
  },
  icon: {
    position: 'relative',
    //bottom: theme.spacing(1),
    top: 2,
    width: theme.typography.subtitle2.fontSize,
    height: theme.typography.subtitle2.fontSize,
  },
  disconnected: {
    color: theme.palette.error.light,
  },
  connecting: {
    color: amber[700],
  },
  connected: {
    color: green[600],
  },
  ping: {
    float: 'right',
  },
});

interface IProps extends WithStyles<typeof styles> {
  status: EStatus,
  latency: number,
}

function statusString(status: EStatus) {
  switch (status) {
    case EStatus.Connected:
      return 'Connected';
    case EStatus.Connecting:
      return 'Connecting...';
    case EStatus.Disconnected:
      return 'Disconnected';

  }
}

const StatusPanel: React.FC<IProps> = (props) => {
  const {classes, status, latency} = props;

  let iconClass = classes.icon;
  let latencyText;

  switch (status) {
    case EStatus.Connected:
      iconClass += ' ' + classes.connected;
      latencyText = latency + ' ms';
      break;
    case EStatus.Connecting:
      iconClass += ' ' + classes.connecting;
      latencyText = 'connecting...';
      break;
    case EStatus.Disconnected:
      iconClass += ' ' + classes.disconnected;
      latencyText = 'disconnected';
      break;
  }


  return (
    <Paper square={true} className={classes.root}>
      <div className={classes.ping}>
        <SignalCellularAlt className={iconClass}/>
        <Typography variant={'subtitle2'} component={'span'}> {latencyText}</Typography>
      </div>
      <Typography variant={'h5'}> Torus Go</Typography>
    </Paper>
  );
};

export default withStyles(styles)(StatusPanel);