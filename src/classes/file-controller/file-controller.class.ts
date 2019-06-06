import fs, {MakeDirectoryOptions, PathLike, WriteFileOptions} from 'fs';
import {md5FileAsPromised as md5File} from 'md5-file/promise';
import {ncp, Options} from 'ncp';
import replace from 'replace';
import {promisify} from 'util';

export class FileController {
    protected accessHandler: (path: PathLike, mode?: number) => Promise<void>;
    protected writeHandler: (path: PathLike | number, data: any, options?: WriteFileOptions) => Promise<void>;
    protected mkdirHandler: (path: PathLike, options?: number | string | MakeDirectoryOptions) => Promise<void>;
    protected copyHandler: (source: string, destination: string, options?: Options) => Promise<void>;
    protected readHandler: (path: PathLike | number, options?: { encoding?: null; flag?: string; }) => Promise<Buffer>;
    protected replaceHandler: (options: {
        regex: string,
        replacement: string,
        paths: string[],
        recursive?: boolean,
        silent?: boolean,
    }) => Promise<void>;
    protected hashHandler: md5File;

    constructor() {
        this.accessHandler = promisify(fs.access);
        this.writeHandler = promisify(fs.writeFile);
        this.readHandler = promisify(fs.readFile);
        this.mkdirHandler = promisify(fs.mkdir);
        this.copyHandler = promisify(ncp);
        this.replaceHandler = promisify(replace);
        this.hashHandler = md5File;
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

    public async read(path: PathLike): Promise<Buffer> {
        try {
            await this.access(path);
        } catch (error) {
            return Promise.reject(new Error(`Read failed > ${error.message}`));
        }
        return this.readHandler(path);
    }

    public async access(path: PathLike) {
        try {
            await this.accessHandler(path, fs.constants.R_OK);
        } catch (error) {
            return Promise.reject(new Error(`Current user has no access rights to path ${path}`));
        }
    }

    public async replace(paths: string[], pattern: string, replacement: string) {
        return this.replaceHandler({
            paths: paths,
            regex: pattern,
            replacement: replacement,
            recursive: true,
            silent: true
        });
    }

    public async fileHash(path: string) {
        return this.hashHandler(path);
    }

    public async mkdir(path: PathLike) {
        return this.mkdirHandler(path);
    }
}
