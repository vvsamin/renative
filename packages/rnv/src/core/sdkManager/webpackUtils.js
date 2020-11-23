/* eslint-disable no-restricted-syntax */
import path from 'path';
import open from 'better-opn';
import axios from 'axios';
import ip from 'ip';
import commandExists from 'command-exists';
import { fsExistsSync, readObjectSync, writeCleanFile, fsWriteFileSync, mkdirSync } from '../systemManager/fileutils';
import { executeAsync } from '../systemManager/exec';
import {
    getPlatformBuildDir,
    getAppVersion,
    checkPortInUse,
    getConfigProp,
    getTemplateProjectDir,
    getAppTitle,
    sanitizeColor,
    confirmActiveBundler,
    getTimestampPathsConfig,
    addSystemInjects,
    getPlatformProjectDir,
    getPlatformServerDir
} from '../common';
import { doResolve, doResolvePath } from '../systemManager/resolve';
import {
    chalk,
    logTask,
    logInfo,
    logDebug,
    logWarning,
    logSuccess,
    logRaw,
    logError,
    logSummary
} from '../systemManager/logger';
import { getPlatformExtensions } from '../engineManager';
import { parsePlugins } from '../pluginManager';
import { getValidLocalhost } from '../systemManager/utils';

import { REMOTE_DEBUG_PORT, RNV_NODE_MODULES_DIR } from '../constants';

const WEBPACK = path.join(RNV_NODE_MODULES_DIR, 'webpack/bin/webpack.js');
const WEBPACK_DEV_SERVER = path.join(RNV_NODE_MODULES_DIR, 'webpack-dev-server/bin/webpack-dev-server.js');

const _generateWebpackConfigs = (c) => {
    logTask('_generateWebpackConfigs');
    const { platform } = c;
    const appFolder = getPlatformBuildDir(c);
    const appFolderServer = getPlatformServerDir(c);
    // const templateFolder = getAppTemplateFolder(c, platform);

    let { modulePaths, moduleAliases } = getModuleConfigs(c);

    const modulePath = path.join(appFolder, 'modules.json');
    let externalModulePaths = [];
    let localModulePaths = [];
    if (fsExistsSync(modulePath)) {
        const modules = readObjectSync(modulePath);
        externalModulePaths = modules.externalPaths;
        localModulePaths = modules.localPaths;
        if (modules.aliases) {
            moduleAliases = { ...modules.aliases, ...moduleAliases };
        }
    }

    modulePaths = modulePaths
        .concat(externalModulePaths.map(v => doResolvePath(v, true, {}, c.paths.project.nodeModulesDir)))
        .concat(localModulePaths.map(v => path.join(c.paths.project.dir, v)))
        .filter(Boolean);

    // const env = getConfigProp(c, platform, 'environment');
    const extendConfig = getConfigProp(c, platform, 'webpackConfig', {});
    const entryFile = getConfigProp(c, platform, 'entryFile', 'index.web');
    const title = getAppTitle(c, platform);
    const analyzer = getConfigProp(c, platform, 'analyzer') || c.program.analyzer;

    if (!fsExistsSync(appFolderServer)) {
        mkdirSync(appFolderServer);
    }

    // copyFileSync(
    //     path.join(
    //         templateFolder,
    //         '_privateConfig',
    //         env === 'production' ? 'webpack.config.js' : 'webpack.config.dev.js'
    //     ),
    //     path.join(appFolderServer, 'webpack.config.js')
    // );

    // const externalModulesResolved = externalModules.map(v => doResolve(v))
    let assetVersion = '';
    const versionedAssets = getConfigProp(c, platform, 'versionedAssets', false);
    if (versionedAssets) {
        assetVersion = `-${getAppVersion(c, platform)}`;
    }
    const timestampAssets = getConfigProp(c, platform, 'timestampAssets', false);
    if (timestampAssets) {
        assetVersion = `-${c.runtime.timestamp}`;
    }

    const bundleAssets = c.runtime.forceBundleAssets || getConfigProp(c, c.platform, 'bundleAssets', false);

    const obj = {
        modulePaths,
        moduleAliases,
        analyzer,
        entryFile,
        title,
        assetVersion,
        buildFolder: bundleAssets ? getPlatformProjectDir(c) : getPlatformServerDir(c),
        extensions: getPlatformExtensions(c, true),
        ...extendConfig
    };

    const extendJs = `
    module.exports = ${JSON.stringify(obj, null, 2)}`;

    fsWriteFileSync(path.join(appFolder, 'webpack.extend.js'), extendJs);
};

