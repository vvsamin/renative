import { logSuccess, RnvTask } from '@rnv/core';

const Task: RnvTask = {
    description: 'Prints hello message',
    fn: async ({ ctx }) => {
        //TODO: switch to typed options once Context generics are supported
        const opts: any = ctx.program.opts();
        logSuccess(`Hello from Integration Starter single command! 
        --my-opt: "${opts.myOpt}"`);
    },
    task: 'starter-single-command',
    options: [{ key: 'my-opt', description: 'Hello', isValueType: true }],
};

export default Task;
