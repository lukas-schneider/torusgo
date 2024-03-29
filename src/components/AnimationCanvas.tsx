import {withTheme, useTheme}           from '@mui/material';
import {styled}                        from '@mui/material/styles';
import {boundMethod}                   from 'autobind-decorator';
import * as React                      from 'react';
import Stats                           from 'stats.js';
import {Vector2, WebGLRenderer, Color} from 'three';
import globalTheme                     from '../globalTheme';
import AbstractAnimation               from '../graphics/AbstractAnimation';
import ThreeAnimation, {EKeys}         from '../graphics/three/ThreeAnimation';
import TwoAnimation                    from '../graphics/two/TwoAnimation';
import {IRawGame}                      from '../shared/gameLogic';
import {contains}                      from '../shared/utils';

const PREFIX = 'AnimationCanvas';

const classes = {
  root: `${PREFIX}-root`,
};

const StyledCanvas = styled('canvas')({
  [`& .${classes.root}`]: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

interface IProps {
  three?: boolean,
  allowInput: boolean,
  rawGame: IRawGame,
  onClick: (x: number, y: number) => void,
}

class AnimationCanvas extends React.Component<IProps & { theme: any }> {
  /*
 * world space has domain [-a, a] for x (left to right) and [-b, b] for y (bottom to top),
 * where a and b are set so that the board is visible.
 *
 * one board field has the size of 1 (see unit)
 *
 * "board space" is offset to the bottom left so that the board's center is at (0, 0).
 * Thus, board position x, y has coordinates x, y in board space.
 *
 * grid, board and their children operate in board space, scene operates in world space
 */

  private animation: AbstractAnimation;

  private canvas: HTMLCanvasElement;
  private renderer: WebGLRenderer;
  private requestId: number; // given by requestAnimationFrame

  // mouse position in eye space
  private mouse = new Vector2();

  private backgroundColor = new Color(0x4286f4);
  private boardColor = new Color(0xFF6F00);

  private stats: Stats;

  // ---- lifecycle methods ----

  public componentDidMount() {
    const {background, primary} = this.props.theme.palette;

    this.backgroundColor.setStyle(background.default);

    this.init();

    window.addEventListener('resize', this.handleResize);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('click', this.handleMouseClick);
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  public componentDidUpdate(prevProps: Readonly<IProps>) {
    if (prevProps.rawGame !== this.props.rawGame) {
      this.animation.handleGameStateChange(this.props.rawGame);
    }

    if (prevProps.three !== this.props.three) {
      this.reload();
    }

    if (prevProps.allowInput !== this.props.allowInput) {
      this.animation.allowInput = this.props.allowInput;
    }
  }

  public componentWillUnmount() {
    this.cleanUp();

    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('click', this.handleMouseClick);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }

  public render() {
    return (
      <StyledCanvas className={classes.root}
                    tabIndex={0}
                    width={'100%'}
                    height={'100%'}
                    ref={(canvas) => this.canvas = canvas!}/>
    );
  }

  // ---- event handlers ----

  @boundMethod
  private handleResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    this.renderer.setSize(w, h);

    this.animation.handleResize(w, h);
  }

  @boundMethod
  private handleMouseClick() {
    if (this.props.allowInput && this.animation.selectedField) {
      this.props.onClick(this.animation.selectedField.x, this.animation.selectedField.y);
    }
  }

  @boundMethod
  private handleMouseMove(event: MouseEvent) {
    const offsetX = event.clientX;
    const offsetY = event.clientY;

    if (offsetX > 0 && offsetX < this.canvas.width
      && offsetY > 0 && offsetY < this.canvas.height) {
      this.mouse.x = 2.0 * (offsetX) / this.canvas.width - 1.0;
      this.mouse.y = -2.0 * (offsetY) / this.canvas.height + 1.0;
    }

    this.animation.handleMouseMove(this.mouse.x, this.mouse.y);
  }

  @boundMethod
  private handleKeyDown(event: KeyboardEvent) {
    if (contains(EKeys, event.code)) {
      this.animation.handleKeyStateChange(event.code as EKeys, true);
    }
  }

  @boundMethod
  private handleKeyUp(event: KeyboardEvent) {
    if (contains(EKeys, event.code)) {
      this.animation.handleKeyStateChange(event.code as EKeys, false);
    }

  }

  // ---- init functions ----

  private init() {
    this.initRenderer();
    this.initStats();
    this.initAnimation();

    this.handleResize();
    this.animate();
  }

  private initAnimation() {
    const AnimationClass = this.props.three ? ThreeAnimation : TwoAnimation;
    this.animation = new AnimationClass(
      this.props.rawGame,
      this.canvas,
      this.props.allowInput,
    );
    this.animation.init();
  }

  private initRenderer() {
    this.renderer = new WebGLRenderer({canvas: this.canvas});
    this.renderer.setClearColor(this.backgroundColor, 1);
    this.renderer.getContext().enable(WebGL2RenderingContext.BLEND);
    this.renderer.getContext()
      .blendFunc(WebGL2RenderingContext.SRC_ALPHA, WebGL2RenderingContext.ONE_MINUS_SRC_ALPHA);
  }

  private initStats() {
    this.stats = new Stats();
    this.stats.dom.style.cssText = 'position:absolute;left:0;cursor:pointer;opacity:0.9;z-index:10000;';
    this.canvas.parentElement!.insertBefore(this.stats.dom, this.canvas);

    this.stats.showPanel(0);
  }

  // ---- animation functions ----

  @boundMethod
  private animate() {
    this.requestId = requestAnimationFrame(this.animate);

    this.stats.begin();

    this.animation.update();

    this.renderer.render(this.animation.scene, this.animation.camera);

    this.stats.end();
  }

  // ---- clean up functions ----

  private cleanUp() {
    cancelAnimationFrame(this.requestId);

    this.stats.dom.remove();
    this.animation.cleanUp();
    this.renderer.dispose();
  }

  private reload() {
    cancelAnimationFrame(this.requestId);
    this.animation.cleanUp();

    this.initAnimation();

    this.handleResize();
    this.animate();
  }

}

const AnimationCanvasWithTheme: React.FC<IProps> = (props: IProps) => <AnimationCanvas
  allowInput={props.allowInput}
  rawGame={props.rawGame}
  three={props.three}
  onClick={props.onClick}
  theme={useTheme()}/>;

export default AnimationCanvasWithTheme;