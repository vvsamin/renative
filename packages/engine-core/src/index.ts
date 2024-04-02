import { createRnvEngine, ConfigFileEngine } from '@rnv/core';

import taskCryptoDecrypt from './tasks/crypto/taskCryptoDecrypt';
import taskCryptoEncrypt from './tasks/crypto/taskCryptoEncrypt';
import taskPlatformEject from './tasks/platform/taskPlatformEject';
import taskPlatformConnect from './tasks/platform/taskPlatformConnect';
import taskPlatformList from './tasks/platform/taskPlatformList';
import taskPlatformConfigure from './tasks/platform/taskPlatformConfigure';
import taskPlatformSetup from './tasks/project/taskProjectPlatforms';
import taskTemplateApply from './tasks/template/taskTemplateApply';
import taskPluginAdd from './tasks/plugin/taskPluginAdd';
import taskPluginList from './tasks/plugin/taskPluginList';
import taskPluginUpdate from './tasks/plugin/taskPluginUpdate';
import taskWorkspaceList from './tasks/workspace/taskWorkspaceList';
import taskWorkspaceAdd from './tasks/workspace/taskWorkspaceAdd';
import taskWorkspaceConnect from './tasks/workspace/taskWorkspaceConnect';
import taskHooksList from './tasks/hooks/taskHooksList';
import taskHooksRun from './tasks/hooks/taskHooksRun';
import taskHooksPipes from './tasks/hooks/taskHooksPipes';
import taskClean from './tasks/global/taskClean';
import taskStatus from './tasks/global/taskStatus';
import taskConfig from './tasks/global/taskConfig';
import taskHelp from './tasks/global/taskHelp';
import taskNew from './tasks/bootstrap/taskNew';
import taskInstall from './tasks/global/taskInstall';
import taskProjectConfigure from './tasks/project/taskProjectConfigure';
import taskProjectUpgrade from './tasks/project/taskProjectUpgrade';
import taskAppConfigure from './tasks/app/taskAppConfigure';
import taskAppCreate from './tasks/app/taskAppCreate';
import taskWorkspaceConfigure from './tasks/workspace/taskWorkspaceConfigure';
import taskConfigureSoft from './tasks/project/taskConfigureSoft';
import taskRvnKill from './tasks/global/taskKill';
import taskRvnDoctor from './tasks/global/taskDoctor';
import taskLink from './tasks/linking/taskLink';
import taskUnlink from './tasks/linking/taskUnlink';
import taskTelemetryStatus from './tasks/telemetry/taskTelemetryStatus';
import taskTelemetryEnable from './tasks/telemetry/taskTelemetryEnable';
import taskTelemetryDisable from './tasks/telemetry/taskTelemetryDisable';
import taskSwitch from './tasks/app/taskAppSwitch';

const CNF: ConfigFileEngine = {
    id: 'engine-core',
    platforms: {},
    npm: {},
    engineExtension: 'core',
    overview: '',
    packageName: '@rnv/engine-core',
};

const Engine = createRnvEngine({
    runtimeExtraProps: {},
    serverDirName: '',
    tasks: [
        taskCryptoDecrypt,
        taskCryptoEncrypt,
        taskPlatformEject,
        taskPlatformConnect,
        taskPlatformList,
        taskPlatformConfigure,
        taskPlatformSetup,
        taskTemplateApply,
        taskPluginAdd,
        taskPluginList,
        taskPluginUpdate,
        taskWorkspaceList,
        taskWorkspaceAdd,
        taskWorkspaceConnect,
        taskHooksList,
        taskHooksRun,
        taskHooksPipes,
        taskClean,
        taskStatus,
        taskConfig,
        taskHelp,
        taskNew,
        taskInstall,
        taskProjectConfigure,
        taskProjectUpgrade,
        taskAppConfigure,
        taskAppCreate,
        taskWorkspaceConfigure,
        taskConfigureSoft,
        taskRvnKill,
        taskRvnDoctor,
        taskLink,
        taskUnlink,
        taskTelemetryStatus,
        taskTelemetryEnable,
        taskTelemetryDisable,
        taskSwitch,
    ],
    config: CNF,
    // package: '',
    projectDirName: '',
    // ejectPlatform: null,
    platforms: {},
    rootPath: __dirname,
});

export type GetContext = GetContextType<typeof Engine>;

type Eng = typeof Engine;
type EngTasks = Eng['tasks'];
type EngOpts = Required<Required<Eng['tasks'][string]>['options'][number]>['key'];

// type Booo<T extends RnvEngine> = T['tasks'][string];

// type Booo2<T extends RnvEngine> = Readonly<Booo<T>['options']>;

// type Booo2<T extends RnvEngine> = Readonly<Required<T['tasks'][string]>['options']>
// type Booo2<T extends RnvEngine> = Readonly<Required<T['tasks'][string]>['options']>
// type Booo2<T extends RnvEngine> = Readonly<Required<T['tasks'][string]>['options']>

// type Booo3<T extends RnvEngine> = Readonly<Booo<T>>[number]

const xxx: EngOpts = 'dsdfsdfsdfsd';
const xxx2: EngTasks;
console.log('DDJDJD', xxx, xxx2['ddd'].beforeDependsOn);

export default Engine;
