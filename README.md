# PoC-44 · Location Data Brokerage Map

A production-style intelligence demo for the **Real Rails Intelligence Library** exploring the hidden infrastructure of the **Distribution & Demand Rail** — specifically how location data flows between SDK vendors, brokers, downstream buyers, and regulators.

The platform visualizes how mobile location intelligence is collected, aggregated, sold, and operationalized across commercial and political ecosystems.

---

## Overview

The **Location Data Brokerage Map** demonstrates:

* How SDKs collect user location data
* How brokers aggregate and resell datasets
* How downstream entities operationalize intelligence
* Where regulators lose visibility into the rail
* Which entities control leverage points in the ecosystem

The application combines:

* Real public-source references where available
* Clearly labelled synthetic/mock relationships where event-level public data does not exist

---

## Core Themes

### Distribution & Demand Rail

This PoC focuses on:

* Data extraction
* Distribution pipelines
* Commercial demand
* Political intelligence markets
* Regulatory blind spots

### Regulatory Gap

The demo intentionally highlights:

* Visibility asymmetry
* Weak enforcement reach
* Opaque downstream redistribution
* Fragmented accountability

---

# Features

## Interactive Entity Graph

Visual network map showing relationships between:

* SDK Vendors
* Data Brokers
* Buyers
* Political Entities
* Regulators

Includes:

* Clickable nodes
* Relationship edges
* Dynamic metadata sidebar
* Tooltips
* Provenance badges

---

## Location Granularity Controls

Users can simulate:

* Precise GPS
* City-level aggregation
* Regional aggregation
* State-level rollups

Demonstrates how sensitivity changes with granularity.

---

## Policy Risk Indicators

Flags include:

* Political targeting exposure
* Sensitive location inference
* Health/religious location proximity
* Enforcement visibility gaps
* Cross-market resale chains

---

## Provenance & Lineage

Every relationship includes:

* Source provenance
* Synthetic vs real attribution
* Data lineage tracking
* Downloadable JSON lineage exports

---

## Why This Matters Panel

Explains:

* Economic incentives
* Intelligence asymmetry
* Privacy implications
* Regulatory fragmentation
* Market concentration dynamics

---

## Who Controls The Rail Panel

Highlights:

* Major leverage nodes
* Broker concentration
* Regulatory choke points
* Dependency chains
* Demand concentration

---

# Data Sources

## Public Sources

Where possible, the system references:

* CFPB
* OpenSecrets

## Synthetic / Mock Data

The following are intentionally synthetic:

* Vendor relationships
* SDK telemetry flows
* Downstream buyers
* Volume estimates
* Commercial transfer edges

All synthetic records are visibly labelled.

---

# Tech Stack

## Frontend

* Next.js
* TypeScript
* Tailwind CSS
* React Flow
* Recharts

## Backend / ETL

* Python FastAPI
* Pydantic
* Modular ETL adapters

---

# Architecture

/frontend
/components
/data
/adapters
/app
/styles

/backend
/api
/etl
/connectors
/models

---

# Key UX Requirements

* Dark intelligence-dashboard aesthetic
* Clear language for:

  * everyday viewers
  * builders
  * allocators
* High visual clarity
* Production-style interactions
* Downloadable artifacts

---

# Functional UAT Coverage

Validated areas include:

* Node interaction
* Edge metadata rendering
* Provenance badge rendering
* Regulatory scope visibility
* Sidebar population
* Filters
* Tooltips
* Export/download flows
* Lineage rendering
* Granularity controls

---

# Getting Started

## Install Dependencies

```bash
npm install
```

## Run Frontend

```bash
npm run dev
```

## Run Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

---

# Environment Variables

See `.env.example`

---

# Disclaimer

This project is an educational and analytical demonstration built for the Real Rails Intelligence Library.

Some entity relationships and transaction flows are synthetic and exist solely to illustrate structural dynamics within the location-data brokerage ecosystem.

