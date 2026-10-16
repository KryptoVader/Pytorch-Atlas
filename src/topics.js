export const topicGroups = [
  { label: 'Start here', ids: ['overview', 'installation', 'tensor-basics', 'shapes-dtypes', 'tensor-ops', 'devices'] },
  { label: 'Data & differentiation', ids: ['autograd', 'models-modules', 'datasets-loaders', 'transforms'] },
  { label: 'Training workflow', ids: ['losses', 'optimizers', 'training-loop', 'evaluation', 'save-load', 'initialization', 'regularization', 'mixed-precision'] },
  { label: 'Architectures', ids: ['mlp', 'cnn', 'sequence-models', 'transformers'] },
  { label: 'Engineering', ids: ['reproducibility', 'debugging', 'performance', 'compile', 'distributed', 'deployment'] },
];

export const topics = [
  {
    id: 'overview', title: 'PyTorch mental model', category: 'Start here', level: 'Foundations', time: '5 min', summary: 'The pieces of a PyTorch project and how they connect.',
    intro: 'PyTorch is a tensor library with automatic differentiation and neural-network building blocks. Most projects can be understood as a pipeline: represent data as tensors, load batches, define a model, compute a loss, backpropagate gradients, update parameters, then evaluate and save.',
    sections: [
      { heading: 'The five pieces', bullets: [
        '**Tensor (`torch.Tensor`)** — the multidimensional data structure; tensors carry shape, dtype, device, and optionally gradient history.',
        '**Dataset / DataLoader** — defines one example and batches examples, optionally shuffling and loading in parallel.',
        '**Model (`nn.Module`)** — owns parameters and describes the forward computation.',
        '**Loss + optimizer** — the loss measures prediction error; the optimizer updates parameters using gradients.',
        '**Training loop** — repeatedly runs forward → loss → gradients → parameter update; validation checks generalization.'
      ]},
      { heading: 'What PyTorch does for you', bullets: [
        'Tracks differentiable operations when gradient recording is enabled.',
        'Computes gradients with reverse-mode automatic differentiation.',
        'Provides CPU and accelerator backends, common layers, losses, optimizers, data utilities, and serialization.',
        'Leaves the training loop explicit, which makes it flexible and inspectable.'
      ]},
      { heading: 'A useful default workflow', paragraphs: ['Start with a tiny batch and a small model. Verify tensor shapes, run one forward pass, calculate the loss, and check that gradients exist before launching a long training job. Keep training, validation, and test data logically separate.'] }
    ],
    examples: [{ title: 'Minimal PyTorch skeleton', code: `import torch\nfrom torch import nn\n\ndevice = torch.device("cuda" if torch.cuda.is_available() else "cpu")\nmodel = nn.Sequential(nn.Linear(10, 32), nn.ReLU(), nn.Linear(32, 2)).to(device)\nx = torch.randn(8, 10, device=device)\ntarget = torch.randint(0, 2, (8,), device=device)\nloss_fn = nn.CrossEntropyLoss()\noptimizer = torch.optim.AdamW(model.parameters(), lr=1e-3)\n\nlogits = model(x)\nloss = loss_fn(logits, target)\noptimizer.zero_grad()\nloss.backward()\noptimizer.step()` }],
    gotchas: ['PyTorch does not automatically decide your model architecture, loss, metrics, or train/validation split.', 'A tensor and a model must be on compatible devices and have compatible shapes and dtypes.', 'A scalar loss is usually required for a plain `loss.backward()` call.'],
    docs: [{ label: 'PyTorch Learn the Basics', url: 'https://docs.pytorch.org/tutorials/beginner/basics/intro.html' }, { label: 'PyTorch API reference', url: 'https://docs.pytorch.org/docs/stable/index.html' }], related: ['tensor-basics', 'models-modules', 'training-loop']
  },
  {
    id: 'installation', title: 'Installation & environment', category: 'Start here', level: 'Setup', time: '6 min', summary: 'Create an isolated Python environment and install the right PyTorch build.',
    intro: 'Install PyTorch into the Python environment that will run your notebook or script. CPU and accelerator builds differ, and the right accelerator command depends on your operating system, Python version, and supported driver/runtime combination.',
    sections: [
      { heading: 'Recommended setup sequence', bullets: [
        'Create a virtual environment for each project and activate it before installing packages.',
        'Use the official PyTorch installation selector for the exact CPU, CUDA, or ROCm command. Do not blindly copy a CUDA version from another machine.',
        'Install torchvision for image datasets/transforms/models; install torchaudio only when audio functionality is needed.',
        'Verify the interpreter and accelerator after installation.'
      ]},
      { heading: 'Verify the installation', paragraphs: ['The checks below confirm the imported package version, whether CUDA is available to PyTorch, and the visible GPU name. `torch.cuda.is_available()` being false can mean a CPU-only build, an incompatible driver/runtime, or no supported GPU; it does not by itself identify the cause.'] }
    ],
    examples: [
      { title: 'Windows PowerShell', code: `py -3.12 -m venv .venv\n.\.venv\Scripts\Activate.ps1\npython -m pip install --upgrade pip\n# Install torch/torchvision using the command from the official selector\npython -c "import torch; print(torch.__version__); print(torch.cuda.is_available())"` },
      { title: 'Linux / macOS', code: `python3 -m venv .venv\nsource .venv/bin/activate\npython -m pip install --upgrade pip\n# Install torch/torchvision using the command from the official selector\npython -c 'import torch; print(torch.__version__); print(torch.cuda.is_available())'` }
    ],
    gotchas: ['Do not install packages into one Python and run a different interpreter in VS Code/Jupyter.', 'Avoid hard-coding a CUDA wheel index until you have checked the official selector.', 'A local GPU driver is not the same thing as the CUDA toolkit used for compiling custom extensions.'],
    docs: [{ label: 'Official install selector', url: 'https://pytorch.org/get-started/locally/' }, { label: 'Start Locally', url: 'https://docs.pytorch.org/get-started/locally/' }], related: ['devices', 'overview']
  },
  {
    id: 'tensor-basics', title: 'Tensor basics', category: 'Start here', level: 'Foundations', time: '8 min', summary: 'Create, inspect, reshape, and move tensors—the core PyTorch data structure.',
    intro: 'A tensor is an n-dimensional array. Every tensor has a shape, dtype, device, and memory layout. A 0-D tensor is a scalar; 1-D is a vector; 2-D is a matrix; higher dimensions commonly represent batches, channels, height/width, sequence length, or feature dimensions.',
    sections: [
      { heading: 'Creating tensors', bullets: ['`torch.tensor(data)` copies input data into a tensor.', '`torch.zeros`, `torch.ones`, and `torch.full` create initialized tensors.', '`torch.empty` allocates uninitialized memory; every value must be written before it is read.', '`torch.arange` creates stepped values; `torch.linspace` creates a fixed number of evenly spaced values.', '`torch.randn` samples from a standard normal distribution; `torch.rand` samples from a uniform distribution on [0, 1).']},
      { heading: 'Inspect before computing', bullets: ['`x.shape` / `x.size()` reports dimensions.', '`x.dtype` shows element type; `x.device` shows where it lives.', '`x.ndim` gives the number of dimensions; `x.numel()` counts all elements.', '`x.item()` converts a one-element tensor into a Python scalar; it is not for multi-element tensors.']},
      { heading: 'View versus copy', paragraphs: ['`view` requires a compatible memory layout; `reshape` returns a view when possible and otherwise may copy. `transpose` and `permute` commonly return views with changed strides. Call `.contiguous()` only when a downstream operation requires contiguous memory or measurements justify it.']}
    ],
    examples: [{ title: 'Creation and inspection', code: `import torch\n\na = torch.tensor([[1, 2], [3, 4]], dtype=torch.float32)\nb = torch.zeros(2, 3)\nc = torch.randn(4, 5)\n\nprint(a.shape)   # torch.Size([2, 2])\nprint(a.dtype)   # torch.float32\nprint(a.device)  # cpu (unless moved)\nprint(c.numel()) # 20\nprint(a.T)       # transpose for a 2-D tensor` }],
    gotchas: ['`torch.tensor(existing_tensor)` detaches and copies; use `.clone()`, `.detach()`, or `torch.as_tensor()` intentionally.', 'Mixing integer labels and floating-point model inputs is normal; mixing incompatible dtypes in arithmetic may not be.', 'A shape is not just bookkeeping: batch dimensions and channel dimensions carry meaning.'],
    docs: [{ label: 'Tensor documentation', url: 'https://docs.pytorch.org/docs/stable/tensors.html' }, { label: 'Tensor creation reference', url: 'https://docs.pytorch.org/docs/stable/torch.html#tensor-creation-ops' }], related: ['shapes-dtypes', 'tensor-ops', 'devices']
  },
  {
    id: 'shapes-dtypes', title: 'Shapes, dimensions & dtypes', category: 'Start here', level: 'Foundations', time: '7 min', summary: 'Understand batch dimensions, reshaping, broadcasting, and numeric types.',
    intro: 'Shape bugs are among the most common causes of PyTorch errors. Write down what each dimension means, especially the batch dimension. For tabular data, `[batch, features]` is common; images are commonly `[batch, channels, height, width]`; token batches are often `[batch, sequence]` before embeddings.',
    sections: [
      { heading: 'Shape operations', bullets: ['`unsqueeze(dim)` inserts a dimension of size 1.', '`squeeze(dim)` removes a dimension of size 1; specifying `dim` helps avoid accidentally dropping the batch dimension.', '`flatten(start_dim=1)` often flattens all non-batch dimensions.', '`permute(...)` reorders every dimension; `transpose(a, b)` swaps two.', '`cat` joins tensors along an existing dimension; `stack` adds a new dimension.']},
      { heading: 'Dtypes in practice', bullets: ['Floating-point activations/weights are often `float32`, `float16`, or `bfloat16`.', 'Class-index targets for `CrossEntropyLoss` are usually `torch.long` (`int64`).', 'Binary indicator masks may use `bool`; counts/indices often use integer types.', 'Converting with `.to(dtype=...)` or `.float()` changes dtype; `.to(device)` changes device.']},
      { heading: 'Broadcasting', paragraphs: ['Two dimensions are broadcast-compatible when they are equal or one of them is 1, comparing dimensions from the right. Broadcasting avoids manually repeating values, but an unexpected singleton dimension can silently create a larger result than intended.']}
    ],
    examples: [{ title: 'Shapes at a glance', code: `x = torch.randn(32, 3, 224, 224)  # batch, channels, H, W\nfeatures = x.flatten(start_dim=1) # (32, 150528)\nlabels = torch.randint(0, 10, (32,), dtype=torch.long)\n\nrow = torch.randn(32, 1)\ncolumn = torch.randn(1, 8)\nresult = row + column             # (32, 8), broadcasting\n\na = torch.randn(2, 3, 4)\nb = a.permute(0, 2, 1)           # (2, 4, 3)` }],
    gotchas: ['Do not use `.squeeze()` carelessly when batch size may be 1.', '`view(-1, ...)` infers one dimension; use only when the intended element count is clear.', 'A shape can be valid syntactically and still be semantically wrong—check what each axis represents.'],
    docs: [{ label: 'Tensor methods', url: 'https://docs.pytorch.org/docs/stable/tensors.html' }, { label: 'Broadcasting semantics', url: 'https://docs.pytorch.org/docs/stable/notes/broadcasting.html' }], related: ['tensor-basics', 'tensor-ops', 'cnn']
  },
  {
    id: 'tensor-ops', title: 'Tensor operations & indexing', category: 'Start here', level: 'Foundations', time: '8 min', summary: 'Arithmetic, reductions, indexing, masks, concatenation, and matrix multiplication.',
    intro: 'PyTorch operations work element-wise unless the operation is explicitly a reduction, matrix operation, or indexing operation. Distinguish element-wise multiplication (`*`) from matrix multiplication (`@` or `torch.matmul`).',
    sections: [
      { heading: 'Common operations', bullets: ['Element-wise arithmetic: `+`, `-`, `*`, `/`, `torch.pow`.', 'Reductions: `sum`, `mean`, `min`, `max`, `argmax`; use `dim=` to reduce over an axis.', 'Linear algebra: `@`, `torch.matmul`, `torch.mm` (2-D matrix multiplication).', 'Join/split: `torch.cat`, `torch.stack`, `torch.chunk`, `torch.split`.', 'Indexing: slices, integer index tensors, boolean masks, `index_select`, `gather`.']},
      { heading: 'In-place operations', paragraphs: ['Operations ending in an underscore (for example `add_`) mutate a tensor in place. In-place updates can save memory but may conflict with autograd if they overwrite values needed for backward. Prefer out-of-place operations until you have a measured reason and understand the gradient implications.']}
    ],
    examples: [{ title: 'Operations and reductions', code: `x = torch.tensor([[1., 2., 3.], [4., 5., 6.]])\nprint(x.mean())          # scalar mean\nprint(x.sum(dim=0))      # reduce rows -> shape (3,)\nprint(x.argmax(dim=1))   # index of max in each row\nprint(x @ x.T)           # matrix multiplication: (2, 2)\n\nmask = x > 3\nprint(x[mask])           # values where mask is True\nx[:, 0] = 0              # assign to first column` }],
    gotchas: ['`argmax` returns indices, not confidence scores.', '`torch.max(x, dim=...)` returns both values and indices.', 'Calling `.tolist()` or `.item()` on CUDA tensors can force synchronization; avoid inside performance-critical loops.'],
    docs: [{ label: 'Torch operation reference', url: 'https://docs.pytorch.org/docs/stable/torch.html' }], related: ['tensor-basics', 'shapes-dtypes', 'autograd']
  },
  {
    id: 'devices', title: 'CPU, CUDA & devices', category: 'Start here', level: 'Intermediate', time: '7 min', summary: 'Choose a device and consistently move models, batches, and tensors.',
    intro: 'Device placement determines where tensor operations run. The common pattern is to choose an available device once, move the model to it, and move each batch to the same device inside the training loop.',
    sections: [
      { heading: 'Device workflow', bullets: ['`torch.cuda.is_available()` checks if CUDA is usable by this PyTorch installation.', '`torch.device("cuda")` selects the current CUDA device; explicit device indices can be used for multi-GPU work.', 'Move a module with `model.to(device)` and a tensor with `tensor.to(device)`.', 'Use `.cpu()` before converting a GPU tensor to NumPy.', 'MPS may be available on supported Apple hardware; check availability before selecting it.']},
      { heading: 'Remember that `.to()` returns a tensor', paragraphs: ['For tensors, `x.to(device)` typically returns a tensor on the requested device; assign the result (`x = x.to(device)`). Modules are moved in place and return the module, so `model.to(device)` is conventional.']}
    ],
    examples: [{ title: 'Portable device selection', code: `import torch\n\nif torch.cuda.is_available():\n    device = torch.device("cuda")\nelif hasattr(torch.backends, "mps") and torch.backends.mps.is_available():\n    device = torch.device("mps")\nelse:\n    device = torch.device("cpu")\n\nmodel = model.to(device)\nfor x, y in loader:\n    x = x.to(device)\n    y = y.to(device)\n    logits = model(x)` }],
    gotchas: ['A model on CUDA cannot operate directly on a CPU input tensor.', 'Do not assume a specific GPU index exists on every machine.', 'GPU operations are asynchronous; benchmark with appropriate synchronization or tools.'],
    docs: [{ label: 'CUDA semantics', url: 'https://docs.pytorch.org/docs/stable/notes/cuda.html' }, { label: 'MPS backend', url: 'https://docs.pytorch.org/docs/stable/notes/mps.html' }], related: ['installation', 'training-loop', 'performance']
  },
  {
    id: 'autograd', title: 'Autograd & backpropagation', category: 'Data & differentiation', level: 'Core concept', time: '9 min', summary: 'How PyTorch records operations and computes gradients.',
    intro: 'Autograd builds a dynamic computation graph while differentiable operations execute with gradient recording enabled. Calling `backward()` computes derivatives using the chain rule and accumulates them into leaf tensors such as trainable model parameters.',
    sections: [
      { heading: 'The gradient lifecycle', bullets: ['Set `requires_grad=True` on a tensor when you need gradients with respect to it.', 'Compute a scalar loss from the model output.', 'Call `loss.backward()` to populate parameter gradients.', 'Clear gradients before the next update because `.grad` accumulates by default.', 'Call `optimizer.step()` to update parameters using their gradients.']},
      { heading: 'Important controls', bullets: ['`torch.no_grad()` disables gradient recording in a block; useful for evaluation and inference.', '`torch.inference_mode()` can further reduce overhead for pure inference, with stricter restrictions.', '`tensor.detach()` creates a tensor disconnected from the graph.', '`requires_grad_()` changes the flag in place; use with care when reasoning about leaf tensors.', 'Most non-leaf tensors do not retain `.grad` unless `retain_grad()` is requested.']},
      { heading: 'Why gradients accumulate', paragraphs: ['Accumulation supports gradient accumulation across multiple micro-batches, but ordinary training usually calls `optimizer.zero_grad()` each iteration (often with `set_to_none=True`) before `backward()`.']}
    ],
    examples: [{ title: 'Inspect a gradient', code: `x = torch.tensor(3.0, requires_grad=True)\ny = x**2 + 2*x\ny.backward()\nprint(x.grad)  # dy/dx = 2x + 2 = 8 at x = 3\n\n# For a model training step:\noptimizer.zero_grad(set_to_none=True)\nloss = loss_fn(model(inputs), targets)\nloss.backward()\noptimizer.step()` }],
    gotchas: ['Calling `backward()` twice on the same graph generally requires `retain_graph=True`; avoid this unless necessary.', 'Do not update parameters in place between forward and backward unless the operation is supported and safe.', 'Use `model.eval()` and `no_grad()` for different reasons: evaluation mode changes certain layer behavior; no-grad controls graph recording.'],
    docs: [{ label: 'Autograd mechanics', url: 'https://docs.pytorch.org/docs/stable/notes/autograd.html' }, { label: 'torch.autograd API', url: 'https://docs.pytorch.org/docs/stable/autograd.html' }], related: ['training-loop', 'evaluation', 'debugging']
  },
  {
    id: 'models-modules', title: 'Models & nn.Module', category: 'Data & differentiation', level: 'Core concept', time: '9 min', summary: 'Define layers, register parameters, and build reusable forward passes.',
    intro: '`torch.nn.Module` is the base class for neural networks and layers. Subclass it when you need a custom architecture; put trainable layers in `__init__` and define how data flows through them in `forward`.',
    sections: [
      { heading: 'What `nn.Module` provides', bullets: ['Registers submodules and parameters assigned as attributes.', '`model.parameters()` supplies trainable parameters to an optimizer.', '`state_dict()` exposes parameters and persistent buffers for checkpointing.', '`model.train()` and `model.eval()` recursively switch mode-sensitive layers.', '`model.to(device)` moves parameters and buffers to a device.']},
      { heading: 'Build the forward pass', paragraphs: ['Use layers from `torch.nn` (`Linear`, `Conv2d`, `Embedding`, `LayerNorm`, `Dropout`, etc.) and compose them. Call `model(x)` rather than `model.forward(x)` directly: the module call path handles hooks and other framework behavior.']}
    ],
    examples: [{ title: 'A small classifier', code: `import torch.nn as nn\n\nclass MLP(nn.Module):\n    def __init__(self, in_features: int, n_classes: int):\n        super().__init__()\n        self.network = nn.Sequential(\n            nn.Linear(in_features, 128),\n            nn.ReLU(),\n            nn.Dropout(p=0.2),\n            nn.Linear(128, n_classes),\n        )\n\n    def forward(self, x):\n        return self.network(x)  # raw logits\n\nmodel = MLP(in_features=20, n_classes=4)` }],
    gotchas: ['Do not create trainable layers inside `forward`; doing so repeatedly can create fresh, unregistered parameters.', 'Remember `super().__init__()` in a custom module.', 'For `CrossEntropyLoss`, usually return raw logits—not softmax probabilities.'],
    docs: [{ label: 'Build the neural network', url: 'https://docs.pytorch.org/tutorials/beginner/basics/buildmodel_tutorial.html' }, { label: 'nn.Module API', url: 'https://docs.pytorch.org/docs/stable/generated/torch.nn.Module.html' }], related: ['mlp', 'losses', 'save-load']
  },
  {
    id: 'datasets-loaders', title: 'Dataset & DataLoader', category: 'Data & differentiation', level: 'Core workflow', time: '8 min', summary: 'Turn individual examples into batched, optionally shuffled data.',
    intro: 'A `Dataset` defines how to retrieve one sample; a `DataLoader` wraps it to form batches and control shuffling, parallel workers, pinned memory, and other loading behavior. `TensorDataset` is convenient when features and targets already live in tensors.',
    sections: [
      { heading: 'Choose the right abstraction', bullets: ['Use `TensorDataset(X, y)` for aligned tensors that fit in memory.', 'Implement `Dataset` when examples need custom parsing, file access, lazy loading, or specialized labels.', '`DataLoader(dataset, batch_size=..., shuffle=True)` yields mini-batches.', 'Use `shuffle=True` for training when order should not matter; validation/test loaders normally do not shuffle.', 'Tune `num_workers` for your platform and workload; more workers are not always faster.']},
      { heading: 'Batch structure', paragraphs: ['A loader returns whatever each dataset item returns, collated into batches by default. The common supervised case yields `(features, targets)`. Text, images, variable-length sequences, and multimodal records can need a custom `collate_fn`.']}
    ],
    examples: [
      { title: 'Tensors already in memory', code: `from torch.utils.data import TensorDataset, DataLoader\n\ndataset = TensorDataset(X, y)\nloader = DataLoader(\n    dataset, batch_size=64, shuffle=True,\n    num_workers=0, pin_memory=torch.cuda.is_available()\n)\n\nfor features, target in loader:\n    # features: (batch_size, n_features)\n    # target: typically (batch_size,) for class indices\n    ...` },
      { title: 'Custom dataset shape', code: `from torch.utils.data import Dataset\n\nclass TabularDataset(Dataset):\n    def __init__(self, features, targets):\n        self.features = features\n        self.targets = targets\n\n    def __len__(self):\n        return len(self.features)\n\n    def __getitem__(self, index):\n        return self.features[index], self.targets[index]` }
    ],
    gotchas: ['For Windows scripts using multiple workers, use the standard `if __name__ == "__main__":` guard.', 'Do not use `drop_last=True` by default; it discards the final incomplete batch.', '`pin_memory=True` can help host-to-CUDA transfer in some setups, but measure it.'],
    docs: [{ label: 'Datasets & DataLoaders tutorial', url: 'https://docs.pytorch.org/tutorials/beginner/basics/data_tutorial.html' }, { label: 'Data API', url: 'https://docs.pytorch.org/docs/stable/data.html' }], related: ['transforms', 'training-loop', 'devices']
  },
  {
    id: 'transforms', title: 'Transforms & preprocessing', category: 'Data & differentiation', level: 'Core workflow', time: '6 min', summary: 'Apply consistent preprocessing and optional training-time augmentation.',
    intro: 'Transforms convert raw examples into model-ready representations. Keep preprocessing consistent between training and inference. Random augmentations are usually applied to training data only; deterministic normalization and type conversions are applied where appropriate to all splits.',
    sections: [
      { heading: 'Images', bullets: ['`torchvision.transforms` contains resize, crop, flip, tensor conversion, normalization, and augmentation utilities.', 'Normalization uses the intended channel-wise mean and standard deviation.', 'Augmentations should preserve the target label and resemble plausible deployment variation.', 'Check expected input layout and range, such as CHW and `[0, 1]` after tensor conversion.']},
      { heading: 'Tabular / text data', bullets: ['Fit scalers, imputers, vocabularies, and feature selectors using training data only.', 'Apply the same fitted transformation to validation, test, and production data to prevent leakage.', 'For NLP, tokenization and padding/truncation need a consistent policy; batching variable lengths may require a custom collator.']}
    ],
    examples: [{ title: 'Image preprocessing example', code: `from torchvision import transforms\n\ntrain_transform = transforms.Compose([\n    transforms.RandomResizedCrop(224),\n    transforms.RandomHorizontalFlip(),\n    transforms.ToTensor(),\n    transforms.Normalize(mean=(0.485, 0.456, 0.406),\n                         std=(0.229, 0.224, 0.225)),\n])\n\neval_transform = transforms.Compose([\n    transforms.Resize(256),\n    transforms.CenterCrop(224),\n    transforms.ToTensor(),\n    transforms.Normalize(mean=(0.485, 0.456, 0.406),\n                         std=(0.229, 0.224, 0.225)),\n])` }],
    gotchas: ['The normalization constants above are commonly used with ImageNet-pretrained vision models, not a universal default.', 'Do not compute preprocessing statistics from the entire dataset before splitting.', 'Random transforms should generally not affect validation metrics between runs.'],
    docs: [{ label: 'Transforms tutorial', url: 'https://docs.pytorch.org/tutorials/beginner/basics/transforms_tutorial.html' }, { label: 'torchvision transforms', url: 'https://docs.pytorch.org/vision/stable/transforms.html' }], related: ['datasets-loaders', 'cnn', 'reproducibility']
  },
  {
    id: 'losses', title: 'Loss functions', category: 'Training workflow', level: 'Core concept', time: '8 min', summary: 'Match the objective function to the task and target representation.',
    intro: 'A loss converts predictions and targets into a scalar objective to minimize. The expected target dtype and prediction format differ by loss; using the wrong combination can produce a runtime error or, worse, train the wrong objective.',
    sections: [
      { heading: 'Common pairings', bullets: ['Multiclass classification: `CrossEntropyLoss` with raw logits of shape `[N, C]` and integer class indices of shape `[N]` (`long`).', 'Binary classification / multi-label classification: `BCEWithLogitsLoss` with raw logits and floating targets in `[0, 1]`; for multi-label tasks predictions can be `[N, C]`.', 'Regression: `MSELoss` for squared error; `L1Loss` for absolute error; `SmoothL1Loss` for a robust alternative.', 'Class probabilities are not usually passed to `CrossEntropyLoss`; it performs the relevant log-softmax internally.']},
      { heading: 'Reduction and weighting', bullets: ['Default `reduction="mean"` averages loss elements; `sum` adds them; `none` retains per-element values.', 'Class weights can help address class imbalance but should reflect a considered strategy.', 'Mask padded/ignored values rather than allowing them to dominate the objective.']}
    ],
    examples: [{ title: 'Choose the loss', code: `# Multiclass classification\ncriterion = nn.CrossEntropyLoss()\nlogits = model(x)                 # (N, C), no softmax\nloss = criterion(logits, class_ids)  # class_ids: (N,), torch.long\n\n# Binary or multi-label classification\ncriterion = nn.BCEWithLogitsLoss()\nlogits = binary_model(x)          # (N,) or (N, C)\nloss = criterion(logits, targets.float())\n\n# Regression\ncriterion = nn.MSELoss()\nprediction = regression_model(x)\nloss = criterion(prediction, y.float())` }],
    gotchas: ['A one-hot target matrix is not the standard target form for class-index `CrossEntropyLoss`.', 'Do not add a sigmoid before `BCEWithLogitsLoss`; the combined loss is numerically more stable.', 'Check that prediction and target shapes align exactly for regression to avoid accidental broadcasting.'],
    docs: [{ label: 'torch.nn loss functions', url: 'https://docs.pytorch.org/docs/stable/nn.html#loss-functions' }], related: ['training-loop', 'mlp', 'evaluation']
  },
  {
    id: 'optimizers', title: 'Optimizers & learning rates', category: 'Training workflow', level: 'Core concept', time: '7 min', summary: 'Update parameters and control the size and direction of learning steps.',
    intro: 'Optimizers use the gradients stored on model parameters to update weights. SGD is a classic baseline; momentum improves directional consistency; Adam adapts per-parameter step sizes; AdamW decouples weight decay from the gradient-based update.',
    sections: [
      { heading: 'Common choices', bullets: ['`torch.optim.SGD` — simple, often strong with a tuned learning-rate schedule and momentum.', '`torch.optim.Adam` — adaptive first/second-moment estimates.', '`torch.optim.AdamW` — Adam-style updates with decoupled weight decay; a common modern default.', 'Learning rate is often one of the most influential hyperparameters.', 'Weight decay, gradient clipping, and scheduler choice solve different problems; none is universally required.']},
      { heading: 'Schedulers', paragraphs: ['A scheduler adjusts the learning rate according to a schedule or metric. Examples include `StepLR`, `CosineAnnealingLR`, and `ReduceLROnPlateau`. Follow the scheduler’s intended stepping frequency: some are stepped once per epoch, others per optimizer update.']}
    ],
    examples: [{ title: 'Optimizer and scheduler', code: `optimizer = torch.optim.AdamW(\n    model.parameters(), lr=3e-4, weight_decay=1e-2\n)\nscheduler = torch.optim.lr_scheduler.CosineAnnealingLR(\n    optimizer, T_max=num_epochs\n)\n\nfor epoch in range(num_epochs):\n    train_one_epoch(...)\n    validate(...)\n    scheduler.step()  # this scheduler is stepped per epoch` }],
    gotchas: ['The optimizer must receive the parameters of the model you actually train.', 'Call `optimizer.step()` after gradients are computed, not before.', 'Scheduler stepping order and frequency depend on scheduler type; consult the specific scheduler docs.'],
    docs: [{ label: 'Optimizer API', url: 'https://docs.pytorch.org/docs/stable/optim.html' }, { label: 'Learning-rate scheduler API', url: 'https://docs.pytorch.org/docs/stable/optim.html#how-to-adjust-learning-rate' }], related: ['training-loop', 'regularization', 'mixed-precision']
  },
  {
    id: 'training-loop', title: 'The training loop', category: 'Training workflow', level: 'Core workflow', time: '10 min', summary: 'Connect the data loader, model, loss, backward pass, and optimizer.',
    intro: 'The training loop is explicit by design. For each batch: move data, clear old gradients, run the forward pass, compute loss, backpropagate, and update the weights. Track metrics across the epoch and distinguish per-batch averages from sample-weighted averages.',
    sections: [
      { heading: 'Canonical step order', bullets: ['`model.train()` enables training behavior for layers such as dropout and batch normalization.', '`optimizer.zero_grad(set_to_none=True)` clears gradients from the previous step.', 'Forward pass produces predictions/logits; the loss compares them with targets.', '`loss.backward()` computes gradients.', '`optimizer.step()` applies the update.', 'Accumulate detached metrics; do not keep the entire computation graph alive in a Python list.']},
      { heading: 'Validation is a separate phase', paragraphs: ['Validation should not update model weights. Set `model.eval()` and disable gradient recording. Aggregate the metric across the full validation set and use it to guide model selection, learning-rate decisions, or early stopping. Do not repeatedly tune choices based on the final test set.']}
    ],
    examples: [{ title: 'Train one epoch', code: `def train_one_epoch(model, loader, loss_fn, optimizer, device):\n    model.train()\n    total_loss = 0.0\n    total_items = 0\n\n    for x, y in loader:\n        x, y = x.to(device), y.to(device)\n        optimizer.zero_grad(set_to_none=True)\n        logits = model(x)\n        loss = loss_fn(logits, y)\n        loss.backward()\n        optimizer.step()\n\n        batch_size = x.size(0)\n        total_loss += loss.detach().item() * batch_size\n        total_items += batch_size\n\n    return total_loss / max(total_items, 1)` }],
    gotchas: ['Do not forget `zero_grad`; gradients accumulate by default.', 'Use `loss.item()` or `loss.detach()` only for logging; keep the original loss for `backward()`.', 'For gradient accumulation, intentionally delay optimizer updates and scale the loss appropriately.', 'If the dataset is not equally sized in every batch, weight epoch loss by batch size for a sample-level mean.'],
    docs: [{ label: 'Optimization tutorial', url: 'https://docs.pytorch.org/tutorials/beginner/basics/optimization_tutorial.html' }], related: ['autograd', 'losses', 'evaluation', 'mixed-precision']
  },
  {
    id: 'evaluation', title: 'Evaluation & inference', category: 'Training workflow', level: 'Core workflow', time: '7 min', summary: 'Switch model behavior, skip gradient tracking, and compute metrics correctly.',
    intro: 'Inference has two separate switches: `model.eval()` changes behavior of modules that have training/evaluation modes, while `torch.no_grad()` or `torch.inference_mode()` disables autograd tracking. Most evaluation code needs both.',
    sections: [
      { heading: 'Mode versus grad recording', bullets: ['`model.eval()` affects dropout and batch normalization behavior; it does not itself disable gradients.', '`torch.no_grad()` avoids building a backward graph but keeps ordinary tensor operations available.', '`torch.inference_mode()` is useful for pure inference and can provide extra performance benefits; tensors created there have stronger restrictions.', 'Return to `model.train()` before continuing training after validation.']},
      { heading: 'Metrics', bullets: ['For class-index predictions from logits, `logits.argmax(dim=1)` gives predicted classes.', 'Accuracy is often a starting metric but may be misleading under class imbalance.', 'Use task-relevant metrics such as precision/recall/F1, AUROC, MAE/RMSE, or calibration measures as appropriate.', 'Aggregate counts or per-example results across the dataset instead of averaging metrics with incompatible weighting.']}
    ],
    examples: [{ title: 'Evaluation loop', code: `model.eval()\ncorrect, total = 0, 0\nwith torch.inference_mode():\n    for x, y in val_loader:\n        x, y = x.to(device), y.to(device)\n        logits = model(x)\n        prediction = logits.argmax(dim=1)\n        correct += (prediction == y).sum().item()\n        total += y.size(0)\n\naccuracy = correct / max(total, 1)` }],
    gotchas: ['Do not apply softmax just to take `argmax`; argmax of logits and softmax probabilities is the same.', 'Dropout left in training mode makes inference stochastic.', 'Evaluation code should not call `optimizer.step()` or update trainable parameters.'],
    docs: [{ label: 'Save, load, and run tutorial', url: 'https://docs.pytorch.org/tutorials/beginner/basics/saveloadrun_tutorial.html' }], related: ['training-loop', 'save-load', 'losses']
  },
  {
    id: 'save-load', title: 'Save, load & checkpoint', category: 'Training workflow', level: 'Core workflow', time: '8 min', summary: 'Persist model weights safely and resume training when needed.',
    intro: 'Saving a model’s `state_dict` is generally the most flexible default. Recreate the same model architecture, load the weights, move it to the target device, and call `eval()` for inference. A resumable training checkpoint should also include optimizer/scheduler state and training progress.',
    sections: [
      { heading: 'Inference artifact', bullets: ['Save learned parameters with `torch.save(model.state_dict(), path)`.', 'Re-create the same architecture before loading weights.', 'Use `load_state_dict` and check for missing/unexpected keys when relevant.', 'When loading weights, prefer restricted `weights_only=True` where supported by the chosen PyTorch version and artifact format.', 'Treat checkpoint files as trusted inputs; deserialization can be security-sensitive.']},
      { heading: 'Resume training', paragraphs: ['Save the epoch, model state, optimizer state, scheduler state, and any scaler state used for mixed precision. Also save configuration and random-number-generator state when exact reproducibility matters. Restoring a checkpoint is more than just restoring model weights.']}
    ],
    examples: [
      { title: 'Save and load for inference', code: `# Save\ntorch.save(model.state_dict(), "model.pth")\n\n# Load into the same model architecture\nmodel = MyModel(...)\nstate = torch.load("model.pth", map_location=device, weights_only=True)\nmodel.load_state_dict(state)\nmodel.to(device)\nmodel.eval()` },
      { title: 'Training checkpoint', code: `checkpoint = {\n    "epoch": epoch,\n    "model_state": model.state_dict(),\n    "optimizer_state": optimizer.state_dict(),\n    "scheduler_state": scheduler.state_dict(),\n    "config": config,\n}\ntorch.save(checkpoint, "checkpoint.pth")\n\n# Loading a checkpoint requires a compatible model/optimizer setup.\ncheckpoint = torch.load("checkpoint.pth", map_location=device, weights_only=True)\nmodel.load_state_dict(checkpoint["model_state"])\noptimizer.load_state_dict(checkpoint["optimizer_state"])` }
    ],
    gotchas: ['Saving a state dict does not save the model class definition or architecture code.', 'Move optimizer state to the correct device if needed when resuming across devices.', 'Avoid loading unknown pickle-based files from untrusted sources.'],
    docs: [{ label: 'Saving and loading models', url: 'https://docs.pytorch.org/tutorials/beginner/saving_loading_models.html' }, { label: 'torch.load API', url: 'https://docs.pytorch.org/docs/stable/generated/torch.load.html' }], related: ['models-modules', 'evaluation', 'reproducibility']
  },
  {
    id: 'initialization', title: 'Weight initialization', category: 'Training workflow', level: 'Intermediate', time: '7 min', summary: 'Start trainable layers with sensible weight distributions.',
    intro: 'Initialization affects signal and gradient scales at the start of training. PyTorch layers have built-in default initialization, so you do not need to blindly apply Xavier or He initialization to every layer. Custom initialization is useful when architecture, activation, or research requirements justify it.',
    sections: [
      { heading: 'Common strategies', bullets: ['Kaiming / He initialization is designed for ReLU-like activations and accounts for fan-in/fan-out.', 'Xavier / Glorot initialization balances variance across inputs and outputs and is commonly associated with tanh or linear activations.', 'Biases are often initialized to zero or small values depending on the layer and model.', 'Pretrained networks should generally keep their pretrained parameters unless intentionally reinitializing part of the model.']},
      { heading: 'Where to apply it', paragraphs: ['Use `model.apply(init_fn)` to traverse modules and initialize selected layer types. Be deliberate about convolution, linear, recurrent, and normalization layers—one global rule is rarely right for all of them.']}
    ],
    examples: [{ title: 'Initialize linear and convolution layers', code: `import torch.nn as nn\n\n def_init_note = "Choose an initializer that matches the activation and architecture."\n\ndef init_weights(module):\n    if isinstance(module, (nn.Linear, nn.Conv2d)):\n        nn.init.kaiming_normal_(module.weight, nonlinearity="relu")\n        if module.bias is not None:\n            nn.init.zeros_(module.bias)\n\nmodel.apply(init_weights)` }],
    gotchas: ['The snippet uses ReLU-oriented Kaiming initialization; do not apply it uncritically to every architecture.', 'Initializing after loading pretrained weights overwrites learned knowledge.', 'Initialization is not a substitute for sensible normalization, architecture, or learning-rate choices.'],
    docs: [{ label: 'torch.nn.init reference', url: 'https://docs.pytorch.org/docs/stable/nn.init.html' }], related: ['models-modules', 'mlp', 'regularization']
  },
  {
    id: 'regularization', title: 'Regularization & overfitting', category: 'Training workflow', level: 'Intermediate', time: '8 min', summary: 'Improve generalization using data, architecture, and optimization choices.',
    intro: 'Overfitting occurs when a model fits training data but fails to generalize to new samples. Regularization includes explicit penalties and stochastic layers, but good data splits, adequate data quality, and early validation often matter just as much.',
    sections: [
      { heading: 'Common techniques', bullets: ['Weight decay penalizes large parameters; `AdamW` implements decoupled weight decay.', 'Dropout randomly masks activations during training and is disabled by `model.eval()`.', 'Data augmentation introduces label-preserving variation in training examples.', 'Early stopping selects a checkpoint using validation performance.', 'Batch normalization and layer normalization stabilize activation distributions but serve different roles; they are not interchangeable regularizers.', 'Label smoothing changes target distributions for some classification objectives.']},
      { heading: 'Diagnose before adding complexity', paragraphs: ['Compare training and validation curves. High training and high validation error may suggest underfitting, a pipeline bug, or distribution mismatch. Low training error with much worse validation error suggests overfitting, leakage, or a split that differs from the real deployment distribution.']}
    ],
    examples: [{ title: 'Dropout and weight decay', code: `model = nn.Sequential(\n    nn.Linear(n_features, 256),\n    nn.ReLU(),\n    nn.Dropout(p=0.25),\n    nn.Linear(256, n_classes),\n)\noptimizer = torch.optim.AdamW(\n    model.parameters(), lr=1e-3, weight_decay=1e-2\n)\n\n# model.train(): dropout active\n# model.eval(): dropout disabled` }],
    gotchas: ['Too much regularization can cause underfitting.', 'Dropout is not active in the expected way unless module mode is managed correctly.', 'Weight decay values are not directly comparable across all optimizers and training setups.'],
    docs: [{ label: 'Dropout', url: 'https://docs.pytorch.org/docs/stable/generated/torch.nn.Dropout.html' }, { label: 'AdamW', url: 'https://docs.pytorch.org/docs/stable/generated/torch.optim.AdamW.html' }], related: ['optimizers', 'evaluation', 'transforms']
  },
  {
    id: 'mixed-precision', title: 'Mixed precision (AMP)', category: 'Training workflow', level: 'Advanced', time: '8 min', summary: 'Use autocasting and gradient scaling to improve throughput and memory use.',
    intro: 'Automatic mixed precision runs eligible operations in lower precision while retaining higher precision where needed. This often improves performance on supported accelerators, but benefits vary by GPU, model, and workload. Modern PyTorch uses `torch.autocast` and `torch.amp.GradScaler` patterns.',
    sections: [
      { heading: 'The moving parts', bullets: ['`torch.autocast(device_type=...)` chooses precision per operation inside a context.', '`GradScaler` is primarily useful for float16 CUDA training to reduce gradient underflow; bfloat16 often does not need scaling.', 'Keep model parameters in their normal precision and let autocast choose supported operations unless a specific workflow requires otherwise.', 'Validate numerical behavior and benchmark real throughput before making AMP a default.']},
      { heading: 'Common pattern', paragraphs: ['For CUDA float16 training, autocast the forward/loss region, scale the loss before backward, then let the scaler step the optimizer and update the scale. Do not call `loss.backward()` inside the autocast context by default; follow the documented pattern.']}
    ],
    examples: [{ title: 'CUDA float16 training step', code: `scaler = torch.amp.GradScaler("cuda")\n\nfor x, y in loader:\n    x, y = x.to(device), y.to(device)\n    optimizer.zero_grad(set_to_none=True)\n    with torch.autocast(device_type="cuda", dtype=torch.float16):\n        logits = model(x)\n        loss = loss_fn(logits, y)\n    scaler.scale(loss).backward()\n    scaler.step(optimizer)\n    scaler.update()` }],
    gotchas: ['This example assumes CUDA and float16; check current API support and hardware before adapting it to CPU, XPU, or bfloat16.', 'Custom losses or numerically sensitive operations may need explicit precision handling.', 'Do not combine AMP with manual `.half()` conversions without understanding the resulting dtype interactions.'],
    docs: [{ label: 'Automatic mixed precision', url: 'https://docs.pytorch.org/docs/stable/amp.html' }, { label: 'AMP examples', url: 'https://docs.pytorch.org/docs/stable/notes/amp_examples.html' }], related: ['training-loop', 'devices', 'performance']
  },
  {
    id: 'mlp', title: 'Fully connected networks (MLP)', category: 'Architectures', level: 'Architecture', time: '7 min', summary: 'Build feed-forward networks for tabular data and fixed-size feature vectors.',
    intro: 'An MLP applies affine transformations and nonlinear activations. `nn.Linear(in_features, out_features)` computes a learned linear map plus bias; stacking linear layers without nonlinearities is still just one affine transformation, so activations matter.',
    sections: [
      { heading: 'Design choices', bullets: ['Input dimension must match the feature count after preprocessing.', 'Hidden width/depth trade expressive capacity against compute and overfitting risk.', 'ReLU/GELU are common hidden activations; the best choice depends on the model and task.', 'The final layer should match the task: one output for scalar regression, class logits for multiclass classification, or appropriate output dimensions for multi-label work.', 'Normalize numeric features where appropriate, especially when feature scales differ substantially.']},
      { heading: 'Interpret output dimensions', paragraphs: ['For a batch of `N` tabular examples and `C` classes, a classifier commonly returns logits with shape `[N, C]`. A regression model might return `[N, 1]`; ensure targets use a matching shape to avoid broadcasting mistakes.']}
    ],
    examples: [{ title: 'Tabular classifier', code: `class TabularMLP(nn.Module):\n    def __init__(self, n_features, n_classes):\n        super().__init__()\n        self.net = nn.Sequential(\n            nn.Linear(n_features, 128), nn.ReLU(),\n            nn.Linear(128, 64), nn.ReLU(),\n            nn.Linear(64, n_classes),\n        )\n\n    def forward(self, x):\n        return self.net(x)  # logits; no output softmax for CrossEntropyLoss` }],
    gotchas: ['Do not confuse a fully connected layer with a fully connected neural network: activations and training make the complete model.', 'Flatten image tensors before feeding them to an MLP, but consider whether losing spatial structure is appropriate.', 'Standardize numeric features using training-split statistics, not test information.'],
    docs: [{ label: 'Linear layer', url: 'https://docs.pytorch.org/docs/stable/generated/torch.nn.Linear.html' }], related: ['models-modules', 'losses', 'initialization']
  },
  {
    id: 'cnn', title: 'Convolutional neural networks (CNNs)', category: 'Architectures', level: 'Architecture', time: '9 min', summary: 'Learn convolution, channels, pooling, receptive fields, and output shapes.',
    intro: 'CNNs apply learned local filters across spatial dimensions. Weight sharing lets the same filter detect patterns at different locations; stacking layers builds increasingly complex receptive fields. In standard PyTorch vision models, images usually use NCHW layout: batch, channels, height, width.',
    sections: [
      { heading: 'Main building blocks', bullets: ['`Conv2d(in_channels, out_channels, kernel_size, stride, padding)` learns filters and produces feature maps.', '`ReLU` or another activation supplies nonlinearity.', '`MaxPool2d` downsamples by selecting local maxima; strided convolutions can also downsample.', '`BatchNorm2d` normalizes channel activations using running statistics during evaluation.', '`AdaptiveAvgPool2d((1, 1))` reduces each channel to one spatial value, simplifying the classifier head.']},
      { heading: 'Reading shapes', paragraphs: ['Convolution output height/width depend on input size, kernel, stride, padding, and dilation. Track channels as carefully as spatial dimensions: the next convolution’s `in_channels` must equal the previous layer’s `out_channels`. Flatten the correct non-batch dimensions before a dense layer.']},
      { heading: 'Where PCA fits', paragraphs: ['PCA is not usually a standard preprocessing step for raw images entering a CNN: convolutional filters learn spatial features directly. PCA can still be useful in a broader pipeline—for example, on tabular side features, embeddings, or engineered representations—when dimensionality reduction is justified and fit only on training data.']}
    ],
    examples: [{ title: 'Compact CNN', code: `class SmallCNN(nn.Module):\n    def __init__(self, n_classes=10):\n        super().__init__()\n        self.features = nn.Sequential(\n            nn.Conv2d(3, 32, kernel_size=3, padding=1),\n            nn.ReLU(),\n            nn.MaxPool2d(2),\n            nn.Conv2d(32, 64, kernel_size=3, padding=1),\n            nn.ReLU(),\n            nn.AdaptiveAvgPool2d((1, 1)),\n        )\n        self.classifier = nn.Linear(64, n_classes)\n\n    def forward(self, x):\n        x = self.features(x)       # (N, 64, 1, 1)\n        x = torch.flatten(x, 1)    # (N, 64)\n        return self.classifier(x)  # logits` }],
    gotchas: ['A `Conv2d` expects channel-first tensors by default: `[N, C, H, W]`.', 'Pooling reduces spatial size, not the number of channels.', 'Dense layers after flattening can create a large parameter count; global/adaptive pooling is often more parameter-efficient.'],
    docs: [{ label: 'Conv2d API', url: 'https://docs.pytorch.org/docs/stable/generated/torch.nn.Conv2d.html' }, { label: 'TorchVision models', url: 'https://docs.pytorch.org/vision/stable/models.html' }], related: ['shapes-dtypes', 'transforms', 'mlp']
  },
  {
    id: 'sequence-models', title: 'Sequence models: RNN, LSTM & GRU', category: 'Architectures', level: 'Architecture', time: '8 min', summary: 'Model sequential inputs and understand batch-first tensor layouts.',
    intro: 'Recurrent models process a sequence one time step at a time while carrying a hidden state. LSTM and GRU add gating mechanisms that help preserve useful information over longer spans compared with a simple vanilla RNN.',
    sections: [
      { heading: 'Shape conventions', bullets: ['With `batch_first=True`, input commonly has shape `[batch, sequence, features]`.', 'Without `batch_first`, sequence-first layout is `[sequence, batch, features]`.', 'The hidden state and output sequence are different: `output` contains outputs across time; `h_n` summarizes final hidden state(s).', 'For classification, use the final time step, pooled outputs, or an attention/pooling head suited to the task.', 'Packed sequences can help avoid computation over padding for variable-length batches.']},
      { heading: 'Where they are useful', paragraphs: ['RNN-family layers remain useful for some streaming and compact sequence tasks. For many language tasks and long-context modeling, attention-based architectures are more common, but the right choice depends on latency, data, scale, and constraints.']}
    ],
    examples: [{ title: 'GRU over a batch of sequences', code: `gru = nn.GRU(\n    input_size=16, hidden_size=64,\n    num_layers=2, batch_first=True,\n    bidirectional=False, dropout=0.1,\n)\n\nx = torch.randn(32, 50, 16)  # batch, sequence, features\noutput, h_n = gru(x)\nprint(output.shape)  # (32, 50, 64)\nprint(h_n.shape)     # (2, 32, 64)` }],
    gotchas: ['The `dropout` argument in RNN modules applies between recurrent layers and has no effect when `num_layers=1`.', 'For bidirectional networks, the output feature dimension is typically twice the hidden size.', 'Padding tokens can contaminate pooled summaries unless masked or packed correctly.'],
    docs: [{ label: 'RNN API', url: 'https://docs.pytorch.org/docs/stable/generated/torch.nn.RNN.html' }, { label: 'LSTM API', url: 'https://docs.pytorch.org/docs/stable/generated/torch.nn.LSTM.html' }, { label: 'GRU API', url: 'https://docs.pytorch.org/docs/stable/generated/torch.nn.GRU.html' }], related: ['transformers', 'shapes-dtypes', 'datasets-loaders']
  },
  {
    id: 'transformers', title: 'Transformers & attention', category: 'Architectures', level: 'Architecture', time: '9 min', summary: 'Understand token embeddings, attention, masks, and sequence-first pitfalls.',
    intro: 'A Transformer mixes information across a sequence using attention rather than recurrence. A typical text pipeline tokenizes inputs, embeds token IDs, adds positional information, applies attention/MLP blocks, and uses a task-specific head.',
    sections: [
      { heading: 'Core concepts', bullets: ['Token IDs are integer indices; they are not continuous semantic vectors by themselves.', '`nn.Embedding(vocab_size, hidden_dim)` maps integer token IDs to learned vectors.', 'Self-attention computes relationships between positions; multi-head attention learns multiple relationship subspaces.', 'Padding masks prevent attention from treating padding tokens as meaningful content; causal masks prevent a decoder from attending to future positions.', 'Layer normalization and residual connections help optimization in deep Transformer stacks.']},
      { heading: 'PyTorch API note', paragraphs: ['PyTorch provides `nn.MultiheadAttention` and `nn.TransformerEncoder` building blocks. Their exact tensor and mask conventions matter; newer workflows may use optimized scaled dot-product attention through `torch.nn.functional.scaled_dot_product_attention` when its input and mask requirements are met. For large language models, libraries built around pretrained architectures are usually more practical than wiring every detail by hand.']}
    ],
    examples: [{ title: 'Embedding plus attention (shape sketch)', code: `embedding = nn.Embedding(vocab_size, d_model)\nattention = nn.MultiheadAttention(\n    embed_dim=d_model, num_heads=8, batch_first=True\n)\n\ntoken_ids = torch.randint(0, vocab_size, (batch_size, seq_len))\nx = embedding(token_ids)             # (B, T, D)\ncontext, weights = attention(x, x, x, need_weights=False)\n# Production use also needs positional information, masks, residuals,\n# normalization, feed-forward blocks, and task-specific output logic.` }],
    gotchas: ['Attention complexity and activation memory can grow quadratically with sequence length in standard full self-attention.', 'Mask semantics and expected dimensions differ between APIs; test with a tiny synthetic batch.', 'Tokenization, padding, position encoding, and output-head design are part of the model—not optional implementation details.'],
    docs: [{ label: 'MultiheadAttention API', url: 'https://docs.pytorch.org/docs/stable/generated/torch.nn.MultiheadAttention.html' }, { label: 'Scaled dot-product attention', url: 'https://docs.pytorch.org/docs/stable/generated/torch.nn.functional.scaled_dot_product_attention.html' }], related: ['sequence-models', 'shapes-dtypes', 'performance']
  },
  {
    id: 'reproducibility', title: 'Reproducibility & random seeds', category: 'Engineering', level: 'Intermediate', time: '7 min', summary: 'Control randomness while understanding why exact repeatability can still vary.',
    intro: 'Reproducibility means controlling sources of randomness and recording the environment. A seed is necessary for many repeatable experiments, but it cannot guarantee identical results across different hardware, library versions, or nondeterministic kernels.',
    sections: [
      { heading: 'What to control', bullets: ['Seed Python, NumPy, and PyTorch random generators used by your workflow.', 'Seed CUDA generators when CUDA is used.', 'For stricter repeatability, use deterministic algorithms and configure backend behavior as documented.', 'Record package versions, OS/driver information, hyperparameters, data split IDs, and code revision.', 'Seed DataLoader workers if your dataset/transforms use worker-level randomness.']},
      { heading: 'Trade-off', paragraphs: ['Deterministic settings may reduce performance or make some operations unavailable. Use them when debugging or comparing experiments, and document the precise reproducibility level you need.']}
    ],
    examples: [{ title: 'Seed common generators', code: `import random\nimport numpy as np\nimport torch\n\ndef set_seed(seed=42):\n    random.seed(seed)\n    np.random.seed(seed)\n    torch.manual_seed(seed)\n    if torch.cuda.is_available():\n        torch.cuda.manual_seed_all(seed)\n\nset_seed(42)\n# For stricter reproducibility, also review:\n# torch.use_deterministic_algorithms(True)\n# backend-specific flags and DataLoader worker seeding.` }],
    gotchas: ['Do not claim bit-for-bit reproducibility just because you seeded PyTorch.', 'A seed does not make data splitting, preprocessing, or external data retrieval repeatable unless those are controlled too.', 'Deterministic algorithms can fail loudly when an operation has no deterministic implementation.'],
    docs: [{ label: 'PyTorch randomness notes', url: 'https://docs.pytorch.org/docs/stable/notes/randomness.html' }], related: ['transforms', 'datasets-loaders', 'save-load']
  },
  {
    id: 'debugging', title: 'Debugging & common errors', category: 'Engineering', level: 'Practical', time: '9 min', summary: 'A systematic checklist for shape, gradient, device, and NaN issues.',
    intro: 'Debug PyTorch from the outside in: inspect one batch, print shapes/dtypes/devices, run one forward pass, verify the loss, inspect gradients, and only then scale up. Most model bugs become easier when reduced to a tiny reproducible example.',
    sections: [
      { heading: 'Symptom → likely check', bullets: ['`mat1 and mat2 shapes cannot be multiplied` — inspect Linear input features and flattening.', '`Expected all tensors to be on the same device` — move inputs, targets, and model consistently.', '`Expected scalar type Long` — check integer class-index targets for `CrossEntropyLoss`.', 'Loss is `nan`/`inf` — inspect input ranges, learning rate, normalization, logits, and mixed-precision behavior.', 'Gradients are `None` — inspect graph breaks, detached tensors, `no_grad`, `requires_grad`, and whether the parameter participates in the loss.', 'Loss is constant — confirm optimizer sees the intended parameters, gradients are nonzero, and labels align with examples.']},
      { heading: 'Inspect gradients', paragraphs: ['After `loss.backward()`, look at a representative parameter’s `.grad` for presence, shape, magnitude, and NaN/Inf values. Gradient clipping can help with exploding gradients, but it should follow diagnosis rather than conceal a broken data or loss pipeline.']}
    ],
    examples: [{ title: 'Sanity checks for one batch', code: `x, y = next(iter(train_loader))\nprint("x:", x.shape, x.dtype, x.device)\nprint("y:", y.shape, y.dtype, y.device)\n\nmodel = model.to(device)\nx, y = x.to(device), y.to(device)\nlogits = model(x)\nprint("logits:", logits.shape, logits.dtype)\nloss = loss_fn(logits, y)\nprint("loss:", loss.item())\n\noptimizer.zero_grad(set_to_none=True)\nloss.backward()\nfor name, parameter in model.named_parameters():\n    if parameter.grad is not None:\n        print(name, parameter.grad.norm().item())\n        break` }],
    gotchas: ['Printing whole tensors can flood the console; inspect shape and summary statistics first.', 'A decreasing training loss alone does not show that the validation pipeline is correct.', 'Gradient clipping prevents very large gradients from exceeding a threshold but cannot fix incorrect gradients.'],
    docs: [{ label: 'Autograd anomaly detection', url: 'https://docs.pytorch.org/docs/stable/autograd.html#debugging-and-anomaly-detection' }, { label: 'CUDA memory notes', url: 'https://docs.pytorch.org/docs/stable/notes/cuda.html#memory-management' }], related: ['autograd', 'training-loop', 'shapes-dtypes']
  },
  {
    id: 'performance', title: 'Performance & memory', category: 'Engineering', level: 'Advanced', time: '8 min', summary: 'Measure bottlenecks before optimizing data loading, compute, or memory.',
    intro: 'Performance is a systems property: data preparation, host-to-device transfer, model compute, synchronization, memory, and Python overhead can all limit throughput. Benchmark representative workloads instead of optimizing based on intuition alone.',
    sections: [
      { heading: 'Practical optimization checklist', bullets: ['Profile before changing code; identify whether data loading, CPU, GPU compute, or memory is the bottleneck.', 'Use inference/no-grad modes for evaluation.', 'Tune batch size within memory limits; larger batches can improve throughput but are not always better for optimization.', 'Consider `pin_memory=True` and non-blocking copies for CUDA workloads when appropriate.', 'Mixed precision can reduce activation memory and accelerate supported operations.', 'Avoid frequent GPU-to-CPU synchronizations from `.item()`, `.cpu()`, or printing device tensors inside tight loops.', 'Use gradient checkpointing or activation recomputation for memory-constrained deep models when the extra compute is acceptable.']},
      { heading: 'Memory does not always mean a leak', paragraphs: ['The CUDA caching allocator may reserve memory for reuse, so memory reported as reserved can exceed currently allocated tensor memory. Deleting references, avoiding retained computation graphs, and profiling actual allocations help distinguish expected caching from a genuine leak.']}
    ],
    examples: [{ title: 'Profile a short training window', code: `from torch.profiler import profile, ProfilerActivity\n\nactivities = [ProfilerActivity.CPU]\nif torch.cuda.is_available():\n    activities.append(ProfilerActivity.CUDA)\n\nwith profile(activities=activities, record_shapes=True) as prof:\n    for step, batch in enumerate(train_loader):\n        if step == 5:\n            break\n        # run a representative forward/backward/update here\n        ...\n\nprint(prof.key_averages().table(sort_by="self_cpu_time_total", row_limit=15))` }],
    gotchas: ['CUDA work is asynchronous; naïve wall-clock timing may be misleading.', 'Increasing `num_workers` can hurt on small datasets or constrained machines.', 'Calling `torch.cuda.empty_cache()` every batch is usually not a performance strategy.'],
    docs: [{ label: 'Profiler recipe', url: 'https://docs.pytorch.org/tutorials/recipes/recipes/profiler_recipe.html' }, { label: 'Performance tuning guide', url: 'https://docs.pytorch.org/tutorials/recipes/recipes/tuning_guide.html' }], related: ['devices', 'mixed-precision', 'compile']
  },
  {
    id: 'compile', title: 'torch.compile', category: 'Engineering', level: 'Advanced', time: '6 min', summary: 'Try compiler-assisted optimization after a correct eager-mode baseline.',
    intro: '`torch.compile` can optimize eligible model code by capturing and compiling parts of a PyTorch program. It is an optimization tool, not a requirement for learning PyTorch, and speedups depend on model structure, shapes, hardware, backend, and compilation overhead.',
    sections: [
      { heading: 'Adoption strategy', bullets: ['First verify the eager model is correct and measure baseline performance.', 'Try compiling the model with the default mode; first calls may be slower because compilation takes time.', 'Benchmark multiple steady-state iterations, not only the first one.', 'Dynamic shapes, Python-side control flow, custom operations, and graph breaks can reduce the optimization benefit.', 'Keep a plain eager path available for debugging and unsupported cases.']},
      { heading: 'When it helps', paragraphs: ['Compilation is most helpful when repeated compute dominates one-time setup costs. Small models or very short jobs may not benefit because compile overhead can exceed runtime savings.']}
    ],
    examples: [{ title: 'Compile a model', code: `model = MyModel().to(device)\n# Establish correctness and a baseline first.\ncompiled_model = torch.compile(model)\n\n# Use compiled_model in the same training loop.\n# Benchmark after warm-up because compilation has a one-time cost.` }],
    gotchas: ['First-run timings are not representative for compiled execution.', 'Compilation support and behavior can evolve by PyTorch version and backend.', 'Do not debug data/model correctness and compiler performance simultaneously.'],
    docs: [{ label: 'torch.compile tutorial', url: 'https://docs.pytorch.org/tutorials/intermediate/torch_compile_tutorial.html' }, { label: 'torch.compile API', url: 'https://docs.pytorch.org/docs/stable/generated/torch.compile.html' }], related: ['performance', 'debugging', 'training-loop']
  },

  {
    id: 'distributed', title: 'Distributed training (DDP)', category: 'Engineering', level: 'Advanced', time: '9 min', summary: 'Scale training across multiple GPUs or machines with DistributedDataParallel.',
    intro: 'DistributedDataParallel (DDP) runs one process per device, with each process holding a model replica. Each process computes gradients on its local batch; DDP synchronizes gradients so replicas can apply consistent updates. DDP does not automatically shard inputs—you choose a sampler or otherwise partition the data.',
    sections: [
      { heading: 'Core concepts', bullets: [
        '`torchrun` launches the worker processes and supplies environment variables such as `LOCAL_RANK`, `RANK`, and `WORLD_SIZE`.',
        '`dist.init_process_group(...)` initializes communication. GPU training commonly uses the NCCL backend where supported; Gloo is used in CPU and other supported configurations.',
        '`DistributedDataParallel` wraps a model after process-group initialization and device selection.',
        '`DistributedSampler` partitions dataset indices across ranks; call `sampler.set_epoch(epoch)` before each epoch to change the shuffle consistently.',
        'Every rank participates in training, but only rank 0 should usually write shared checkpoints or emit one copy of logs.',
        'Each rank needs a complete forward/backward/update step. Global batch size is generally per-rank batch size multiplied by world size (before gradient accumulation).'
      ]},
      { heading: 'When to use it', paragraphs: ['DDP is useful when a model fits on one device but you want greater throughput, or when training spans multiple machines. It adds communication, process management, sampler requirements, and failure modes, so start with a correct single-device pipeline and measure whether scaling helps. DDP is usually preferred over the older single-process `DataParallel` approach for multi-GPU training.']},
      { heading: 'Operational checklist', bullets: [
        'Keep all ranks in compatible collective operations; a rank that exits early can cause the others to hang.',
        'Ensure data partitions are appropriate and that each rank sees the intended number of batches.',
        'Save the underlying model state from rank 0 (commonly `model.module.state_dict()` after wrapping).',
        'Destroy the process group during clean shutdown, especially in reusable scripts or test suites.'
      ]}
    ],
    examples: [{ title: 'DDP training structure (CUDA)', code: `# Launch: torchrun --standalone --nproc_per_node=2 train_ddp.py\nimport os\nimport torch\nimport torch.distributed as dist\nfrom torch.nn.parallel import DistributedDataParallel as DDP\nfrom torch.utils.data import DataLoader, DistributedSampler\n\nlocal_rank = int(os.environ["LOCAL_RANK"])\ntorch.cuda.set_device(local_rank)\ndevice = torch.device("cuda", local_rank)\ndist.init_process_group(backend="nccl")\n\nsampler = DistributedSampler(train_dataset)\nloader = DataLoader(train_dataset, batch_size=64, sampler=sampler)\nmodel = DDP(MyModel().to(device), device_ids=[local_rank])\noptimizer = torch.optim.AdamW(model.parameters(), lr=1e-3)\n\nfor epoch in range(num_epochs):\n    sampler.set_epoch(epoch)\n    model.train()\n    for x, y in loader:\n        x, y = x.to(device), y.to(device)\n        optimizer.zero_grad(set_to_none=True)\n        loss = loss_fn(model(x), y)\n        loss.backward()\n        optimizer.step()\n\nif dist.get_rank() == 0:\n    torch.save(model.module.state_dict(), "model.pth")\ndist.destroy_process_group()` }],
    gotchas: ['This example is a CUDA/NCCL skeleton; adapt backend and device handling for CPU, other accelerators, Windows, and multi-node jobs.', 'Never assume each process will receive unique data unless the data pipeline partitions it.', 'All ranks need compatible control flow around synchronization points; logging or saving from every rank can cause file collisions.'],
    docs: [{ label: 'Distributed communication package', url: 'https://docs.pytorch.org/docs/stable/distributed.html' }, { label: 'DistributedDataParallel API', url: 'https://docs.pytorch.org/docs/stable/generated/torch.nn.parallel.DistributedDataParallel.html' }, { label: 'DDP tutorial with torchrun', url: 'https://docs.pytorch.org/tutorials/intermediate/ddp_tutorial.html' }], related: ['devices', 'training-loop', 'performance', 'save-load']
  },
  {
    id: 'deployment', title: 'Export & deploy a model', category: 'Engineering', level: 'Advanced', time: '8 min', summary: 'Package a stable inference interface and understand state_dict versus graph export.',
    intro: 'Deployment starts by separating model behavior from the training environment. Define the exact input contract, keep preprocessing consistent, load trusted weights, switch to evaluation mode, disable gradients, and validate predictions after packaging. The best serialization format depends on the target runtime and portability requirements.',
    sections: [
      { heading: 'Three different goals', bullets: [
        '**Checkpointing** — save `state_dict` so a compatible Python model class can be rebuilt and weights restored. This is usually the most flexible development default.',
        '**Inference application** — run a normal model in `eval()` and `inference_mode()` and expose a stable input/output interface through a service or local program.',
        '**Graph export** — `torch.export` captures a tensor computation graph with constraints for ahead-of-time workflows. It is distinct from saving a `state_dict` and from `torch.compile` runtime optimization.'
      ]},
      { heading: 'Design the input contract', bullets: [
        'Document tensor shape, dtype, device, value range, normalization, tokenization, and output meaning.',
        'Keep all learned preprocessing artifacts alongside the model, such as scalers, vocabularies, or label maps.',
        'Validate with representative and edge-case examples, including batch size 1 and expected dynamic dimensions.',
        'Measure end-to-end latency, memory, and throughput—not just the model forward-pass time.',
        'Treat serialized artifacts as trusted files; loading untrusted checkpoint files is a security risk.'
      ]},
      { heading: 'Choose the runtime intentionally', paragraphs: ['A plain Python service may be the easiest deployment. For portable graph-oriented execution, check the current `torch.export` documentation and the requirements of the target runtime. Export compatibility depends on the operations used, control flow, and supported dynamic shapes; not every eager model exports unchanged.']}
    ],
    examples: [
      { title: 'A disciplined inference function', code: `model.load_state_dict(torch.load("model.pth", map_location=device, weights_only=True))\nmodel.to(device)\nmodel.eval()\n\ndef predict(batch):\n    batch = batch.to(device)  # apply the same preprocessing used in training\n    with torch.inference_mode():\n        logits = model(batch)\n        probabilities = logits.softmax(dim=1)\n        predicted_class = logits.argmax(dim=1)\n    return predicted_class.cpu(), probabilities.cpu()` },
      { title: 'Graph export (check version support)', code: `model = model.eval()\nexample_input = torch.randn(1, n_features)\nexported = torch.export.export(model, (example_input,))\ntorch.export.save(exported, "model.pt2")\n\n# In a compatible PyTorch environment:\nloaded = torch.export.load("model.pt2")\nruntime_module = loaded.module()\noutput = runtime_module(example_input)` }
    ],
    gotchas: ['`state_dict` does not include your Python model class or preprocessing code.', 'Softmax probabilities are useful when consumers need probability values; return logits instead when a downstream system expects logits.', '`torch.export` and its ecosystem evolve; confirm current support for your operators and target runtime.', 'Test the packaged artifact itself, not just the original notebook model.'],
    docs: [{ label: 'Saving and loading models', url: 'https://docs.pytorch.org/tutorials/beginner/saving_loading_models.html' }, { label: 'torch.export overview', url: 'https://docs.pytorch.org/docs/stable/export.html' }, { label: 'torch.export tutorial', url: 'https://docs.pytorch.org/tutorials/intermediate/torch_export_tutorial.html' }], related: ['save-load', 'evaluation', 'compile', 'performance']
  },
];

