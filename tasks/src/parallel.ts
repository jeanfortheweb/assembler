import Listr from 'listr';
import { createTask, Task } from '@bluprint/cli';

export default function parallel(title: string, ...tasks: Task[]) {
  return createTask(title, () => new Listr(tasks, { concurrent: true }));
}
