import fs, {MakeDirectoryOptions, PathLike, WriteFileOptions} from 'fs';
import {ncp, Options} from 'ncp';
import {promisify} from 'util';

export class FileController {
    protected accessHandler: (path: PathLike, mode?: number) => Promise<void>;
    protected writeHandler: (path: PathLike | number, data: any, options?: WriteFileOptions) => Promise<void>;
    protected mkdirHandler: (path: PathLike, options?: number | string | MakeDirectoryOptions) => Promise<void>;
    protected copyHandler: (source: string, destination: string, options?: Options) => Promise<void>;

    constructor() {
        this.accessHandler = promisify(fs.access);
        this.writeHandler = promisify(fs.writeFile);
        this.mkdirHandler = promisify(fs.mkdir);
        this.copyHandler = promisify(ncp);
    }

    public async copy(from: string, to: string): Promise<void> {
        try {
            await this.access(from);
            await this.access(to);
        } catch (error) {
            return Promise.reject(new Error(`Copy failed > ${error.message}`));
        }
        return this.copyHandler(from, to, {clobber: false});
    }

    public async write(path: PathLike, data: any): Promise<void> {
        try {
            await this.access(path);
        } catch (error) {
            return Promise.reject(new Error(`Write failed > ${error.message}`));
        }
        return this.writeHandler(path, data, 'utf8');
    }

    public async access(path: PathLike) {
        try {
            await this.accessHandler(path, fs.constants.R_OK);
        } catch (error) {
            return Promise.reject(new Error(`Current user has no access rights to path ${path}`));
        }
    }

    public async mkdir(path: PathLike) {
        return this.mkdirHandler(path);
    }
}
