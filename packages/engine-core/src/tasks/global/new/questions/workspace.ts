import { getContext, inquirerPrompt, updateRenativeConfigs } from '@rnv/core';
import type { NewProjectData } from '../types';
import { checkInputValue } from '../utils';

export const inquiryWorkspace = async (data: NewProjectData) => {
    const c = getContext();
    const { ci, workspace } = c.program;
    let inputWorkspace;
    if (checkInputValue(workspace)) {
        inputWorkspace = workspace;
    } else if (ci) {
        inputWorkspace = data.defaults.workspaceID;
    } else {
        const answer = await inquirerPrompt({
            name: 'inputWorkspace',
            type: 'list',
            message: 'What workspace to use?',
            default: data.defaults.workspaceID,
            choices: data.optionWorkspaces.keysAsArray,
        });

        inputWorkspace = answer?.inputWorkspace;
    }
    data.optionWorkspaces.selectedOption = inputWorkspace;
    c.runtime.selectedWorkspace = inputWorkspace;

    data.files.project.renativeConfig.workspaceID = inputWorkspace;
    await updateRenativeConfigs();
};
