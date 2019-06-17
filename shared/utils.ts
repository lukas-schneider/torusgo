export interface IMap<T> {
  [key: string]: T,
}

// check if enum type has given value
export function contains(type: any, value: any) {
  return Object.values(type).includes(value);
}

// 'difference' between booleans (basically x - y)
export function sign(x: boolean, y: boolean) {
  return x === y ? 0 : (x ? 1 : -1);
}

const nameRegex = /^[\w\s]*$/;

export function checkName(name: string) {
  if (name.length < 1 || name.length > 32) return false;

  return nameRegex.test(name);
}