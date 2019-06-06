import chalk from 'chalk';
import Listr, {ListrOptions, ListrTask} from 'listr';

export class ExecutionController {
    protected queueOptions: ListrOptions = {
        concurrent: false,
        exitOnError: false
    };

    constructor(queueOptions?: ListrOptions) {
        Object.assign(this.queueOptions, queueOptions);
    }

    public async processTasks(tasks: ListrTask[]): Promise<void> {
        const queue = new Listr(tasks, this.queueOptions);
        await queue.run();

        // tslint:disable-next-line
        console.log('%s Processing result:', chalk.green.bold('DONE'));
    }
}

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
