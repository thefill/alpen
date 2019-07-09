import {ISimplifiedPackageConfig} from '../simplified-package-config';

export interface IWorkspaceConfig {
    rootDir: string;
    packageManager: string;
    packages: {
        [packageName: string]: {
            packageDir: string;
            packageConfig: ISimplifiedPackageConfig;
        }
    };
}
