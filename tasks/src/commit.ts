import { createTask } from '@assembler/cli';

export default function commit() {
  return createTask(
    'Flush files to disk',
    environment =>
      new Promise((resolve, reject) => {
        environment.fs.commit((err: any) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      }),
  );
}
