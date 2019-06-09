import {ICommandConfig} from '../command-config';
import {IWorkspaceConfig} from '../worskpace-config';

export interface IConfig {
    workspacePath?: string;
    command: ICommandConfig;
    workspace: IWorkspaceConfig;
}
