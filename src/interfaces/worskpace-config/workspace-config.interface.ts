export interface IWorkspaceConfig {
    rootDir: string;
    packageManager: string;
    packages: {
        [packageName: string]: {
            dependencyHash: string;
            packageDir: string;
            packageConfig: {
                name: string;
                version: string;
                scripts?: { [scriptName: string]: string };
                dependencies?: string[];
                devDependencies?: string[];
                peerDependencies?: string[];
                engines?: {
                    node: string
                };
                private?: boolean;
                author?: string;
                repository?: {
                    type: string;
                    url: string;
                };
                license?: string;
            };
        }
    };
}
