#!/bin/bash
cd /home/itzmuzu/Documents/cryptocoinprediction/api
/home/itzmuzu/Documents/cryptocoinprediction/api/.venv/bin/uvicorn index:app --host 0.0.0.0 --port 8000 --reload
