import chalk from 'chalk';
import execa from 'execa';
import Listr, {ListrOptions, ListrTask} from 'listr';
import * as path from 'path';
import {CommandType} from '../../enums/command-type';
import {Placeholder} from '../../enums/placeholder';
import {IConfig, IPackageConfig, ISimplifiedPackageConfig} from '../../interfaces';
import {FileController} from '../file-controller';

export class TaskController {
    public dependencyConflict: {};
    protected fileController: FileController;
    protected commandOutput: { [commandName: string]: any } = {};
    protected externalDependencies: {
        dependencies: { [key: string]: string };
        devDependencies: { [key: string]: string };
        peerDependencies: { [key: string]: string };
    };

    protected queueOptions: ListrOptions = {
        concurrent: false,
        exitOnError: true
        // TODO: Explore extra render features listed below
        // showSubtasks: true,
        // collapse: false,
        // clearOutput: false
    };

    constructor(fileController: FileController, queueOptions?: ListrOptions) {
        Object.assign(this.queueOptions, queueOptions);
        this.fileController = fileController;
    }

    public async processTasks(config: IConfig): Promise<void> {
        const tasks: ListrTask[] = this.getTasks(config);
        const queue = new Listr(tasks, this.queueOptions);
        await queue.run();

        // TODO: output commandOutput if loud mode
        // tslint:disable-next-line
        // console.log(this.commandOutput);

        // tslint:disable-next-line
        console.log('%s Processing finished', chalk.green.bold('DONE'));
    }

