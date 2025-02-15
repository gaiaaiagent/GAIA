# src/envirosearch/utils/rate_limiter.py
from typing import Callable, Any
import time
from collections import deque
from functools import wraps
from threading import Lock
import logging

logger = logging.getLogger(__name__)

class RateLimiter:
    """Rate limiter implementation using token bucket algorithm"""
    def __init__(self, max_requests: int, time_window: float):
        self.max_requests = max_requests
        self.time_window = time_window
        self.requests = deque()  # [(timestamp, tokens_used), ...]
        self.lock = Lock()

    def __call__(self, func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            with self.lock:
                current_time = time.time()

                # Remove old requests
                while self.requests and current_time - self.requests[0][0] > self.time_window:
                    self.requests.popleft()

                # Calculate current usage
                current_usage = sum(tokens for _, tokens in self.requests)

                if current_usage >= self.max_requests:
                    sleep_time = self.time_window - (current_time - self.requests[0][0])
                    logger.warning(f"Rate limit exceeded. Sleeping for {sleep_time:.2f} seconds")
                    time.sleep(sleep_time)
                    # Recursive call after sleeping
                    return wrapper(*args, **kwargs)

                # Add current request
                self.requests.append((current_time, 1))

                return func(*args, **kwargs)
        return wrapper

def rate_limit(max_requests: int, time_window: float) -> Callable:
    """Decorator for rate limiting"""
    limiter = RateLimiter(max_requests, time_window)
    return limiter
