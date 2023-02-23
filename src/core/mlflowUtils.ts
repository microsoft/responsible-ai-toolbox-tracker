// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { UUID } from 'angular2-uuid';
import { requestAPI } from './handler';
import { PathExt } from '@jupyterlab/coreutils';

/**
 * 
 * @param url 
 * @param expId 
 * @returns 
*/
const _createRun = async (url: string, expId: string = '0'): Promise<string> => {
    // let dateTime = new Date();
    const payload = {
        "experiment_id": expId
    }
    const request: RequestInit = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=UTF-8'
        },
        body: JSON.stringify(payload)
    };

    let reply: Promise<string>
    try {
        reply = await requestAPI<any>('create_run', request);
    } catch (error) {
        console.error(
            `Error on POST /raitracker/create_run ${payload}.\n${error}`
        );
        throw error;
    }
    return reply;
}
/**
 * Check if the models list already have the cohort.
 * @param modelsList 
 * @param cohortKey 
 * @returns 
*/
const modelsListDup = (modelsList: any, cohortKey: string): boolean => {
    for (let ent of modelsList) {
        if (ent.cohortKey === cohortKey)
            return true;
    }
    return false;
}
/**
 * 
 * @param projectSettings 
 * @param modelPath 
 * @param datasetPath 
 * @param cohortName 
 * @param _datasetName 
 * @param notebookName 
 * @param cohortKey 
 * @returns 
*/
export const GetLinkedModels = async (projectSettings: any, modelPath: string, datasetPath: string, cohortName: string = undefined,
    _datasetName: string = undefined, notebookName: string = undefined, cohortKey: string = undefined): Promise<any> => {
    let modelsList: any = [];
    let notebooks = projectSettings['notebooks'];
    let datasets = projectSettings['datasets'];
    let modelName = PathExt.basename(modelPath);
    /**
     * Check if the base model is registered, otherwise flag it.
    */
    if (cohortName) {
        for (let i = 0; i < notebooks.length; i++) {
            let notebook = notebooks[i];
            if (notebook.testDataset === _datasetName) {
                // if (modelsListDup(modelsList, cohortKey)) { continue; }
                const _modelPath = modelPath.replace(modelName, notebook.registeredModel).normalize();
                modelsList.push({
                    "modelPath": _modelPath,
                    "datasetPath": datasetPath,
                    "runId": notebook.mlFlowRunId,
                    "mlPlatform": notebook.mlPlatform,
                    "notebookName": notebook.name,
                    "dataset": _datasetName,
                    "masterKey": notebook.testDatasetKey,
                    "masterDataset": notebook.testDataset,
                    "cohortKey": cohortKey,
                    "cohortName": cohortName,
                    "addDataset": undefined,
                });
            }
        }
    } else {
        for (let i = 0; i < notebooks.length; i++) {
            let notebook = notebooks[i];
            if (notebook.testDataset === _datasetName) {
                for (let metricsEnt of notebook.metrics) {
                    if (_datasetName !== metricsEnt.name) {
                        if (modelsListDup(modelsList, metricsEnt.key)) { continue; }
                        let _testDataPath = datasetPath.replace("artifacts", "cohorts").normalize();
                        _testDataPath = _testDataPath.replace(_datasetName, metricsEnt.key).normalize();
                        _testDataPath = PathExt.join(_testDataPath, metricsEnt.key) + ".json";
                        modelsList.push({
                            "modelPath": modelPath,
                            "datasetPath": _testDataPath,
                            "runId": notebook.mlFlowRunId,
                            "mlPlatform": notebook.mlPlatform,
                            "notebookName": notebookName,
                            "dataset": metricsEnt.name,
                            "masterKey": notebook.testDatasetKey,
                            "masterDataset": notebook.testDataset,
                            "cohortKey": metricsEnt.key,
                            "cohortName": metricsEnt.name,
                            "addDataset": false,
                        });
                    }
                }
            }
            else if (notebook.testDataset === '' && notebook.name === notebookName) {
                for (let db of datasets) {
                    if (db.masterName === _datasetName && db.isCohort) {
                        if (modelsListDup(modelsList, db.key)) { continue; }
                        let _testDataPath = datasetPath.replace("artifacts", "cohorts").normalize();
                        _testDataPath = _testDataPath.replace(_datasetName, db.key).normalize();
                        _testDataPath = PathExt.join(_testDataPath, db.key) + ".json";

                        modelsList.push({
                            "modelPath": modelPath,
                            "datasetPath": _testDataPath,
                            "runId": notebook.mlFlowRunId,
                            "mlPlatform": notebook.mlPlatform,
                            "notebookName": notebookName,
                            "dataset": db.name,
                            "masterDataset": db.masterName,
                            "masterKey": db.masterKey,
                            "cohortKey": db.key,
                            "cohortName": db.name,
                            "addDataset": false,
                        });
                    }
                }
            }
        }

    }
    return modelsList;
}
/**
 * 
 * @param projectSettings 
 * @param mlFlowRunId 
 * @param modelPath 
 * @param datasetPath 
 * @param testDataTarget 
 * @param mlPlatformSelected 
 * @param header 
 * @param separator 
 * @param problemType 
 * @param notebookName 
 * @param cohortName 
 * @param datasetName 
 * @param cohortKey 
 * @returns 
*/
export const RegisterModel = async (projectSettings: any, mlFlowRunId: string, modelPath: string, datasetPath: string,
    testDataTarget: string, mlPlatformSelected: string, header: boolean, separator: string, problemType: string,
    notebookName: string = undefined, cohortName: string = undefined, datasetName: string = undefined, cohortKey: string = undefined): Promise<any> => {
    /**
     * Identify problem type.
    */
    let regression = false;
    if (problemType.toLowerCase() === "regression") {
        regression = true;
    }
    let _datasetName = "";
    if (datasetName) {
        _datasetName = datasetName;
    } else {
        _datasetName = PathExt.basename(datasetPath);
    }

    let metricsList = [];
    let payload = {
        "run_id": mlFlowRunId,
        "model_path": modelPath,
        "test_data_path": datasetPath,
        "test_data_target": testDataTarget,
        "header": header,
        "separator": separator,
        "regression": regression,
        "ml_platform_selected": mlPlatformSelected
    }
    /**
     * Only add this part for the cohort model registration.
    */
    try {
        if (!cohortName) {
            let metrics = await _registerModel(payload);
            let datasets = projectSettings['datasets'];
            let dbKey: string;
            let masterKey: string;
            let masterName: string;
            let addDataset = true;
            for (let i = 0; i < datasets.length; i++) {
                if (datasets[i].name.toLowerCase() === _datasetName.toLowerCase()) {
                    addDataset = false;
                    dbKey = datasets[i].key;
                    masterKey = datasets[i].masterKey;
                    masterName = datasets[i].masterName;
                }
            }
            if (addDataset) {
                dbKey = UUID.UUID();
                masterKey = dbKey;
                masterName = _datasetName;
            }
            if (Object.keys(metrics).length !== 0) {
                metricsList.push({
                    "metrics": metrics,
                    "cohortName": cohortName,
                    "notebookName": notebookName,
                    "dataset": _datasetName,
                    "datasetKey": dbKey,
                    "masterKey": masterKey,
                    "masterDataset": masterName,
                    "addDataset": addDataset,
                });
            }
        }
    } catch (error) {
        throw error;
    }
    /**
     * Re-register all models with the same test master datasets.
    */
    return await processModelsRegistration(projectSettings, modelPath, datasetPath, testDataTarget, header, separator,
        regression, metricsList, cohortName, _datasetName, notebookName, cohortKey);
}
/**
 * 
 * @param projectSettings 
 * @param modelPath 
 * @param datasetPath 
 * @param testDataTarget 
 * @param header 
 * @param separator 
 * @param regression 
 * @param metricsList 
 * @param cohortName 
 * @param _datasetName 
 * @param notebookName 
 * @param cohortKey 
 * @returns 
 */
