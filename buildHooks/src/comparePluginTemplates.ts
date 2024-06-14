import { promises as fsPromises } from 'fs';
import inquirer from 'inquirer';
import { diff, diffString } from 'json-diff';
// todo
// all diffs
// total number of plugins, total number of conflicts, current plugin
// overwrite all
// check against latest npm version instead of other file

const comparePluginTemplates = async () => {
    const originalFilePath = process.argv[process.argv.length - 2];
    const modifiedFilePath = process.argv[process.argv.length - 1];

    const data1 = fsPromises.readFile(originalFilePath, 'utf8');
    const data2 = fsPromises.readFile(modifiedFilePath, 'utf8');
    const json1 = JSON.parse(await data1);
    const json2 = JSON.parse(await data2);

    const json1PluginTemplates = json1.pluginTemplates;
    const json2PluginTemplates = json2.pluginTemplates;

    for (const key of Object.keys(json1PluginTemplates)) {
        if (json2PluginTemplates?.[key]) {
            const difference = diff(json1PluginTemplates[key], json2PluginTemplates[key]);
            const differenceString = diffString(json1PluginTemplates[key], json2PluginTemplates[key]);
            if (difference) {
                const answers = await inquirer.prompt([
                    {
                        type: 'list',
                        message: `Conflict on \`${key}\` dependency: \n\n${differenceString}\n`,
                        name: 'prompt',
                        choices: [
                            {
                                name: 'Overwrite',
                                value: 'overwrite',
                            },
                            {
                                name: 'Skip',
                                value: 'skip',
                            },
                        ],
                    },
                ]);
                if (answers.prompt === 'overwrite') {
                    json1PluginTemplates[key] = json2PluginTemplates[key];
                    const updatedJsonContent = JSON.stringify(json1, null, 4);
                    await fsPromises.writeFile(originalFilePath, updatedJsonContent, 'utf8');
                }
            }
        }
    }
};

export { comparePluginTemplates };
