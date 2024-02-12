import {
    logTask,
    configureFonts,
    copyRuntimeAssets,
    executeTask,
    TASK_SWITCH,
    TASK_PROJECT_CONFIGURE,
    PARAMS,
    RnvTaskFn,
    generatePlatformAssetsRuntimeConfig,
    RnvTask,
} from '@rnv/core';

export const taskRnvSwitch: RnvTaskFn = async (c, _parentTask, originTask) => {
    logTask('taskRnvSwitch');

    await executeTask(c, TASK_PROJECT_CONFIGURE, TASK_SWITCH, originTask);

    await copyRuntimeAssets(c);
    await generatePlatformAssetsRuntimeConfig(c);
    await configureFonts(c);

    return true;
};

const Task: RnvTask = {
    description: '',
    fn: taskRnvSwitch,
    task: TASK_SWITCH,
    params: PARAMS.withBase(),
    platforms: [],
};

export default Task;
