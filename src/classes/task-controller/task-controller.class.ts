import chalk from 'chalk';
import execa from 'execa';
import getStream from 'get-stream';
import Listr, {ListrOptions, ListrTask} from 'listr';
import {CommandType} from '../../enums/command-type';
import {IConfig} from '../../interfaces';
import {FileController} from '../file-controller';

export class TaskController {
    protected fileController: FileController;
    protected commandOutput: { [commandName: string]: any } = {};

    protected queueOptions: ListrOptions = {
        concurrent: false,
        exitOnError: true
        // TODO: Explore extra render features listed below
        // showSubtasks: true,
        // collapse: false,
        // clearOutput: false
    };

    constructor(fileController: FileController, queueOptions?: ListrOptions){
        Object.assign(this.queueOptions, queueOptions);
        this.fileController = fileController;
    }

    public async processTasks(tasks: ListrTask[]): Promise<void>{
        const queue = new Listr(tasks, this.queueOptions);
        await queue.run();

        // tslint:disable-next-line
        console.log(this.commandOutput);

        // tslint:disable-next-line
        console.log('%s Processing result:', chalk.green.bold('DONE'));
    }

    public getTasks(config: IConfig): ListrTask[]{
        // TODO: implement
        let tasks;

        switch (config.command.type){
            case CommandType.INIT:
                tasks = [
                    {
                        // check if dir dont exist
                        title: 'Validate path',
                        task: this.checkPathDontExist(config, this.commandOutput)
                    },
                    {
                        // copy templates/root dir
                        title: 'Copy template',
                        task: this.copyRootTemplate(config, this.commandOutput)
                    },
                    {
                        // replace placeholders
                        title: 'Populate placeholders',
                        task: this.populatePlaceholders(config, this.commandOutput)
                    },
                    {
                        // install dependencies
                        title: 'Install dependencies',
                        task: this.installDependencies(config, this.commandOutput)
                    }
                ];
                break;
            case CommandType.ADD:
                // for add:
                tasks = [
                    {
                        // check if dir dont exist
                        title: 'Validate path',
                        task: this.checkPathDontExist(config, this.commandOutput)
                    },
                    {
                        // - use package manager to install template as dev dep.
                        // - copy template 'file' dir content to specified package location
                        title: 'Retrieve template',
                        task: this.installTemplate(config, this.commandOutput)
                    },
                    {
                        // replace placeholders
                        title: 'Populate placeholders',
                        task: this.populatePlaceholders(config, this.commandOutput)
                    },
                    {
                        // - keep hash of alpen.package.json
                        // - keep package name, dir and if publishable
                        title: 'Update workspace config',
                        task: this.updateWorskpaceConfigForAdd(config, this.commandOutput)
                    },
                    {
                        // - get package dependencies and compare with existing (warn if conflict)
                        // - get package dev dependencies and compare with existing (warn if conflict)
                        title: 'Resolve dependencies',
                        task: this.resolveAddDependencies(config, this.commandOutput)
                    },
                    {
                        // install dependencies
                        title: 'Install dependencies',
                        task: this.installDependencies(config, this.commandOutput)
                    }
                ];
                break;
            case CommandType.REMOVE:
                // for remove:
                tasks = [
                    {
                        // - get package dependencies and compare with existing (remove one that are not used by other)
                        // - get package dev dependencies and compare with existing (remove one that are not used by
                        // other)
                        title: 'Resolve dependencies',
                        task: this.resolveRemoveDependencies(config, this.commandOutput)
                    },
                    {
                        // - uninstall removable packages
                        title: 'Install dependencies',
                        task: this.uninstallObsolateDependencies(config, this.commandOutput)
                    },
                    {
                        // - remove files
                        title: 'Remove package files',
                        task: this.removePackageFiles(config, this.commandOutput)
                    },
                    {
                        // - remove entry from config
                        title: 'Update workspace config',
                        task: this.updateWorskpaceConfigForRemove(config, this.commandOutput)
                    }
                ];
                break;
            case CommandType.PUBLISH:
                // for publish:
                tasks = [
                    {
                        // - if package have definition proceed
                        title: 'Retrieve package config',
                        task: this.getPackageConfig(config, this.commandOutput)
                    },
                    {
                        // - copy package config file to package.json
                        title: 'Setup package',
                        task: this.setupPackageForPublish(config, this.commandOutput)
                    },
                    {
                        // - execute script with npm
                        title: 'Execute script',
                        task: this.executePackageScript(config, this.commandOutput)
                    },
                    {
                        // - remove package.json
                        title: 'Cleanup package',
                        task: this.cleanupPackageForPublish(config, this.commandOutput)
                    }
                ];
                break;
            case CommandType.TEST:
            case CommandType.BUILD:
            case CommandType.SERVE:
            case CommandType.RUN:
                // for other commands:
                tasks = [
                    {
                        // - if package have definition proceed
                        title: 'Retrieve package config',
                        task: this.getPackageConfig(config, this.commandOutput)
                    },
                    {
                        // - execute script with npm
                        title: 'Execute script',
                        task: this.executePackageScript(config, this.commandOutput)
                    }
                ];
                break;
            default:
                throw new Error('Unknown command');
        }

        return tasks;
    }

