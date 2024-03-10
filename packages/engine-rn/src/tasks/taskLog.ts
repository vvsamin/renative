import {
    logErrorPlatform,
    logTask,
    RnvTaskFn,
    executeTask,
    RnvTask,
    RnvTaskName,
    RnvTaskOptionPresets,
} from '@rnv/core';
import { runAndroidLog, checkAndConfigureAndroidSdks } from '@rnv/sdk-android';
import { runAppleLog } from '@rnv/sdk-apple';

import {} from '@rnv/sdk-android';

const taskLog: RnvTaskFn = async (c, parentTask, originTask) => {
    logTask('taskLog', `parent:${parentTask}`);

    await executeTask(c, RnvTaskName.workspaceConfigure, RnvTaskName.projectConfigure, originTask);

    switch (c.platform) {
        case 'android':
        case 'androidtv':
        case 'firetv':
        case 'androidwear':
            await checkAndConfigureAndroidSdks(c);
            return runAndroidLog(c);
        case 'ios':
            return runAppleLog(c);
        default:
            return logErrorPlatform(c);
    }
};

const Task: RnvTask = {
    description: 'Attach logger to device or emulator and print out logs',
    fn: taskLog,
    task: RnvTaskName.log,
    options: RnvTaskOptionPresets.withBase(),
    platforms: ['ios', 'android', 'androidtv', 'androidwear', 'macos'],
    isGlobalScope: true,
};

export default Task;