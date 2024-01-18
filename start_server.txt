#!/bin/bash

# Virtual environment directory
VENV_DIR="unpacked_env"

cd MapObjDetctor

# Navigate to the 'server' directory
cd server

# Check if the Conda virtual environment directory exists
if [ -d "../$VENV_DIR" ]; then
    echo "Conda virtual environment directory '${VENV_DIR}' found."
else
    echo "Conda virtual environment directory '${VENV_DIR}' not found. Exiting."
    exit 1
fi

# Activate the Conda virtual environment
echo "Activating the Conda virtual environment from '../$VENV_DIR'."
source activate "../$VENV_DIR"

# Check if the activation was successful
if [ $? -eq 0 ]; then
    # Run the npm command in the background and get its process ID
    npm run dev &
    NPM_PID=$!

    # Wait for a few seconds to allow the server to start
    sleep 5

    # Open the browser and go to the specified URL
    if which xdg-open > /dev/null; then
        xdg-open http://localhost:3000 &
    elif which open > /dev/null; then
        open http://localhost:3000 &
    elif which start > /dev/null; then
        start http://localhost:3000 &
    else
        echo "Could not detect the web browser command."
    fi

    # Wait for the npm process to finish
    wait $NPM_PID
else
    echo "Failed to activate the Conda environment."
    exit 1
fi

read -p "Press any key to continue..."
