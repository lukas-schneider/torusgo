import {
  EColor,
  IPass,
  IPosition,
  IRawGame,
  IRegMove,
  IRuleSet,
  ISize,
  TField,
  TGameBoard,
  TKo,
  TMove,
} from '../types/game';

// here the port from purescript, maybe exported to a npm module.
// everything is intended to be purely functional

// init game with empty board
// TODO handle handicap
export function initGame(ruleSet: IRuleSet): IRawGame {
  return {
    ruleSet,
    toMove: EColor.Black,
    board: new Array(ruleSet.size.x * ruleSet.size.y).fill(0),
    koPosition: null,
    numPasses: 0,
    capturedByBlack: 0,
    capturedByWhite: 0,
  };
}

export function isPass(move: TMove): move is IPass {
  return move.type === 'Pass';
}

export function isRegMove(move: TMove): move is IRegMove {
  return move.type === 'Move';
}

export function pass(): IPass {
  return {
    type: 'Pass',
  };
}

export function regMove(x: number, y: number): IRegMove {
  return {
    type: 'Move', x, y,
  };
}

// return canonical position in [(0,0), (size.x-1, size.y-1)]
function canonPos(size: ISize, pos: IPosition): IPosition {
  let x = pos.x;
  let y = pos.y;

  // TODO jesus christ, you know that modulo is a thing, right?

  //(x % size.x)+ size.x % size.x
  while (x < 0) {
    x += size.x;
  }
  while (x > size.x - 1) {
    x -= size.x;
  }
  while (y < 0) {
    y += size.y;
  }
  while (y > size.y - 1) {
    y -= size.y;
  }
  return {x, y};
}

// compare positions the right way
function posEq(a: IPosition, b: IPosition): boolean {
  return a.x === b.x && a.y === b.y;
}

// I don't know whether this will ever be needed
// narrator: it was not needed
function indexToPos(size: ISize, idx: number): IPosition {
  let remainder = idx;
  let x = 0;
  while (remainder > size.y - 1) {
    remainder -= size.y;
    x += 1;
  }
  return {x, y: remainder};
}

function posToIndex(size: ISize, pos: IPosition) {
  const cPos = canonPos(size, pos);
  return cPos.y + cPos.x * size.y;
}

function getField(size: ISize, board: TGameBoard, pos: IPosition): TField {
  return board[posToIndex(size, pos)];
}

// when this is called, the returned board is modified
// remember that boards captured in filter functions etc.
// will NOT be up to date then!
function setField(size: ISize, board: TGameBoard, field: TField, pos: IPosition): TGameBoard {
  const newBoard = [...board];
  newBoard[posToIndex(size, pos)] = field;
  return newBoard;
}

// can be passed a filter
// to only find positions that have a certain field value
// or to make sure that no loops happen in depth searches
function getNeighPosArray(size: ISize,
  pos: IPosition,
  posFilter = (potentialNeigh: IPosition) => true): IPosition[] {
  return [
    {
      x: pos.x - 1,
      y: pos.y,
    },
    {
      x: pos.x + 1,
      y: pos.y,
    },
    {
      x: pos.x,
      y: pos.y - 1,
    },
    {
      x: pos.x,
      y: pos.y + 1,
    },
  ].map((pos) => canonPos(size, pos)).filter(posFilter);
}

export function flipField(field: TField): TField {
  switch (field) {
    case 0:
      return 0;
    case EColor.Black:
      return EColor.White;
    case EColor.White:
      return EColor.Black;
  }
}

export function flipColor(color: EColor): EColor {
  switch (color) {
    case EColor.Black:
      return EColor.White;
    case EColor.White:
      return EColor.Black;
  }
}

// all inputs canon
function posInArray(positions: IPosition[], toFind: IPosition): boolean {
  for (const pos of positions) {
    if (posEq(pos, toFind)) {
      return true;
    }
  }
  return false;
}

// there may be a better way for this
// the intention is to remove duplicate positions
// first get canonical positions, then only add if not present yet
function canonAndRemoveDups(size: ISize, positions: IPosition[]): IPosition[] {
  const canonPositions = positions.map((pos) => canonPos(size, pos));

  const noDups: IPosition[] = [];
  for (const pos of canonPositions) {
    if (!posInArray(noDups, pos)) {
      noDups.push(pos);
    }
  }

  return noDups;
}

