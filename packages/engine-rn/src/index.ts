import { withRNVMetro } from './adapters/metroAdapter';
import { withRNVBabel } from './adapters/babelAdapter';

//@ts-ignore
import CNF from '../renative.engine.json';
import taskRun from './tasks/taskRun';
import taskPackage from './tasks/taskPackage';
import taskBuild from './tasks/taskBuild';
import taskConfigure from './tasks/taskConfigure';
import taskStart from './tasks/taskStart';
import taskExport from './tasks/taskExport';
import taskCryptoInstallCerts from './tasks/taskCryptoInstallCerts';
import taskCryptoUpdateProfile from './tasks/taskCryptoUpdateProfile';
import taskCryptoUpdateProfiles from './tasks/taskCryptoUpdateProfiles';
import taskCryptoInstallProfiles from './tasks/taskCryptoInstallProfiles';
import taskLog from './tasks/taskLog';
import taskEject from './tasks/taskEject';
import { generateEngineExtensions, generateEngineTasks, RnvEngine } from '@rnv/core';
import { withRNVRNConfig } from '@rnv/sdk-react-native';
import { taskTargetLaunchAndroid, taskSdkConfigureAndroid, taskTargetListAndroid } from '@rnv/sdk-android';
import { taskTargetLaunchApple, taskTargetListApple } from '@rnv/sdk-apple';

const Engine: RnvEngine = {
    tasks: generateEngineTasks([
        taskRun,
        taskPackage,
        taskBuild,
        taskConfigure,
        taskStart,
        taskExport,
        taskEject,
        taskCryptoInstallCerts,
        taskCryptoUpdateProfile,
        taskCryptoUpdateProfiles,
        taskCryptoInstallProfiles,
        taskLog,
        taskTargetLaunchAndroid,
        taskTargetLaunchApple,
        taskTargetListAndroid,
        taskTargetListApple,
        taskSdkConfigureAndroid,
    ]),
    config: CNF,
    runtimeExtraProps: {
        reactNativePackageName: 'react-native',
        reactNativeMetroConfigName: 'metro.config.js',
        xcodeProjectName: 'RNVApp',
    },
    projectDirName: '',
    serverDirName: '',
    // package: '',
    // ejectPlatform: null,
    platforms: {
        ios: {
            defaultPort: 8082,
            extensions: generateEngineExtensions(['ios.mobile', 'mobile', 'ios', 'mobile.native', 'native'], CNF),
        },
        android: {
            defaultPort: 8083,
            extensions: generateEngineExtensions(
                ['android.mobile', 'mobile', 'android', 'mobile.native', 'native'],
                CNF
            ),
        },
        androidtv: {
            defaultPort: 8084,
            extensions: generateEngineExtensions(
                ['androidtv.tv', 'tv', 'androidtv', 'android', 'tv.native', 'native'],
                CNF
            ),
        },
        firetv: {
            defaultPort: 8098,
            extensions: generateEngineExtensions(
                ['firetv.tv', 'androidtv.tv', 'tv', 'firetv', 'androidtv', 'android', 'tv.native', 'native'],
                CNF
            ),
        },
        androidwear: {
            defaultPort: 8084,
            extensions: generateEngineExtensions(
                ['androidwear.watch', 'watch', 'androidwear', 'android', 'watch.native', 'native'],
                CNF
            ),
        },
        macos: {
            defaultPort: 8086,
            extensions: generateEngineExtensions(
                ['macos.desktop', 'desktop', 'macos', 'ios', 'desktop.native', 'native'],
                CNF
            ),
        },
    },
};

export default Engine;

export { withRNVMetro, withRNVBabel, withRNVRNConfig };
