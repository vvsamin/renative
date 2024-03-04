import {
    logErrorPlatform,
    logTask,
    RnvTaskFn,
    executeOrSkipTask,
    shouldSkipTask,
    RnvTask,
    TaskKey,
    RnvTaskOptionPresets,
} from '@rnv/core';
import { ejectGradleProject } from '@rnv/sdk-android';
import { ejectXcodeProject } from '@rnv/sdk-apple';

const taskEject: RnvTaskFn = async (c, _parentTask, originTask) => {
    logTask('taskEject');
    const { platform } = c;

    c.runtime._platformBuildsSuffix = '_eject';

    switch (platform) {
        case 'android':
        case 'androidtv':
        case 'androidwear':
            c.runtime._platformBuildsSuffix = '_eject/android';
            break;
        default:
        // Do nothing
    }

    c.runtime._skipNativeDepResolutions = true;

    await executeOrSkipTask(c, TaskKey.package, TaskKey.eject, originTask);

    if (shouldSkipTask(c, TaskKey.eject, originTask)) return true;

    switch (platform) {
        case 'ios':
        case 'macos':
            await ejectXcodeProject(c);
            return true;
        case 'android':
        case 'androidtv':
        case 'androidwear':
            await ejectGradleProject(c);
            return true;
        default:
            await logErrorPlatform(c);
            return true;
    }
};

const Task: RnvTask = {
    description: 'Eject current project app to self contained native project',
    fn: taskEject,
    task: TaskKey.eject,
    options: RnvTaskOptionPresets.withBase(RnvTaskOptionPresets.withConfigure()),
    platforms: ['ios', 'android', 'androidtv', 'androidwear', 'macos'],
};

export default Task;