// this is the head for the recursive group search
// can be passed a filter which will usually just check for correct field
// THE STARTING POSITION WILL NOT BE FILTERED
function getGroupWithFilter(size: ISize,
  filter: (pos: IPosition) => boolean,
  startingPos: IPosition): IPosition[] {
  return getGroupWithFilterRecursive(size, filter, [], [canonPos(size, startingPos)]);
}

// members and newMembers always canonical
function getGroupWithFilterRecursive(size: ISize,
  filter: (pos: IPosition) => boolean,
  members: IPosition[],
  newMembers: IPosition[]): IPosition[] {

  // nothing new found end recursion
  if (newMembers.length === 0) {
    return members;
  }

  // previous newMembers are now also members
  const membersNext = members.concat(newMembers);

  // we don't want to add previously visited positions -> infinite loop
  // also apply the passed filter
  const neighFilter = (potentialNeigh: IPosition): boolean => !posInArray(
    membersNext,
    canonPos(
      size,
      potentialNeigh,
    ),
  ) && filter(potentialNeigh);

  // get the wanted unvisited neighbors of all newMembers
  const newMembersSameFieldNeighArrays = newMembers.map((newMember: IPosition): IPosition[] => getNeighPosArray(
    size,
    newMember,
    neighFilter,
  ));

  // flatten result & remove duplicates
  const newMembersNextWithDups = ([] as any[]).concat.apply([], newMembersSameFieldNeighArrays);
  const newMembersNext = canonAndRemoveDups(size, newMembersNextWithDups);

  // next step in search
  return getGroupWithFilterRecursive(size, filter, membersNext, newMembersNext);
}

// for a given position gets the positions of empty fields
// adjecent to the connected group
// only makes sense to call this with a color
function groupEmptyPositions(size: ISize,
  board: TGameBoard,
  color: EColor,
  pos: IPosition): IPosition[] {

  // only same color ofc
  const group = getGroupWithFilter(
    size,
    (potentialMember) => getField(size, board, potentialMember) === color,
    pos,
  );

  // get the adject empty neighbors as multiple arrays
  const groupEmptyPositionsArrays = group.map((member) => getNeighPosArray(
    size,
    member,
    (potentialEmpty) => getField(size, board, potentialEmpty) === 0,
  ));

  // flatten result & remove duplicates
  const groupEmptyPositionsWithDups = ([] as any[]).concat.apply([], groupEmptyPositionsArrays);

  return canonAndRemoveDups(size, groupEmptyPositionsWithDups);
}

// export only for testing
// TODO why not use RawGame as arg?
// TODO ko detection not working (or missing?)
export function testPosition(size: ISize,
  board: TGameBoard,
  koPosition: TKo,
  toMove: EColor,
  intededPos: IPosition): boolean {

  // first canonize
  const pos = canonPos(size, intededPos);

  // gotta be empty field
  if (getField(size, board, pos) !== 0) {
    console.log('this field is not empty, sir');
    return false;
  }

  console.log('is empty');

  // check for ko
  if (koPosition) {
    if (posEq(pos, koPosition)) {
      return false;
    }
  }

  console.log('not ko');

  // some filters
  const friendFilter = (potentialFriend: IPosition) => getField(
    size,
    board,
    potentialFriend,
  ) === toMove;
  const enemyFilter = (potentialEnemy: IPosition) => getField(
    size,
    board,
    potentialEnemy,
  ) === flipColor(toMove);

  // capturing enemy stones?
  // i.e. a neighboring enemy group has 1 liberty: pos
  const enemyNeigh = getNeighPosArray(size, pos, enemyFilter);
  if (enemyNeigh.length > 0) {
    const enemyNeighsFreedoms = enemyNeigh.map((n) => groupEmptyPositions(
      size,
      board,
      flipColor(toMove),
      n,
    ));

    if (enemyNeighsFreedoms.some((freedoms) => freedoms.length === 1)) {
      console.log('capturing enemy, all good');
      return true;
    }
  }

  // if no enemy stones are captured, we must take care to not suicide other friendly stones
  // so at least one neighboring group needs to have at least 2 liberties
  // or there are no friendly stones at all
  const friendNeigh = getNeighPosArray(size, pos, friendFilter);
  if (friendNeigh.length > 0) {
    const friendNeighsFreedoms = friendNeigh.map((n) => groupEmptyPositions(
      size,
      board,
      toMove,
      n,
    ));

    if (friendNeighsFreedoms.some((freedoms) => freedoms.length > 1)) {
      console.log('one neighboring friendly group has enough libs');
      return true;
    }

    console.log('capturing friends, illegal');
    return false;
  }

  const directEmpty = getNeighPosArray(
    size,
    pos,
    (potentialEmpty) => getField(size, board, potentialEmpty) === 0,
  );

  if (directEmpty.length > 0) {
    console.log('got space, nothing happening though');
    return true;
  }

  console.log('got no space, illegal');
  return false;
}

