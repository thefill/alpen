import chalk from 'chalk';
import execa from 'execa';
import Listr, {ListrOptions, ListrTask} from 'listr';
import {CommandType} from '../../enums/command-type';
import {IConfig} from '../../interfaces';
import {FileController} from '../file-controller';

export class TaskController {
    protected fileController: FileController;

    protected queueOptions: ListrOptions = {
        concurrent: false,
        exitOnError: false
        // TODO: Explore extra render features listed below
        // showSubtasks: true,
        // collapse: false,
        // clearOutput: false
    };

    constructor(fileController: FileController, queueOptions?: ListrOptions) {
        Object.assign(this.queueOptions, queueOptions);
        this.fileController = fileController;
    }

    public async processTasks(tasks: ListrTask[]): Promise<void> {
        const queue = new Listr(tasks, this.queueOptions);
        await queue.run();

        // tslint:disable-next-line
        console.log('%s Processing result:', chalk.green.bold('DONE'));
    }

    public getTasks(config: IConfig): ListrTask[] {
        // TODO: implement
        let tasks;

        switch (config.command.type) {
            case CommandType.INIT:
                tasks = [
                    {
                        title: 'Execa test 1',
                        task: async () => {
                            const {stdout} = await execa('npm', ['--help']);
                            // tslint:disable-next-line
                            console.log(stdout);
                        }
                    },
                    // check if dir dont exist
                    {
                        title: 'Validate path',
                        task: () => Promise.resolve('Foo')
                    },
                    // copy templates/root dir
                    {
                        title: 'Copy template',
                        task: () => Promise.resolve('Foo')
                    },
                    // replace placeholders
                    {
                        title: 'Populate placeholders',
                        task: () => Promise.resolve('Foo')
                    },
                    // install dependencies
                    {
                        title: 'Install dependencies',
                        task: () => Promise.resolve('Foo')
                    }
                ];
                break;
            case CommandType.ADD:
                // for add:
                tasks = [
                    // check if dir dont exist
                    {
                        title: 'Validate path',
                        task: () => Promise.resolve('Foo')
                    },
                    // - use package manager to install template as dev dep.
                    // - copy template 'file' dir content to specified package location
                    {
                        title: 'Retrieve template',
                        task: () => Promise.resolve('Foo')
                    },
                    // replace placeholders
                    // - replace in whole dir placeholders
                    {
                        title: 'Populate placeholders',
                        task: () => Promise.resolve('Foo')
                    },
                    // - keep hash of alpen.package.json
                    // - keep package name, dir and if publishable
                    {
                        title: 'Update workspace config',
                        task: () => Promise.resolve('Foo')
                    },
                    // - get package dependencies and compare with existing (warn if conflict)
                    // - get package dev dependencies and compare with existing (warn if conflict)
                    {
                        title: 'Resolve dependencies',
                        task: () => Promise.resolve('Foo')
                    },
                    // install dependencies
                    // - install dependencies and save
                    {
                        title: 'Install dependencies',
                        task: () => Promise.resolve('Foo')
                    }
                ];
                break;
            case CommandType.REMOVE:
                // TODO: implement later: we need to keep track of dependencies per package
                // for remove:
                tasks = [
                    // - get package dependencies and compare with existing (remove one that are not used by other)
                    // - get package dev dependencies and compare with existing (remove one that are not used by other)
                    {
                        title: 'Resolve dependencies',
                        task: () => Promise.resolve('Foo')
                    },
                    // - uninstall removable packages
                    {
                        title: 'Uninstall unused dependencies',
                        task: () => Promise.resolve('Foo')
                    },
                    // - remove files
                    {
                        title: 'Remove package files',
                        task: () => Promise.resolve('Foo')
                    },
                    // - remove entry from config
                    {
                        title: 'Update workspace config',
                        task: () => Promise.resolve('Foo')
                    },
                ];
                break;
            case CommandType.PUBLISH:
                // for publish:
                tasks = [
                    // - copy package config file to package.json
                    {
                        title: 'Setup package',
                        task: () => Promise.resolve('Foo')
                    },
                    // - npm publish
                    {
                        title: 'Publish package',
                        task: () => Promise.resolve('Foo')
                    },
                    // - remove package.json
                    {
                        title: 'Cleanup package',
                        task: () => Promise.resolve('Foo')
                    }
                ];
                break;
            case CommandType.TEST:
                break;
            case CommandType.BUILD:
                break;
            case CommandType.SERVE:
                break;
            case CommandType.RUN:
                // for other commands:
                tasks = [
                    // - if package have definition proceed
                    {
                        title: 'Retrieve package config',
                        task: () => Promise.resolve('Foo')
                    },
                    // - execute script with npm
                    {
                        title: 'Execute script',
                        task: () => Promise.resolve('Foo')
                    },
                ];
                break;
            default:
                throw new Error('Unknown command');
        }

        return tasks;
    }
}
