import { Task } from '@bluprint/cli';

export default function conditional(enabled: boolean, then: Task): Task {
  return { ...then, enabled };
}
