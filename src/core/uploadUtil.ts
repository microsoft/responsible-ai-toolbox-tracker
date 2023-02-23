// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { Widget } from '@lumino/widgets';
import { Signal } from '@lumino/signaling';
import { ArrayExt } from '@lumino/algorithm';
import { Contents } from '@jupyterlab/services';
import { IChangedArgs } from '@jupyterlab/coreutils';
import { ServiceManager } from '@jupyterlab/services';
import { DocumentManager } from '@jupyterlab/docmanager';
import { Dialog, showDialog } from '@jupyterlab/apputils';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { PageConfig, PathExt } from '@jupyterlab/coreutils';

export interface IUploadModel {
    path: string;
    /**
     * % uploaded [0, 1)
     */
    progress: number;
}

export class UploadUtil {
    private LARGE_FILE_SIZE = 15 * 1024 * 1024;
    private CHUNK_SIZE = 1024 * 1024;
    private readonly WORKSPACE_DIR = 'workspace';
    private fileDir: string = undefined;
    private projectName: string;
    private project_dir: string;
    private _isDisposed = false;
    /**
     * The document manager instance used by the file upload process.
    */
    private docManager: DocumentManager;
    constructor() {
        /**
         * Create a document manager object 
         */
        if (!this.docManager) {
            this.docManager = this.InitializeDocumentManager();
        }
    }
    /**
     * 
     * @returns 
    */
    private InitializeDocumentManager(): DocumentManager {

        const manager = new ServiceManager();
        const opener = {
            open: (widget: Widget) => { }
        }

        const docRegistry = new DocumentRegistry();
        const docManager = new DocumentManager({
            registry: docRegistry,
            manager,
            opener
        });
        return docManager;
    }
    /**
     * whether a model is disposed.
    */
    get isDisposed(): boolean {
        return this._isDisposed;
    }
    /**
     * 
     * @returns 
    */
    private _uploadCheckDisposed(): Promise<void> {
        if (this.isDisposed) {
            return Promise.reject('Model disposed. File upload canceled');
        }
        return Promise.resolve();
    }
    /**
     * handle the promise content to content
     * @param file 
     * @returns file IModel contents
    */
    async UploadFile(file: File, projectName: string = undefined, dirName: string = undefined): Promise<Contents.IModel> {
        /**
         * setup the correct project id and file directory.
         */
        this.projectName = projectName;
        this.fileDir = dirName;

        return this.UploadSize(file)
            .then(response => {
                return response;
            })
            .then((content: Contents.IModel) => {
                return content;
            })
            .catch((error: Error) => {
                return undefined;
            })
    }
    /**
     * 
     * @param file the file to upload
     * @returns IModel object
    */
    async UploadSize(file: File): Promise<Contents.IModel> {
        const serverVersion = PageConfig.getNotebookVersion();
        const supportsChunked =
            serverVersion < [4, 0, 0] /* Jupyter Server */ ||
            serverVersion >= [5, 1, 0]; /* Jupyter Notebook >= 5.1.0 */
        const largeFile = file.size > this.LARGE_FILE_SIZE;

        if (largeFile && !supportsChunked) {
            const msg =
                'Cannot upload file (>%1 MB). %2 ' +
                this.LARGE_FILE_SIZE / (1024 * 1024) + ' ' + file.name
            console.warn(msg);
        }
        await this._uploadCheckDisposed();
        const chunkedUpload = supportsChunked && file.size > this.CHUNK_SIZE;
        return await this._upload(file, chunkedUpload);
    }
    private _uploads: IUploadModel[] = [];
    private _uploadChanged = new Signal<this, IChangedArgs<IUploadModel | null>>(
        this
    );
    /**
     * 
     * @param file the file to upload 
     * @returns boolean flag
    */
    private async _shouldUploadLarge(file: File): Promise<boolean> {
        const { button } = await showDialog({
            title: 'Large file size warning',
            body: 'The file size is %1 MB. Do you still want to upload it?' + Math.round(file.size / (1024 * 1024)),
            buttons: [
                Dialog.cancelButton({ label: 'Cancel' }),
                Dialog.warnButton({ label: 'Upload' })
            ]
        });
        return button.accept;
    }
    /**
     * 
     * @param file 
     * @param chunked 
     * @returns 
    */
    private async _upload(
        file: File,
        chunked: boolean
    ): Promise<Contents.IModel> {

        if (!this.projectName) {
            throw 'Project name is missing';
        }
        const name = file.name;
        if (!this.project_dir) {
            this.project_dir = PathExt.join(this.WORKSPACE_DIR, this.projectName);
        }

        const path = PathExt.join(this.project_dir, this.fileDir, name);

        const type: Contents.ContentType = 'file';
        const format: Contents.FileFormat = 'base64';

        const uploadInner = async (
            blob: Blob,
            chunk?: number
        ): Promise<Contents.IModel> => {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            await new Promise((resolve, reject) => {
                reader.onload = resolve;
                reader.onerror = event =>
                    reject(`Failed to upload "${name}":` + event);
            });
            const content = (reader.result as string).split(',')[1];

            const model: Partial<Contents.IModel> = {
                type,
                format,
                name,
                chunk,
                content
            };
            return await this.docManager.services.contents.save(path, model);
        };

        if (!chunked) {
            try {
                return await uploadInner(file);
            } catch (err) {
                return null;
            }
        }
        let finalModel: Contents.IModel | undefined;

        let upload = { path, progress: 0 };
        this._uploadChanged.emit({
            name: 'start',
            newValue: upload,
            oldValue: null
        });

        for (let start = 0; !finalModel; start += this.CHUNK_SIZE) {
            const end = start + this.CHUNK_SIZE;
            const lastChunk = end >= file.size;
            const chunk = lastChunk ? -1 : end / this.CHUNK_SIZE;

            const newUpload = { path, progress: start / file.size };
            this._uploads.splice(this._uploads.indexOf(upload));
            this._uploads.push(newUpload);
            this._uploadChanged.emit({
                name: 'update',
                newValue: newUpload,
                oldValue: upload
            });
            upload = newUpload;

            let currentModel: Contents.IModel;
            try {
                currentModel = await uploadInner(file.slice(start, end), chunk);
            } catch (err) {
                ArrayExt.removeFirstWhere(this._uploads, uploadIndex => {
                    return file.name === uploadIndex.path;
                });

                this._uploadChanged.emit({
                    name: 'failure',
                    newValue: upload,
                    oldValue: null
                });

                throw err;
            }

            if (lastChunk) {
                finalModel = currentModel;
            }
        }
        this._uploads.splice(this._uploads.indexOf(upload));
        this._uploadChanged.emit({
            name: 'finish',
            newValue: null,
            oldValue: upload
        });
        return finalModel;

    }
    /**
     * Upload a directory recursively in the Jupyter server
     *
     * @param sourcePath Local source path
     * @param destinationPath Server destination path
     * @returns Action success status
     */
    async uploadDirectory(
        sourcePath: string,
        destinationPath?: string
    ): Promise<boolean> {
        const pos = sourcePath.lastIndexOf('/');
        const sourceDirName = sourcePath.substring(pos + 1);
        destinationPath = destinationPath ?? sourceDirName;
        //todo:hook this call
        // const files = getFilesInDirectory(sourcePath);
        let files = [];
        for (const file of files) {
            const relativePath = file.substring(sourcePath.length + 1);
            await this.UploadFile(file, `${destinationPath}/${relativePath}`);
        }
        return true;
    }
}