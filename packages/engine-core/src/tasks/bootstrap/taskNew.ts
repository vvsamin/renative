import {
    RnvTaskName,
    updateRenativeConfigs,
    logToSummary,
    applyTemplate,
    configureTemplateFiles,
    generateLocalJsonSchemas,
    createTask,
} from '@rnv/core';
import inquiryProjectFolder from './questions/projectFolder';
import inquiryBootstrapQuestions from './questions/bootstrapQuestions';
import inquiryGit from './questions/confirmGit';
import inquiryIsRenativeProject from './questions/isRenativeProject';
import inquiryHasNodeModules from './questions/hasNodeModules';
import inquiryProjectName from './questions/projectName';
import inquiryWorkspace from './questions/workspace';
import inquirySupportedPlatforms from './questions/supportedPlatforms';
import inquiryAppTitle from './questions/appTitle';
import inquiryAppID from './questions/appID';
import inquiryAppVersion from './questions/appVersion';
import inquiryInstallTemplate from './questions/installTemplate';
import inquiryApplyTemplate from './questions/applyTemplate';
import inquiryBookmarkTemplate from './questions/bookmarkTemplate';
import inquiryAppConfigs from './questions/appConfigs';
import inquiryConfigTemplates from './questions/configTemplates';
import inquiryProjectInstall from './questions/installProject';
import {
    configureConfigOverrides,
    generateProjectOverview,
    initNewProject,
    saveProgressIntoProjectConfig,
    telemetryNewProject,
    processChdirToProject,
} from './questionHelpers';

export default createTask({
    description: 'Create new ReNative project',
    fn: async () => {
        // Initialize Project
        const payload = await initNewProject();
        // Initial questions
        await inquiryProjectName(payload);
        await inquiryProjectFolder(payload);
        await inquiryIsRenativeProject(payload);
        await inquiryHasNodeModules(payload);
        await inquiryWorkspace(payload);
        await saveProgressIntoProjectConfig(payload);
        // Switch execution context to new directory
        await processChdirToProject();
        // Install template only (this avoids whole npm project install)
        await inquiryInstallTemplate(payload);
        await inquiryConfigTemplates(payload);
        await inquiryApplyTemplate(payload);
        await saveProgressIntoProjectConfig(payload);
        // Gather project/app info
        await inquiryBookmarkTemplate(payload);
        await inquiryAppTitle(payload);
        await inquiryAppID(payload);
        await inquiryAppVersion(payload);
        await saveProgressIntoProjectConfig(payload);

        await inquirySupportedPlatforms(payload);
        await inquiryBootstrapQuestions(payload);
        await inquiryGit(payload);
        // Configure final config overrides
        await updateRenativeConfigs();
        await configureConfigOverrides(payload);
        await saveProgressIntoProjectConfig(payload);
        // Now we can apply template (required for appConfigs to be generated properly)
        await updateRenativeConfigs();
        await applyTemplate();
        await configureTemplateFiles();
        await generateLocalJsonSchemas();
        await inquiryAppConfigs(payload);
        // Telementry
        await telemetryNewProject(payload);
        await inquiryProjectInstall(payload);

        logToSummary(generateProjectOverview(payload));

        return true;
    },
    task: RnvTaskName.new,
    options: [
        {
            key: 'gitEnabled',
            description: 'Enable git in your newly created project',
            isValueType: true,
        },
        {
            key: 'answer',
            isValueType: true,
            isVariadic: true,
            description: 'Pass in answers to prompts',
            examples: ['--answer question=response question2=response2', '--answer question=\'{"some": "json"}\''],
        },
        {
            key: 'workspace',
            isValueType: true,
            description: 'select the workspace for the new project',
        },
        {
            key: 'template',
            shortcut: 'T',
            isValueType: true,
            isRequired: true,
            description: 'select specific template',
        },
        {
            key: 'projectName',
            isValueType: true,
            description: 'select the name of the new project',
        },
        {
            key: 'projectTemplate',
            isValueType: true,
            description: 'select the template of new project',
        },
        {
            key: 'templateVersion',
            isValueType: true,
            description: 'select the template version',
        },
        {
            key: 'title',
            isValueType: true,
            description: 'select the title of the app',
        },
        {
            key: 'appVersion',
            isValueType: true,
            description: 'select the version of the app',
        },
        {
            key: 'id',
            isValueType: true,
            description: 'select the id of the app',
        },
        // RnvTaskOptions.gitEnabled,
        // RnvTaskOptions.answer,
        // RnvTaskOptions.workspace,
        // RnvTaskOptions.template,
        // RnvTaskOptions.projectName,
        // RnvTaskOptions.projectTemplate,
        // RnvTaskOptions.templateVersion,
        // RnvTaskOptions.title,
        // RnvTaskOptions.appVersion,
        // RnvTaskOptions.id,
    ],
    isGlobalScope: true,
    isPriorityOrder: true,
});