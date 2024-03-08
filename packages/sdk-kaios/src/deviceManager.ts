import { fsExistsSync, getRealPath, chalk, logDefault, RnvError, RnvContext } from '@rnv/core';

const childProcess = require('child_process');

export const launchKaiOSSimulator = (c: RnvContext) =>
    new Promise<void>((resolve, reject) => {
        logDefault('launchKaiOSSimulator');
        if (!c.buildConfig?.sdks?.KAIOS_SDK) {
            reject(
                `KAIOS_SDK is not configured in your ${
                    c.paths.workspace.config
                } file. Make sure you add location to your Kaiosrt App path similar to: ${chalk().white.bold(
                    '"KAIOS_SDK": "/Users/<USER>/Library/kaiosrt"'
                )}`
            );
            return;
        }

        const ePath = getRealPath(c, c.buildConfig?.sdks?.KAIOS_SDK);

        if (ePath && !fsExistsSync(ePath)) {
            reject(`Can't find simulator at path: ${ePath}`);
            return;
        }

        childProcess.exec(`(cd ${ePath} && ${ePath}/kaiosrt )`, (err: RnvError) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
