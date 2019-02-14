import { resolve } from 'path';

export interface Environment {
  source: (...segments: string[]) => string;
  destination: (...segments: string[]) => string;
}

export function createEnvironment(
  source: string,
  destination: string,
): Environment {
  return Object.freeze({
    source: (...segments: string[]) => resolve(source, ...segments),
    destination: (...segments: string[]) => resolve(destination, ...segments),
  });
}
