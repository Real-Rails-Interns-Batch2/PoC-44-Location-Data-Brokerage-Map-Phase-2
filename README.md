# Location Data Brokerage Map

Production-style intelligence dashboard exploring how location data moves through the **Distribution & Demand Rail** ecosystem.

Built for the **Real Rails Intelligence Library** using real public references and clearly labelled synthetic intelligence flows.

---

## Features

* Interactive entity relationship map
* Location granularity controls
* Policy & privacy risk indicators
* Data lineage + provenance tracking
* Downloadable sample datasets
* Rail ownership insights
* Filters, tooltips, and analytics panels

---

## Data Sources

### Public Sources

* CFPB
* OpenSecrets

### Synthetic Data

Used where public event-level feeds do not exist:

* SDK vendors
* Broker relationships
* Downstream buyers
* Distribution chains

All synthetic records are visibly labelled.

---

## Stack

### Frontend

* Next.js
* TypeScript
* Tailwind CSS

### Backend

* FastAPI
* Python ETL adapters

---

## Run Locally

### Frontend

```bash id="tn8m2p"
npm install
npm run dev
```

### Backend

```bash id="m4k9vs"
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```


