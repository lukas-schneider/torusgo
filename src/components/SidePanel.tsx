import * as React                                                         from 'react';
import {createStyles, Divider, Paper, Typography, WithStyles, withStyles} from '@material-ui/core';
import {IPlayer}                                                          from '../types/utils';
import PlayerCard                                                         from './PlayerCard';
import {IRuleSet}                                                         from '../types/game';

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
}

const SidePanel: React.FC<IProps> = (props) => {
  const {classes, black, white, ruleSet} = props;
  return (
    <Paper square={true} className={classes.root}>
      <PlayerCard player={black} color={'black'}/>
      <Divider component={'hr'}/>
      <Typography variant={'body2'} align={'center'} className={classes.center}>
        {ruleSet.size.x}&times;{ruleSet.size.y}
        &nbsp;&bull;&nbsp;{ruleSet.komi} komi
        &nbsp;&bull;&nbsp;{ruleSet.handicap || 'no'} handicap<br/>
        <i>
          Game is currently waiting to start
        </i>
      </Typography>
      <Divider component={'hr'}/>
      <PlayerCard player={white} color={'white'}/>
    </Paper>
  );
};

export default withStyles(styles)(SidePanel);