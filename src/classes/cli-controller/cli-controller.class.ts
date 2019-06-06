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

    public processArgs(version: string, args: any): { [key: string]: any } {
        // TODO: implement
        this.argsHandler
            .version(version, '-v, --version')
            .usage('<action>  [options]')
            .option('-y, --yes', 'no prompts (accept defaults)', false)
            .option('-s, --silent', 'silent mode', false)
            .option('-l, --loud', 'all the output to the console', false);

        // program
        //     .command('setup [env]')
        //     .description('run setup commands for all envs')
        //     .option("-s, --setup_mode [mode]", "Which setup mode to use")
        //     .action(function(env, options){
        //         var mode = options.setup_mode || "normal";
        //         env = env || 'all';
        //         console.log('setup for %s env(s) with %s mode', env, mode);
        //     });

        this.argsHandler
            .option('init <workspaceName> [path]', 'create <workspaceName> in [path]')
            .option('add <templateName> [packageName]', 'add [packageName] based on <templateName> to workspace')
            .option('remove [packageName]', 'remove [packageName] from workspace')
            .option('publish [packageName]', 'publish [packageName]')
            .option('serve [packageName]', 'serve [packageName]')
            .option('build [packageName]', 'build [packageName]')
            .option('test [packageName]', 'test [packageName]')
            .option('run <scriptName> [packageName]', 'run <scriptName> for [packageName]');

        this.argsHandler.parse(args);

        // tslint:disable-next-line
        console.log('---Params---------------------');
        // tslint:disable-next-line
        console.log('yes', this.argsHandler.yes);
        // tslint:disable-next-line
        console.log('silent', this.argsHandler.silent);
        // tslint:disable-next-line
        console.log('loud', this.argsHandler.loud);
        // tslint:disable-next-line
        console.log('---Arguments------------------');
        // tslint:disable-next-line
        console.log('workspaceName', this.argsHandler.workspaceName);
        // tslint:disable-next-line
        console.log('templateName', this.argsHandler.templateName);
        // tslint:disable-next-line
        console.log('packageName', this.argsHandler.packageName);
        // tslint:disable-next-line
        console.log('scriptName', this.argsHandler.scriptName);

        return this.argsHandler;
    }

    public async promptQuestions(questions: Questions): Promise<{ [key: string]: any } | void> {
        return this.questionHandler.prompt(questions);
    }
}

// alpen serve packageName
// alpen build packageName
// alpen lint packageName
// alpen test packageName
// alpen test:watch packageName
// alpen docs packageName
// alpen clean packageName
// alpen run packageName
// // Extra command:
// alpen init workspaceName
