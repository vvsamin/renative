import { RnvTaskOptionPresets, chalk, logSuccess, logTask, RnvTask, RnvTaskName } from '@rnv/core';
import { inquiryBootstrapQuestions } from './questions/bootstrapQuestions';
import { inquiryGit } from './questions/confirmGit';
import { inquiryIsRenativeProject } from './questions/isRenativeProject';
import { inquiryHasNodeModules } from './questions/hasNodeModules';
import { inquiryConfirm } from './questions/confirmOverview';
import { inquiryProjectName } from './questions/projectName';
import { inquiryWorkspace } from './questions/workspace';
import { inquirySupportedPlatforms } from './questions/supportedPlatforms';
import {
    generateNewProject,
    initNewProject,
    saveProgressIntoProjectConfig,
    telemetryNewProject,
} from './projectGenerator';
import { inquiryAppTitle } from './questions/appTitle';
import { inquiryAppID } from './questions/appID';
import { inquiryAppVersion } from './questions/projectVersion';
import { inquiryInstallTemplate } from './questions/installTemplate';
import { inquiryApplyTemplate } from './questions/applyTemplate';
import { inquiryBookmarkTemplate } from './questions/bookmarkTemplate';
import { processChdirToProject } from './utils';

const taskNew = async () => {
    logTask('taskNew');
    // Initialize Project
    const payload = await initNewProject();
    // Interactive Questions Required
    await inquiryProjectName(payload);
    await processChdirToProject();
    await inquiryIsRenativeProject(payload);
    await inquiryHasNodeModules(payload);
    await inquiryInstallTemplate(payload);
    await inquiryApplyTemplate(payload);
    await saveProgressIntoProjectConfig(payload);
    // Interactive Questions Optional
    await inquiryAppTitle(payload);
    await inquiryAppID(payload);
    await inquiryAppVersion(payload);
    await saveProgressIntoProjectConfig(payload);

    await inquiryWorkspace(payload);
    await inquirySupportedPlatforms(payload);
    await inquiryBootstrapQuestions(payload);
    await inquiryGit(payload);
    await inquiryBookmarkTemplate(payload);
    await inquiryConfirm(payload);
    // Generate Project
    await generateNewProject(payload);
    // Telementry
    await telemetryNewProject(payload);

    logSuccess(
        `Your project is ready! navigate to project ${chalk().bold(`cd ${payload.projectName}`)} and run ${chalk().bold(
            'npx rnv run'
        )} to see magic happen!`
    );

    return true;
};

const Task: RnvTask = {
    description: 'Create new ReNative project',
    fn: taskNew,
    task: RnvTaskName.new,
    options: RnvTaskOptionPresets.withBase(),
    platforms: [],
    isGlobalScope: true,
    isPriorityOrder: true,
};

export default Task;
