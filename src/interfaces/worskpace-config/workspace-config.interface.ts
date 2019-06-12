import {IPackageConfig} from '../package-config';

export interface IWorkspaceConfig {
    rootDir: string;
    packageManager: string;
    packages: {
        [packageName: string]: {
            configHash: string;
            packageDir: string;
            packageConfig: IPackageConfig;
        }
    };
}
