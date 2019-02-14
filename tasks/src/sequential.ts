import Listr from 'listr';
import { createTask, Task } from '@bluprint/cli';

export default function sequential(title: string, ...tasks: Task[]) {
  return createTask(title, () => new Listr(tasks, { concurrent: false }));
}
