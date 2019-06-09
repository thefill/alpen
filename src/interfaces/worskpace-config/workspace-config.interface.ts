export interface IWorkspaceConfig {
    rootDir: string;
    packageManager: string;
    packages: {
        [packageName: string]: {
            configHash: string;
            packageDir: string;
        }
    };
}