const _parseCssSync = (c) => {
    const templateProjectDir = getTemplateProjectDir(c);
    const timestampPathsConfig = getTimestampPathsConfig(c, c.platform);
    const backgroundColor = getConfigProp(c, c.platform, 'backgroundColor');

    const bundleAssets = c.runtime.forceBundleAssets || getConfigProp(c, c.platform, 'bundleAssets', false);
    const targetDir = bundleAssets ? getPlatformProjectDir(c) : getPlatformServerDir(c);

    const injects = [
        {
            pattern: '{{PLUGIN_COLORS_BG}}',
            override: sanitizeColor(
                backgroundColor,
                'backgroundColor'
            ).hex
        }
    ];

    addSystemInjects(c, injects);

    writeCleanFile(
        path.join(templateProjectDir, 'app.css'),
        path.join(targetDir, 'app.css'),
        injects,
        timestampPathsConfig, c
    );
};

export const waitForUrl = url => new Promise((resolve, reject) => {
    let attempts = 0;
    const maxAttempts = 10;
    const CHECK_INTEVAL = 2000;
    const interval = setInterval(() => {
        axios.get(url)
            .then(() => {
                resolve(true);
            })
            .catch(() => {
                attempts++;
                if (attempts > maxAttempts) {
                    clearInterval(interval);
                    // spinner.fail('Can\'t connect to webpack. Try restarting it.');
                    return reject(
                        "Can't connect to webpack. Try restarting it."
                    );
                }
            });
    }, CHECK_INTEVAL);
});

const _runWebBrowser = (c, platform, devServerHost, port, alreadyStarted) => new Promise((resolve) => {
    logTask(
        '_runWebBrowser', `ip:${devServerHost} port:${port} openBrowser:${!!c.runtime.shouldOpenBrowser}`
    );
    if (!c.runtime.shouldOpenBrowser) return resolve();
    const wait = waitForWebpack(c)
        .then(() => {
            open(`http://${devServerHost}:${port}/`);
        })
        .catch((e) => {
            logWarning(e);
        });
    if (alreadyStarted) return wait; // if it's already started, return the promise so it rnv will wait, otherwise it will exit before opening the browser
    return resolve();
});

const _runRemoteDebuggerChii = async (c, obj) => {
    const { debugIp } = c.program;
    try {
        await commandExists('chii');

        const resolvedDebugIp = debugIp || ip.address();
        logInfo(
            `Starting a remote debugger build with ip ${
                resolvedDebugIp}. If this IP is not correct, you can always override it with --debugIp`
        );

        const debugUrl = chalk().cyan(`http://${resolvedDebugIp}:${REMOTE_DEBUG_PORT}`);

        const command = `chii start --port ${REMOTE_DEBUG_PORT}`;
        executeAsync(c, command, { stdio: 'inherit', silent: true });

        try {
            await waitForUrl(`http://${resolvedDebugIp}:${REMOTE_DEBUG_PORT}`);
            logRaw(`

Debugger running at: ${debugUrl}`);
            open(`http://${resolvedDebugIp}:${REMOTE_DEBUG_PORT}/`);
        } catch (e) {
            logError(e);
        }
        obj.remoteDebuggerActive = true;
        obj.debugVariables += `DEBUG=true DEBUG_IP=${
            resolvedDebugIp} DEBUG_CLIENT=chii DEBUG_SCRIPT="http://${resolvedDebugIp}:${REMOTE_DEBUG_PORT}/target.js"`;
        obj.lineBreaks = '\n';
    } catch (e) {
        logWarning(`You are missing chii. You can install via ${chalk().white('npm i -g chii')}) Trying to use weinre next`);
    }

    return true;
};

