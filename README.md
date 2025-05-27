# Sol-y-Sis

This repository contains three simple applications that can be run interactively via a command-line interface. Each project has its own functionality and requirements. Follow the instructions below to set up and run the projects smoothly.

---

## Table of Contents

1. [Overview](#overview)
2. [Setup](#setup)
3. [Projects](#projects)

   - [Mojo Mutki Exchange](#1-mojo-mutki-exchange)
   - [Inventory Management](#2-inventory-management)
   - [Message Processor](#3-message-processor)

4. [Running the Application](#running-the-application)
5. [Project Structure](#project-structure)
6. [Error Handling](#error-handling)

---

## Overview

This project provides three interactive applications:

1. **Mojo Mutki Exchange**: Simulates the exchange of Mojos and Mutkis.
2. **Inventory Management**: Manages stock quantities with operations like purchase and sell.
3. **Message Processor**: Processes transactions using MongoDB and RabbitMQ.

---

## Setup

### Prerequisites

- **Node.js**: Install [Node.js](https://nodejs.org/) (v16 or higher recommended)
- **TypeScript**: Install TypeScript globally using:

  ```bash
  npm install -g typescript
  ```

- **MongoDB**: Install and run a MongoDB instance locally or use a remote MongoDB URL
- **RabbitMQ**: Install and run RabbitMQ locally or use a remote RabbitMQ URL

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/programmerbanna/sol-y-sis.git
   cd sol-y-sis
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

### Using Docker (Optional)

> **Note:** If you don't have docker setup in your machine you can skip this process, only provide mongodb and rabbitmq connectoin urls when prompted.

This project includes Docker support for MongoDB and RabbitMQ services:

1. Start the Docker services:

   ```bash
   docker-compose up -d
   ```

2. When running the **Message Processor** project, use these connection URLs when prompted:

   - MongoDB:

     ```
     mongodb://localhost:27017/msgproject
     ```

   - RabbitMQ:

     ```
     amqp://admin:admin@localhost:5672
     ```

3. Access RabbitMQ Management UI:

   - URL: [http://localhost:15672](http://localhost:15672)
   - Username: `admin`
   - Password: `admin`

4. Stop Docker services when done:

   ```bash
   docker-compose down
   ```

> **Note:** If using Docker, simply press **Enter** when prompted for connection URLs in the Message Processor to use the default Docker connection settings.

---

## Projects

### 1. Mojo Mutki Exchange

A project where:

- Initial Mojos are converted to Mutkis
- Every 3 Mutkis can be exchanged for 1 new Mojo
- Process continues until no more exchanges possible

#### Example

![Mojo Mutki Project](/img/mojo-mutki-project.png "Mojo Mutki Project")

---

### 2. Inventory Management

Features:

- Handles multiple units (tons, kilograms, grams, milligrams)
- Purchase and sell operations
- Input validation
- Prevents negative stock

#### Example

![Inventory Management Project](/img/inventory-management-project.png "Inventory Management Project")

---

### 3. Message Processor

Features:

- Connects to MongoDB and RabbitMQ
- Processes transactions with retry logic
- Uses dead letter queues

Default connections:

- MongoDB:

  ```
  mongodb://localhost:27017/msgproject
  ```

- RabbitMQ:

  ```
  amqp://admin:admin@localhost:5672
  ```

RabbitMQ Management UI:

- URL: [http://localhost:15672](http://localhost:15672)
- Username: `admin`
- Password: `admin`

#### Example

![Message Processor Project](/img/message-processor-project.png "Message Processor Project")

![Rabbitmq Dashboard](/img/rabbitmq-dashboard.png "Rabbitmq Dashboard")

---

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

You'll see an interactive menu to choose between the three applications:

1. Mojo Mutki Exchange
2. Inventory Management
3. Message Processor

#### Example

![Interactive Menu](/img/interactive-menu.png "Interactive Menu")

---

🚩 **Interactive Session Feature:** After completing a project, the application will prompt you:

```
⚠️ Do you want to run another project? (Y/n):
```

You can choose **Y** to return to the main menu and run another project, or **n** to safely exit the application. This ensures a smooth and continuous interactive experience without restarting the program.

---

## Project Structure

Key files:

- `index.ts` - Main application entry point
- `mojoMutkiExchange.ts` - Mojo-Mutki project
- `inventoryManagement.ts` - Stock management system
- `messageProcessor.ts` - Transaction processing system

---

## Error Handling

The application includes robust error handling:

- Invalid inputs are handled gracefully
- Connection issues provide retry options
- Clear error messages displayed
- Safe exit options available
