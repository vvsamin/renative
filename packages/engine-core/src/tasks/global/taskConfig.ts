import { logTask, PARAMS, RnvTaskFn, executeTask, SUPPORTED_PLATFORMS, RnvTask } from '@rnv/core';
import { TASK_CONFIGURE_SOFT } from './constants';

const TASK_CONFIG = 'config';

export const taskRnvConfig: RnvTaskFn = async (c, _, originTask) => {
    logTask('taskRnvConfig');

    await executeTask(c, TASK_CONFIGURE_SOFT, TASK_CONFIG, originTask);

    console.log(JSON.stringify(c.buildConfig, null, 2));

    return true;
};

const Task: RnvTask = {
    description: 'Display RNV config',
    fn: taskRnvConfig,
    task: TASK_CONFIG,
    params: PARAMS.withBase(),
    platforms: [...SUPPORTED_PLATFORMS],
};

export default Task;
