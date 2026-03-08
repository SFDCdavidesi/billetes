# billetes

A Node.js web application to browse a database of bank notes from around the world.

## Features

- 📋 View a collection of international bank notes
- 🔍 Search/filter by country or currency
- 🔗 REST API at `/api/banknotes`
- 📱 Responsive design

## Getting Started

### Prerequisites

- Node.js v18+
- npm

### Installation

```bash
npm install
```

### Run the app

```bash
npm start
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

### Run tests

```bash
npm test
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/banknotes` | Get all banknotes |
| GET | `/api/banknotes?country=Japan` | Filter by country |
| GET | `/api/banknotes?currency=Euro` | Filter by currency |
| GET | `/api/banknotes/:id` | Get a single banknote by ID |
