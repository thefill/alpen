import chalk from 'chalk';
import execa from 'execa';
import getStream from 'get-stream';
import Listr, {ListrOptions, ListrTask} from 'listr';
import * as path from 'path';
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

        // TODO: output commandOutput if loud mode
        // tslint:disable-next-line
        // console.log(this.commandOutput);

        // tslint:disable-next-line
        console.log('%s Processing finished', chalk.green.bold('DONE'));
    }

    public getTasks(config: IConfig): ListrTask[]{
        const tasks: Array<{
            title: string,
            callback: (
                config: IConfig,
                outputStore: { [commandName: string]: any }
            ) => Promise<any>
        }> = [];

        switch (config.command.type){
            case CommandType.INIT:
                tasks.push(
                    {title: 'Validate path', callback: this.checkWorkspaceDontExist.bind(this)},
                    {title: 'Copy template', callback: this.copyRootTemplate.bind(this)},
                    {title: 'Populate placeholders', callback: this.populatePlaceholders.bind(this)},
                    {title: 'Install dependencies', callback: this.installDependencies.bind(this)}
                );
                break;
            case CommandType.ADD:
                tasks.push(
                    {title: 'Validate path', callback: this.checkPackageDontExist.bind(this)},
                    {title: 'Retrieve template', callback: this.installTemplate.bind(this)},
                    {title: 'Populate placeholders', callback: this.populatePlaceholders.bind(this)},
                    {title: 'Update workspace config', callback: this.updateWorskpaceConfigForAdd.bind(this)},
                    {title: 'Resolve dependencies', callback: this.resolveAddDependencies.bind(this)},
                    {title: 'Install dependencies', callback: this.installDependencies.bind(this)}
                );
                break;
            case CommandType.REMOVE:
                tasks.push(
                    {title: 'Resolve dependencies', callback: this.resolveRemoveDependencies.bind(this)},
                    {title: 'Install dependencies', callback: this.uninstallObsolateDependencies.bind(this)},
                    {title: 'Remove package files', callback: this.removePackageFiles.bind(this)},
                    {title: 'Update workspace config', callback: this.updateWorskpaceConfigForRemove.bind(this)}
                );
                break;
            case CommandType.PUBLISH:
                tasks.push(
                    {title: 'Retrieve package config', callback: this.getPackageConfig.bind(this)},
                    {title: 'Setup package', callback: this.setupPackageForPublish.bind(this)},
                    {title: 'Execute script', callback: this.executePackageScript.bind(this)},
                    {title: 'Cleanup package', callback: this.cleanupPackageForPublish.bind(this)}
                );
                break;
            case CommandType.TEST:
            case CommandType.BUILD:
            case CommandType.SERVE:
            case CommandType.RUN:
                // for other commands:
                tasks.push(
                    {title: 'Retrieve package config', callback: this.getPackageConfig.bind(this)},
                    {title: 'Execute script', callback: this.executePackageScript.bind(this)}
                );
                break;
            default:
                throw new Error('Unknown command');
        }

        // convert inner task to Listr task
        return tasks.map((task) => {
            return {
                title: task.title,
                task: async () => {
                    await task.callback(config, this.commandOutput);
                }
            };
        });
    }

    protected async executeShellScript(
        commandId: string,
        command: string,
        params: string[],
        executionPath: string,
        outputStore: { [commandName: string]: any }
    ): Promise<any>{
        const spawn = execa(command, params, {cwd: executionPath});
        const stream = spawn.stdout;

        getStream(stream).then((value) => {
            outputStore[commandId] = value;
        });

        await spawn;
    }

    protected async checkWorkspaceDontExist(
        config: IConfig
    ): Promise<any>{
        try {
            await this.fileController.notExist(config.workspacePath as string);
        } catch (error){
            throw new Error(`Path ${config.workspacePath} already exists`);
        }
    }

    protected async checkPackageDontExist(
        config: IConfig
    ): Promise<any>{
        // check if dir exist
        const packagePath = path.resolve(
            config.command.path as string,
            config.command.packages[0] as string
        );
        const fullPath = path.resolve(
            config.workspacePath as string,
            packagePath
        );

        try {
            await this.fileController.notExist(fullPath);
        } catch (error){
            throw new Error(`Path ${packagePath} already exists`);
        }
    }

    protected async copyRootTemplate(
        config: IConfig
    ): Promise<void>{
        const from = path.resolve(config.alpenPath, 'templates/root/files');
        const to = path.resolve(
            config.workspacePath as string,
            config.command.path as string,
            config.command.workspace as string
        );

        try {
            // await this.fileController.copy(from, to);
            await this.fileController.copy(
                '/Users/fill/Documents/alpen/templates/root/files',
                '/Users/fill/Documents/test-alpen/test'
            );
        } catch (error){
            return Promise.reject(new Error(`Failed while coping template files > ${error.message}`));
        }
    }

    protected async installTemplate(
        config: IConfig,
        outputStore: { [commandName: string]: any }
    ): Promise<any>{
        // - use package manager to install template as dev dep.
        await this.executeShellScript(
            'installTemplate',
            config.workspace.packageManager,
            ['install'],
            config.workspacePath as string,
            outputStore
        );

        // - copy template 'file' dir content to specified package location
        const from = path.resolve(config.workspacePath as string, `node_modules/${config.command.packages[0]}/files`);
        const packagePath = config.command.path ? config.command.path : config.workspace.rootDir;
        const to = path.resolve(config.workspacePath as string, packagePath, config.command.packages[0]);
        await this.fileController.copy(from, to);
    }

    protected async populatePlaceholders(
        config: IConfig,
        outputStore: { [commandName: string]: any }
    ): Promise<any>{
        // replace placeholders
        let dirPath = '';
        if (config.command.type === CommandType.INIT){
            dirPath = path.resolve(config.workspacePath as string, config.command.path as string);
        }
        if (config.command.type === CommandType.ADD){
            const packagePath = config.command.path ? config.command.path : config.workspace.rootDir;
            dirPath = path.resolve(config.workspacePath as string, packagePath, config.command.packages[0]);
        }
        // TODO: do for all placeholders
        await this.fileController.replace(dirPath, '{{ROOT_DIR}}', config.workspace.rootDir);
    }

    protected async updateWorskpaceConfigForAdd(
        config: IConfig,
        outputStore: { [commandName: string]: any }
    ): Promise<any>{
        // - keep hash of alpen.package.json
        // - keep package name, dir and if publishable
        // TODO: implement
    }

    protected async resolveAddDependencies(
        config: IConfig,
        outputStore: { [commandName: string]: any }
    ): Promise<any>{
        // - get package dependencies and compare with existing (warn if conflict)
        // - get package dev dependencies and compare with existing (warn if conflict)
        // TODO: implement
    }

    protected async installDependencies(
        config: IConfig,
        outputStore: { [commandName: string]: any }
    ): Promise<any>{
        // install dependencies
        await this.executeShellScript(
            'installDependencies',
            config.workspace.packageManager,
            ['install'],
            config.workspacePath as string,
            outputStore
        );
    }

    protected async resolveRemoveDependencies(
        config: IConfig,
        outputStore: { [commandName: string]: any }
    ): Promise<any>{
        // - get package dependencies and compare with existing (remove one that are not used by other)
        // - get package dev dependencies and compare with existing (remove one that are not used by
        // other)
        // TODO: implement
    }

    protected async uninstallObsolateDependencies(
        config: IConfig,
        outputStore: { [commandName: string]: any }
    ): Promise<any>{
        // - uninstall removable packages
        // TODO: implement
    }

    protected async removePackageFiles(
        config: IConfig,
        outputStore: { [commandName: string]: any }
    ): Promise<any>{
        // - remove files
        // TODO: implement
    }

    protected async updateWorskpaceConfigForRemove(
        config: IConfig,
        outputStore: { [commandName: string]: any }
    ): Promise<any>{
        // - remove entry from config
        // TODO: implement
    }

    protected async setupPackageForPublish(
        config: IConfig,
        outputStore: { [commandName: string]: any }
    ): Promise<any>{
        // - copy package config file to package.json
        // TODO: implement
    }

    protected async executePackageScript(
        config: IConfig,
        outputStore: { [commandName: string]: any }
    ): Promise<any>{
        // - execute script with npm
        // - execute script with npm
        // TODO: implement
    }

    protected async cleanupPackageForPublish(
        config: IConfig,
        outputStore: { [commandName: string]: any }
    ): Promise<any>{
        // TODO: implement
    }

    protected async getPackageConfig(
        config: IConfig,
        outputStore: { [commandName: string]: any }
    ): Promise<any>{
        // - if package have definition proceed
        // - if package have definition proceed
        // TODO: implement
    }

}

type TaskParamGetter = (config: IConfig) => Promise<{ command: string, params: string[] }>;
