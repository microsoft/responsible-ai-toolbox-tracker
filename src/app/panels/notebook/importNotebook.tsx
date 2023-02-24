// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import * as React from 'react';
import { UUID } from 'angular2-uuid';
import { useState, useMemo } from 'react';
import { PathExt } from '@jupyterlab/coreutils';
import { Label } from '@fluentui/react/lib/Label';
import { useSelector, useDispatch } from 'react-redux';
import { PrimaryButton, DefaultButton } from '@fluentui/react/lib/Button';
import { Dialog, DialogType, DialogFooter } from '@fluentui/react/lib/Dialog';
import { INotebookType, IMetricsType, INotebookMetricsType } from '../../../core/components';
import { CreateRun } from '../../../core/mlflowUtils';
import { UploadUtil } from '../../../core/uploadUtil';
import { NotebookUtils } from '../../../core/notebookUtils';
const modalPropsStyles = {
    main: { maxWidth: 450 },
    root: { className: 'importNotebookModal' },
    align: 'center', dialogDefaultMaxWidth: 450
};
const dialogContentProps = {
    type: DialogType.normal,
    title: 'Import a Notebook',
};

export const ImportNotebook: React.FunctionComponent = () => {
    const ARTIFACTS_DIR = 'artifacts';
    const FILE_TYPE_ERROR_MESSAGE = "Only notebooks are supported.  Please try again.";
    const NOTEBOOK_NAME_COLLISION = "Notebook already exists in your workspace.  Choose a different one."
    const NOTEBOOK_DISPLAY = 20;
    const modalProps = useMemo(
        () => ({
            isBlocking: true,
            styles: modalPropsStyles,
            dragOptions: undefined,
        }),
        [],
    );
    const dispatch = useDispatch();
    const state = useSelector((state) => state);
    const notebooks = state['projectSettings']['notebooks'];
    const showModal = state['importNotebookModalState'];
    const projectKey = state['projectSettings']['key'];
    const projectName = state['projectSettings']['name'];
    const serverUri = state['serverUri'];
    let [buttonDisabled, SetButtonDisabled] = useState(true);    
    let [uploadFileTypeError, setUploadFileTypeError] = useState("");
    let [uploadFileTypeHidden, setUploadFileTypeHidden] = useState(true);
    /**
     * Upload the selected file. 
    */
    const _onInputChanged = async (file: File) => {
        const _uploadUtil = new UploadUtil();
        return _uploadUtil.UploadFile(file, projectName, ARTIFACTS_DIR)
            .then(response => {
                return response;
            })
            .catch((error: Error) => {
                return false;
            });
    }
    /**
      * 
      * @param displayStr 
      * @param length 
      * @returns 
    */
    const nbNameDisplay = (nbName: string, nbLength: number) => {
        if (nbName?.length < nbLength) { return nbName; }
        let ext = PathExt.extname(nbName);
        let name = PathExt.basename(nbName, ext);
        let displayName = name.substring(0, nbLength);
        displayName = displayName.concat('..', ext);
        return displayName;
    }
    /**
     * 
     * @param nbName 
     * @returns 
    */
    const isValidNotebook = (nbName: string): boolean => {
        if (notebooks) {
            for (let p of notebooks) {
                if (p && p.name.toLowerCase().trim() === nbName.toLowerCase().trim()) {
                    return false;
                }
            }
        } else {
            return true;
        }
        /**
         * a new project name.  always valid.
        */
        return true;
    }
    /**
      * Identify the notebook name being uploaded.    
    */
    const [displayNotebook, setDisplayNotebook] = useState('');
    const [notebookName, setNotebookName] = useState('');
    const uploadFileChange = (event) => {
        const current_event = event.currentTarget;
        if (current_event.files.length !== 0) {
            let fileName = nbNameDisplay(event.target.files[0]?.name, NOTEBOOK_DISPLAY);
            if (isValidNotebook(fileName)) {
                if (PathExt.extname(event.target.files[0].name) !== '.ipynb') {
                    setUploadFileTypeHidden(false);
                    setUploadFileTypeError(FILE_TYPE_ERROR_MESSAGE);
                    setNotebookName('');
                    return;
                } else {
                    setUploadFileTypeHidden(true);
                    setUploadFileTypeError('');
                }

                setNotebookName(event.target.files[0].name)
                setDisplayNotebook(fileName)
                SetButtonDisabled(false);
                /**
                 * The notebook upload info.
                 */
                const _notebooks = Array.prototype.slice.call(current_event.files) as File[];
                if (notebooks.length !== 0) {
                    const pending_notebook = _notebooks.map(notebook => _onInputChanged(notebook));
                    void Promise.all(pending_notebook).then(response => {
                        //do nothing.
                    }).catch(error => {
                        console.warn('Upload Error : ' + error);
                    });

                }
            } else {
                setUploadFileTypeHidden(false);
                setUploadFileTypeError(NOTEBOOK_NAME_COLLISION);
            }
        }

    }
    /**
     * Update project settings  
    */
    const _updateNotebookSettings = async (notebook: INotebookType) => {
        const notebookUtils = new NotebookUtils();
        return notebookUtils.UpdateNotebookSettings(projectName, projectKey, notebook)
            .then(response => {
                return response;
            })
            .catch((error: Error) => {
                return false;
            });
    }
    /**
      * Create an mlflow run id for each notebook
    */
    const createMlFlowRun = async () => {
        return CreateRun(serverUri)
            .then(response => {
                return response;
            })
            .catch((error: Error) => {
                return error.message;
            });
    }
    /**
     * 
    */
    const updateNotebookSettings = () => {
        /**
         * update the  project settings file
        */
        let dateTime = new Date();
        let newNotebook = {} as INotebookType;
        let metricsArr: IMetricsType[] = [];
        let notebookMetricsArr: INotebookMetricsType[] = [];
        let notebookMetrics = {} as INotebookMetricsType;
        notebookMetrics.key = "";
        notebookMetrics.name = "";
        notebookMetrics.metricsVisible = true; 
        notebookMetrics.mapTo = ''; 
        notebookMetrics.metrics = metricsArr
        notebookMetricsArr.push(notebookMetrics);
        newNotebook.name = notebookName;
        newNotebook.key = UUID.UUID();
        newNotebook.notebookVisible = false;
        /**
         * Create mlflow run if
        */
        createMlFlowRun().then(content => {
            if (content) {
                newNotebook.mlFlowRunId = content;
            }
            else {
                console.log('mlflow run creation failed');
            }
        });
        newNotebook.registeredModel = '';
        newNotebook.mlPlatform = '';
        newNotebook.testDataset = '';
        newNotebook.testDatasetKey = '';
        newNotebook.metrics = notebookMetricsArr;
        newNotebook.dateCreated = dateTime.toLocaleDateString();
        newNotebook.lastUpdated = dateTime.toLocaleDateString();
        setDisplayNotebook('');
        _updateNotebookSettings(newNotebook).then(
            projectContent => {
                /**
                 * Update notebook list
                */
                if (notebooks.indexOf(newNotebook) === -1) {
                    notebooks.push(newNotebook);
                }
                dispatch({ type: 'REFRESH_NOTEBOOK_LIST', payload: notebooks });
                dispatch({ type: 'IMPORT_NOTEBOOK_MODAL_STATE', payload: false });
            });
    }    
    const handleClose = () => {
        dispatch({ type: 'IMPORT_NOTEBOOK_MODAL_STATE', payload: false });
    }

    return (
        <>
            <Dialog
                hidden={showModal}
                onDismiss={handleClose}
                dialogContentProps={dialogContentProps}
                modalProps={modalProps}
            >
                <div className='importNotebookContent'>
                    <table>
                        <tbody>
                            <tr>
                                <th>
                                    <Label className='projectLabelText'>Upload Notebook</Label>
                                    <Label className='projectLabelChooseFile' id="labelUploadNotebook"><span className='spanChooseFile'>Select File</span>
                                        <input onChange={uploadFileChange} type="file" multiple={true} name='upload_notebook' placeholder='Upload Notebook' className='btnUploadFile' />
                                    </Label>
                                </th>
                                <th className='projectLabelTextOutput'>
                                    <span>&nbsp;{displayNotebook}</span>
                                </th>
                            </tr>
                            <tr hidden={uploadFileTypeHidden}>
                                <th className='LabelTextErrorOutput' colSpan={2}><span>&nbsp;{uploadFileTypeError}&nbsp;</span></th>
                            </tr>

                        </tbody>
                    </table>
                </div>

                <DialogFooter>
                    <PrimaryButton id="btnOpenProject" onClick={updateNotebookSettings} text="Save" disabled={buttonDisabled} />
                    <DefaultButton onClick={handleClose} text="Cancel" />
                </DialogFooter>
            </Dialog>
        </>
    );
};
