import {Command} from 'commander';
import * as inquirer from 'inquirer';
import {Inquirer, Question, Questions} from 'inquirer';
import * as path from 'path';
import {CommandType} from '../../enums/command-type';
import {ExecutionMode} from '../../enums/execution-mode';
import {PackageManager} from '../../enums/package-manager';
import {ICommandConfig, IConfig, IPackageConfig, IWorkspaceConfig} from '../../interfaces';
import {FileController} from '../file-controller';

export class ConfigController {
    // TODO: introduce config repositories
    protected fileController: FileController;
    protected argsHandler: Command;
    protected questionHandler: Inquirer;
    protected config: IConfig = {
        command: {
            type: CommandType.UNKNOWN,
            currentDir: process.cwd(),
            mode: ExecutionMode.PRETTY,
            packages: [],
            noPrompts: false,
            approved: true,
            path: ''
        },
        alpenVersion: '',
        alpenPath: '',
        workspace: {
            packageManager: PackageManager.NPM,
            rootDir: 'packages',
            packages: {}
        },
        workspacePackage: {
            name: 'unknown',
            version: '0.0.1',
            engines: {
                node: `'>=${process.version}'`
            },
            private: true,
            author: 'Uknown',
            repository: {
                type: 'git',
                url: '-'
            },
            license: 'Unknown'
        }
    };

    constructor(fileController: FileController) {
        this.fileController = fileController;
        this.argsHandler = new Command();
        this.questionHandler = inquirer;
    }

    public async getConfig(args: any, version: string, alpenPath: string): Promise<IConfig> {
        this.config.alpenPath = alpenPath;
        this.config.alpenVersion = version;
        // get command config from args
        this.config.command = this.processArgs(version, args, this.config.command);

        if (this.config.command.type === CommandType.UNKNOWN) {
            throw new Error('Unknown command provided');
        }

        if (this.config.command.type !== CommandType.INIT) {
            // get workspace config
            try {
                this.config.workspacePath = await this.getWorkspaceConfigPath();
                this.config.workspace = await this.getWorkspaceConfig(this.config.workspacePath);
            } catch (error) {
                throw new Error(`No workspace config > ${error.message}`);
            }
            // get package manager config
            try {
                const packageManagerConfig = await this.getPackageManagerConfig(this.config.workspacePath);
                this.config.workspacePackage = Object.assign(this.config.workspacePackage, packageManagerConfig);
            } catch (error) {
                throw new Error(`No package manager config > ${error.message}`);
            }
        }

        // if no default values, ask for missing questions
        if (!this.config.command.noPrompts) {
            const questions: Questions = this.getQuestions(this.config.command);
            this.config = await this.promptQuestions(questions, this.config);
        }

        try {
            this.validateConfig(this.config);
        } catch (error) {
            throw new Error(`Provided config has errors > ${error.message}`);
        }

        if (this.config.command.type === CommandType.INIT) {
            this.config.workspacePath = path.resolve(
                process.cwd(),
                this.config.command.path as string,
                this.config.command.workspace as string
            );
        }

        return Object.assign({}, this.config);
    }

    public validateConfig(config: IConfig): void {
        if (config.command.type === CommandType.INIT) {
            if (this.config.workspacePath) {
                throw new Error('Creating workspace inside another workspace is not allowed');
            }
            return;
        }

        if (!config.command.packages || !config.command.packages.length) {
            throw new Error('No packages provided to trigger requested action against');
        }

        if (!Object.keys(config.workspace.packages).length) {
            throw new Error('No registered packages to trigger requested action against');
        }

        // check if all packages registered
        const notRegistered = config.command.packages.filter((packageName) => {
            return !Object.keys(config.workspace.packages).includes(packageName);
        });

        if (config.command.type !== CommandType.ADD && notRegistered.length) {
            throw new Error(
                `Package${notRegistered.length > 1 ? 's' : ''} with 
                name${notRegistered.length > 1 ? 's' : ''} ${notRegistered.join(', ')} not registered`
            );
        }
    }

