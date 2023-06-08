import {Paper, Typography} from '@mui/material';
import {green, amber}      from '@mui/material/colors';
import {styled}            from '@mui/material/styles';
import {SignalCellularAlt} from '@mui/icons-material';
import * as React          from 'react';
import {EStatus}           from '../shared/types';

const PREFIX = 'StatusPanel';

const classes = {
  root: `${PREFIX}-root`,
  icon: `${PREFIX}-icon`,
  disconnected: `${PREFIX}-disconnected`,
  connecting: `${PREFIX}-connecting`,
  connected: `${PREFIX}-connected`,
  ping: `${PREFIX}-ping`,
};

const StyledPaper = styled(Paper)(({theme}) => ({
  [`&.${classes.root}`]: {
    position: 'relative',
    padding: theme.spacing(1),
  },

  [`& .${classes.icon}`]: {
    position: 'relative',
    //bottom: theme.spacing(1),
    top: 2,
    width: theme.typography.subtitle2.fontSize,
    height: theme.typography.subtitle2.fontSize,
  },

  [`& .${classes.disconnected}`]: {
    color: theme.palette.error.light,
  },

  [`& .${classes.connecting}`]: {
    color: amber[700],
  },

  [`& .${classes.connected}`]: {
    color: green[600],
  },

  [`& .${classes.ping}`]: {
    float: 'right',
  },
}));

interface IProps {
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
  const {status, latency} = props;

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
    <StyledPaper square={true} className={classes.root}>
      <div className={classes.ping}>
        <SignalCellularAlt className={iconClass}/>
        <Typography variant={'subtitle2'} component={'span'}> {latencyText}</Typography>
      </div>
      <Typography variant={'h5'}> Torus Go</Typography>
    </StyledPaper>
  );
};

export default (StatusPanel);