    protected async executeShellScript(
        commandId: string,
        command: string,
        params: string[],
        outputStore: { [commandName: string]: any }
    ): Promise<any>{
        const spawn = execa(command, params);
        const stream = spawn.stdout;

        getStream(stream).then((value) => {
            outputStore[commandId] = value;
        });

        await spawn;
    }

    protected checkPathDontExist(
        config: IConfig,
        outputStore: { [commandName: string]: any }
    ): () => Promise<any>{
        return async () => {
            // const {command, params} = await getParams(config);
            // await this.executeShellScript('commandId', command, params, outputStore);
        };
    }

    protected copyRootTemplate(
        config: IConfig,
        outputStore: { [commandName: string]: any }
    ): () => Promise<any>{
        return async () => {
            // const {command, params} = await getParams(config);
            // await this.executeShellScript('commandId', command, params, outputStore);
        };
    }

    protected installTemplate(
        config: IConfig,
        outputStore: { [commandName: string]: any }
    ): () => Promise<any>{
        return async () => {
            // const {command, params} = await getParams(config);
            // await this.executeShellScript('commandId', command, params, outputStore);
        };
    }

    protected populatePlaceholders(
        config: IConfig,
        outputStore: { [commandName: string]: any }
    ): () => Promise<any>{
        return async () => {
            // const {command, params} = await getParams(config);
            // await this.executeShellScript('commandId', command, params, outputStore);
        };
    }

    protected updateWorskpaceConfigForAdd(
        config: IConfig,
        outputStore: { [commandName: string]: any }
    ): () => Promise<any>{
        return async () => {
            // const {command, params} = await getParams(config);
            // await this.executeShellScript('commandId', command, params, outputStore);
        };
    }

    protected resolveAddDependencies(
        config: IConfig,
        outputStore: { [commandName: string]: any }
    ): () => Promise<any>{
        return async () => {
            // const {command, params} = await getParams(config);
            // await this.executeShellScript('commandId', command, params, outputStore);
        };
    }

    protected installDependencies(
        config: IConfig,
        outputStore: { [commandName: string]: any }
    ): () => Promise<any>{
        return async () => {
            // const {command, params} = await getParams(config);
            // await this.executeShellScript('commandId', command, params, outputStore);
        };
    }

    protected resolveRemoveDependencies(
        config: IConfig,
        outputStore: { [commandName: string]: any }
    ): () => Promise<any>{
        return async () => {
            // const {command, params} = await getParams(config);
            // await this.executeShellScript('commandId', command, params, outputStore);
        };
    }

    protected uninstallObsolateDependencies(
        config: IConfig,
        outputStore: { [commandName: string]: any }
    ): () => Promise<any>{
        return async () => {
            // const {command, params} = await getParams(config);
            // await this.executeShellScript('commandId', command, params, outputStore);
        };
    }

    protected removePackageFiles(
        config: IConfig,
        outputStore: { [commandName: string]: any }
    ): () => Promise<any>{
        return async () => {
            // const {command, params} = await getParams(config);
            // await this.executeShellScript('commandId', command, params, outputStore);
        };
    }

    protected updateWorskpaceConfigForRemove(
        config: IConfig,
        outputStore: { [commandName: string]: any }
    ): () => Promise<any>{
        return async () => {
            // const {command, params} = await getParams(config);
            // await this.executeShellScript('commandId', command, params, outputStore);
        };
    }

    protected setupPackageForPublish(
        config: IConfig,
        outputStore: { [commandName: string]: any }
    ): () => Promise<any>{
        return async () => {
            // const {command, params} = await getParams(config);
            // await this.executeShellScript('commandId', command, params, outputStore);
        };
    }

    protected executePackageScript(
        config: IConfig,
        outputStore: { [commandName: string]: any }
    ): () => Promise<any>{
        return async () => {
            // const {command, params} = await getParams(config);
            // await this.executeShellScript('commandId', command, params, outputStore);
        };
    }

    protected cleanupPackageForPublish(
        config: IConfig,
        outputStore: { [commandName: string]: any }
    ): () => Promise<any>{
        return async () => {
            // const {command, params} = await getParams(config);
            // await this.executeShellScript('commandId', command, params, outputStore);
        };
    }

    protected getPackageConfig(
        config: IConfig,
        outputStore: { [commandName: string]: any }
    ): () => Promise<any>{
        return async () => {
            // const {command, params} = await getParams(config);
            // await this.executeShellScript('commandId', command, params, outputStore);
        };
    }

}

type TaskParamGetter = (config: IConfig) => Promise<{ command: string, params: string[] }>;
