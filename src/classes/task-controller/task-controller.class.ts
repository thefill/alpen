import {ListrTask} from 'listr';
import {FileController} from '../file-controller';

export class TaskController {

    protected fileController: FileController;

    constructor(fileController: FileController) {
        this.fileController = fileController;
    }

    public get(options: { [key: string]: any }): ListrTask[] {
        // TODO: implement
        return [];
    }
}

// for add:
// - use package manager to install template as dev dep.
// - copy template 'file' dir content to specified package location
// - replace in whole dir placeholders
// - keep hash of alpen.package.json
// - keep package name, dir and if publishable
// - get package dependencies and compare with existing (warn if conflict)
// - get package dev dependencies and compare with existing (warn if conflict)
// - install dependencies and save
// for remove:
// - get package dependencies and compare with existing (remove one that are not used by other)
// - get package dev dependencies and compare with existing (remove one that are not used by other)
// - uninstall removable packages
// - remove files
// - remove entry from config
// for publish:
// - if no package provided ask if publish all?
// - if publishable proceed
// - copy package config file to package.json
// - npm publish
// - remove package.json
// for other commands:
// - if no package name provided execute for all (for serve / test:watch / watch - ask)
// - if package have definition proceed
// - execute script with npm
//
// async function initGit(options) {
//     const result = await execa('git', ['init'], {
//         cwd: options.targetDirectory
//     });
//     if (result.failed) {
//         return Promise.reject(new Error('Failed to initialize git'));
//     }
//     return;
// }
//
//
// [
//     {
//         title: 'Copy project files',
//         task: () => copyTemplateFiles(options)
//     },
//     {
//         title: 'Create gitignore',
//         task: () => createGitignore(options)
//     },
//     {
//         title: 'Create License',
//         task: () => createLicense(options)
//     },
//     {
//         title: 'Initialize git',
//         task: () => initGit(options),
//         enabled: () => options.git
//     },
//     {
//         title: 'Install dependencies',
//         task: () =>
//             projectInstall({
//                 cwd: options.targetDirectory
//             }),
//         skip: () =>
//             !options.runInstall
//                 ? 'Pass --install to automatically install dependencies'
//                 : undefined
//     }
// ];

// export async function createProject(options) {
//     options = {
//         ...options,
//         targetDirectory: options.targetDirectory || process.cwd(),
//         email: 'hi@dominik.dev',
//         name: 'Dominik Kundel'
//     };
//
//     const templateDir = path.resolve(
//         new URL(import.meta.url).pathname,
//         '../../templates',
//         options.template
//     );
//     options.templateDirectory = templateDir;
//
//     try {
//         await access(templateDir, fs.constants.R_OK);
//     } catch (err) {
//         console.error('%s Invalid template name', chalk.red.bold('ERROR'));
//         process.exit(1);
//     }
//
//     const tasks = new Listr(
//         [
//             {
//                 title: 'Copy project files',
//                 task: () => copyTemplateFiles(options)
//             },
//             {
//                 title: 'Create gitignore',
//                 task: () => createGitignore(options)
//             },
//             {
//                 title: 'Create License',
//                 task: () => createLicense(options)
//             },
//             {
//                 title: 'Initialize git',
//                 task: () => initGit(options),
//                 enabled: () => options.git
//             },
//             {
//                 title: 'Install dependencies',
//                 task: () =>
//                     projectInstall({
//                         cwd: options.targetDirectory
//                     }),
//                 skip: () =>
//                     !options.runInstall
//                         ? 'Pass --install to automatically install dependencies'
//                         : undefined
//             }
//         ],
//         {
//             exitOnError: false
//         }
//     );
//
//     await tasks.run();
//     console.log('%s Project ready', chalk.green.bold('DONE'));
//     return true;
// }
