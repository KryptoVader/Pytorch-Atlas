import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const apiKey = process.env.FIRECRAWL_API_KEY;
if (!apiKey) {
  console.error('Missing FIRECRAWL_API_KEY. Copy .env.example to .env and add your key.');
  process.exit(1);
}

const sources = [
  ['PyTorch Stable Documentation', 'https://docs.pytorch.org/docs/stable/', 'Core documentation index'],
  ['Tensor Views', 'https://docs.pytorch.org/docs/stable/tensor_view.html', 'Tensor memory semantics'],
  ['torch.autograd', 'https://docs.pytorch.org/docs/stable/autograd.html', 'Autograd and gradient mechanics'],
  ['torch.nn', 'https://docs.pytorch.org/docs/stable/nn.html', 'Layers, losses and utilities'],
  ['Data loading', 'https://docs.pytorch.org/docs/stable/data.html', 'DataLoader, datasets and samplers'],
  ['Reproducibility', 'https://docs.pytorch.org/docs/stable/notes/randomness.html', 'Randomness and determinism'],
  ['Performance Tuning Guide', 'https://docs.pytorch.org/tutorials/recipes/recipes/tuning_guide.html', 'Performance and memory optimization'],
  ['torch.distributed', 'https://docs.pytorch.org/docs/stable/distributed.html', 'Distributed training'],
  ['torch.func', 'https://docs.pytorch.org/docs/stable/func.html', 'Functional transforms'],
  ['torch.compiler', 'https://docs.pytorch.org/docs/stable/torch.compiler.html', 'Compilation'],
  ['torch.export', 'https://docs.pytorch.org/docs/stable/export.html', 'Graph capture and deployment'],
  ['torch.onnx', 'https://docs.pytorch.org/docs/stable/onnx.html', 'ONNX export'],
  ['Extending PyTorch', 'https://docs.pytorch.org/docs/stable/notes/extending.html', 'Custom autograd and operators'],
  ['Quantization', 'https://docs.pytorch.org/docs/stable/quantization.html', 'Quantization and migration'],
  ['torch.profiler', 'https://docs.pytorch.org/docs/stable/profiler.html', 'Performance traces'],
];
const checkedAt = new Date().toISOString().slice(0, 10);
const output = [];
for (const [title, url, topic] of sources) {
  try {
    const response = await fetch('https://api.firecrawl.dev/v2/scrape', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, formats: ['markdown', 'summary'], onlyMainContent: true, maxAge: 0 }),
    });
    const payload = await response.json();
    if (!response.ok || payload.success === false) {
      console.warn(`Skipped ${url}: ${payload.error || response.statusText}`);
      continue;
    }
    const data = payload.data || payload;
    output.push({ title, url, topic, checkedAt, summary: data.summary || '', markdown: (data.markdown || '').slice(0, 18000), scrapeId: data.metadata?.scrapeId || null });
    console.log(`Fetched: ${title}`);
  } catch (error) {
    console.warn(`Failed ${url}: ${error.message}`);
  }
}
if (!output.length) {
  console.error('No documentation pages were fetched; the existing local catalogue was not replaced.');
  process.exit(2);
}
const destination = resolve(root, 'src/docs-snapshots.json');
await mkdir(dirname(destination), { recursive: true });
await writeFile(destination, JSON.stringify(output, null, 2) + '\n', 'utf8');
console.log(`Wrote ${output.length} documentation snapshots to ${destination}`);
console.log('Review excerpts and version-specific claims before publishing a production reference.');