export function testMove(state: IRawGame, move: TMove): boolean {
  return isPass(move) || testPosition(
    state.ruleSet.size,
    state.board,
    state.koPosition,
    state.toMove,
    move,
  );
}

export function execMove(state: IRawGame, move: TMove): IRawGame {
  const {ruleSet, board, koPosition, toMove, numPasses} = state;
  const size = ruleSet.size;

  if (isPass(move)) {
    return {
      ...state,
      toMove: flipColor(toMove),
      numPasses: numPasses + 1,
      koPosition: null,
    };
  }

  console.log(move.x, move.y);

  const intendedPos = {
    x: move.x,
    y: move.y,
  };

  // test the position just to be sure
  if (!testPosition(ruleSet.size, board, koPosition, toMove, intendedPos)) {
    // this should never happen
    alert('illegal move was passed to makeMove!');
  }

  // filters
  const friendFilter = (potentialEnemy: IPosition) => getField(
    size,
    board,
    potentialEnemy,
  ) === toMove;

  const enemyFilter = (potentialEnemy: IPosition) => getField(
    size,
    board,
    potentialEnemy,
  ) === flipField(toMove);

  // capturing enemy stones?
  const enemyNeigh = getNeighPosArray(size, move, enemyFilter);

  // i.e. a neighboring enemy group has 1 liberty: pos
  const enemyNeighsWith1Lib = enemyNeigh.filter((n) => groupEmptyPositions(
    size,
    board,
    flipField(toMove),
    n,
  ).length === 1);

  // get the connected groups
  const enemyGroupsWith1Lib = enemyNeighsWith1Lib.map((n) => getGroupWithFilter(
    size,
    enemyFilter,
    n,
  ));

  // check for possible ko
  // that means that a group of size one is captured in a special pattern:
  // * B W *      Here as an example, its B turn to play into E
  // B W E W      One stone is captured, the one W surrounded by B
  // * B W *      Since it could be captured right back, its ko

  let newKoPosition: TKo = null;
  if (enemyNeighsWith1Lib.length === 1) { // one neighbor get capped
    if (enemyGroupsWith1Lib[0].length === 1) { // its group has size one
      if (enemyNeigh.length === 4) { // the played stone can be captured again
        // then it is ko
        newKoPosition = enemyNeighsWith1Lib[0];
      }
    }
  }

  console.log(newKoPosition);
  // now we don't care about the structure of the captured stones anymore
  const enemiesToBeCaptured = canonAndRemoveDups(
    size,
    ([] as any[]).concat.apply([], enemyGroupsWith1Lib),
  );

  let newBoard = board;
  for (const cap of enemiesToBeCaptured) {
    newBoard = setField(size, newBoard, 0, cap);
  }

  newBoard = setField(size, newBoard, toMove, intendedPos);

  switch (toMove) {
    case EColor.Black:
      return {
        ...state,
        toMove: EColor.White,
        board: newBoard,
        koPosition: newKoPosition,
        numPasses: 0,
        capturedByBlack: state.capturedByBlack + enemiesToBeCaptured.length,
      };
    case EColor.White:
      return {
        ...state,
        toMove: EColor.Black,
        board: newBoard,
        koPosition: newKoPosition,
        numPasses: 0,
        capturedByWhite: state.capturedByWhite + enemiesToBeCaptured.length,
      };
  }
}

