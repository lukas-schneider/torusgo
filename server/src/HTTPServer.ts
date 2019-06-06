import * as Overnight  from '@overnightjs/core';
import * as morgan     from 'morgan';
import * as http       from 'http';
import * as bodyParser from 'body-parser';
import MainController  from './MainController';

export default class HTTPServer extends Overnight.Server {
  public readonly server: http.Server;

  constructor(port: number) {
    super(process.env.NODE_ENV === 'development');

    this.app.use(bodyParser.urlencoded({extended: true}));
    this.app.use(bodyParser.json());

    this.app.use(morgan('tiny'));

    super.addControllers(new MainController());

    this.server = this.app.listen(port, () => console.log('Server listening on port: ' + port));
  }
}