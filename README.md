# Bahnhof Watchdog

![](assets/bwatchdog.svg)

Bahnhof Watchdog is a Node.js service that periodically checks for current and planned outages in your area from the ISP named Bahnhof. It also checks if your current subscription is priced higher than what is listed on their website. Notifications are sent via a Discord webhook or via email (Gmail only) if any issues are found.

## Features

- **Outage Check**: Monitors for current and planned outages in your area based on your postal code.
- **Price Check**: Compares your current subscription price with the listed price on Bahnhof's website.
- **Notifications**: Sends notifications about outages or price discrepancies through a Discord webhook or an email.

## Environment Variables

Before running the service, you'll need to set up the following environment variables:

```bash
# Uncomment and set these variables if you are mounting a volume for the data directory.
# PUID=1000
# PGID=1000

# Runs every hour. crontab.cronhub.io can be used to generate another interval
CRON_SCHEDULE="0 * * * *" 

SEND_STARTUP_MESSAGE=true # set to false to avoid getting notified when the service starts

# Outage check
POSTAL_CODE="12345"

# Price check
ADDRESS="ExampleStreet 1A, 12345 ExampleCity"
CURRENT_SPEED="250/250" # In Mbit down/up e.g. 100/10, 250/250, 1000/1000...
CURRENT_PRICE="500"
LOG_PRICES=true # log price changes in a csv file

# Notifications
WEBHOOK_URL="https://your-webhook-url" # Only tested with Discord Webhook bot

# Mail uses nodemailer set to gmail.
# Optional to use but needs all 3 values to work.
MAIL_SENDER="example.sender@gmail.com"
MAIL_SENDER_PASS="examplepassword123"
MAIL_RECEIVER="example.receiver@gmail.com"
```

## Setup

### Running with Docker Compose

1. **Create a `.env` file** in a directory of your choice and add your environment variables as described above.

2. **Create a `docker-compose.yml` file** in the same directory with the following content:

    ```yaml
    services:
      bahnhof-watchdog:
        container_name: bahnhof-watchdog
        image: musenkishi/bahnhof-watchdog:latest
        ports:
          - 3000:3000
        volumes:
          - data:/data
        restart: unless-stopped
        env_file:
          - .env
    
    volumes:
      data:
    ```

3. **Run the Docker Compose stack**:

    ```bash
    docker-compose up -d
    ```

### Running with Docker

#### Using a Pre-built Image from Docker Hub

1. **Create a `.env` file** in a directory of your choice and add your environment variables as described above.

2. **Run the Docker container**:

    ```bash
    docker run --env-file .env musenkishi/bahnhof-watchdog:latest
    ```

#### Building the Image Locally

1. **Clone the repository**:

    ```bash
    git clone https://github.com/musenkishi/bahnhof-watchdog.git
    cd bahnhof-watchdog
    ```

2. **Create a `.env` file** in the root directory and add your environment variables as described above.

3. **Build the Docker image**:

    ```bash
    docker build -t bahnhof-watchdog .
    ```

4. **Run the Docker container**:

    ```bash
    docker run --env-file .env bahnhof-watchdog
    ```

### Running Locally

1. **Clone the repository**:

    ```bash
    git clone https://github.com/musenkishi/bahnhof-watchdog.git
    cd bahnhof-watchdog
    ```

2. **Install dependencies**:

    ```bash
    npm install
    ```

3. **Create a `.env` file** in the root directory and add your environment variables as described above.

4. **Build the project**

    ```bash
    tsc
    ```

5. **Run the service**:

    ```bash
    node dist/app.js
    ```

## Usage

The service runs based on the interval set in the `CRON_SCHEDULE` environment variable. It will check for outages and price discrepancies based on your provided postal code and address, and send notifications if any issues are found.

## Notifications

### Discord Webhook

Ensure `WEBHOOK_URL` is set to your Discord webhook URL. Guide is available on [Discord's support site](https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks):

```bash
WEBHOOK_URL=https://your-webhook-url
```

### Email

To use email notifications, all three of the following variables need to be set:

```bash
MAIL_SENDER="your.sender@gmail.com"
MAIL_SENDER_PASS="yourpassword"
MAIL_RECEIVER="your.receiver@gmail.com"
```

These values will configure the service to use Gmail through Nodemailer for sending email notifications. Guide is available [here](https://nodemailer.com/usage/using-gmail/).

## Contributing

Feel free to submit issues or pull requests if you have any improvements or suggestions.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
