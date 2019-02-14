import { Environment } from './environment';
import Listr, { ListrTask } from 'listr';
import { Editor } from 'mem-fs-editor';

export interface TaskHelpers {
  title: string;
  output: string;
  skip: (message: string) => void;
}

export interface TaskContext {
  env: Environment;
  memfs: Editor;
}

export interface TaskExecuter {
  (context: TaskContext, task: TaskHelpers): Promise<any> | Listr;
}

export interface Task {
  description: string;
  execute: TaskExecuter;
  enabled?: boolean;
}

export function normalizeTasks(tasks: Task[]): ListrTask[] {
  return tasks.map(
    input =>
      ({
        title: input.description,
        task: input.execute,
        enabled: () => (input.enabled === undefined ? true : input.enabled),
      } as ListrTask),
  );
}