    protected processArgs(version: string, args: any, config: ICommandConfig): ICommandConfig {

        // TODO: allow rest params for package names for remove, publish...
        const configFromArgs: ICommandConfig = Object.assign({}, config);

        this.argsHandler
            .version(version, '-v, --version')
            .usage('<command> [options]')
            .option('-s, --silent', 'silent output mode', false)
            .option('-p, --pretty', 'pretty output mode (default)', false)
            .option('-l, --loud', 'verbose output mode', false)
            .option('-y, --yes', 'no prompts (yes to all questions)', false);

        this.argsHandler
            .on('--help', () => {
                // tslint:disable
                console.log('');
                console.log('Examples:');
                console.log('  $ alpen init someWorkspace');
                console.log('  $ alpen init someWorkspace some/dir/');
                console.log('  $ alpen add @some/NPMPackage someName some/dir/');
                console.log('  $ alpen serve');
                console.log('  $ alpen serve someName');
                console.log('  $ alpen build');
                console.log('  $ alpen build someName');
                console.log('  $ alpen run someScript someName');
                // tslint:enable
            });

        this.argsHandler
            .command('init <workspace> [path]')
            .description('create <workspace> in [path]')
            .action((workspace, path) => {
                configFromArgs.type = CommandType.INIT;
                configFromArgs.workspace = workspace;
                configFromArgs.path = path;
            });

        this.argsHandler
            .command('add <template> <package> [path]')
            .description('add [package] based on <template> in [path]')
            .action((template, packageName, path) => {
                configFromArgs.type = CommandType.ADD;
                configFromArgs.template = template;
                configFromArgs.path = path;

                if (configFromArgs.packages) {
                    configFromArgs.packages.push(packageName);
                }
            });

        this.argsHandler
            .command('remove <package>')
            .description('remove <package>')
            .action((packageName) => {
                configFromArgs.type = CommandType.REMOVE;

                if (configFromArgs.packages) {
                    configFromArgs.packages.push(packageName);
                }
            });

        this.argsHandler
            .command('publish [package]')
            .description('publish [package] or all packages')
            .action((packageName) => {
                configFromArgs.type = CommandType.PUBLISH;

                if (configFromArgs.packages) {
                    configFromArgs.packages.push(packageName);
                }
            });

        this.argsHandler
            .command('serve [package]')
            .description('serve [package] or all packages')
            .action((packageName, command) => {
                configFromArgs.type = CommandType.SERVE;

                if (configFromArgs.packages) {
                    configFromArgs.packages.push(packageName);
                }
            });

        this.argsHandler
            .command('build [package]')
            .description('build [package] or all packages')
            .action((packageName, command) => {
                configFromArgs.type = CommandType.BUILD;

                if (configFromArgs.packages) {
                    configFromArgs.packages.push(packageName);
                }
            });

        this.argsHandler
            .command('test [package]')
            .description('test [package] or all packages')
            .action((packageName) => {
                configFromArgs.type = CommandType.TEST;

                if (configFromArgs.packages) {
                    configFromArgs.packages.push(packageName);
                }
            });

        this.argsHandler
            .command('run <command> [package]')
            .description('run <command> for [package] or for all packages')
            .action((command, packageName) => {
                configFromArgs.type = CommandType.RUN;
                configFromArgs.command = command;

                if (configFromArgs.packages) {
                    configFromArgs.packages.push(packageName);
                }
            });

        this.argsHandler.parse(args);

        if (!configFromArgs.packages.length) {
            configFromArgs.packages = Object.keys(this.config.workspace.packages);
        }

        configFromArgs.noPrompts = this.argsHandler.yes;

        if (this.argsHandler.silent) {
            configFromArgs.mode = ExecutionMode.SILENT;
        } else if (this.argsHandler.loud) {
            configFromArgs.mode = ExecutionMode.LOUD;
        } else {
            configFromArgs.mode = ExecutionMode.PRETTY;
        }

        if (!configFromArgs.path || !configFromArgs.path.length) {
            configFromArgs.path = process.cwd();
        }

        return configFromArgs;
    }

