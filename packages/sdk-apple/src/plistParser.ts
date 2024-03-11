import path from 'path';
import {
    getAppFolder,
    getConfigProp,
    getFlavouredProp,
    logDefault,
    logError,
    logWarning,
    parsePlugins,
    readObjectSync,
    mergeObjects,
    writeCleanFile,
    fsWriteFileSync,
    getContext,
} from '@rnv/core';
import { getAppFolderName } from './common';
import { Context, FilePlistJSON } from './types';
import { addSystemInjects, getAppTitle, getAppVersion, getAppVersionCode, getBuildFilePath } from '@rnv/sdk-utils';

const isBool = (value: unknown) => typeof value === 'boolean';
const isNumber = (value: unknown) => typeof value === 'number' && Number.isFinite(value);
const isString = (value: unknown) => typeof value === 'string' || value instanceof String;
const isArray = (value: unknown) => value && typeof value === 'object' && value.constructor === Array;
const isObject = (value: unknown) => value && typeof value === 'object' && value.constructor === Object;

export const parseExportOptionsPlist = () =>
    new Promise<void>((resolve) => {
        // EXPORT OPTIONS
        const c = getContext();
        const { platform } = c;
        const tId = getConfigProp(c, platform, 'teamID');
        const appFolder = getAppFolder();
        const exportOptions = getConfigProp(c, platform, 'exportOptions') || {};
        const id = getConfigProp(c, platform, 'id');

        c.payload.pluginConfigiOS.exportOptions = objToPlist(exportOptions);

        if (exportOptions.provisioningProfiles && id) {
            const expProvProfile = exportOptions.provisioningProfiles[id];
            if (!expProvProfile) {
                logError(
                    `Your exportOptions.provisioningProfiles object in ${c.paths.appConfig.config} does not include id ${id}!`
                );
            }
        }

        const bPath = getBuildFilePath(c, platform, 'exportOptions.plist');

        const injects = [
            { pattern: '{{TEAM_ID}}', override: tId },
            {
                pattern: '{{PLUGIN_EXPORT_OPTIONS}}',
                override: c.payload.pluginConfigiOS.exportOptions,
            },
        ];

        addSystemInjects(c, injects);

        writeCleanFile(bPath, path.join(appFolder, 'exportOptions.plist'), injects, undefined, c);
        resolve();
    });

export const parseEntitlementsPlist = () =>
    new Promise<void>((resolve) => {
        logDefault('parseEntitlementsPlist');

        const c = getContext();
        const { platform } = c;

        const appFolder = getAppFolder();
        const appFolderName = getAppFolderName(c, platform);
        const entitlementsPath = path.join(appFolder, `${appFolderName}/${appFolderName}.entitlements`);
        // PLUGIN ENTITLEMENTS
        let pluginsEntitlementsObj = getConfigProp(c, platform, 'entitlements');
        if (!pluginsEntitlementsObj) {
            pluginsEntitlementsObj =
                readObjectSync(path.join(__dirname, '../supportFiles/entitlements.json')) || undefined;
        }

        saveObjToPlistSync(c, entitlementsPath, pluginsEntitlementsObj);
        resolve();
    });