const processModelsRegistration = async (projectSettings: any, modelPath: string, datasetPath: string, testDataTarget: string, header: boolean, separator: string,
    regression: boolean, metricsList: any, cohortName: string = undefined, _datasetName: string = undefined, notebookName: string = undefined, cohortKey: string = undefined): Promise<any> => {
    /**
     * get object info with the same test master datasets.
    */
    let modelsList = await GetLinkedModels(projectSettings, modelPath, datasetPath, cohortName, _datasetName, notebookName, cohortKey);
    if (modelsList && modelsList.length > 0) {
        try {
            for (let i = 0; i < modelsList.length; i++) {
                const _models = modelsList[i];
                const payload = {
                    "run_id": _models['runId'],
                    "model_path": _models['modelPath'],
                    "test_data_path": _models['datasetPath'],
                    "test_data_target": testDataTarget,
                    "header": header,
                    "separator": separator,
                    "regression": regression,
                    "ml_platform_selected": _models['mlPlatform']
                }

                let metrics = await _registerModel(payload);

                if (Object.keys(metrics).length !== 0) {
                    metricsList.push({
                        "metrics": metrics,
                        "cohortName": _models['cohortName'],
                        "notebookName": _models['notebookName'],
                        "dataset": _models['dataset'],
                        "datasetKey": _models['cohortKey'],
                        "masterKey": _models['masterKey'],
                        "masterDataset": _models['masterDataset'],
                        "addDataset": _models['addDataset'],
                    });
                }
                else {
                    console.log("Failed to register a model for this: " + JSON.stringify(payload));
                }

            }
        } catch (error) {
            throw error;
        }
    }
    return metricsList;
}
/**
 * 
 * @param payload 
 * @returns 
*/
const _registerModel = async (payload: any): Promise<any> => {
    const request: RequestInit = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=UTF-8'
        },
        body: JSON.stringify(payload)
    };

    let res: Promise<string>;
    try {
        res = await requestAPI<any>('register_model', request);
    } catch (error) {
        console.log(`Error on POST /raitracker/register_model ${JSON.stringify(payload)}.\n${error}`);
        throw error;
    }
    return res;
}
/**
 * 
 * @param path 
 * @returns 
*/
export const deleteProjectResources = async (path: string): Promise<any> => {
    const payload = {
        "project_path": path
    }
    const request: RequestInit = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=UTF-8'
        },
        body: JSON.stringify(payload)
    };
    let res: Promise<string>;
    try {
        res = await requestAPI<any>('delete_project', request);
    } catch (reason) {
        console.log(`Error on POST /raitracker/delete_project ${path}.\n${reason}`);
    }
    return res;
}
/**
 * 
 * @param serverUri 
 * @returns 
*/
export const CreateRun = async (serverUri: string): Promise<string> => {
    /**
     *  Fetch a run configs
    */
    try {
        const runId_json = await _createRun(serverUri);
        const runId = runId_json["experiment_id"];
        return runId;
    } catch (error) {
        throw error;
    }
}