    protected async promptQuestions(questions: Questions, config: IConfig): Promise<IConfig> {
        const answers = await this.questionHandler.prompt(questions);

        switch (config.command.type) {
            case CommandType.INIT:
                config.workspace.packageManager = answers.workspacePackage;
                config.workspace.rootDir = answers.rootDir;
                break;
            case CommandType.REMOVE:
            case CommandType.PUBLISH:
                config.command.approved = answers.approved;
                break;
        }

        return Object.assign({}, config);
    }

    protected async getWorkspaceConfigPath(): Promise<string> {
        let workspaceConfigPath;
        const availableNames = [
            '.alpenrc',
            'alpen.json',
            'alpen.config.json'
        ];

        workspaceConfigPath = await this.fileController.findClosestUp(availableNames);
        if (!workspaceConfigPath) {
            return Promise.reject(new Error(`Cant find workspace config. Are you inside workspace?`));
        }

        return workspaceConfigPath;
    }

    protected async getWorkspaceConfig(workspaceConfigPath: string): Promise<IWorkspaceConfig> {
        let workspaceConfig: IWorkspaceConfig | Buffer;
        try {
            await this.fileController.access(workspaceConfigPath);
            workspaceConfig = await this.fileController.read(workspaceConfigPath);
            workspaceConfig = JSON.parse(workspaceConfig.toString()) as IWorkspaceConfig;
        } catch (error) {
            return Promise.reject(new Error(`Unable to load workspace config > ${error.message}`));
        }

        return workspaceConfig;
    }

    protected async getPackageManagerConfig(workspaceConfigPath: string): Promise<IPackageConfig> {
        let packageManagerConfig: IPackageConfig | Buffer;
        try {
            const packageManagerConfigPath = path.join(workspaceConfigPath, 'package.json');
            await this.fileController.access(packageManagerConfigPath);
            packageManagerConfig = await this.fileController.read(packageManagerConfigPath);
            packageManagerConfig = JSON.parse(packageManagerConfig.toString()) as IPackageConfig;
        } catch (error) {
            return Promise.reject(new Error(`Unable to load workspace package manager config > ${error.message}`));
        }

        return packageManagerConfig;
    }

    protected getQuestions(config: ICommandConfig): Questions {
        const questions: Question[] = [];

        switch (config.type) {
            case CommandType.INIT:
                // ask about preferred package manager
                questions.push(
                    {
                        type: 'list',
                        name: 'workspacePackage',
                        message: 'What is your preferred package manager?',
                        default: 0,
                        choices: [
                            {
                                name: PackageManager.NPM,
                                value: PackageManager.NPM,
                                short: PackageManager.NPM
                            },
                            {
                                name: PackageManager.YARN,
                                value: PackageManager.YARN,
                                short: PackageManager.YARN
                            },
                            {
                                name: PackageManager.PNPM,
                                value: PackageManager.PNPM,
                                short: PackageManager.PNPM
                            }
                        ]
                    });
                // ask about default package directory
                questions.push(
                    {
                        type: 'input',
                        name: 'rootDir',
                        message: 'Where by default you would like to store workspace packages?',
                        default: 'packages'
                    });

                break;
            case CommandType.REMOVE:
                const packagesToRemove = config.packages.join(', ');
                const removeMultiple = config.packages.length > 1;

                // ask if remove package?
                questions.push({
                    type: 'confirm',
                    name: 'approved',
                    message: `Are you sure you want to 
                    remove ${removeMultiple ? 'following packages:' : 'package'} ${packagesToRemove}?`,
                    default: true
                });

                break;
            case CommandType.PUBLISH:
                const packagesToPublish = config.packages.join(', ');
                const publishMultiple = config.packages.length > 1;

                // ask if publish?
                questions.push({
                    type: 'confirm',
                    name: 'approved',
                    message: `Are you sure you want to 
                    publish ${publishMultiple ? 'following packages:' : 'package'} ${packagesToPublish}?`,
                    default: false
                });
                break;
        }
        return questions;
    }
}
