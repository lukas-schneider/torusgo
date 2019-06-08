import {
  Button,
  createStyles,
  Divider,
  Paper,
  Typography,
  WithStyles,
  withStyles,
  Theme,
}                                          from '@material-ui/core';
import * as React                          from 'react';
import {EColor, EGamePhase, IGameWithInfo} from '../types/game';
import PlayerCard                          from './PlayerCard';

const styles = (theme: Theme) => createStyles({
  root: {
    padding: theme.spacing(1),
  },
  center: {
    paddingTop: 5,
    paddingBottom: 5,
  },
});

interface IProps extends WithStyles<typeof styles> {
  game: IGameWithInfo,
  onOpenConfig?: () => void,
  onJoin?: (color: EColor) => void,
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

const ScoreBoard: React.FC<IProps> = (props) => {
  const {classes, game, onOpenConfig, onJoin} = props;

  return (
    <Paper square={true} className={classes.root}>
      <PlayerCard color={EColor.Black}
                  onJoin={onJoin}
                  player={game.players[EColor.Black]}/>
      <Divider component={'hr'}/>
      <Typography variant={'body2'} align={'center'} className={classes.center}>
        <i>{statusString(game.phase)}</i><br/>
        move {game.moveNumber + 1}
        &nbsp;&bull;&nbsp;{game.rawGame.ruleSet.size.x}&times;{game.rawGame.ruleSet.size.y}
        &nbsp;&bull;&nbsp;{game.rawGame.ruleSet.komi} komi
        &nbsp;&bull;&nbsp;{game.rawGame.ruleSet.handicap || 'no'} handicap
      </Typography>
      <Divider component={'hr'}/>
      <PlayerCard color={EColor.White}
                  onJoin={onJoin}
                  player={game.players[EColor.White]}/>
      {onOpenConfig &&
      <Button fullWidth
              color={'primary'}
              type={'button'}
              onClick={onOpenConfig}>
        Restart Game
      </Button>
      }
    </Paper>
  );
};

export default withStyles(styles)(ScoreBoard);