    public getTasks(config: IConfig): ListrTask[] {
        const tasks: Array<{
            title: string,
            callback: (
                config: IConfig,
                outputStore: { [commandName: string]: any }
            ) => Promise<any>,
            skip?: () => boolean;
        }> = [];

        switch (config.command.type) {
            case CommandType.INIT:
                tasks.push(
                    {title: 'Validate path', callback: this.checkWorkspaceDontExist.bind(this)},
                    {title: 'Copy template', callback: this.copyRootTemplate.bind(this)},
                    {title: 'Populate placeholders', callback: this.populatePlaceholders.bind(this)},
                    {title: 'Install dependencies', callback: this.installDependencies.bind(this)}
                );
                break;
            case CommandType.ADD:
                if (!this.dependencyConflict) {
                    tasks.push(
                        {title: 'Validate path', callback: this.checkPackageDontExist.bind(this)},
                        {title: 'Retrieve template', callback: this.installTemplate.bind(this)},
                        {title: 'Update workspace config', callback: this.updateWorkspaceConfigForAdd.bind(this)},
                        {title: 'Populate placeholders', callback: this.populatePlaceholders.bind(this)},
                        {title: 'Resolve dependencies', callback: this.resolveAddDependencies.bind(this)},
                        {
                            title: 'Install dependencies',
                            callback: this.installDependencies.bind(this),
                            skip: () => {
                                return !!this.dependencyConflict;
                            }
                        }
                    );
                } else {
                    // TODO: refactor? Seems ugly
                    tasks.push(
                        {title: 'Install dependencies', callback: this.installDependencies.bind(this)}
                    );
                }
                break;
            case CommandType.REMOVE:
                tasks.push(
                    {title: 'Resolve dependencies', callback: this.resolveRemoveDependencies.bind(this)},
                    {title: 'Install dependencies', callback: this.uninstallObsolateDependencies.bind(this)},
                    {title: 'Remove package files', callback: this.removePackageFiles.bind(this)},
                    {title: 'Update workspace config', callback: this.updateWorkspaceConfigForRemove.bind(this)}
                );
                break;
            case CommandType.PUBLISH:
                // TODO: for multiple
                tasks.push(
                    {title: 'Publish package', callback: this.publish.bind(this)}
                );
                break;
            case CommandType.TEST:
            case CommandType.BUILD:
            case CommandType.SERVE:
            case CommandType.RUN:
                // TODO: for multiple
                // for other commands:
                tasks.push(
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
    ): Promise<any> {

        try {
            const {stdout} = await execa(command, params, {cwd: executionPath});
            outputStore[commandId] = stdout;
            // const stream = spawn.stdout;
            // getStream(stdout).then((value) => {
            //
            // });
            // await spawn;
        } catch (e) {
            console.log(e);
        }

    }

    protected async checkWorkspaceDontExist(
        config: IConfig
    ): Promise<any> {
        try {
            await this.fileController.notExist(config.workspacePath as string);
        } catch (error) {
            throw new Error(`Path ${config.workspacePath} already exists`);
        }
    }

    protected async checkPackageDontExist(
        config: IConfig
    ): Promise<any> {
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
        } catch (error) {
            throw new Error(`Path ${packagePath} already exists`);
        }
    }

    protected async copyRootTemplate(
        config: IConfig
    ): Promise<void> {
        const from = path.resolve(config.alpenPath, 'templates/root/files');
        const to = path.resolve(
            config.workspacePath as string,
            config.command.path as string,
            config.command.workspace as string
        );

        try {
            // await this.fileController.copy(from, to);
            await this.fileController.copy(from, to);
        } catch (error) {
            return Promise.reject(new Error(`Failed while coping template files > ${error.message}`));
        }

        // TODO: preserve config with simplified dependencies in .alpenrc
    }

    protected async installTemplate(
        config: IConfig,
        outputStore: { [commandName: string]: any }
    ): Promise<any> {
        // - use package manager to install template as dev dep.
        await this.executeShellScript(
            'installTemplate',
            config.workspace.packageManager,
            ['install', '--save-dev'],
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
    ): Promise<any> {
        // replace placeholders
        let dirPath = '';
        let packageName = '';
        if (config.command.type === CommandType.INIT) {
            dirPath = path.resolve(config.workspacePath as string, config.command.path as string);
            packageName = config.command.workspace as string;
        }
        if (config.command.type === CommandType.ADD) {
            const packagePath = config.command.path ? config.command.path : config.workspace.rootDir;
            packageName = config.command.packages[0];
            dirPath = path.resolve(config.workspacePath as string, packagePath, packageName);
        }

        await this.fileController.replace(dirPath, Placeholder.ROOT_DIR, config.workspace.rootDir);
        await this.fileController.replace(dirPath, Placeholder.VERSION, config.workspacePackage.version);
        await this.fileController.replace(dirPath, Placeholder.AUTHOR, config.workspacePackage.author);
        await this.fileController.replace(
            dirPath,
            Placeholder.REPOSITORY_TYPE,
            config.workspacePackage.repository.type
        );
        await this.fileController.replace(dirPath, Placeholder.REPOSITORY_URL, config.workspacePackage.repository.url);
        await this.fileController.replace(dirPath, Placeholder.NAME, packageName);
        await this.fileController.replace(dirPath, Placeholder.PATH, config.command.path);
        await this.fileController.replace(dirPath, Placeholder.ALPEN_VERSION, config.alpenVersion);
        await this.fileController.replace(dirPath, Placeholder.PACKAGE_MANAGER, config.workspace.packageManager);
        await this.fileController.replace(
            dirPath,
            Placeholder.NODE_VERSION_RESTRICTION,
            config.workspacePackage.engines.node
        );

        await this.fileController.replace(
            dirPath,
            Placeholder.NODE_VERSION,
            config.nodeVersion
        );
        await this.fileController.replace(dirPath, Placeholder.LICENCE, config.workspacePackage.license);
        await this.fileController.replace(dirPath, Placeholder.PRIVATE, config.workspacePackage.private);
    }

    protected async updateWorkspaceConfigForAdd(
        config: IConfig,
        outputStore: { [commandName: string]: any }
    ): Promise<any> {
        // TODO: implement:
        const packageName = config.command.packages[0];
        const packagePath = path.join(
            config.command.path ? config.command.path : config.workspace.rootDir,
            packageName
        );
        const pathToPackageConfig = path.join(
            config.workspacePath as string,
            packagePath,
            'package.json'
        );

        try {
            let packageConfigContent: Buffer | string = await this.fileController.read(pathToPackageConfig);
            packageConfigContent = packageConfigContent.toString();
            const packageConfig: IPackageConfig = JSON.parse(packageConfigContent);

            this.externalDependencies.dependencies = packageConfig.dependencies ?
                packageConfig.dependencies : {};
            this.externalDependencies.devDependencies = packageConfig.devDependencies ?
                packageConfig.devDependencies : {};
            this.externalDependencies.peerDependencies = packageConfig.peerDependencies ?
                packageConfig.peerDependencies : {};

            const simplifiedPackageConfig: ISimplifiedPackageConfig = this.complexPackageConfigToSimple(packageConfig);
            await this.fileController.removeFile(pathToPackageConfig);

            config.workspace.packages[packageName] = {
                packageConfig: simplifiedPackageConfig,
                packageDir: packagePath
            };

            const workspaceConfig = JSON.stringify(config.workspace);
            const workspaceConfigPath = path.join(config.workspacePath as string, '.alpenrc');
            await this.fileController.write(workspaceConfigPath, workspaceConfig);
        } catch (error) {
            return Promise.reject(new Error(`Failed while updating workspace config > ${error.message}`));
        }
    }

    protected complexPackageConfigToSimple(packageConfig: IPackageConfig): ISimplifiedPackageConfig {
        const config = {
            dependencies: [] as string[],
            devDependencies: [] as string[],
            peerDependencies: [] as string[]
        };
        if (packageConfig.dependencies) {
            config.dependencies = Object.keys(packageConfig.dependencies).map((key) => {
                return key;
            });
        }
        if (packageConfig.devDependencies) {
            config.devDependencies = Object.keys(packageConfig.devDependencies).map((key) => {
                return key;
            });
        }
        if (packageConfig.peerDependencies) {
            config.peerDependencies = Object.keys(packageConfig.peerDependencies).map((key) => {
                return key;
            });
        }

        return Object.assign({}, packageConfig, config);
    }

    protected simplePackageConfigToComplex(
        packageConfig: ISimplifiedPackageConfig,
        workspacePackageConfig: IPackageConfig
    ): IPackageConfig {
        const config = {
            dependencies: {} as { [key: string]: string },
            devDependencies: {} as { [key: string]: string },
            peerDependencies: {} as { [key: string]: string }
        };
        if (workspacePackageConfig.dependencies) {
            Object.keys(workspacePackageConfig.dependencies).forEach((key) => {
                config.dependencies[key] = (
                    workspacePackageConfig.dependencies as { [key: string]: string }
                )[key];
            });
        }
        if (workspacePackageConfig.devDependencies) {
            Object.keys(workspacePackageConfig.devDependencies).forEach((key) => {
                config.devDependencies[key] = (
                    workspacePackageConfig.devDependencies as { [key: string]: string }
                )[key];
            });
        }
        if (workspacePackageConfig.peerDependencies) {
            Object.keys(workspacePackageConfig.peerDependencies).forEach((key) => {
                config.peerDependencies[key] = (
                    workspacePackageConfig.peerDependencies as { [key: string]: string }
                )[key];
            });
        }

        return Object.assign({}, packageConfig, config);
    }

    protected async resolveAddDependencies(
        config: IConfig,
        outputStore: { [commandName: string]: any }
    ): Promise<any> {

        // - get package dependencies and compare with existing (warn if conflict)
        // - get package dev dependencies and compare with existing (warn if conflict)
        // - get package peer dependencies and compare with existing (warn if conflict)
        // use: this.dependencyConflict and this.externalDependencies
        // TODO: implement
    }

    protected async diffDependencies(
        packages: any[]
    ): Promise<any> {
        // TODO: implement
        // get infinite amount of packages,
        // return merge, diff and conflicts with names
    }

    protected async installDependencies(
        config: IConfig,
        outputStore: { [commandName: string]: any }
    ): Promise<any> {
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
    ): Promise<any> {
        // TODO: implement
        // - get package dependencies and compare with existing (remove one that are not used by other)
        // - get package dev dependencies and compare with existing (remove one that are not used by
        // other)
        // ask if user wants to remove unused
    }

    protected async uninstallObsolateDependencies(
        config: IConfig,
        outputStore: { [commandName: string]: any }
    ): Promise<any> {
        // - uninstall removable packages
        // TODO: implement
    }

    protected async removePackageFiles(
        config: IConfig,
        outputStore: { [commandName: string]: any }
    ): Promise<any> {
        // - remove files
        // TODO: implement
    }

    protected async updateWorkspaceConfigForRemove(
        config: IConfig,
        outputStore: { [commandName: string]: any }
    ): Promise<any> {
        // - remove entry from config
        // TODO: implement
    }

    protected async publish(
        config: IConfig,
        outputStore: { [commandName: string]: any }
    ): Promise<any> {
        // TODO: implement
        // - copy package config file to package.json
        // - execute script with npm
        // await this.executeShellScript(
        //     'executePackageScript',
        //     config.workspace.packageManager,
        //     ['run'],
        //     config.workspacePath as string,
        //     outputStore
        // );
        // - remove package config file to package.json
    }

    protected async executePackageScript(
        config: IConfig,
        outputStore: { [commandName: string]: any }
    ): Promise<any> {
        // - execute script with npm
        await this.executeShellScript(
            'executePackageScript',
            config.workspace.packageManager,
            ['run'],
            config.workspacePath as string,
            outputStore
        );
    }

}

type TaskParamGetter = (config: IConfig) => Promise<{ command: string, params: string[] }>;
