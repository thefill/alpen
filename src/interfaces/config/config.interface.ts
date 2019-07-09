import {ICommandConfig} from '../command-config';
import {IPackageConfig} from '../package-config';
import {IWorkspaceConfig} from '../worskpace-config';

export interface IConfig {
    workspacePath?: string;
    alpenPath: string;
    alpenVersion: string;
    nodeVersion: string;
    command: ICommandConfig;
    workspace: IWorkspaceConfig;
    workspacePackage: IPackageConfig;
}
