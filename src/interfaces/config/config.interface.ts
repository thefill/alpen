import {ICommandConfig} from '../command-config';
import {IWorkspaceConfig} from '../worskpace-config';

export interface IConfig {
    workspacePath?: string;
    alpenPath: string;
    command: ICommandConfig;
    workspace: IWorkspaceConfig;
}
