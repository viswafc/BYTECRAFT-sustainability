"""Compatibility shim: `python -m ml.train` -> ml.training.train"""
from ml.training.train import main

if __name__ == "__main__":
    raise SystemExit(main())
