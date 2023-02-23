# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.
import os
import time
import tornado
from tornado.web import StaticFileHandler
from mlflow.tracking import MlflowClient
from jupyter_server.utils import url_path_join
from jupyter_server.base.handlers import APIHandler
from .src.registration import process_request
from .src.core import delete_project_resources

# -----------------------------------
class RouteHandlerRegister(APIHandler):
    # The following decorator should be present on all verb methods (head, get, post,
    # patch, put, delete, options) to ensure only authorized user can request the
    # Jupyter server
    @tornado.web.authenticated
    def post(self):
        input_data = self.get_json_body()
        metrics = process_request(input_data)
        self.finish(metrics)


# -----------------------------------
class RouteHandlerExperiment(APIHandler):
    # The following decorator should be present on all verb methods (head, get, post,
    # patch, put, delete, options) to ensure only authorized user can request the
    # Jupyter server
    @tornado.web.authenticated
    def post(self):
            input_data = self.get_json_body()
            experiment_id = input_data["experiment_id"]
            tags = {
                "Rai Tracker": f"Create a run with a tag under the experiment id: {experiment_id}"
            }
            client = MlflowClient()
            run = client.create_run(
                experiment_id, start_time=int(time.time() * 1000), tags=tags
            )
            id_dict = {"experiment_id": run.info.run_id}
            self.finish(id_dict)

# -----------------------------------
class RouteHandlerDeleteProject(APIHandler):
    # The following decorator should be present on all verb methods (head, get, post,
    # patch, put, delete, options) to ensure only authorized user can request the
    # Jupyter server
    @tornado.web.authenticated
    def post(self):
        input_data = self.get_json_body()
        project_path = input_data["project_path"]
        success = delete_project_resources(project_path) 
        delete_dict = {"project_deleted": success}
        self.finish(delete_dict)


# -----------------------------------
def _setup_handlers(web_app, url_path, endpoint_name, route_class):
    host_pattern = ".*$"
    
    base_url = web_app.settings["base_url"]
    route_pattern = url_path_join(base_url, url_path, endpoint_name)
    handlers = [(route_pattern, route_class)]
    web_app.add_handlers(host_pattern, handlers)

    # Prepend the base_url so that it works in a JupyterHub setting
    doc_url = url_path_join(base_url, url_path, "public")
    doc_dir = os.getenv(
        "RAITRACKER_STATIC_DIR",
        os.path.join(os.path.dirname(__file__), "public"),
    )
    handlers = [("{}/(.*)".format(doc_url), StaticFileHandler, {"path": doc_dir})]
    web_app.add_handlers(".*$", handlers)


# -----------------------------------
def setup_handlers_register_model(web_app, url_path):
    _setup_handlers(web_app, url_path, "register_model", RouteHandlerRegister)


# -----------------------------------
def setup_handlers_create_experiment(web_app, url_path):
    _setup_handlers(web_app, url_path, "create_run", RouteHandlerExperiment)


# -----------------------------------
def setup_handlers_delete_project(web_app, url_path):
    _setup_handlers(web_app, url_path, "delete_project", RouteHandlerDeleteProject)
