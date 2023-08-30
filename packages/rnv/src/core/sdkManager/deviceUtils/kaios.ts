import { fsExistsSync, getRealPath } from '../../systemManager/fileutils';
import { chalk, logTask } from '../../systemManager/logger';
import { KAIOS_SDK } from '../../constants';
import { RnvConfig } from '../../configManager/types';
import { RnvError } from '../../types';

const childProcess = require('child_process');

export const launchKaiOSSimulator = (c: RnvConfig) =>
    new Promise<void>((resolve, reject) => {
        logTask('launchKaiOSSimulator');

        if (!c.buildConfig?.sdks?.KAIOS_SDK) {
            reject(
                `${KAIOS_SDK} is not configured in your ${
                    c.paths.workspace.config
                } file. Make sure you add location to your Kaiosrt App path similar to: ${chalk().white.bold(
                    '"KAIOS_SDK": "/Applications/Kaiosrt.app"'
                )}`
            );
            return;
        }

        const ePath = getRealPath(c, c.buildConfig?.sdks?.KAIOS_SDK);

        if (ePath && !fsExistsSync(ePath)) {
            reject(`Can't find emulator at path: ${ePath}`);
            return;
        }

        childProcess.exec(`open ${ePath}`, (err: RnvError) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
