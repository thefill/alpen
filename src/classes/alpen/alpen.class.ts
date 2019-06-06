import {Questions} from 'inquirer';
import {ListrTask} from 'listr';
import {CliController} from '../cli-controller';
import {ExecutionController} from '../execution-controller';
import {FileController} from '../file-controller';
import {QuestionController} from '../question-controller';
import {TaskController} from '../task-controller';

export class Alpen {
    protected cliController: CliController;
    protected taskController: TaskController;
    protected questionController: QuestionController;
    protected executionController: ExecutionController;
    protected fileController: FileController;
    protected defaultOptions = {};

    constructor() {
        this.fileController = new FileController();
        this.cliController = new CliController();
        this.executionController = new ExecutionController();
        this.taskController = new TaskController(this.fileController);
        this.questionController = new QuestionController();
    }

    public async cli(args: any) {
        const version = await this.getVersion();
        const argsOptions: { [key: string]: any } = this.cliController.processArgs(version, args);
        const questions: Questions = this.questionController.get(argsOptions);
        const answerOptions: { [key: string]: any } = this.cliController.promptQuestions(questions);
        // tslint:disable-next-line
        console.log('answerOptions', answerOptions);
        const options = Object.assign({}, this.defaultOptions, argsOptions, answerOptions);
        const tasks: ListrTask[] = this.taskController.get(options);
        await this.executionController.processTasks(tasks);
    }

    protected async getVersion(): Promise<string> {
        let version;
        try {
            const content = await this.fileController.read('./package.json');
            version = JSON.parse(content.toString()).version;
        } catch (error) {
            return Promise.reject(new Error(`Unable to retrieve version of package`));
        }
        return version;
    }

}
