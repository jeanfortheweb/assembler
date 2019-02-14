import { Task } from '@bluprint/cli';

export default function conditional(condition: boolean, then: Task): Task {
  return { ...then, enabled: () => condition };
}
