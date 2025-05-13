## Sound-Swipe

### By: James Murphy, William Newstad, Tyler Speedy, and Alan Atrach

To run **Sound Swipe** locally using Docker, you’ll first need to install Docker Desktop. Follow the setup instructions below based on your operating system.

---

### Windows Installation

1. **Download Docker Desktop**
   - Visit the official Docker website:  
     [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
   - Click **Download for Windows (WSL2)**.

2. **Install Docker**
   - Run the downloaded installer.
   - Follow the setup wizard.
   - Make sure **WSL 2** and **integration with your preferred terminal (e.g., PowerShell)** are selected.

3. **Start Docker Desktop**
   - Launch Docker Desktop from the Start Menu.
   - Wait for the Docker whale icon to appear in your system tray.

4. **Verify Installation**
   Open a terminal (e.g., PowerShell) and run:
   ```bash
   docker --version


## Docker Installation Guide (macOS)

To run **Sound Swipe** locally using Docker on your Mac, follow the steps below:

---

### Step 1: Download Docker Desktop

1. Go to the official Docker Desktop page:  
   [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)

2. Click **Download for Mac** and choose the version for your architecture:
   - **Apple Chip** (for M1/M2)
   - **Intel Chip** (for Intel-based Macs)

---

### Step 2: Install Docker

1. Open the `.dmg` file you downloaded.
2. Drag the **Docker** icon into your **Applications** folder.

---

### Step 3: Launch Docker

1. Open **Docker** from your Applications.
2. Grant any required system permissions when prompted.
3. Wait for the Docker whale icon to appear in the macOS menu bar (top-right corner), indicating Docker is running.

---

## Running the project

1. Once you have the GitHub repo cloned and you are in side of the Sound-Swipe directory, use the command "cd server" to get into the server directory and then run "npm install" to install all dependencies
2. Next, go back to the root directory and use the command "cd client" to get into the client directory and use the command "npm install" to install all dependencies.
3. After this, go back to the server directory to use the command "cd server" to enter the server
4. After this, use the command "docker-compose down -v" to make sure all of the containers stopped running
5. To run the docker, use the command "docker-compose up -d". Once this command is done, you will now have to enter the command to start the server.
6. To start the server, use the command "npm start".
7. Next, create a new terminal in VS code and cd into the client directory.
8. Once in the client directory, run the command "npm run dev" to start the client side
9. Lastly, open the localhost:5173 on your server to see the application
