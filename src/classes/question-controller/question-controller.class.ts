import {Questions} from 'inquirer';

export class QuestionController {

    public get(options: { [key: string]: any }): Questions {
        // TODO: implement
        return [];
    }
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
