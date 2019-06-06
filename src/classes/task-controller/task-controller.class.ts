import {ListrTask} from 'listr';
import {FileController} from '../file-controller';

export class TaskController {

    protected fileController: FileController;

    constructor() {
        this.fileController = new FileController();
    }

    public get(options: { [key: string]: any }): ListrTask[] {
        // TODO: implement
        return [];
    }
}

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
