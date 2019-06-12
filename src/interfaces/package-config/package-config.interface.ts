export interface IPackageConfig {
    name: string;
    version: string;
    scripts?: { [scriptName: string]: string };
    dependencies?: { [dependencyName: string]: string };
    devDependencies?: { [dependencyName: string]: string };
    peerDependencies?: { [dependencyName: string]: string };
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
