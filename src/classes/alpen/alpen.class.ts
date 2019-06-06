import {Questions} from 'inquirer';
import {ListrTask} from 'listr';
import {CliController} from '../cli-controller';
import {ExecutionController} from '../execution-controller';
import {QuestionController} from '../question-controller';
import {TaskController} from '../task-controller';

export class Alpen {
    protected cliController: CliController;
    protected taskController: TaskController;
    protected questionController: QuestionController;
    protected executionController: ExecutionController;
    protected defaultOptions = {};

    constructor() {
        this.cliController = new CliController();
        this.executionController = new ExecutionController();
        this.taskController = new TaskController();
        this.questionController = new QuestionController();
        this.cliController = new CliController();
    }

    public async cli(args: any) {
        const argsOptions: { [key: string]: any } = this.cliController.processArgs(args);
        const questions: Questions = this.questionController.get(argsOptions);
        const answerOptions: { [key: string]: any } = this.cliController.promptQuestions(questions);
        const options = Object.assign({}, this.defaultOptions, argsOptions, answerOptions);
        const tasks: ListrTask[] = this.taskController.get(options);
        await this.executionController.processTasks(tasks);
    }

}
