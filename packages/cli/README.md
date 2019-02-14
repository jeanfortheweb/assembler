# blue - modern scaffolding

## Installation

```sh
yarn add @assembler/cli
npm install @assembler/cli
```

## Quickstart

1. Place a **blueprints** folder next to your package.json and create a **helloworld.ts** inside of it:

   ```ts
   import {
     createTaskBuilder,
     createArgumentsBuilder,
   } from '@assembler/blueprints';
   import { write } from '@assembler/tasks';

   export const desc = 'My first blueprint';

   export const args = createArgumentsBuilder(argv =>
     argv.option('name', {
       type: 'string',
       required: true,
     }),
   );

   export const task = createBlueprintBuilder((args, env) =>
     write(env.destination('helloworld.txt', `Hello, ${args.name}`)),
   );
   ```

2. Now run your local **blue** inside of your project:

   ```sh
   yarn assemble
   ```

   Which will output the cli help by default, showing your first blueprint as command:

   ```sh

   ```