const _runRemoteDebuggerWeinre = async (c, obj) => {
    const { debugIp } = c.program;
    try {
        await commandExists('weinre');

        const resolvedDebugIp = debugIp || ip.address();
        logInfo(
            `Starting a remote debugger build with ip ${
                resolvedDebugIp}. If this IP is not correct, you can always override it with --debugIp`
        );

        const debugUrl = chalk().cyan(`http://${resolvedDebugIp}:${REMOTE_DEBUG_PORT}/client/#${c.platform}`);

        const command = `weinre --boundHost -all- --httpPort ${REMOTE_DEBUG_PORT}`;
        executeAsync(c, command, { stdio: 'inherit', silent: true });

        try {
            await waitForUrl(`http://${resolvedDebugIp}:${REMOTE_DEBUG_PORT}`);
            logRaw(`

Debugger running at: ${debugUrl}`);
            open(`http://${resolvedDebugIp}:${REMOTE_DEBUG_PORT}/client/#${c.platform}`);
        } catch (e) {
            logError(e);
        }
        obj.remoteDebuggerActive = true;
        obj.debugVariables += `DEBUG=true DEBUG_IP=${
            resolvedDebugIp} DEBUG_CLIENT=weinre DEBUG_SCRIPT="http://${resolvedDebugIp}:${
            REMOTE_DEBUG_PORT}/target/target-script-min.js#${c.platform}}`;
        obj.lineBreaks = '\n';
    } catch (e) {
        logWarning(`You are missing weinre. Skipping debug. install via ${chalk().white('npm i -g weinre')}`);
    }
    return true;
};

const _runWebDevServer = async (c, enableRemoteDebugger) => {
    logTask('_runWebDevServer');
    const { debug } = c.program;

    const environment = getConfigProp(c, c.platform, 'environment', 'production');
    const configName = environment === 'production' ? 'prod' : 'dev';

    const appFolder = getPlatformBuildDir(c);
    const wpPublic = getPlatformServerDir(c);
    const wpConfig = path.join(appFolder, `webpack.config.${configName}.js`);
    const debugObj = { lineBreaks: '\n\n\n', debugVariables: '', remoteDebuggerActive: false };
    let debugOrder = [_runRemoteDebuggerChii, _runRemoteDebuggerWeinre];
    if (debug === 'weinre') debugOrder = [_runRemoteDebuggerWeinre, _runRemoteDebuggerChii];
    if ((debug || enableRemoteDebugger) && debug !== 'false') {
        await debugOrder[0](c, debugObj);
        if (!debugObj.remoteDebuggerActive) {
            await debugOrder[1](c, debugObj);
        }
    }

    const devServerHost = getValidLocalhost(getConfigProp(c, c.platform, 'webpackConfig', {}).devServerHost, c.runtime.localhost);

    const url = chalk().cyan(`http://${devServerHost}:${c.runtime.port}`);
    logRaw(`${debugObj.lineBreaks}Dev server running at: ${url}\n\n`);


    const WPS_ALTERNATIVE = `${doResolve('webpack-dev-server')}/bin/webpack-dev-server.js`;

    let wps = 'webpack-dev-server';
    if (fsExistsSync(WEBPACK_DEV_SERVER)) {
        wps = WEBPACK_DEV_SERVER;
    } else if (fsExistsSync(WPS_ALTERNATIVE)) {
        wps = WPS_ALTERNATIVE;
    } else {
        logWarning(`cannot find installed webpack-dev-server. looked in following locations:
${chalk().white(WEBPACK_DEV_SERVER)},
${chalk().white(WPS_ALTERNATIVE)}
will try to use globally installed one`);
    }

    const command = `npx cross-env PLATFORM=${c.platform} ${
        debugObj.debugVariables
    } ${wps} -d --devtool source-map --config ${
        wpConfig
    }  --inline --hot --colors --content-base ${
        wpPublic
    } --history-api-fallback --port ${c.runtime.port} --mode=${environment}`;
    try {
        await executeAsync(c, command, {
            stdio: 'inherit',
            silent: true,
            // env: {
            //     RNV_EXTENSIONS: getPlatformExtensions(c)
            // }
        });

        logDebug('_runWebDevServer: running');
    } catch (e) {
        logDebug(e);
        return true;
    }
};


