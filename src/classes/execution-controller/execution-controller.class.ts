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
