"""Task Tracker & Project Board Backend Package"""
import sys
from pathlib import Path

# Ensure backend root is always present in sys.path
backend_root = str(Path(__file__).resolve().parents[1])
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

__version__ = "2.0.0"