export const configureCoreWebProject = async (c) => {
    logTask('configureCoreWebProject');
    _generateWebpackConfigs(c);
    _parseCssSync(c);
};

export const runWebpackServer = async (c, enableRemoteDebugger) => {
    const { port } = c.runtime;
    const { platform } = c;
    logTask('runWeb', `port:${port} debugger:${!!enableRemoteDebugger}`);

    let devServerHost = c.runtime.localhost;

    const extendConfig = getConfigProp(c, c.platform, 'webpackConfig', {});
    devServerHost = getValidLocalhost(
        extendConfig.devServerHost,
        c.runtime.localhost
    );

    const isPortActive = await checkPortInUse(c, platform, port);
    const bundleAssets = getConfigProp(c, c.platform, 'bundleAssets', false);

    if (bundleAssets) {
        await buildCoreWebpackProject(c);
        logSuccess('bundleAssets set to true. webpack dev server will not run');
        return true;
    }

    if (!isPortActive) {
        logInfo(
            `Your ${chalk().white(
                platform
            )} devServerHost ${chalk().white(
                devServerHost
            )} at port ${chalk().white(
                port
            )} is not running. Starting it up for you...`
        );
        await _runWebBrowser(c, platform, devServerHost, port, false);
        if (!bundleAssets) {
            logSummary('BUNDLER STARTED');
        }
        await _runWebDevServer(c, enableRemoteDebugger);
    } else {
        const resetCompleted = await confirmActiveBundler(c);

        if (resetCompleted) {
            await _runWebBrowser(c, platform, devServerHost, port, false);
            if (!bundleAssets) {
                logSummary('BUNDLER STARTED');
            }
            await _runWebDevServer(c, enableRemoteDebugger);
        } else {
            await _runWebBrowser(c, platform, devServerHost, port, true);
        }
    }
};

export const waitForWebpack = async (c, suffix = 'assets/bundle.js') => {
    logTask('waitForWebpack', `port:${c.runtime.port}`);
    let attempts = 0;
    const maxAttempts = 10;
    const CHECK_INTEVAL = 2000;
    // const spinner = ora('Waiting for webpack to finish...').start();

    const extendConfig = getConfigProp(c, c.platform, 'webpackConfig', {});
    const devServerHost = getValidLocalhost(extendConfig.devServerHost, c.runtime.localhost);
    const url = `http://${devServerHost}:${c.runtime.port}/${suffix}`;

    return new Promise((resolve, reject) => {
        const interval = setInterval(() => {
            axios
                .get(url)
                .then((res) => {
                    if (res.status === 200) {
                        clearInterval(interval);
                        // spinner.succeed();
                        return resolve(true);
                    }
                    attempts++;
                    if (attempts === maxAttempts) {
                        clearInterval(interval);
                        // spinner.fail('Can\'t connect to webpack. Try restarting it.');
                        return reject(
                            "Can't connect to webpack. Try restarting it."
                        );
                    }
                })
                .catch(() => {
                    attempts++;
                    if (attempts > maxAttempts) {
                        clearInterval(interval);
                        // spinner.fail('Can\'t connect to webpack. Try restarting it.');
                        return reject(
                            "Can't connect to webpack. Try restarting it."
                        );
                    }
                });
        }, CHECK_INTEVAL);
    });
};

