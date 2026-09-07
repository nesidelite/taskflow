try:
    from .config import settings
    __all__ = ["settings"]
except ImportError:
    settings = None
    __all__ = []
