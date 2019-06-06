import {Controller, Post}  from '@overnightjs/core';
import {Request, Response} from 'express';
import GameServer          from './GameServer';

@Controller('')
export default class MainController {

  @Post('createGame')
  private createGame(req: Request, res: Response) {
    const body = req.body;
    const ruleSet: any = {};

    try {
      ruleSet.handicap = parseInt(body.handicap);
      ruleSet.komi = parseFloat(body.komi);
      ruleSet.size = {
        x: parseInt(body.x),
        y: parseInt(body.y),
      };
    } catch (err) {
      return res.status(400).send('invalid request data: ' + JSON.stringify(body));
    }

    const id = GameServer.instance.createGame(ruleSet);

    return res.redirect('/game/' + id);
  }
}