export const buildCoreWebpackProject = async (c) => {
    const { debug, debugIp } = c.program;
    const { platform } = c;
    logTask('buildCoreWebpackProject');

    let debugVariables = '';

    if (debug) {
        logInfo(
            `Starting a remote debugger build with ip ${debugIp
                    || ip.address()}. If this IP is not correct, you can always override it with --debugIp`
        );
        debugVariables += `DEBUG=true DEBUG_IP=${debugIp || ip.address()}`;
    }

    const environment = getConfigProp(c, c.platform, 'environment', 'production');
    const configName = environment === 'production' ? 'prod' : 'dev';

    const WP_ALTERNATIVE = `${doResolve('webpack')}/bin/webpack.js`;

    let wp = 'webpack';
    if (fsExistsSync(WEBPACK)) {
        wp = WEBPACK;
    } else if (fsExistsSync(WP_ALTERNATIVE)) {
        wp = WP_ALTERNATIVE;
    } else {
        logWarning(`cannot find installed webpack. looked in following locations:
${chalk().white(WEBPACK)},
${chalk().white(WP_ALTERNATIVE)}
will try to use globally installed one`);
    }


    await executeAsync(c, `npx cross-env PLATFORM=${platform} NODE_ENV=${environment} ${
        debugVariables
    } node ${wp} -p --config ./platformBuilds/${c.runtime.appId}_${platform}/webpack.config.${configName}.js`, {
        // env: {
        //     RNV_EXTENSIONS: getPlatformExtensions(c)
        // }
    });
    logSuccess(
        `Your Build is located in ${chalk().cyan(
            getPlatformProjectDir(c)
        )} .`
    );
    return true;
};

export const getModuleConfigs = (c, primaryKey) => {
    let modulePaths = [];
    const moduleAliases = {};

    const doNotResolveModulePaths = [];

    // PLUGINS
    parsePlugins(c, c.platform, (plugin, pluginPlat, key) => {
        const webpackConfig = plugin[primaryKey] || plugin.webpack || plugin.webpackConfig;

        if (webpackConfig) {
            if (webpackConfig.modulePaths) {
                if (webpackConfig.modulePaths === false) {
                    // ignore
                } else if (webpackConfig.modulePaths === true) {
                    modulePaths.push(`node_modules/${key}`);
                } else {
                    webpackConfig.modulePaths.forEach((v) => {
                        if (typeof v === 'string') {
                            modulePaths.push(v);
                        } else if (v?.projectPath) {
                            doNotResolveModulePaths.push(path.join(c.paths.project.dir, v.projectPath));
                        }
                    });
                }
            }
            if (webpackConfig.moduleAliases) {
                if (webpackConfig.moduleAliases === true) {
                    moduleAliases[key] = doResolvePath(key, true, {}, c.paths.project.nodeModulesDir);
                } else {
                    Object.keys(webpackConfig.moduleAliases).forEach((aKey) => {
                        const mAlias = webpackConfig.moduleAliases[aKey];
                        if (typeof mAlias === 'string') {
                            moduleAliases[key] = doResolvePath(mAlias, true, {}, c.paths.project.nodeModulesDir);
                        } else if (mAlias.path) {
                            moduleAliases[key] = path.join(c.paths.project.dir, mAlias.path);
                        } else if (mAlias.projectPath) {
                            moduleAliases[key] = path.join(c.paths.project.dir, mAlias.projectPath);
                        }
                    });
                }
            }
        }
    }, true);

    const moduleAliasesArray = [];
    Object.keys(moduleAliases).forEach((key) => {
        moduleAliasesArray.push(`${key}:${moduleAliases[key]}`);
    });

    modulePaths = modulePaths
        .map(v => doResolvePath(v, true, {}, c.paths.project.dir))
        .concat(doNotResolveModulePaths)
        .concat([c.paths.project.assets.dir])
        .filter(Boolean);


    return { modulePaths, moduleAliases, moduleAliasesArray };
};
