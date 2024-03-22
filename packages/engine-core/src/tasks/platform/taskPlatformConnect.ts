import path from 'path';

import {
    chalk,
    logTask,
    logSuccess,
    logToSummary,
    writeFileSync,
    removeDirs,
    generatePlatformChoices,
    executeTask,
    RnvTaskOptionPresets,
    RnvTaskFn,
    inquirerPrompt,
    PlatformKey,
    RnvTask,
    RnvTaskName,
} from '@rnv/core';

const taskPlatformConnect: RnvTaskFn = async (c, _parentTask, originTask) => {
    logTask('taskPlatformConnect');

    await executeTask(RnvTaskName.projectConfigure, RnvTaskName.platformConnect, originTask);

    const configOriginal = c.files.project.config_original;
    if (!configOriginal) {
        return;
    }

    if (!c.files.project.config?.paths?.platformTemplatesDirs) {
        logToSummary('All supported platforms are connected. nothing to do.');
        return;
    }

    let selectedPlatforms: Array<PlatformKey>;
    if (c.platform) {
        selectedPlatforms = [c.platform];
    } else {
        const { connectedPlatforms } = await inquirerPrompt({
            name: 'connectedPlatforms',
            message:
                'This will point platformTemplates folders from your local project to ReNative managed one. Select platforms you would like to connect',
            type: 'checkbox',
            choices: generatePlatformChoices().map((choice) => ({
                ...choice,
                disabled: choice.isConnected,
            })),
        });
        selectedPlatforms = connectedPlatforms;
    }

    if (selectedPlatforms.length) {
        selectedPlatforms.forEach((platform) => {
            if (configOriginal.paths?.platformTemplatesDirs?.[platform]) {
                delete configOriginal.paths.platformTemplatesDirs[platform];
            }

            if (!Object.keys(configOriginal.paths?.platformTemplatesDirs || {}).length) {
                delete configOriginal.paths?.platformTemplatesDirs; // also cleanup the empty object
            }

            writeFileSync(c.paths.project.config, configOriginal);
        });
    }

    const { deletePlatformFolder } = await inquirerPrompt({
        name: 'deletePlatformFolder',
        type: 'confirm',
        message: 'Would you also like to delete the previously used platform folder?',
    });

    if (deletePlatformFolder) {
        const pathsToRemove: Array<string> = [];
        selectedPlatforms.forEach((platform) => {
            pathsToRemove.push(path.join(c.paths.project.platformTemplatesDirs[platform], platform));
        });

        // TODO: Remove shared folders as well

        await removeDirs(pathsToRemove);
    }

    logSuccess(
        `${chalk().bold(
            selectedPlatforms.join(',')
        )} now using ReNative platformTemplates located associated platform engines.`
    );
};

const Task: RnvTask = {
    description: 'Connect platform template back to rnv',
    fn: taskPlatformConnect,
    task: RnvTaskName.platformConnect,
    options: RnvTaskOptionPresets.withBase(),
    platforms: null,
};

export default Task;
