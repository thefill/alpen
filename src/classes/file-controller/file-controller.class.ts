import * as findUp from 'find-up';
import fs, {MakeDirectoryOptions, PathLike, Stats, WriteFileOptions} from 'fs';
import {md5FileAsPromised as md5File} from 'md5-file/promise';
import mkdirp from 'mkdirp';
import {ncp, Options} from 'ncp';
import * as path from 'path';
import {promisify} from 'util';

export class FileController {
    protected statsHandler: (path: PathLike) => Promise<Stats>;
    protected accessHandler: (path: PathLike, mode?: number) => Promise<void>;
    protected writeHandler: (path: PathLike | number, data: any, options?: WriteFileOptions) => Promise<void>;
    protected copyHandler: (source: string, destination: string, options?: Options) => Promise<void>;
    protected readHandler: (path: PathLike | number, options?: { encoding?: null; flag?: string; }) => Promise<Buffer>;
    protected findClosestHandler: (...args: any) => Promise<string | undefined>;
    protected hashHandler: md5File;
    protected mkdirHandler: (path: PathLike, options?: number | string | MakeDirectoryOptions) => Promise<void>;
    protected removeHandler: (path: PathLike) => Promise<void>;

    constructor() {
        this.statsHandler = promisify(fs.stat);
        this.accessHandler = promisify(fs.access);
        this.writeHandler = promisify(fs.writeFile);
        this.readHandler = promisify(fs.readFile);
        this.removeHandler = promisify(fs.unlink);
        this.copyHandler = promisify(ncp);
        this.hashHandler = md5File;
        this.findClosestHandler = findUp.default;
        this.mkdirHandler = promisify(mkdirp);
    }

    public async copy(fromPath: string, toPath: string): Promise<void> {
        try {
            await this.access(fromPath);
        } catch (error) {
            throw new Error(`Copy failed > ${error.message}`);
        }

        try {
            await this.access(toPath);
        } catch (error) {
            // we dont want destination to exist
            return this.copyHandler(fromPath, toPath, {clobber: false});
        }

        throw new Error(`Copy failed > destination dir exists`);
    }

    public async write(filePath: PathLike, data: any): Promise<void> {
        try {
            await this.access(filePath);
        } catch (error) {
            throw new Error(`Write failed > ${error.message}`);
        }
        return this.writeHandler(filePath, data, 'utf8');
    }

    public async removeFile(filePath: PathLike): Promise<void> {
        try {
            await this.removeFile(filePath);
        } catch (error) {
            throw new Error(`File removal failed > ${error.message}`);
        }
    }

    public async read(filePath: PathLike): Promise<Buffer> {
        try {
            await this.access(filePath);
        } catch (error) {
            throw new Error(`Read failed > ${error.message}`);
        }
        return this.readHandler(filePath);
    }

    public async access(pathToCheck: PathLike) {
        try {
            // tslint:disable-next-line
            await this.accessHandler(pathToCheck, fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK);
        } catch (error) {
            throw new Error(`Current user has no access rights to path ${pathToCheck}`);
        }
    }

    public async exist(pathToCheck: PathLike) {
        try {
            await this.statsHandler(pathToCheck);
        } catch (error) {
            throw new Error(`Path ${pathToCheck} dont exist or no access`);
        }
    }

    public async notExist(pathToCheck: PathLike) {
        try {
            await this.statsHandler(pathToCheck);
        } catch (error) {
            return Promise.resolve();
        }
        throw new Error(`Path ${pathToCheck} dont exist or no access`);
    }

    public async findClosestUp(pathToCheck: string | string[]): Promise<string | undefined> {
        return await this.findClosestHandler(pathToCheck);
    }

    public async replace(dirPath: string, pattern: string, replacement: string | number | boolean) {
        console.log('replace for', replacement);
        replacement = typeof replacement === 'string' ? replacement : replacement.toString();
        const replaceProcessor = async (filePath) => {
            let content: Buffer | string = await this.read(filePath);
            content = content.toString().replace(pattern, replacement as string);
            await this.write(filePath, content);
        };

        try {
            const allFilePaths = await this.listAllFiles(dirPath);
            await this.processMultiple(replaceProcessor, allFilePaths);
        } catch (error) {
            throw new Error(`Error while replacing pattern in path ${dirPath}`);
        }
    }

    public async processMultiple(processor: (value) => Promise<any>, values: any[]) {
        const requests = values.map((value) => {
            return processor(value);
        });

        await Promise.all(requests);
    }

    public async listAllFiles(dirPath: string): Promise<string[]> {
        console.log(`checking dir ${dirPath}`);
        const readdir = promisify(fs.readdir);

        let dirMembers: string[];
        try {
            dirMembers = await readdir(dirPath);
        } catch (error) {
            throw new Error(`Unable to retrieve list of files from path ${dirPath} > ${error.message}`);
        }

        if (!dirMembers.length) {
            return [];
        }

        dirMembers = dirMembers.map((dirMember) => {
            return path.join(dirPath, dirMember);
        });

        const dirs: string[] = [];
        const files: string[] = [];
        const getDirMembers = async (memberPath) => {
            let stat;
            try {
                stat = await this.statsHandler(memberPath);
            } catch (error) {
                throw new Error(`Error while listing all files > ${error.message}`);
            }
            if (stat.isDirectory()) {
                // tslint:disable-next-line
                console.log(`dir > ${memberPath}`);
                dirs.push(memberPath);
            } else if (stat.isFile()) {
                // tslint:disable-next-line
                console.log(`file > ${memberPath}`);
                files.push(memberPath);
            }
        };

        const dirMembersRetrieval = dirMembers.map((memberPath) => {
            return getDirMembers(memberPath);
        });
        await Promise.all(dirMembersRetrieval);

        const getNestedDirMembers = async (memberPath) => {
            const dirFiles: string[] = await this.listAllFiles(memberPath);
            files.push(...dirFiles);
        };

        const nestedDirMembersRetrieval = await dirs.map(async (memberPath) => {
            return getNestedDirMembers(memberPath);
        });
        await Promise.all(nestedDirMembersRetrieval);

        return files;
    }

    public async fileHash(filePath: string) {
        return this.hashHandler(filePath);
    }

    public async mkdir(dirPath: PathLike) {
        return this.mkdirHandler(dirPath);
    }
}
