import os
import shutil

directory = 'dist'
keep_directory = 'raitracker'
keep_file = '.tgz'
keep_files = 'index'

for filename in os.listdir(directory):
    # if not filename.startswith(keep_directory):
    if not filename.endswith(keep_file) and not filename.startswith(keep_files):
        file_path = os.path.join(directory, filename)
        if os.path.isfile(file_path) or os.path.islink(file_path):
            os.unlink(file_path)
        elif os.path.isdir(file_path):
            shutil.rmtree(file_path)