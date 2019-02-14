import { Environment } from './environment';
import Listr, { ListrTask } from 'listr';
import { Editor } from 'mem-fs-editor';

/**
 * TaskHelpers.
 */
export interface TaskHelpers {
  title: string;
  output: string;
  skip: (message: string) => void;
}

/**
 * TaskContext.
 */
export interface TaskContext {
  env: Environment;
  memfs: Editor;
}

/**
 * TaskExecuter.
 */
export interface TaskExecuter {
  (context: TaskContext, task: TaskHelpers): Promise<any> | Listr;
}

/**
 * Task.
 */
export interface Task {
  description: string;
  execute: TaskExecuter;
  enabled?: boolean;
}

/**
 * Creates a simple task using a description and an execute function
 *
 * @param description Description.
 * @param execute Execute function.
 */
export function task(description: string, execute: TaskExecuter) {
  return {
    description,
    execute,
  };
}

/**
 * Normalizes the shape of a task array to make it consumable by
 * Listr.
 *
 * @param tasks Task array to normalize.
 */
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

/**
 * Creates a multi task where the tasks are executed sequentially.
 *
 * @param title Title for the task list.
 * @param tasks Tasks to execute.
 */
export function sequential(title: string, ...tasks: Task[]) {
  return task(
    title,
    () => new Listr(normalizeTasks(tasks), { concurrent: false }),
  );
}

/**
 * Creates a multi task where the tasks are executed in parallel.
 *
 * @param title Title for the task list.
 * @param tasks Tasks to execute.
 */
export function parallel(title: string, ...tasks: Task[]) {
  return task(
    title,
    () => new Listr(normalizeTasks(tasks), { concurrent: true }),
  );
}
