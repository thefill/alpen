export interface ISimplifiedPackageConfig {
    name: string;
    version: string;
    scripts?: { [scriptName: string]: string };
    dependencies?: string[];
    devDependencies?: string[];
    peerDependencies?: string[];
    engines: {
        node: string
    };
    private: boolean;
    author: string;
    repository: {
        type: string;
        url: string;
    };
    license: string;
}