export const cheatCategories = [
  {
    label: 'Create & inspect', color: 'orange', items: [
      ['Create from Python data', 'torch.tensor([[1, 2], [3, 4]])'],
      ['Zeros / ones', 'torch.zeros(2, 3)\ntorch.ones(2, 3)'],
      ['Random normal', 'torch.randn(32, 128)'],
      ['Shape / dtype / device', 'x.shape\nx.dtype\nx.device\nx.ndim\nx.numel()'],
      ['Change dtype / device', 'x = x.to(dtype=torch.float32)\nx = x.to(device)'],
      ['Convert scalar', 'loss.item()  # one-element tensor only'],
    ]
  },
  {
    label: 'Shape & indexing', color: 'purple', items: [
      ['Add / remove dimension', 'x.unsqueeze(0)\nx.squeeze(dim=1)'],
      ['Flatten non-batch dimensions', 'x.flatten(start_dim=1)'],
      ['Reshape / transpose', 'x.reshape(batch, -1)\nx.transpose(1, 2)\nx.permute(0, 2, 3, 1)'],
      ['Concatenate / stack', 'torch.cat([a, b], dim=0)\ntorch.stack([a, b], dim=0)'],
      ['Mask with booleans', 'x[x > 0]'],
      ['Argmax over classes', 'logits.argmax(dim=1)'],
    ]
  },
  {
    label: 'Autograd & training', color: 'blue', items: [
      ['Clear old gradients', 'optimizer.zero_grad(set_to_none=True)'],
      ['Backpropagate', 'loss.backward()'],
      ['Update parameters', 'optimizer.step()'],
      ['Disable gradients', 'with torch.no_grad():\n    predictions = model(x)'],
      ['Evaluation mode', 'model.eval()\nwith torch.inference_mode():\n    logits = model(x)'],
      ['Clip gradient norm', 'torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)'],
    ]
  },
  {
    label: 'Data & models', color: 'green', items: [
      ['Batch tensors', 'DataLoader(TensorDataset(X, y), batch_size=64, shuffle=True)'],
      ['Custom model', 'class Net(nn.Module):\n    def __init__(self):\n        super().__init__()\n    def forward(self, x):\n        return x'],
      ['AdamW optimizer', 'torch.optim.AdamW(model.parameters(), lr=3e-4, weight_decay=1e-2)'],
      ['Cross entropy', 'nn.CrossEntropyLoss()  # logits + long class indices'],
      ['Binary logits loss', 'nn.BCEWithLogitsLoss()  # logits + float targets'],
      ['Save weights', 'torch.save(model.state_dict(), "model.pth")'],
    ]
  },
  {
    label: 'Device & diagnostics', color: 'pink', items: [
      ['Choose device', 'device = torch.device("cuda" if torch.cuda.is_available() else "cpu")'],
      ['Move model / batch', 'model = model.to(device)\nx, y = x.to(device), y.to(device)'],
      ['Check gradients', 'for name, p in model.named_parameters():\n    print(name, p.grad is None)'],
      ['Seed generators', 'torch.manual_seed(42)\nif torch.cuda.is_available():\n    torch.cuda.manual_seed_all(42)'],
      ['Count parameters', 'sum(p.numel() for p in model.parameters())'],
      ['Check finite loss', 'torch.isfinite(loss).all()'],
    ]
  }
];
