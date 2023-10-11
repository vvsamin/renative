import { z } from 'zod';

const GradleProperties = z
    .record(z.string(), z.union([z.string(), z.boolean(), z.number()]))
    .describe('Overrides values in `gradle.properties` file of generated android based project');

const BuildGradle = z
    .object({
        allprojects: z.object({
            repositories: z.record(z.string(), z.boolean()),
        }),
        plugins: z.array(z.string()),
        buildscript: z.object({
            repositories: z.record(z.string(), z.boolean()),
            dependencies: z.record(z.string(), z.boolean()),
        }),
        dexOptions: z.record(z.string(), z.boolean()),
        injectAfterAll: z.array(z.string()),
    })
    .describe('Overrides values in `build.gradle` file of generated android based project');

const AppBuildGradle = z
    .object({
        apply: z.array(z.string()),
        defaultConfig: z.array(z.string()),
    })
    .describe('Overrides values in `app/build.gradle` file of generated android based project');

const ManifestChild = z.object({
    tag: z.string(),
    'android:name': z.string(),
    // 'android:name': '.MainApplication',
    // 'android:allowBackup': true,
    // 'android:largeHeap': true,
    // 'android:usesCleartextTraffic': true,
    // 'tools:targetApi': 28,
});

const ManifestChildWithChildren = ManifestChild.merge(
    z.object({
        children: z.array(ManifestChild),
    })
);

const AndroidManifest = z.object({
    apply: z.object({
        children: z.array(ManifestChildWithChildren),
    }),
}).describe(`Allows you to directly manipulate \`AndroidManifest.xml\` via json override mechanism
Injects / Overrides values in AndroidManifest.xml file of generated android based project
> IMPORTANT: always ensure that your object contains \`tag\` and \`android:name\` to target correct tag to merge into
 `);

const Gradle = z.object({
    buildTypes: z.optional(
        z.object({
            debug: z.optional(z.array(z.string())),
            release: z.optional(z.array(z.string())),
        })
    ),
});

export const PlatformSharedAndroid = z.object({
    'gradle.properties': z.optional(GradleProperties),
    'build.gradle': z.optional(BuildGradle),
    'app/build.gradle': z.optional(AppBuildGradle),
    AndroidManifest: z.optional(AndroidManifest),
    gradle: z.optional(Gradle),
    afterEvaluate: z.optional(z.array(z.string())),
    //     applyPlugin: {
    //         type: 'array',
    //     },
    //     BuildGradle: {
    //         type: 'object',
    //         description: 'Allows you to customize `build.gradle` file',
    //         properties: {
    //             allprojects: {
    //                 type: 'object',
    //                 properties: {
    //                     repositories: {
    //                         type: 'object',
    //                         description: 'Customize repositories section of build.gradle',
    //                         additionalProperties: true,
    //                         examples: [
    //                             {
    //                                 "flatDir { dirs 'libs'}": true,
    //                             },
    //                         ],
    //                     },
    //                 },
    //             },
    //         },
    //     },
    //     implementation: {
    //         type: 'object',
    //     },
});