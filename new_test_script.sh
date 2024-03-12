#!/bin/bash

# Virtual environment directory
VENV_DIR="./unpacked_env"

# Check if the Conda virtual environment directory exists
if [ -d "$VENV_DIR" ]; then
    echo "Conda virtual environment directory '${VENV_DIR}' found."
else
    echo "Conda virtual environment directory '${VENV_DIR}' not found. Exiting."
    read -p "Press any key to exit..."
    exit 1
fi

# Activate the Conda virtual environment
echo "Activating the Conda virtual environment from '$VENV_DIR'."
conda activate "$VENV_DIR"

# Check if the activation was successful
if [ $? -eq 0 ]; then
    echo "Conda environment activated successfully."
else
    echo "Failed to activate the Conda environment. Exiting."
    read -p "Press any key to exit..."
    exit 1
fi

# Navigate to the 'server' directory
cd mapobjdetctor/server || { echo "Failed to enter server directory. Exiting."; read -p "Press any key to exit..."; exit 1; }

# Function to clean up background processes
cleanup() {
    echo "Terminating npm process..."
    # Use pkill with a pattern that matches your npm process
    # Be cautious to ensure it's specific enough
    pkill -f "npm run dev"
    echo "Cleanup complete."
}

# Trap SIGINT (Ctrl+C) and SIGTERM signals and call cleanup function
trap cleanup SIGINT SIGTERM




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
    read -p "Press any key to exit..."
    cleanup
    exit 1
fi

# Wait for the npm process to finish
wait $NPM_PID

read -p "Press any key to continue..."
