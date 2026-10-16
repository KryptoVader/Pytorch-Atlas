"""Train a tiny MLP on synthetic multiclass data with a standard PyTorch loop.

Install PyTorch using https://pytorch.org/get-started/locally/ before running.
This example creates its data locally and requires no download.
"""
from __future__ import annotations

import torch
from torch import nn
from torch.utils.data import DataLoader, TensorDataset, random_split


def make_synthetic_data(samples: int = 2_400, features: int = 12, classes: int = 3):
    """Create a learnable toy dataset with class-specific linear signal."""
    generator = torch.Generator().manual_seed(7)
    x = torch.randn(samples, features, generator=generator)
    teacher = torch.randn(features, classes, generator=generator)
    logits = x @ teacher + 0.25 * torch.randn(samples, classes, generator=generator)
    y = logits.argmax(dim=1)
    return x, y


class MLP(nn.Module):
    def __init__(self, n_features: int, n_classes: int) -> None:
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(n_features, 64),
            nn.ReLU(),
            nn.Dropout(p=0.1),
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.Linear(32, n_classes),  # raw logits for CrossEntropyLoss
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.net(x)


def evaluate(model: nn.Module, loader: DataLoader, device: torch.device):
    model.eval()
    total_loss = 0.0
    correct = 0
    count = 0
    loss_fn = nn.CrossEntropyLoss()
    with torch.inference_mode():
        for x, y in loader:
            x, y = x.to(device), y.to(device)
            logits = model(x)
            loss = loss_fn(logits, y)
            batch_size = x.size(0)
            total_loss += loss.item() * batch_size
            correct += (logits.argmax(dim=1) == y).sum().item()
            count += batch_size
    return total_loss / max(count, 1), correct / max(count, 1)


def main() -> None:
    torch.manual_seed(42)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"PyTorch {torch.__version__} | device: {device}")

    x, y = make_synthetic_data()
    full_dataset = TensorDataset(x, y)
    n_train = int(0.8 * len(full_dataset))
    n_val = len(full_dataset) - n_train
    train_set, val_set = random_split(
        full_dataset,
        [n_train, n_val],
        generator=torch.Generator().manual_seed(42),
    )
    train_loader = DataLoader(train_set, batch_size=64, shuffle=True)
    val_loader = DataLoader(val_set, batch_size=128, shuffle=False)

    model = MLP(n_features=x.shape[1], n_classes=int(y.max().item()) + 1).to(device)
    loss_fn = nn.CrossEntropyLoss()
    optimizer = torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-3)
    epochs = 12

    for epoch in range(1, epochs + 1):
        model.train()
        total_loss = 0.0
        total_count = 0
        for features, target in train_loader:
            features, target = features.to(device), target.to(device)
            optimizer.zero_grad(set_to_none=True)
            logits = model(features)
            loss = loss_fn(logits, target)
            loss.backward()
            optimizer.step()

            batch_size = features.size(0)
            total_loss += loss.detach().item() * batch_size
            total_count += batch_size

        train_loss = total_loss / max(total_count, 1)
        val_loss, val_accuracy = evaluate(model, val_loader, device)
        print(
            f"Epoch {epoch:02d}/{epochs} | train_loss={train_loss:.4f} "
            f"| val_loss={val_loss:.4f} | val_accuracy={val_accuracy:.3f}"
        )

    output_path = "mlp_synthetic.pth"
    torch.save(model.state_dict(), output_path)
    print(f"Saved model weights to {output_path}")


if __name__ == "__main__":
    main()
