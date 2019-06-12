import {CommandType} from '../../enums/command-type';
import {ExecutionMode} from '../../enums/execution-mode';

export interface ICommandConfig {
    type: CommandType;
    currentDir: string;
    command?: undefined;
    mode: ExecutionMode;
    noPrompts: boolean;
    packages: string[];
    workspace?: string;
    template?: string;
    path: string;
    approved?: boolean;
}
