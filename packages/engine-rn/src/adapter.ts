const path = require('path');

const sharedBlacklist = [
    /node_modules\/react\/dist\/.*/,
    /website\/node_modules\/.*/,
    /heapCapture\/bundle\.js/,
    /.*\/__tests__\/.*/,
];

const env: any = process?.env;

function escapeRegExp(pattern: RegExp | string) {
    if (typeof pattern === 'string') {
        // eslint-disable-next-line
        const escaped = pattern.replace(/[\-\[\]\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&'); // convert the '/' into an escaped local file separator

        return escaped.replace(/\//g, `\\${path.sep}`);
    } else if (Object.prototype.toString.call(pattern) === '[object RegExp]') {
        return pattern.source.replace(/\//g, path.sep);
    }
    throw new Error(`Unexpected blacklist pattern: ${pattern}`);
}

function blacklist(additionalBlacklist: RegExp[]) {
    return new RegExp(`(${(additionalBlacklist || []).concat(sharedBlacklist).map(escapeRegExp).join('|')})$`);
}

export const withRNVMetro = (config: any) => {
    const projectPath = process.env.RNV_PROJECT_ROOT || process.cwd();

    const watchFolders = [path.resolve(projectPath, 'node_modules')];

    if (env.RNV_IS_MONOREPO === 'true' || env.RNV_IS_MONOREPO === true) {
        const monoRootPath = process.env.RNV_MONO_ROOT || projectPath;
        watchFolders.push(path.resolve(monoRootPath, 'node_modules'));
        watchFolders.push(path.resolve(monoRootPath, 'packages'));
    }
    if (config?.watchFolders?.length) {
        watchFolders.push(...config.watchFolders);
    }

    const exts: string = env.RNV_EXTENSIONS || '';

    const cnf = {
        ...config,
        transformer: {
            getTransformOptions: async () => ({
                transform: {
                    experimentalImportSupport: false,
                    // this defeats the RCTDeviceEventEmitter is not a registered callable module
                    inlineRequires: true,
                },
            }),
            ...(config?.transformer || {}),
        },
        resolver: {
            blacklistRE: blacklist([
                /platformBuilds\/.*/,
                /buildHooks\/.*/,
                /projectConfig\/.*/,
                /website\/.*/,
                /appConfigs\/.*/,
                /renative.local.*/,
                /metro.config.local.*/,
                /.expo\/.*/,
                /.rollup.cache\/.*/,
            ]),
            ...(config?.resolver || {}),
            sourceExts: [...(config?.resolver?.sourceExts || []), ...exts.split(',')],
            extraNodeModules: config?.resolver?.extraNodeModules,
        },
        watchFolders,
        projectRoot: path.resolve(projectPath),
    };

    return cnf;
};

export const withRNVBabel = (cnf: any) => {
    const plugins = cnf?.plugins || [];

    return {
        retainLines: true,
        presets: ['module:metro-react-native-babel-preset'],
        ...cnf,
        plugins: [
            [
                require.resolve('babel-plugin-module-resolver'),
                {
                    root: [process.env.RNV_MONO_ROOT || '.'],
                },
            ],
            ...plugins,
        ],
    };
};

