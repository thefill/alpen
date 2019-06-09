import {ListrTask} from 'listr';
import {IConfig} from '../../interfaces';
import {ConfigController} from '../config-controller';
import {FileController} from '../file-controller';
import {TaskController} from '../task-controller';

// TODO: create config service
// TODO: on class create get repository for inputs
// TODO: cli repository for inputs
// TODO: repository for inputs from code
// TODO: create own question and task models translated by repos

export class Alpen {
    protected configController: ConfigController;
    protected taskController: TaskController;
    protected fileController: FileController;

    constructor() {
        this.fileController = new FileController();
        this.configController = new ConfigController(this.fileController);
        this.taskController = new TaskController(this.fileController);
    }

    public async init(args: any) {
        // get config
        let config: IConfig;
        try {
            const version = await this.getVersion();
            config = await this.configController.getConfig(args, version);
        } catch (error) {
            // tslint:disable-next-line
            console.error(`Config invalid > ${error.message}`);
            process.exit(1);
            return;
        }

        // tslint:disable
        console.log('config', config);
        // tslint:enable

        if (!config.command.approved) {
            // tslint:disable-next-line
            console.warn(`Command aborted by user`);
            process.exit(0);
            return;
        }

        // create & execute tasks
        try {
            const tasks: ListrTask[] = this.taskController.getTasks(config);
            await this.taskController.processTasks(tasks);
        } catch (error) {
            // tslint:disable-next-line
            console.error(`Execution failed > ${error.message}`);
            process.exit(1);
        }
    }

    protected async getVersion(): Promise<string> {
        let version;
        try {
            const content = await this.fileController.read('./package.json');
            version = JSON.parse(content.toString()).version;
        } catch (error) {
            return Promise.reject(new Error(`Unable to retrieve version of package > ${error.message}`));
        }
        return version;
    }
}
