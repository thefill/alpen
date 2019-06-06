import {Command} from 'commander';
import * as inquirer from 'inquirer';
import {Inquirer, Questions} from 'inquirer';

export class CliController {
    protected argsHandler: Command;
    protected questionHandler: Inquirer;

    constructor() {
        this.argsHandler = new Command();
        this.questionHandler = inquirer;
    }

    public processArgs(args: any): { [key: string]: any } {
        // TODO: implement
        return this.argsHandler
            .version('0.1.0', '-v, --version')
            .option('-p, --peppers', 'Add peppers')
            .option('-P, --pineapple', 'Add pineapple')
            .option('-b, --bbq-sauce', 'Add bbq sauce')
            .option('-c, --cheese [type]', 'Add the specified type of cheese [marble]', 'marble')
            .parse(args);
    }

    public async promptQuestions(questions: Questions): Promise<{ [key: string]: any } | void> {
        return this.questionHandler.prompt(questions);
    }
}
