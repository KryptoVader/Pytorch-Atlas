# Tensor Atlas — PyTorch, within reach

A focused, reference-first PyTorch field guide built with React and Vite. Tensor Atlas combines detailed topic chapters, a copy-ready cheatsheet, a searchable API catalog, practical recipes, an interactive CNN shape lab, and an optional Firecrawl-powered source refresh workflow.

## Run locally

**Requirements:** Node.js 20+ and npm.

```bash
# Extract the ZIP and enter the project folder
cd pytorch-atlas

# Install site dependencies
npm install

# Start the local development server
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

```bash
# Production build and local preview
npm run build
npm run preview

# Optional TypeScript component check
npm run typecheck
```

The website does not need a backend, database, login, or API key for ordinary use. Saved topics and the reading theme are stored locally in the browser.

## Design and interaction

- **BackgroundPaths hero:** restrained animated paths, reduced-motion support, and a direct entry to global search.
- **Compact dock navigation:** primary reference sections remain reachable without adding a large navigation band.
- **Command palette:** open with `Ctrl+K` or `Cmd+K`, search chapters, API names, cheat snippets and common concepts, navigate with arrow keys, use Enter to open, and Escape to close.
- **Syntax-highlighted code:** copy-ready blocks with optional tabs, line numbers for longer examples, and a consistent dark code surface for comfortable reading in either page theme.
- **Folded reference cards:** used for a small set of home-page shortcuts; article layouts remain text-first.
- **Responsive and accessible:** keyboard focus states, reduced motion, mobile navigation, and persistent light/dark theme.

The project uses Vite + React, TypeScript support for UI components, Tailwind CSS, and a shadcn-style `src/components/ui` structure. The content catalog remains in JavaScript modules to preserve the existing reference content and make updates straightforward.

## Optional Firecrawl documentation sync

The bundled source catalog is usable without Firecrawl. To refresh source snapshots on your own computer:

1. Copy `.env.example` to `.env`.
2. Add your key to `FIRECRAWL_API_KEY` in the local `.env` file. Never commit or share `.env`.
3. Use Node.js 20.6+ (the sync script uses Node's built-in `--env-file`) and run:

```bash
npm run docs:sync
```

The script fetches a curated list of official PyTorch documentation pages through Firecrawl and updates `src/docs-snapshots.json`. API use may consume credits. The key is read by the local Node script only; it is not imported into the frontend bundle. Review new summaries and version-sensitive claims before publishing. The script does not rewrite or automatically certify the tutorial content.

## Python example

The website and Python runtime are independent. To run the included synthetic-data MLP example, create a virtual environment.

**Windows PowerShell**

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
```

**Linux / macOS**

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
```

Install a PyTorch build that matches your operating system and accelerator using the [official installation selector](https://pytorch.org/get-started/locally/), then run:

```bash
python -m pip install -r examples/requirements.txt
python -c "import torch; print(torch.__version__); print('CUDA:', torch.cuda.is_available())"
python examples/train_mlp.py
```

The example uses synthetic data, does not download a dataset, and supports CPU execution.

## Reference scope

This is a curated and growing reference, not a complete mirror of every PyTorch symbol, signature, release or ecosystem package. APIs evolve: use the official references linked from each entry to confirm exact parameters, device support, compatibility, edge cases and deprecations.

## Main packages

- React 18 and Vite 6
- TypeScript 5 and Tailwind CSS 3
- Framer Motion and Lucide React
- shadcn-style Button primitive with Radix Slot, CVA, `clsx`, and `tailwind-merge`
- `react-syntax-highlighter`
- Optional Firecrawl REST API for local source refresh