export const parseInfoPlist = () =>
    new Promise<void>((resolve) => {
        const c = getContext();
        logDefault('parseInfoPlist');
        const { platform } = c;
        if (!platform) return;

        const appFolder = getAppFolder();
        const appFolderName = getAppFolderName(c, platform);
        const orientationSupport = getConfigProp(c, c.platform, 'orientationSupport');
        const urlScheme = getConfigProp(c, c.platform, 'urlScheme');

        const plistPath = path.join(appFolder, `${appFolderName}/Info.plist`);

        // PLIST
        let plistObj =
            readObjectSync<FilePlistJSON>(path.join(__dirname, `../supportFiles/info.plist.${platform}.json`)) || {};
        plistObj.CFBundleDisplayName = getAppTitle(c, platform);
        plistObj.CFBundleShortVersionString = getAppVersion(c, platform);
        plistObj.CFBundleVersion = getAppVersionCode(c, platform);
        // FONTS
        if (c.payload.pluginConfigiOS.embeddedFonts.length) {
            plistObj.UIAppFonts = c.payload.pluginConfigiOS.embeddedFonts;
        }
        // PERMISSIONS
        const includedPermissions = getConfigProp(c, platform, 'includedPermissions');
        if (includedPermissions && c.buildConfig.permissions) {
            const platPrem = 'ios'; // c.buildConfig.permissions[platform] ? platform : 'ios';
            const pc = c.buildConfig.permissions[platPrem] || {};
            if (includedPermissions?.length && includedPermissions[0] === '*') {
                Object.keys(pc).forEach((v) => {
                    (plistObj as Record<string, string>)[v] = pc[v].desc;
                });
            } else if (includedPermissions?.forEach) {
                includedPermissions.forEach((v) => {
                    if (pc[v]) {
                        (plistObj as Record<string, string>)[v] = pc[v].desc;
                    }
                });
            } else if (includedPermissions) {
                logWarning('includedPermissions not parsed. make sure it an array format!');
            }
        }
        // ORIENATATIONS
        if (orientationSupport) {
            if (orientationSupport.phone) {
                plistObj.UISupportedInterfaceOrientations = orientationSupport.phone;
            } else {
                plistObj.UISupportedInterfaceOrientations = ['UIInterfaceOrientationPortrait'];
            }
            if (orientationSupport.tab) {
                plistObj['UISupportedInterfaceOrientations~ipad'] = orientationSupport.tab;
            } else {
                plistObj['UISupportedInterfaceOrientations~ipad'] = ['UIInterfaceOrientationPortrait'];
            }
        }
        // URL_SCHEMES (LEGACY)
        if (urlScheme) {
            logWarning('urlScheme is DEPRECATED. use "plist:{ CFBundleURLTypes: []}" object instead');
            plistObj.CFBundleURLTypes?.push({
                CFBundleTypeRole: 'Editor',
                CFBundleURLName: urlScheme,
                CFBundleURLSchemes: [urlScheme],
            });
        }

        // PLIST

        const plist = getConfigProp(c, platform, 'templateXcode')?.Info_plist;
        if (plist) {
            plistObj = mergeObjects(c, plistObj, plist, true, true);
        }

        // PLUGINS
        parsePlugins(c, platform, (plugin, pluginPlat) => {
            const plistPlug = getFlavouredProp(c, pluginPlat, 'templateXcode')?.Info_plist;
            if (plistPlug) {
                plistObj = mergeObjects(c, plistObj, plistPlug, true, false);
            }
        });
        saveObjToPlistSync(c, plistPath, plistObj);
        resolve();
    });

const PLIST_START = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">\n`;

const PLIST_END = '</plist>\n';

const objToPlist = (obj: any): string => {
    let output = PLIST_START;
    output += _parseObject(obj, 0);
    output += PLIST_END;
    return output;
};

const _parseObject = (obj: any, level: number) => {
    let output = '';
    let space = '';
    for (let i = 0; i < level; i++) {
        space += '  ';
    }
    if (isArray(obj)) {
        output += `${space}<array>\n`;
        obj.forEach((v: any) => {
            output += _parseObject(v, level + 1);
        });
        output += `${space}</array>\n`;
    } else if (isBool(obj)) {
        output += `${space}<${obj} />\n`;
    } else if (isObject(obj)) {
        output += `${space}<dict>\n`;
        Object.keys(obj).forEach((key) => {
            output += `  ${space}<key>${key}</key>\n`;
            output += _parseObject(obj[key], level + 1);
        });
        output += `${space}</dict>\n`;
    } else if (isString(obj)) {
        output += `${space}<string>${obj}</string>\n`;
    } else if (isNumber(obj) && Number.isInteger(obj)) {
        output += `${space}<integer>${obj}</integer>\n`;
    }

    return output;
};

const saveObjToPlistSync = (c: Context, filePath: string, obj: any) => {
    // fsWriteFileSync(filePath, objToPlist(sanitizeDynamicProps(obj, c.buildConfig?._refs)));
    fsWriteFileSync(filePath, objToPlist(obj));
};

export { objToPlist, saveObjToPlistSync };
