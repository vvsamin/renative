import path from 'path';
import {
    inquirerPrompt,
    logTask,
    createWorkspace,
    fsExistsSync,
    executeTask,
    RnvTaskOptionPresets,
    RnvTaskFn,
    RnvTask,
    RnvTaskName,
} from '@rnv/core';

const taskWorkspaceAdd: RnvTaskFn = async (_c, _parentTask, originTask) => {
    logTask('taskWorkspaceAdd');

    await executeTask(RnvTaskName.projectConfigure, RnvTaskName.workspaceAdd, originTask);

    const { workspace } = await inquirerPrompt({
        name: 'workspace',
        type: 'input',
        message: 'absolute path to new workspace',
        validate: (i: string) => !!i || 'No path provided',
    });

    const workspacePath = path.join(workspace);

    if (fsExistsSync(workspacePath)) {
        const { confirm } = await inquirerPrompt({
            name: 'confirm',
            type: 'confirm',
            message: `Folder ${workspacePath} already exists are you sure you want to override it?`,
        });
        if (!confirm) return false;
    }

    let workspaceID = workspacePath.split('/').pop()?.replace(/@|\./g, '') || 'rnv';

    const { workspaceIDInput } = await inquirerPrompt({
        name: 'workspaceIDInput',
        type: 'input',
        message: `ID of the workspace (${workspaceID})`,
    });

    workspaceID = workspaceIDInput || workspaceID;
    createWorkspace(workspaceID, workspacePath);

    return true;
};

const Task: RnvTask = {
    description: 'Add new workspace',
    fn: taskWorkspaceAdd,
    task: RnvTaskName.workspaceAdd,
    options: RnvTaskOptionPresets.withBase(),
    platforms: null,
    isGlobalScope: true,
};

export default Task;
