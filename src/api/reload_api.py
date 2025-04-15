import os
import time
import subprocess
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

model_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../ml/model.pkl"))
api_script = os.path.abspath(os.path.join(os.path.dirname(__file__), "api.py"))

class ModelChangeHandler(FileSystemEventHandler):
    def __init__(self):
        self.process = None
        self.start_server()

    def start_server(self):
        print("🚀 Starting FastAPI server...")
        self.process = subprocess.Popen(["python", api_script])

    def stop_server(self):
        if self.process:
            print("🛑 Stopping FastAPI server...")
            self.process.terminate()
            self.process.wait()

    def restart_server(self):
        print("🔁 Model changed, restarting server...")
        self.stop_server()
        self.start_server()

    def on_modified(self, event):
        if os.path.abspath(event.src_path) == model_path:
            self.restart_server()

if __name__ == "__main__":
    print(f"📂 Monitoring {model_path} for changes...")
    event_handler = ModelChangeHandler()
    observer = Observer()
    observer.schedule(event_handler, path=os.path.dirname(model_path), recursive=False)
    observer.start()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
        event_handler.stop_server()
    observer.join()
