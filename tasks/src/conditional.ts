import { Task } from '@assembler/cli';

export default function conditional(condition: boolean, then: Task): Task {
  return { ...then, enabled: () => condition };
}
