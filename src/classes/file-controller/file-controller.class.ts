import * as findUp from 'find-up';
import fs, {MakeDirectoryOptions, PathLike, Stats, WriteFileOptions} from 'fs';
import {md5FileAsPromised as md5File} from 'md5-file/promise';
import mkdirp from 'mkdirp';
import {ncp, Options} from 'ncp';
import replace from 'replace';
import {promisify} from 'util';

export class FileController {
    protected statsHandler: (path: PathLike) => Promise<Stats>;
    protected accessHandler: (path: PathLike, mode?: number) => Promise<void>;
    protected writeHandler: (path: PathLike | number, data: any, options?: WriteFileOptions) => Promise<void>;
    protected copyHandler: (source: string, destination: string, options?: Options) => Promise<void>;
    protected readHandler: (path: PathLike | number, options?: { encoding?: null; flag?: string; }) => Promise<Buffer>;
    protected findClosestHandler: (...args: any) => Promise<string | undefined>;
    protected replaceHandler: (options: {
        regex: string,
        replacement: string,
        paths: string[],
        recursive?: boolean,
        silent?: boolean,
    }) => Promise<void>;
    protected hashHandler: md5File;
    protected mkdirHandler: (path: PathLike, options?: number | string | MakeDirectoryOptions) => Promise<void>;

    constructor() {
        this.statsHandler = promisify(fs.stat);
        this.accessHandler = promisify(fs.access);
        this.writeHandler = promisify(fs.writeFile);
        this.readHandler = promisify(fs.readFile);
        this.copyHandler = promisify(ncp);
        this.replaceHandler = promisify(replace);
        this.hashHandler = md5File;
        this.findClosestHandler = findUp.default;
        this.mkdirHandler = promisify(mkdirp);
    }

    public async copy(from: string, to: string): Promise<void> {
        try {
            await this.access(from);
        } catch (error) {
            throw new Error(`Copy failed > ${error.message}`);
        }

        try {
            await this.access(to);
        } catch (error) {
            // we dont want destination to exist
            return this.copyHandler(from, to, {clobber: false});
        }

        throw new Error(`Copy failed > destination dir exists`);
    }

    public async write(path: PathLike, data: any): Promise<void> {
        try {
            await this.access(path);
        } catch (error) {
            throw new Error(`Write failed > ${error.message}`);
        }
        return this.writeHandler(path, data, 'utf8');
    }

    public async read(path: PathLike): Promise<Buffer> {
        try {
            await this.access(path);
        } catch (error) {
            throw new Error(`Read failed > ${error.message}`);
        }
        return this.readHandler(path);
    }

    public async access(path: PathLike) {
        try {
            // tslint:disable-next-line
            await this.accessHandler(path, fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK);
        } catch (error) {
            throw new Error(`Current user has no access rights to path ${path}`);
        }
    }

    public async exist(path: PathLike) {
        try {
            // tslint:disable-next-line
            await this.statsHandler(path);
        } catch (error) {
            throw new Error(`Path ${path} dont exist`);
        }
    }

    public async notExist(path: PathLike) {
        try {
            // tslint:disable-next-line
            await this.statsHandler(path);
        } catch (error) {
            return Promise.resolve();
        }
        throw new Error(`Path ${path} dont exist`);
    }

    public async findClosestUp(path: string | string[]): Promise<string | undefined> {
        return await this.findClosestHandler(path);
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
