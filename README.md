This repo contains the VROOM frontend demo hosted at
[http://map.vroom-project.org/](http://map.vroom-project.org/).

# Setup

Clone the repo and install dependencies using `npm`:

```bash
git clone https://github.com/VROOM-Project/vroom-frontend.git
cd vroom-frontend
npm install
```

# Requirements

To run the frontend locally, you need the following tools up and
running.

- [OSRM](https://github.com/Project-OSRM/osrm-backend/wiki/Building-OSRM)
   v5.0.0 or later.
- [VROOM](https://github.com/VROOM-Project/vroom/wiki/Building) v1.0.0
   or later
- [vroom-express](https://github.com/VROOM-Project/vroom-express) to
expose VROOM's API over http requests.

# Usage

Serve at `http://127.0.0.1:9966` with:

```bash
npm run serve
```
