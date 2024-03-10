import {
    RnvTaskFn,
    RnvContext,
    listAppConfigsFoldersSync,
    chalk,
    logTask,
    RnvTaskOptionPresets,
    executeTask,
    shouldSkipTask,
    RnvTask,
    RnvTaskName,
} from '@rnv/core';
import { updateProfile } from '@rnv/sdk-apple';

const _updateProfile = (c: RnvContext, v: string) =>
    new Promise<void>((resolve, reject) => {
        logTask(`_updateProfile:${v}`, chalk().grey);
        updateProfile(c)
            .then(() => resolve())
            .catch((e) => reject(e));
    });

const _updateProfiles = (c: RnvContext) => {
    logTask('_updateProfiles', chalk().grey);
    const acList = listAppConfigsFoldersSync(c, true);

    return acList.reduce((previousPromise, v) => previousPromise.then(() => _updateProfile(c, v)), Promise.resolve());
};

const taskCryptoUpdateProfiles: RnvTaskFn = async (c, _parentTask, originTask) => {
    logTask('taskCryptoUpdateProfiles');

    await executeTask(c, RnvTaskName.projectConfigure, RnvTaskName.cryptoUpdateProfiles, originTask);

    if (shouldSkipTask(c, RnvTaskName.cryptoUpdateProfiles, originTask)) return true;

    switch (c.platform) {
        case 'tvos':
            await _updateProfiles(c);
            break;
        default:
            return true;
    }
    return Promise.reject(`updateProfiles: Platform ${c.platform} not supported`);
};

const Task: RnvTask = {
    description: 'Will attempt to update all provisioning profiles (mac only)',
    fn: taskCryptoUpdateProfiles,
    task: RnvTaskName.cryptoUpdateProfiles,
    options: RnvTaskOptionPresets.withBase(),
    platforms: ['tvos'],
    // skipPlatforms: true,
};

export default Task;