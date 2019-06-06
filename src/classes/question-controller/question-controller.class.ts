import {Questions} from 'inquirer';

export class QuestionController {

    public get(options: { [key: string]: any }): Questions {
        // TODO: implement
        return [];
    }

    // Questions - init
    // whats the workspace name
    // whats your preferred package manager (npm | yarn | pnpm)
    // whats your packages root dir

    // Questions - add
    // whats the package name
    // whats the package template name (npm package name)
    // whats your package dir (you can provide nested dir e.g. /some/dir/) relative to workspace root dir
    // is this package publishable?

    // Questions - remove
    // are you sure? Will remove files...
}

// const defaultTemplate = 'javascript';
// if (options.skipPrompts) {
//     return {
//         ...options,
//         template: options.template || defaultTemplate
//     };
// }
//
// const questions = [];
// if (!options.template) {
//     questions.push({
//         type: 'list',
//         name: 'template',
//         message: 'Please choose which project template to use',
//         choices: ['javascript', 'typescript'],
//         default: defaultTemplate
//     });
// }
//
// if (!options.git) {
//     questions.push({
//         type: 'confirm',
//         name: 'git',
//         message: 'Should a git be initialized?',
//         default: false
//     });
// }
//
