import * as path from 'path';
import {IConfig} from '../../interfaces';
import {ConfigController} from '../config-controller';
import {FileController} from '../file-controller';
import {TaskController} from '../task-controller';

// TODO: create config service
// TODO: on class create get repository for inputs
// TODO: cli repository for inputs from stdin and repository for inputs from code
// TODO: create own question and task models translated by repos
// TODO: allow templates to supply question:placeholder pairs to introduce custom replacements
// TODO: move from listr to https://github.com/cronvel/terminal-kit

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
        // get root path as we execute in ./dist/cjs/classes/alpen/
        const alpenRootPath = path.resolve(__dirname, '../../../../');
        try {
            const version = await this.getVersion(alpenRootPath);
            config = await this.configController.getConfig(args, version, alpenRootPath);
        } catch (error) {
            // tslint:disable-next-line
            console.error(`Config invalid > ${error.message}`);
            process.exit(1);
            return;
        }

        if (!config.command.approved) {
            // tslint:disable-next-line
            console.warn(`Command aborted by user`);
            process.exit(0);
            return;
        }

        // create & execute tasks
        try {
            await this.taskController.processTasks(config);
        } catch (error) {
            // tslint:disable-next-line
            console.error(`Execution failed > ${error.message}`);
            process.exit(1);
        }

        if (this.taskController.dependencyConflict) {
            // TODO: prompt questions to resolve package conflict
            // TODO: trigger taskcontroller again to confinue execution
        }
    }

    protected async getVersion(alpenPath: string): Promise<string> {
        let version;
        try {
            const packagePath = path.resolve(alpenPath, 'package.json');
            const content = await this.fileController.read(packagePath);
            version = JSON.parse(content.toString()).version;
        } catch (error) {
            return Promise.reject(new Error(`Unable to retrieve version of package > ${error.message}`));
        }
        return version;
    }
}
