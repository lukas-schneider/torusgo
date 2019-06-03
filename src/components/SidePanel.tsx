import * as React from 'react';
import {
  Button,
  createStyles,
  Divider,
  Paper,
  Typography,
  WithStyles,
  withStyles,
}                 from '@material-ui/core';
import {IPlayer}  from '../types/utils';
import PlayerCard from './PlayerCard';
import {
  EGamePhase,
  IRuleSet,
}                 from '../types/game';

const styles = () => createStyles({
  root: {
    position: 'absolute',
    right: 0,
    zIndex: 100,
    margin: 25,
    padding: 5,
    width: 320,
  },
  center: {
    paddingTop: 5,
    paddingBottom: 5,
  },
});

interface IProps extends WithStyles<typeof styles> {
  white: IPlayer,
  black: IPlayer,
  local: boolean,
  ruleSet: IRuleSet,
  gamePhase: EGamePhase,
  moveNumber: number,
  onOpenConfig: () => void,
}

function statusString(phase: EGamePhase): string {
  switch (phase) {
    case EGamePhase.Canceled:
      return 'game has been cancelled';
    case EGamePhase.WhiteVictory:
      return 'white is victorious';
    case EGamePhase.BlackVictory:
      return 'black is victorious';
    case EGamePhase.Waiting:
      return 'waiting for a second player...';
    case EGamePhase.Running:
      return 'game in progress';

  }
}

const SidePanel: React.FC<IProps> = (props) => {
  const {classes, black, white, ruleSet, gamePhase, moveNumber, onOpenConfig} = props;

  return (
    <Paper square={true} className={classes.root}>
      <PlayerCard player={black} color={'black'}/>
      <Divider component={'hr'}/>
      <Typography variant={'body2'} align={'center'} className={classes.center}>
        <i>{statusString(gamePhase)}</i><br/>
        move {moveNumber + 1}
        &nbsp;&bull;&nbsp;{ruleSet.size.x}&times;{ruleSet.size.y}
        &nbsp;&bull;&nbsp;{ruleSet.komi} komi
        &nbsp;&bull;&nbsp;{ruleSet.handicap || 'no'} handicap
      </Typography>
      <Divider component={'hr'}/>
      <PlayerCard player={white} color={'white'}/>
      <Button fullWidth
              color={'primary'}
              type={'button'}
              onClick={onOpenConfig}>
        Restart Game
      </Button>
    </Paper>
  );
};

export default withStyles(styles)(SidePanel);