Project Path: openai-cookbook

Source Tree:

```
openai-cookbook
└── examples
    ├── utils
    │   └── embeddings_utils.py
    ├── api_request_parallel_processor.py
    ├── chatgpt
    │   └── rag-quickstart
    │       ├── azure
    │       │   └── function_app.py
    │       └── gcp
    │           └── main.py
    ├── object_oriented_agentic_approach
    │   └── resources
    │       ├── object_oriented_agents
    │       │   ├── utils
    │       │   │   ├── logger.py
    │       │   │   └── openai_util.py
    │       │   ├── services
    │       │   │   ├── openai_language_model.py
    │       │   │   ├── language_model_interface.py
    │       │   │   └── openai_factory.py
    │       │   └── core_classes
    │       │       ├── chat_messages.py
    │       │       ├── tool_interface.py
    │       │       ├── tool_manager.py
    │       │       ├── agent_signature.py
    │       │       └── base_agent.py
    │       └── registry
    │           ├── tools
    │           │   ├── python_code_interpreter_tool.py
    │           │   └── file_access_tool.py
    │           └── agents
    │               ├── file_access_agent.py
    │               └── python_code_exec_agent.py
    ├── vector_databases
    │   └── redis
    │       └── nbutils.py
    └── fine-tuned_qa
        └── answers_with_ft.py

```

`/home/ygg/Workspace/Eliza/GAIA/openai-cookbook/examples/utils/embeddings_utils.py`:

```py
import textwrap as tr
from typing import List, Optional

import matplotlib.pyplot as plt
import plotly.express as px
from scipy import spatial
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE
from sklearn.metrics import average_precision_score, precision_recall_curve

from openai import OpenAI
import numpy as np
import pandas as pd

client = OpenAI(max_retries=5)


def get_embedding(text: str, model="text-embedding-3-small", **kwargs) -> List[float]:
    # replace newlines, which can negatively affect performance.
    text = text.replace("\n", " ")

    response = client.embeddings.create(input=[text], model=model, **kwargs)

    return response.data[0].embedding


async def aget_embedding(
    text: str, model="text-embedding-3-small", **kwargs
) -> List[float]:
    # replace newlines, which can negatively affect performance.
    text = text.replace("\n", " ")

    return (await client.embeddings.create(input=[text], model=model, **kwargs))[
        "data"
    ][0]["embedding"]


def get_embeddings(
    list_of_text: List[str], model="text-embedding-3-small", **kwargs
) -> List[List[float]]:
    assert len(list_of_text) <= 2048, "The batch size should not be larger than 2048."

    # replace newlines, which can negatively affect performance.
    list_of_text = [text.replace("\n", " ") for text in list_of_text]

    data = client.embeddings.create(input=list_of_text, model=model, **kwargs).data
    return [d.embedding for d in data]


async def aget_embeddings(
    list_of_text: List[str], model="text-embedding-3-small", **kwargs
) -> List[List[float]]:
    assert len(list_of_text) <= 2048, "The batch size should not be larger than 2048."

    # replace newlines, which can negatively affect performance.
    list_of_text = [text.replace("\n", " ") for text in list_of_text]

    data = (
        await client.embeddings.create(input=list_of_text, model=model, **kwargs)
    ).data
    return [d.embedding for d in data]


def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))


def plot_multiclass_precision_recall(
    y_score, y_true_untransformed, class_list, classifier_name
):
    """
    Precision-Recall plotting for a multiclass problem. It plots average precision-recall, per class precision recall and reference f1 contours.

    Code slightly modified, but heavily based on https://scikit-learn.org/stable/auto_examples/model_selection/plot_precision_recall.html
    """
    n_classes = len(class_list)
    y_true = pd.concat(
        [(y_true_untransformed == class_list[i]) for i in range(n_classes)], axis=1
    ).values

    # For each class
    precision = dict()
    recall = dict()
    average_precision = dict()
    for i in range(n_classes):
        precision[i], recall[i], _ = precision_recall_curve(y_true[:, i], y_score[:, i])
        average_precision[i] = average_precision_score(y_true[:, i], y_score[:, i])

    # A "micro-average": quantifying score on all classes jointly
    precision_micro, recall_micro, _ = precision_recall_curve(
        y_true.ravel(), y_score.ravel()
    )
    average_precision_micro = average_precision_score(y_true, y_score, average="micro")
    print(
        str(classifier_name)
        + " - Average precision score over all classes: {0:0.2f}".format(
            average_precision_micro
        )
    )

    # setup plot details
    plt.figure(figsize=(9, 10))
    f_scores = np.linspace(0.2, 0.8, num=4)
    lines = []
    labels = []
    for f_score in f_scores:
        x = np.linspace(0.01, 1)
        y = f_score * x / (2 * x - f_score)
        (l,) = plt.plot(x[y >= 0], y[y >= 0], color="gray", alpha=0.2)
        plt.annotate("f1={0:0.1f}".format(f_score), xy=(0.9, y[45] + 0.02))

    lines.append(l)
    labels.append("iso-f1 curves")
    (l,) = plt.plot(recall_micro, precision_micro, color="gold", lw=2)
    lines.append(l)
    labels.append(
        "average Precision-recall (auprc = {0:0.2f})" "".format(average_precision_micro)
    )

    for i in range(n_classes):
        (l,) = plt.plot(recall[i], precision[i], lw=2)
        lines.append(l)
        labels.append(
            "Precision-recall for class `{0}` (auprc = {1:0.2f})"
            "".format(class_list[i], average_precision[i])
        )

    fig = plt.gcf()
    fig.subplots_adjust(bottom=0.25)
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel("Recall")
    plt.ylabel("Precision")
    plt.title(f"{classifier_name}: Precision-Recall curve for each class")
    plt.legend(lines, labels)


def distances_from_embeddings(
    query_embedding: List[float],
    embeddings: List[List[float]],
    distance_metric="cosine",
) -> List[List]:
    """Return the distances between a query embedding and a list of embeddings."""
    distance_metrics = {
        "cosine": spatial.distance.cosine,
        "L1": spatial.distance.cityblock,
        "L2": spatial.distance.euclidean,
        "Linf": spatial.distance.chebyshev,
    }
    distances = [
        distance_metrics[distance_metric](query_embedding, embedding)
        for embedding in embeddings
    ]
    return distances


def indices_of_nearest_neighbors_from_distances(distances) -> np.ndarray:
    """Return a list of indices of nearest neighbors from a list of distances."""
    return np.argsort(distances)


def pca_components_from_embeddings(
    embeddings: List[List[float]], n_components=2
) -> np.ndarray:
    """Return the PCA components of a list of embeddings."""
    pca = PCA(n_components=n_components)
    array_of_embeddings = np.array(embeddings)
    return pca.fit_transform(array_of_embeddings)


def tsne_components_from_embeddings(
    embeddings: List[List[float]], n_components=2, **kwargs
) -> np.ndarray:
    """Returns t-SNE components of a list of embeddings."""
    # use better defaults if not specified
    if "init" not in kwargs.keys():
        kwargs["init"] = "pca"
    if "learning_rate" not in kwargs.keys():
        kwargs["learning_rate"] = "auto"
    tsne = TSNE(n_components=n_components, **kwargs)
    array_of_embeddings = np.array(embeddings)
    return tsne.fit_transform(array_of_embeddings)


def chart_from_components(
    components: np.ndarray,
    labels: Optional[List[str]] = None,
    strings: Optional[List[str]] = None,
    x_title="Component 0",
    y_title="Component 1",
    mark_size=5,
    **kwargs,
):
    """Return an interactive 2D chart of embedding components."""
    empty_list = ["" for _ in components]
    data = pd.DataFrame(
        {
            x_title: components[:, 0],
            y_title: components[:, 1],
            "label": labels if labels else empty_list,
            "string": ["<br>".join(tr.wrap(string, width=30)) for string in strings]
            if strings
            else empty_list,
        }
    )
    chart = px.scatter(
        data,
        x=x_title,
        y=y_title,
        color="label" if labels else None,
        symbol="label" if labels else None,
        hover_data=["string"] if strings else None,
        **kwargs,
    ).update_traces(marker=dict(size=mark_size))
    return chart


def chart_from_components_3D(
    components: np.ndarray,
    labels: Optional[List[str]] = None,
    strings: Optional[List[str]] = None,
    x_title: str = "Component 0",
    y_title: str = "Component 1",
    z_title: str = "Compontent 2",
    mark_size: int = 5,
    **kwargs,
):
    """Return an interactive 3D chart of embedding components."""
    empty_list = ["" for _ in components]
    data = pd.DataFrame(
        {
            x_title: components[:, 0],
            y_title: components[:, 1],
            z_title: components[:, 2],
            "label": labels if labels else empty_list,
            "string": ["<br>".join(tr.wrap(string, width=30)) for string in strings]
            if strings
            else empty_list,
        }
    )
    chart = px.scatter_3d(
        data,
        x=x_title,
        y=y_title,
        z=z_title,
        color="label" if labels else None,
        symbol="label" if labels else None,
        hover_data=["string"] if strings else None,
        **kwargs,
    ).update_traces(marker=dict(size=mark_size))
    return chart

```

`/home/ygg/Workspace/Eliza/GAIA/openai-cookbook/examples/api_request_parallel_processor.py`:

```py
"""
API REQUEST PARALLEL PROCESSOR

Using the OpenAI API to process lots of text quickly takes some care.
If you trickle in a million API requests one by one, they'll take days to complete.
If you flood a million API requests in parallel, they'll exceed the rate limits and fail with errors.
To maximize throughput, parallel requests need to be throttled to stay under rate limits.

This script parallelizes requests to the OpenAI API while throttling to stay under rate limits.

Features:
- Streams requests from file, to avoid running out of memory for giant jobs
- Makes requests concurrently, to maximize throughput
- Throttles request and token usage, to stay under rate limits
- Retries failed requests up to {max_attempts} times, to avoid missing data
- Logs errors, to diagnose problems with requests

Example command to call script:
```
python examples/api_request_parallel_processor.py \
  --requests_filepath examples/data/example_requests_to_parallel_process.jsonl \
  --save_filepath examples/data/example_requests_to_parallel_process_results.jsonl \
  --request_url https://api.openai.com/v1/embeddings \
  --max_requests_per_minute 1500 \
  --max_tokens_per_minute 6250000 \
  --token_encoding_name cl100k_base \
  --max_attempts 5 \
  --logging_level 20
```

Inputs:
- requests_filepath : str
    - path to the file containing the requests to be processed
    - file should be a jsonl file, where each line is a json object with API parameters and an optional metadata field
    - e.g., {"model": "text-embedding-3-small", "input": "embed me", "metadata": {"row_id": 1}}
    - as with all jsonl files, take care that newlines in the content are properly escaped (json.dumps does this automatically)
    - an example file is provided at examples/data/example_requests_to_parallel_process.jsonl
    - the code to generate the example file is appended to the bottom of this script
- save_filepath : str, optional
    - path to the file where the results will be saved
    - file will be a jsonl file, where each line is an array with the original request plus the API response
    - e.g., [{"model": "text-embedding-3-small", "input": "embed me"}, {...}]
    - if omitted, results will be saved to {requests_filename}_results.jsonl
- request_url : str, optional
    - URL of the API endpoint to call
    - if omitted, will default to "https://api.openai.com/v1/embeddings"
- api_key : str, optional
    - API key to use
    - if omitted, the script will attempt to read it from an environment variable {os.getenv("OPENAI_API_KEY")}
- max_requests_per_minute : float, optional
    - target number of requests to make per minute (will make less if limited by tokens)
    - leave headroom by setting this to 50% or 75% of your limit
    - if requests are limiting you, try batching multiple embeddings or completions into one request
    - if omitted, will default to 1,500
- max_tokens_per_minute : float, optional
    - target number of tokens to use per minute (will use less if limited by requests)
    - leave headroom by setting this to 50% or 75% of your limit
    - if omitted, will default to 125,000
- token_encoding_name : str, optional
    - name of the token encoding used, as defined in the `tiktoken` package
    - if omitted, will default to "cl100k_base" (used by `text-embedding-3-small`)
- max_attempts : int, optional
    - number of times to retry a failed request before giving up
    - if omitted, will default to 5
- logging_level : int, optional
    - level of logging to use; higher numbers will log fewer messages
    - 40 = ERROR; will log only when requests fail after all retries
    - 30 = WARNING; will log when requests his rate limits or other errors
    - 20 = INFO; will log when requests start and the status at finish
    - 10 = DEBUG; will log various things as the loop runs to see when they occur
    - if omitted, will default to 20 (INFO).

The script is structured as follows:
    - Imports
    - Define main()
        - Initialize things
        - In main loop:
            - Get next request if one is not already waiting for capacity
            - Update available token & request capacity
            - If enough capacity available, call API
            - The loop pauses if a rate limit error is hit
            - The loop breaks when no tasks remain
    - Define dataclasses
        - StatusTracker (stores script metadata counters; only one instance is created)
        - APIRequest (stores API inputs, outputs, metadata; one method to call API)
    - Define functions
        - api_endpoint_from_url (extracts API endpoint from request URL)
        - append_to_jsonl (writes to results file)
        - num_tokens_consumed_from_request (bigger function to infer token usage from request)
        - task_id_generator_function (yields 0, 1, 2, ...)
    - Run main()
"""

# imports
import aiohttp  # for making API calls concurrently
import argparse  # for running script from command line
import asyncio  # for running API calls concurrently
import json  # for saving results to a jsonl file
import logging  # for logging rate limit warnings and other messages
import os  # for reading API key
import re  # for matching endpoint from request URL
import tiktoken  # for counting tokens
import time  # for sleeping after rate limit is hit
from dataclasses import (
    dataclass,
    field,
)  # for storing API inputs, outputs, and metadata


async def process_api_requests_from_file(
    requests_filepath: str,
    save_filepath: str,
    request_url: str,
    api_key: str,
    max_requests_per_minute: float,
    max_tokens_per_minute: float,
    token_encoding_name: str,
    max_attempts: int,
    logging_level: int,
):
    """Processes API requests in parallel, throttling to stay under rate limits."""
    # constants
    seconds_to_pause_after_rate_limit_error = 15
    seconds_to_sleep_each_loop = (
        0.001  # 1 ms limits max throughput to 1,000 requests per second
    )

    # initialize logging
    logging.basicConfig(level=logging_level)
    logging.debug(f"Logging initialized at level {logging_level}")

    # infer API endpoint and construct request header
    api_endpoint = api_endpoint_from_url(request_url)
    request_header = {"Authorization": f"Bearer {api_key}"}
    # use api-key header for Azure deployments
    if "/deployments" in request_url:
        request_header = {"api-key": f"{api_key}"}

    # initialize trackers
    queue_of_requests_to_retry = asyncio.Queue()
    task_id_generator = (
        task_id_generator_function()
    )  # generates integer IDs of 0, 1, 2, ...
    status_tracker = (
        StatusTracker()
    )  # single instance to track a collection of variables
    next_request = None  # variable to hold the next request to call

    # initialize available capacity counts
    available_request_capacity = max_requests_per_minute
    available_token_capacity = max_tokens_per_minute
    last_update_time = time.time()

    # initialize flags
    file_not_finished = True  # after file is empty, we'll skip reading it
    logging.debug(f"Initialization complete.")

    # initialize file reading
    with open(requests_filepath) as file:
        # `requests` will provide requests one at a time
        requests = file.__iter__()
        logging.debug(f"File opened. Entering main loop")
        async with aiohttp.ClientSession() as session:  # Initialize ClientSession here
            while True:
                # get next request (if one is not already waiting for capacity)
                if next_request is None:
                    if not queue_of_requests_to_retry.empty():
                        next_request = queue_of_requests_to_retry.get_nowait()
                        logging.debug(
                            f"Retrying request {next_request.task_id}: {next_request}"
                        )
                    elif file_not_finished:
                        try:
                            # get new request
                            request_json = json.loads(next(requests))
                            next_request = APIRequest(
                                task_id=next(task_id_generator),
                                request_json=request_json,
                                token_consumption=num_tokens_consumed_from_request(
                                    request_json, api_endpoint, token_encoding_name
                                ),
                                attempts_left=max_attempts,
                                metadata=request_json.pop("metadata", None),
                            )
                            status_tracker.num_tasks_started += 1
                            status_tracker.num_tasks_in_progress += 1
                            logging.debug(
                                f"Reading request {next_request.task_id}: {next_request}"
                            )
                        except StopIteration:
                            # if file runs out, set flag to stop reading it
                            logging.debug("Read file exhausted")
                            file_not_finished = False

                # update available capacity
                current_time = time.time()
                seconds_since_update = current_time - last_update_time
                available_request_capacity = min(
                    available_request_capacity
                    + max_requests_per_minute * seconds_since_update / 60.0,
                    max_requests_per_minute,
                )
                available_token_capacity = min(
                    available_token_capacity
                    + max_tokens_per_minute * seconds_since_update / 60.0,
                    max_tokens_per_minute,
                )
                last_update_time = current_time

                # if enough capacity available, call API
                if next_request:
                    next_request_tokens = next_request.token_consumption
                    if (
                        available_request_capacity >= 1
                        and available_token_capacity >= next_request_tokens
                    ):
                        # update counters
                        available_request_capacity -= 1
                        available_token_capacity -= next_request_tokens
                        next_request.attempts_left -= 1

                        # call API
                        asyncio.create_task(
                            next_request.call_api(
                                session=session,
                                request_url=request_url,
                                request_header=request_header,
                                retry_queue=queue_of_requests_to_retry,
                                save_filepath=save_filepath,
                                status_tracker=status_tracker,
                            )
                        )
                        next_request = None  # reset next_request to empty

                # if all tasks are finished, break
                if status_tracker.num_tasks_in_progress == 0:
                    break

                # main loop sleeps briefly so concurrent tasks can run
                await asyncio.sleep(seconds_to_sleep_each_loop)

                # if a rate limit error was hit recently, pause to cool down
                seconds_since_rate_limit_error = (
                    time.time() - status_tracker.time_of_last_rate_limit_error
                )
                if (
                    seconds_since_rate_limit_error
                    < seconds_to_pause_after_rate_limit_error
                ):
                    remaining_seconds_to_pause = (
                        seconds_to_pause_after_rate_limit_error
                        - seconds_since_rate_limit_error
                    )
                    await asyncio.sleep(remaining_seconds_to_pause)
                    # ^e.g., if pause is 15 seconds and final limit was hit 5 seconds ago
                    logging.warn(
                        f"Pausing to cool down until {time.ctime(status_tracker.time_of_last_rate_limit_error + seconds_to_pause_after_rate_limit_error)}"
                    )

        # after finishing, log final status
        logging.info(
            f"""Parallel processing complete. Results saved to {save_filepath}"""
        )
        if status_tracker.num_tasks_failed > 0:
            logging.warning(
                f"{status_tracker.num_tasks_failed} / {status_tracker.num_tasks_started} requests failed. Errors logged to {save_filepath}."
            )
        if status_tracker.num_rate_limit_errors > 0:
            logging.warning(
                f"{status_tracker.num_rate_limit_errors} rate limit errors received. Consider running at a lower rate."
            )


# dataclasses


@dataclass
class StatusTracker:
    """Stores metadata about the script's progress. Only one instance is created."""

    num_tasks_started: int = 0
    num_tasks_in_progress: int = 0  # script ends when this reaches 0
    num_tasks_succeeded: int = 0
    num_tasks_failed: int = 0
    num_rate_limit_errors: int = 0
    num_api_errors: int = 0  # excluding rate limit errors, counted above
    num_other_errors: int = 0
    time_of_last_rate_limit_error: int = 0  # used to cool off after hitting rate limits


@dataclass
class APIRequest:
    """Stores an API request's inputs, outputs, and other metadata. Contains a method to make an API call."""

    task_id: int
    request_json: dict
    token_consumption: int
    attempts_left: int
    metadata: dict
    result: list = field(default_factory=list)

    async def call_api(
        self,
        session: aiohttp.ClientSession,
        request_url: str,
        request_header: dict,
        retry_queue: asyncio.Queue,
        save_filepath: str,
        status_tracker: StatusTracker,
    ):
        """Calls the OpenAI API and saves results."""
        logging.info(f"Starting request #{self.task_id}")
        error = None
        try:
            async with session.post(
                url=request_url, headers=request_header, json=self.request_json
            ) as response:
                response = await response.json()
            if "error" in response:
                logging.warning(
                    f"Request {self.task_id} failed with error {response['error']}"
                )
                status_tracker.num_api_errors += 1
                error = response
                if "rate limit" in response["error"].get("message", "").lower():
                    status_tracker.time_of_last_rate_limit_error = time.time()
                    status_tracker.num_rate_limit_errors += 1
                    status_tracker.num_api_errors -= (
                        1  # rate limit errors are counted separately
                    )

        except (
            Exception
        ) as e:  # catching naked exceptions is bad practice, but in this case we'll log & save them
            logging.warning(f"Request {self.task_id} failed with Exception {e}")
            status_tracker.num_other_errors += 1
            error = e
        if error:
            self.result.append(error)
            if self.attempts_left:
                retry_queue.put_nowait(self)
            else:
                logging.error(
                    f"Request {self.request_json} failed after all attempts. Saving errors: {self.result}"
                )
                data = (
                    [self.request_json, [str(e) for e in self.result], self.metadata]
                    if self.metadata
                    else [self.request_json, [str(e) for e in self.result]]
                )
                append_to_jsonl(data, save_filepath)
                status_tracker.num_tasks_in_progress -= 1
                status_tracker.num_tasks_failed += 1
        else:
            data = (
                [self.request_json, response, self.metadata]
                if self.metadata
                else [self.request_json, response]
            )
            append_to_jsonl(data, save_filepath)
            status_tracker.num_tasks_in_progress -= 1
            status_tracker.num_tasks_succeeded += 1
            logging.debug(f"Request {self.task_id} saved to {save_filepath}")


# functions


def api_endpoint_from_url(request_url):
    """Extract the API endpoint from the request URL."""
    match = re.search("^https://[^/]+/v\\d+/(.+)$", request_url)
    if match is None:
        # for Azure OpenAI deployment urls
        match = re.search(
            r"^https://[^/]+/openai/deployments/[^/]+/(.+?)(\?|$)", request_url
        )
    return match[1]


def append_to_jsonl(data, filename: str) -> None:
    """Append a json payload to the end of a jsonl file."""
    json_string = json.dumps(data)
    with open(filename, "a") as f:
        f.write(json_string + "\n")


def num_tokens_consumed_from_request(
    request_json: dict,
    api_endpoint: str,
    token_encoding_name: str,
):
    """Count the number of tokens in the request. Only supports completion and embedding requests."""
    encoding = tiktoken.get_encoding(token_encoding_name)
    # if completions request, tokens = prompt + n * max_tokens
    if api_endpoint.endswith("completions"):
        max_tokens = request_json.get("max_tokens", 15)
        n = request_json.get("n", 1)
        completion_tokens = n * max_tokens

        # chat completions
        if api_endpoint.startswith("chat/"):
            num_tokens = 0
            for message in request_json["messages"]:
                num_tokens += 4  # every message follows <im_start>{role/name}\n{content}<im_end>\n
                for key, value in message.items():
                    num_tokens += len(encoding.encode(value))
                    if key == "name":  # if there's a name, the role is omitted
                        num_tokens -= 1  # role is always required and always 1 token
            num_tokens += 2  # every reply is primed with <im_start>assistant
            return num_tokens + completion_tokens
        # normal completions
        else:
            prompt = request_json["prompt"]
            if isinstance(prompt, str):  # single prompt
                prompt_tokens = len(encoding.encode(prompt))
                num_tokens = prompt_tokens + completion_tokens
                return num_tokens
            elif isinstance(prompt, list):  # multiple prompts
                prompt_tokens = sum([len(encoding.encode(p)) for p in prompt])
                num_tokens = prompt_tokens + completion_tokens * len(prompt)
                return num_tokens
            else:
                raise TypeError(
                    'Expecting either string or list of strings for "prompt" field in completion request'
                )
    # if embeddings request, tokens = input tokens
    elif api_endpoint == "embeddings":
        input = request_json["input"]
        if isinstance(input, str):  # single input
            num_tokens = len(encoding.encode(input))
            return num_tokens
        elif isinstance(input, list):  # multiple inputs
            num_tokens = sum([len(encoding.encode(i)) for i in input])
            return num_tokens
        else:
            raise TypeError(
                'Expecting either string or list of strings for "inputs" field in embedding request'
            )
    # more logic needed to support other API calls (e.g., edits, inserts, DALL-E)
    else:
        raise NotImplementedError(
            f'API endpoint "{api_endpoint}" not implemented in this script'
        )


def task_id_generator_function():
    """Generate integers 0, 1, 2, and so on."""
    task_id = 0
    while True:
        yield task_id
        task_id += 1


# run script


if __name__ == "__main__":
    # parse command line arguments
    parser = argparse.ArgumentParser()
    parser.add_argument("--requests_filepath")
    parser.add_argument("--save_filepath", default=None)
    parser.add_argument("--request_url", default="https://api.openai.com/v1/embeddings")
    parser.add_argument("--api_key", default=os.getenv("OPENAI_API_KEY"))
    parser.add_argument("--max_requests_per_minute", type=int, default=3_000 * 0.5)
    parser.add_argument("--max_tokens_per_minute", type=int, default=250_000 * 0.5)
    parser.add_argument("--token_encoding_name", default="cl100k_base")
    parser.add_argument("--max_attempts", type=int, default=5)
    parser.add_argument("--logging_level", default=logging.INFO)
    args = parser.parse_args()

    if args.save_filepath is None:
        args.save_filepath = args.requests_filepath.replace(".jsonl", "_results.jsonl")

    # run script
    asyncio.run(
        process_api_requests_from_file(
            requests_filepath=args.requests_filepath,
            save_filepath=args.save_filepath,
            request_url=args.request_url,
            api_key=args.api_key,
            max_requests_per_minute=float(args.max_requests_per_minute),
            max_tokens_per_minute=float(args.max_tokens_per_minute),
            token_encoding_name=args.token_encoding_name,
            max_attempts=int(args.max_attempts),
            logging_level=int(args.logging_level),
        )
    )


"""
APPENDIX

The example requests file at openai-cookbook/examples/data/example_requests_to_parallel_process.jsonl contains 10,000 requests to text-embedding-3-small.

It was generated with the following code:

```python
import json

filename = "data/example_requests_to_parallel_process.jsonl"
n_requests = 10_000
jobs = [{"model": "text-embedding-3-small", "input": str(x) + "\n"} for x in range(n_requests)]
with open(filename, "w") as f:
    for job in jobs:
        json_string = json.dumps(job)
        f.write(json_string + "\n")
```

As with all jsonl files, take care that newlines in the content are properly escaped (json.dumps does this automatically).
"""

```

`/home/ygg/Workspace/Eliza/GAIA/openai-cookbook/examples/chatgpt/rag-quickstart/azure/function_app.py`:

```py
import azure.functions as func
import json
import logging
from azure.search.documents import SearchClient
from azure.search.documents.indexes import SearchIndexClient
from azure.core.credentials import AzureKeyCredential
from openai import OpenAI
import os
from azure.search.documents.models import (
    VectorizedQuery
)

# Initialize the Azure Function App
app = func.FunctionApp()

def generate_embeddings(text):
    # Check if text is provided
    if not text:
        logging.error("No text provided in the query string.")
        return func.HttpResponse(
            "Please provide text in the query string.",
            status_code=400
        )

    try:
        # Initialize OpenAI client
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        logging.info("OpenAI client initialized successfully.")
        
        # Generate embeddings using OpenAI API
        response = client.embeddings.create(
            input=text,
            model=os.getenv("EMBEDDINGS_MODEL")
        )
        logging.info("Embeddings created successfully.")
        
        # Extract the embedding from the response
        embedding = response.data[0].embedding
        logging.debug(f"Generated embedding: {embedding}")
        
        return embedding
    except Exception as e:
        logging.error(f"Error generating embeddings: {str(e)}")
        return func.HttpResponse(
            f"Error generating embeddings: {str(e)}",
            status_code=500
        )


@app.route(route="vector_similarity_search", auth_level=func.AuthLevel.ANONYMOUS)
def vector_similarity_search(req: func.HttpRequest) -> func.HttpResponse:
    logging.info("Received request for vector similarity search.")
    try:
        # Parse the request body as JSON
        req_body = req.get_json()
        logging.info("Request body parsed successfully.")
    except ValueError:
        logging.error("Invalid JSON in request body.")
        return func.HttpResponse(
            "Invalid JSON in request body.",
            status_code=400
        )

    # Extract parameters from the request body
    search_service_endpoint = req_body.get('search_service_endpoint')
    index_name = req_body.get('index_name')
    query = req_body.get('query')
    k_nearest_neighbors = req_body.get('k_nearest_neighbors')
    search_column = req_body.get('search_column')
    use_hybrid_query = req_body.get('use_hybrid_query')
    
    logging.info(f"Parsed request parameters: search_service_endpoint={search_service_endpoint}, index_name={index_name}, query={query}, k_nearest_neighbors={k_nearest_neighbors}, search_column={search_column}, use_hybrid_query={use_hybrid_query}")

    # Generate embeddings for the query
    embeddings = generate_embeddings(query)
    logging.info(f"Generated embeddings: {embeddings}")

    # Check for required parameters
    if not (search_service_endpoint and index_name and query):
        logging.error("Missing required parameters in request body.")
        return func.HttpResponse(
            "Please provide search_service_endpoint, index_name, and query in the request body.",
            status_code=400
        )
    try:
        # Create a vectorized query
        vector_query = VectorizedQuery(vector=embeddings, k_nearest_neighbors=float(k_nearest_neighbors), fields=search_column)
        logging.info("Vector query generated successfully.")
    except Exception as e:
        logging.error(f"Error generating vector query: {str(e)}")
        return func.HttpResponse(
            f"Error generating vector query: {str(e)}",
            status_code=500
        )

    try:
        # Initialize the search client
        search_client = SearchClient(
            endpoint=search_service_endpoint,
            index_name=index_name,
            credential=AzureKeyCredential(os.getenv("SEARCH_SERVICE_API_KEY"))
        )
        logging.info("Search client created successfully.")
        
        # Initialize the index client and get the index schema
        index_client = SearchIndexClient(endpoint=search_service_endpoint, credential=AzureKeyCredential(os.getenv("SEARCH_SERVICE_API_KEY"))) 
        index_schema = index_client.get_index(index_name)
        for field in index_schema.fields:
            logging.info(f"Field: {field.name}, Type: {field.type}")
        # Filter out non-vector fields
        non_vector_fields = [field.name for field in index_schema.fields if field.type not in ["Edm.ComplexType", "Collection(Edm.ComplexType)","Edm.Vector","Collection(Edm.Single)"]]

        logging.info(f"Non-vector fields in the index: {non_vector_fields}")
    except Exception as e:
        logging.error(f"Error creating search client: {str(e)}")
        return func.HttpResponse(
            f"Error creating search client: {str(e)}",
            status_code=500
        )

    # Determine if hybrid query should be used
    search_text = query if use_hybrid_query else None

    try:
        # Perform the search
        results = search_client.search(  
            search_text=search_text,  
            vector_queries=[vector_query],
            select=non_vector_fields,
            top=3
        )
        logging.info("Search performed successfully.")
    except Exception as e:
        logging.error(f"Error performing search: {str(e)}")
        return func.HttpResponse(
            f"Error performing search: {str(e)}",
            status_code=500
        )

    try:
        # Extract relevant data from results and put it into a list of dictionaries
        response_data = [result for result in results]
        response_data = json.dumps(response_data)
        logging.info("Search results processed successfully.")
    except Exception as e:
        logging.error(f"Error processing search results: {str(e)}")
        return func.HttpResponse(
            f"Error processing search results: {str(e)}",
            status_code=500
        )

    logging.info("Returning search results.")
    return func.HttpResponse(response_data, mimetype="application/json")

```

`/home/ygg/Workspace/Eliza/GAIA/openai-cookbook/examples/chatgpt/rag-quickstart/gcp/main.py`:

```py
from google.cloud import bigquery
import functions_framework
import os
from openai import OpenAI
import json

openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
embeddings_model = os.getenv('EMBEDDINGS_MODEL')
project_id = os.getenv('PROJECT_ID')
dataset_id = os.getenv('DATASET_ID')
table_id = os.getenv('TABLE_ID')

def generate_embeddings(text, model):
    print(f'Generating embedding for: {text}')
    # Generate embeddings for the provided text using the specified model
    embeddings_response = openai_client.embeddings.create(model=model, input=text)
    # Extract the embedding data from the response
    embedding = embeddings_response.data[0].embedding
    return embedding

@functions_framework.http
def openai_docs_search(request):
    print('received a request')
    client = bigquery.Client()
    
    request_json = request.get_json(silent=True)
    print(request_json)
    
    if not request_json:
        return json.dumps({"error": "Invalid JSON in request"}), 400, {'Content-Type': 'application/json'}
    
    query = request_json.get('query')
    top_k = request_json.get('top_k', 3)
    category = request_json.get('category', '')

    if not query:
        return json.dumps({"error": "Query parameter is required"}), 400, {'Content-Type': 'application/json'}
    
    embedding_query = generate_embeddings(query, embeddings_model)
    embedding_query_list = ', '.join(map(str, embedding_query))
    
    sql_query = f"""
    WITH search_results AS (
        SELECT query.id AS query_id, base.id AS base_id, distance
        FROM VECTOR_SEARCH(
            TABLE `{project_id}.{dataset_id}.{table_id}`, 'content_vector',
            (SELECT ARRAY[{embedding_query_list}] AS content_vector, 'query_vector' AS id),
            top_k => {top_k}, distance_type => 'COSINE', options => '{{"use_brute_force": true}}')
    )
    SELECT sr.query_id, sr.base_id, sr.distance, ed.text, ed.title, ed.category
    FROM search_results sr
    JOIN `{project_id}.{dataset_id}.{table_id}` ed ON sr.base_id = ed.id
    """
    
    if category:
        sql_query += f" WHERE ed.category = '{category}'"

    sql_query += " ORDER BY sr.distance;"
    
    query_job = client.query(sql_query)  # Make an API request.
    
    rows = []
    for row in query_job:
        print(row.title)
        rows.append({
            "text": row.text,
            "title": row.title,
            "distance": row.distance,
            "category": row.category
        })

    response = {
        "items": rows
    }
    print('sending response')
    print(len(rows))
    return json.dumps(response), 200
```

`/home/ygg/Workspace/Eliza/GAIA/openai-cookbook/examples/object_oriented_agentic_approach/resources/object_oriented_agents/utils/logger.py`:

```py
# object_oriented_agents/utils/logger.py
import logging
from typing import Optional

def get_logger(name: str, level: int = logging.INFO, formatter: Optional[logging.Formatter] = None) -> logging.Logger:
    """
    Return a logger instance with a given name and logging level.
    If no formatter is provided, a default formatter will be used.
    """
    logger = logging.getLogger(name)
    logger.setLevel(level)

    if not logger.handlers:
        # Create a console handler
        ch = logging.StreamHandler()
        ch.setLevel(level)

        # Use a default formatter if none is provided
        if formatter is None:
            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
        ch.setFormatter(formatter)

        # Add the handler to the logger
        logger.addHandler(ch)

    return logger
```

`/home/ygg/Workspace/Eliza/GAIA/openai-cookbook/examples/object_oriented_agentic_approach/resources/object_oriented_agents/utils/openai_util.py`:

```py
# object_oriented_agents/utils/openai_util.py

from typing import List, Dict, Any
from .logger import get_logger
from ..services.openai_factory import OpenAIClientFactory

logger = get_logger("OpenAIUtils")

def call_openai_chat_completion(
    model: str,
    messages: List[Dict[str, str]],
    tools: List[Dict[str, Any]] = None,
    openai_client=None,
    api_key: str = None
) -> Any:
    """
    A utility function to call OpenAI's chat completion.
    If openai_client is provided, use it, otherwise create a new one.
    """
    if openai_client is None:
        openai_client = OpenAIClientFactory.create_client(api_key=api_key)

    kwargs = {
        "model": model,
        "messages": messages,
    }

    if tools:
        kwargs["tools"] = tools

    try:
        response = openai_client.chat.completions.create(**kwargs)
        return response
    except Exception as e:
        logger.error(f"OpenAI call failed: {str(e)}")
        raise e
```

`/home/ygg/Workspace/Eliza/GAIA/openai-cookbook/examples/object_oriented_agentic_approach/resources/object_oriented_agents/services/openai_language_model.py`:

```py
# object_oriented_agents/services/openai_language_model.py

from typing import List, Dict, Any, Optional
from .language_model_interface import LanguageModelInterface
from .openai_factory import OpenAIClientFactory
from ..utils.logger import get_logger

class OpenAILanguageModel(LanguageModelInterface):
    """
    A concrete implementation of LanguageModelInterface that uses the OpenAI API.
    """

    def __init__(self, openai_client=None, api_key: Optional[str] = None, logger=None):
        self.logger = logger or get_logger(self.__class__.__name__)
        # If no client is provided, create one using the factory
        self.openai_client = openai_client or OpenAIClientFactory.create_client(api_key)

    def generate_completion(
        self,
        model: str,
        messages: List[Dict[str, str]],
        tools: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Calls the OpenAI API to generate a chat completion using the provided messages and tools.
        """
        kwargs = {
            "model": model,
            "messages": messages
        }

        if tools:
            # Passing tools directly to the API depends on how the OpenAI implementation expects them.
            # Adjust this as necessary if the API format changes.
            kwargs["tools"] = tools

        self.logger.debug("Generating completion with OpenAI model.")
        self.logger.debug(f"Request: {kwargs}")
        try:
            response = self.openai_client.chat.completions.create(**kwargs)
            self.logger.debug("Received response from OpenAI.")
            self.logger.debug(f"Response: {response}")
            return response
        except Exception as e:
            self.logger.error(f"OpenAI call failed: {str(e)}", exc_info=True)
            raise e
```

`/home/ygg/Workspace/Eliza/GAIA/openai-cookbook/examples/object_oriented_agentic_approach/resources/object_oriented_agents/services/language_model_interface.py`:

```py
# object_oriented_agents/services/language_model_interface.py

from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional


class LanguageModelInterface(ABC):
    """
    Interface for interacting with a language model.
    Decouples application logic from a specific LLM provider (e.g., OpenAI).
    """

    @abstractmethod
    def generate_completion(
            self,
            model: str,
            messages: List[Dict[str, str]],
            tools: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Generate a completion (response) from the language model given a set of messages and optional tool definitions.

        :param model: The name of the model to call.
        :param messages: A list of messages, where each message is a dict with keys 'role' and 'content'.
        :param tools: Optional list of tool definitions.
        :return: A dictionary representing the model's response. The shape of this dict follows the provider's format.
        """
        pass
```

`/home/ygg/Workspace/Eliza/GAIA/openai-cookbook/examples/object_oriented_agentic_approach/resources/object_oriented_agents/services/openai_factory.py`:

```py
# object_oriented_agents/services/openai_factory.py
import os
from openai import OpenAI
from ..utils.logger import get_logger

logger = get_logger("OpenAIFactory")

class OpenAIClientFactory:
    @staticmethod
    def create_client(api_key: str = None) -> OpenAI:
        """
        Create and return an OpenAI client instance.
        The API key can be passed explicitly or read from the environment.
        """
        final_api_key = OpenAIClientFactory._resolve_api_key(api_key)
        return OpenAI(api_key=final_api_key)

    @staticmethod
    def _resolve_api_key(api_key: str = None) -> str:
        if api_key:
            return api_key
        env_key = os.getenv("OPENAI_API_KEY")
        if env_key:
            return env_key
        error_msg = "No OpenAI API key provided. Set OPENAI_API_KEY env variable or provide as an argument."
        logger.error(error_msg)
        raise ValueError(error_msg)

```

`/home/ygg/Workspace/Eliza/GAIA/openai-cookbook/examples/object_oriented_agentic_approach/resources/object_oriented_agents/core_classes/chat_messages.py`:

```py
# object_oriented_agents/core_classes/chat_messages.py
from typing import List, Dict

class ChatMessages:
    """
    Stores all messages in a conversation (developer, user, assistant).
    """

    def __init__(self, developer_prompt: str):
        self.messages: List[Dict[str, str]] = []
        self.add_developer_message(developer_prompt)

    def add_developer_message(self, content: str) -> None:
        self.messages.append({"role": "developer", "content": content})

    def add_user_message(self, content: str) -> None:
        self.messages.append({"role": "user", "content": content})

    def add_assistant_message(self, content: str) -> None:
        self.messages.append({"role": "assistant", "content": content})

    def get_messages(self) -> List[Dict[str, str]]:
        return self.messages
```

`/home/ygg/Workspace/Eliza/GAIA/openai-cookbook/examples/object_oriented_agentic_approach/resources/object_oriented_agents/core_classes/tool_interface.py`:

```py
# object_oriented_agents/core_classes/tool_interface.py
from abc import ABC, abstractmethod
from typing import Dict, Any

class ToolInterface(ABC):
    """
    An abstract class for any 'tool' that an agent can call.
    Every tool must provide two things:
    1) A definition (in JSON schema format) as expected by OpenAI function calling specifications.
    2) A 'run' method to handle the logic given the arguments.
    """

    @abstractmethod
    def get_definition(self) -> Dict[str, Any]:
        """
        Return the JSON/dict definition of the tool's function.
        Example:
        {
            "function": {
                "name": "<tool_function_name>",
                "description": "<what this function does>",
                "parameters": { <JSON schema> }
            }
        }
        """
        pass

    @abstractmethod
    def run(self, arguments: Dict[str, Any]) -> str:
        """
        Execute the tool using the provided arguments and return a result as a string.
        """
        pass
```

`/home/ygg/Workspace/Eliza/GAIA/openai-cookbook/examples/object_oriented_agentic_approach/resources/object_oriented_agents/core_classes/tool_manager.py`:

```py
# object_oriented_agents/core_classes/tool_manager.py

import json
from typing import Dict, Any, List
from .chat_messages import ChatMessages
from .tool_interface import ToolInterface
from ..utils.logger import get_logger
from ..services.language_model_interface import LanguageModelInterface

class ToolManager:
    """
    Manages one or more tools. Allows you to:
      - Register multiple tools
      - Retrieve their definitions
      - Invoke the correct tool by name
      - Handle the entire tool call sequence
    """


    def __init__(self, logger=None, language_model_interface: LanguageModelInterface = None):
        self.tools = {}
        self.logger = logger or get_logger(self.__class__.__name__)
        self.language_model_interface = language_model_interface

    def register_tool(self, tool: ToolInterface) -> None:
        """
        Register a tool by using its function name as the key.
        """
        tool_def = tool.get_definition()
        tool_name = tool_def["function"]["name"]
        self.tools[tool_name] = tool
        self.logger.debug(f"Registered tool '{tool_name}': {tool_def}")

    def get_tool_definitions(self) -> List[Dict[str, Any]]:
        """
        Return the list of tool definitions in the format expected by the OpenAI API.
        """
        definitions = []
        for name, tool in self.tools.items():
            tool_def = tool.get_definition()["function"]
            self.logger.debug(f"Tool definition retrieved for '{name}': {tool_def}")
            definitions.append({"type": "function", "function": tool_def})
        return definitions

    def handle_tool_call_sequence(
        self,
        response,
        return_tool_response_as_is: bool,
        messages: ChatMessages,
        model_name: str
    ) -> str:
        """
        If the model wants to call a tool, parse the function arguments, invoke the tool,
        then optionally return the tool's raw output or feed it back to the model for a final answer.
        """
        # We take the first tool call from the model’s response
        first_tool_call = response.choices[0].message.tool_calls[0]
        tool_name = first_tool_call.function.name
        self.logger.info(f"Handling tool call: {tool_name}")

        args = json.loads(first_tool_call.function.arguments)
        self.logger.info(f"Tool arguments: {args}")

        if tool_name not in self.tools:
            error_message = f"Error: The requested tool '{tool_name}' is not registered."
            self.logger.error(error_message)
            raise ValueError(error_message)

        # 1. Invoke the tool
        self.logger.debug(f"Invoking tool '{tool_name}'")
        tool_response = self.tools[tool_name].run(args)
        self.logger.info(f"Tool '{tool_name}' response: {tool_response}")

        # If returning the tool response "as is," just store and return it
        if return_tool_response_as_is:
            self.logger.debug("Returning tool response as-is without further LLM calls.")
            messages.add_assistant_message(tool_response)
            return tool_response

        self.logger.debug(f"Tool call: {first_tool_call}")
        # Otherwise, feed the tool's response back to the LLM for a final answer
        function_call_result_message = {
            "role": "tool",
            "content": tool_response,
            "tool_call_id": first_tool_call.id
        }

        complete_payload = messages.get_messages()
        complete_payload.append(response.choices[0].message)
        complete_payload.append(function_call_result_message)

        self.logger.debug("Calling the model again with the tool response to get the final answer.")
        # Use the injected openai_client here
        response_after_tool_call = self.language_model_interface.generate_completion(
            model=model_name,
            messages=complete_payload
        )

        final_message = response_after_tool_call.choices[0].message.content
        self.logger.debug("Received final answer from model after tool call.")
        messages.add_assistant_message(final_message)
        return final_message
```

`/home/ygg/Workspace/Eliza/GAIA/openai-cookbook/examples/object_oriented_agentic_approach/resources/object_oriented_agents/core_classes/agent_signature.py`:

```py
# object_oriented_agents/core_classes/agent_signature.py
from typing import Optional, Dict, Any, List
from .tool_manager import ToolManager

class AgentSignature:
    """
    Encapsulates the logic to produce an agent's 'signature' data:
    - The developer prompt
    - The model name
    - The list of tool definitions
    """

    def __init__(self, developer_prompt: str, model_name: str, tool_manager: Optional[ToolManager] = None):
        self.developer_prompt = developer_prompt
        self.model_name = model_name
        self.tool_manager = tool_manager

    def to_dict(self) -> Dict[str, Any]:
        """
        Return a dictionary containing:
          1. The developer prompt
          2. The model name
          3. A list of tool definitions (function schemas)
        """
        if self.tool_manager:
            # Each item in get_tool_definitions() looks like {"type": "function", "function": {...}}
            tool_definitions = self.tool_manager.get_tool_definitions()
            # We need the whole definition for the final signature
            functions = [t for t in tool_definitions]
        else:
            functions = []

        return {
            "developer_prompt": self.developer_prompt,
            "model_name": self.model_name,
            "tools": functions
        }
```

`/home/ygg/Workspace/Eliza/GAIA/openai-cookbook/examples/object_oriented_agentic_approach/resources/object_oriented_agents/core_classes/base_agent.py`:

```py
# object_oriented_agents/core_classes/base_agent.py
from abc import ABC, abstractmethod
from typing import Optional
from .chat_messages import ChatMessages
from .tool_manager import ToolManager
from ..utils.logger import get_logger
from ..services.language_model_interface import LanguageModelInterface
from .agent_signature import AgentSignature


class BaseAgent(ABC):
    """
    An abstract base agent that defines the high-level approach to handling user tasks
    and orchestrating calls to the OpenAI API.
    """

    def __init__(
            self,
            developer_prompt: str,
            model_name: str,
            logger=None,
            language_model_interface: LanguageModelInterface = None
    ):
        self.developer_prompt = developer_prompt
        self.model_name = model_name
        self.messages = ChatMessages(developer_prompt)
        self.tool_manager: Optional[ToolManager] = None
        self.logger = logger or get_logger(self.__class__.__name__)
        self.language_model_interface = language_model_interface

    @abstractmethod
    def setup_tools(self) -> None:
        pass

    def add_context(self, content: str) -> None:
        self.logger.debug(f"Adding context: {content}")
        self.messages.add_user_message(content)

    def add_message(self, content: str) -> None:
        self.logger.debug(f"Adding user message: {content}")
        self.messages.add_user_message(content)

    def task(self, user_task: str, tool_call_enabled: bool = True, return_tool_response_as_is: bool = False) -> str:
        if self.language_model_interface is None:
            error_message = "Error: Cannot execute task without the LanguageModelInterface."
            self.logger.error(error_message)
            raise ValueError(error_message)
        
        self.logger.debug(f"Starting task: {user_task} (tool_call_enabled={tool_call_enabled})")

        # Add user message
        self.add_message(user_task)

        tools = []
        if tool_call_enabled and self.tool_manager:
            tools = self.tool_manager.get_tool_definitions()
            self.logger.debug(f"Tools available: {tools}")

        # Submit to OpenAI
        self.logger.debug("Sending request to language model interface...")
        response = self.language_model_interface.generate_completion(
            model=self.model_name,
            messages=self.messages.get_messages(),
            tools=tools,
        )

        tool_calls = response.choices[0].message.tool_calls
        if tool_call_enabled and self.tool_manager and tool_calls:
            self.logger.debug(f"Tool calls requested: {tool_calls}")
            return self.tool_manager.handle_tool_call_sequence(
                response,
                return_tool_response_as_is,
                self.messages,
                self.model_name
            )

        # No tool call, normal assistant response
        response_message = response.choices[0].message.content
        self.messages.add_assistant_message(response_message)
        self.logger.debug("Task completed successfully.")
        return response_message

    def signature(self) -> dict:
        """
        Return a dictionary with:
        - The developer prompt
        - The model name
        - The tool definitions (function schemas)
        """
        signature_obj = AgentSignature(
            developer_prompt=self.developer_prompt,
            model_name=self.model_name,
            tool_manager=self.tool_manager
        )
        return signature_obj.to_dict()
```

`/home/ygg/Workspace/Eliza/GAIA/openai-cookbook/examples/object_oriented_agentic_approach/resources/registry/tools/python_code_interpreter_tool.py`:

```py
import subprocess
from typing import Tuple, Dict, Any

from ...object_oriented_agents.utils.logger import get_logger
from ...object_oriented_agents.core_classes.tool_interface import ToolInterface

class PythonExecTool(ToolInterface):
    """
    A Tool that executes Python code securely in a container.
    """

    def get_definition(self) -> Dict[str, Any]:
        """
        Return the JSON/dict definition of the tool's function
        in the format expected by the OpenAI function calling API.
        """
        return {
            "function": {
                "name": "execute_python_code",
                "description": "Executes Python code securely in a container. Python version 3.10 is installed in the container. pandas, numpy, matplotlib, seaborn, and scikit-learn are installed in the container.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "python_code": {
                            "type": "string",
                            "description": "The Python code to execute"
                        }
                    },
                    "required": ["python_code"]
                }
            }
        }

    def run(self, arguments: Dict[str, Any]) -> str:
        """
        Execute the Python code in a Docker container and return the output.
        """
        python_code = arguments["python_code"]
        python_code_stripped = python_code.strip('"""')

        output, errors = self._run_code_in_container(python_code_stripped)
        if errors:
            return f"[Error]\n{errors}"

        return output

    @staticmethod
    def _run_code_in_container(code: str, container_name: str = "sandbox") -> Tuple[str, str]:
        """
        Helper function that actually runs Python code inside a Docker container named `sandbox` (by default).
        """
        cmd = [
            "docker", "exec", "-i",
            container_name,
            "python", "-c", "import sys; exec(sys.stdin.read())"
        ]

        process = subprocess.Popen(
            cmd,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        out, err = process.communicate(code)
        return out, err
```

`/home/ygg/Workspace/Eliza/GAIA/openai-cookbook/examples/object_oriented_agentic_approach/resources/registry/tools/file_access_tool.py`:

```py
from typing import Dict, Any
import pandas as pd
import subprocess
import os

from ...object_oriented_agents.utils.logger import get_logger
from ...object_oriented_agents.core_classes.tool_interface import ToolInterface

class FileAccessTool(ToolInterface):
    """
    A tool to read CSV files and copy them to a Docker container.
    """

    def __init__(self, logger=None):
        self.logger = logger or get_logger(self.__class__.__name__)

    def get_definition(self) -> Dict[str, Any]:
        self.logger.debug("Returning tool definition for safe_file_access")
        return {
            "function": {
                "name": "safe_file_access",
                "description": (
                    "Read the contents of a file in a secure manner "
                    "and transfer it to the Python code interpreter docker container"
                ),
                "parameters": {
                    "type": "object",
                    "properties": {
                        "filename": {
                            "type": "string",
                            "description": "Name of the file to read"
                        }
                    },
                    "required": ["filename"]
                }
            }
        }

    def run(self, arguments: Dict[str, Any]) -> str:
        filename = arguments["filename"]
        self.logger.debug(f"Running safe_file_access with filename: {filename}")
        
        return self.safe_file_access(filename)

    def safe_file_access(self, filename: str) -> str:
        if not filename.endswith('.csv'):
            error_msg = "Error: The file is not a CSV file."
            self.logger.warning(f"{error_msg} - Filename provided: {filename}")
            return error_msg

        # Ensure the path is correct
        if not os.path.dirname(filename):
        
            filename = os.path.join('./resources/data', filename)
        
        self.logger.debug(f"Attempting to read file at path: {filename}")
        try:
            df = pd.read_csv(filename)
            self.logger.debug(f"File '{filename}' loaded successfully.")
            copy_output = self.copy_file_to_container(filename)
            head_str = df.head(15).to_string()
            return f"{copy_output}\nThe file content for the first 15 rows is:\n{head_str}"
        except FileNotFoundError:
            error_msg = f"Error: The file '{filename}' was not found."
            self.logger.error(error_msg)
            return error_msg
        except Exception as e:
            error_msg = f"Error while reading the CSV file: {str(e)}"
            self.logger.error(error_msg, exc_info=True)
            return error_msg

    def copy_file_to_container(self, local_file_name: str, container_name: str = "sandbox") -> str:
        container_home_path = "/home/sandboxuser"
        self.logger.debug(f"Copying '{local_file_name}' to container '{container_name}'.")

        if not os.path.isfile(local_file_name):
            error_msg = f"The local file '{local_file_name}' does not exist."
            self.logger.error(error_msg)
            raise FileNotFoundError(error_msg)

        # Check if container is running
        check_container_cmd = ["docker", "inspect", "-f", "{{.State.Running}}", container_name]
        result = subprocess.run(check_container_cmd, capture_output=True, text=True)
        if result.returncode != 0 or result.stdout.strip() != "true":
            error_msg = f"The container '{container_name}' is not running."
            self.logger.error(error_msg)
            raise RuntimeError(error_msg)

        # Copy the file into the container
        container_path = f"{container_name}:{container_home_path}/{os.path.basename(local_file_name)}"
        self.logger.debug(f"Running command: docker cp {local_file_name} {container_path}")
        subprocess.run(["docker", "cp", local_file_name, container_path], check=True)

        # Verify the file was copied
        verify_cmd = ["docker", "exec", container_name, "test", "-f",
                      f"{container_home_path}/{os.path.basename(local_file_name)}"]
        verify_result = subprocess.run(verify_cmd, capture_output=True, text=True)
        if verify_result.returncode != 0:
            error_msg = f"Failed to verify the file '{local_file_name}' in the container '{container_name}'."
            self.logger.error(error_msg)
            raise RuntimeError(error_msg)

        success_msg = f"Copied {local_file_name} into {container_name}:{container_home_path}/."
        self.logger.debug(success_msg)
        return success_msg
```

`/home/ygg/Workspace/Eliza/GAIA/openai-cookbook/examples/object_oriented_agentic_approach/resources/registry/agents/file_access_agent.py`:

```py
import logging
import os

# Import base classes
from ...object_oriented_agents.utils.logger import get_logger
from ...object_oriented_agents.core_classes.base_agent import BaseAgent
from ...object_oriented_agents.core_classes.tool_manager import ToolManager
from ...object_oriented_agents.services.openai_language_model import OpenAILanguageModel

# Import the Tool
from ..tools.file_access_tool import FileAccessTool

# Set the verbosity level: DEBUG for verbose output, INFO for normal output, and WARNING/ERROR for minimal output
myapp_logger = get_logger("MyApp", level=logging.INFO)

# Create a LanguageModelInterface instance using the OpenAILanguageModel
language_model_api_interface = OpenAILanguageModel(api_key=os.getenv("OPENAI_API_KEY"), logger=myapp_logger)


class FileAccessAgent(BaseAgent):
    """
    Agent that can only use the 'safe_file_access' tool to read CSV files.
    """
    # We pass the Agent attributes in the constructor 
    def __init__(self, 
                 developer_prompt: str = """
                 You are a helpful data science assistant. The user will provide the name of a CSV file that contains relational data. The file is in the directory ./resources/data

                 Instructions:
                 1. When the user provides the CSV file name, use the 'safe_read_file' tool to read and display the first 15 lines of that file.
                 2. If the specified file does not exist in the provided directory, return an appropriate error message (e.g., "Error: The specified file does not exist in the provided directory").
                 3. The user may request data analysis based on the file’s contents, but you should NOT perform or write code for any data analysis. Your only task is to read and return the first 6 lines of the file.

                 Do not include any additional commentary or code not related to reading the file.
                 """,
                 model_name: str = "gpt-4o",
                 logger = myapp_logger,
                 language_model_interface = language_model_api_interface):
        super().__init__(developer_prompt=developer_prompt, model_name=model_name, logger=logger, language_model_interface=language_model_interface)
        self.setup_tools()

    def setup_tools(self) -> None:
        self.logger.debug("Setting up tools for FileAccessAgent.")
        # Pass the openai_client to ToolManager
        self.tool_manager = ToolManager(logger=self.logger, language_model_interface=self.language_model_interface)
        # Register the one tool this agent is allowed to use
        self.tool_manager.register_tool(FileAccessTool(logger=self.logger))
```

`/home/ygg/Workspace/Eliza/GAIA/openai-cookbook/examples/object_oriented_agentic_approach/resources/registry/agents/python_code_exec_agent.py`:

```py
import logging
import os

# Import base classes
from ...object_oriented_agents.utils.logger import get_logger
from ...object_oriented_agents.core_classes.base_agent import BaseAgent
from ...object_oriented_agents.core_classes.tool_manager import ToolManager
from ...object_oriented_agents.services.openai_language_model import OpenAILanguageModel

# Import the Python Code Interpreter tool
from ..tools.python_code_interpreter_tool import PythonExecTool

# Set the verbosity level: DEBUG for verbose output, INFO for normal output, and WARNING/ERROR for minimal output
myapp_logger = get_logger("MyApp", level=logging.INFO)

# Create a LanguageModelInterface instance using the OpenAILanguageModel
language_model_api_interface = OpenAILanguageModel(api_key=os.getenv("OPENAI_API_KEY"), logger=myapp_logger)

class PythonExecAgent(BaseAgent):
    """
    An agent specialized in executing Python code in a Docker container.
    """

    def __init__(
            self,
            developer_prompt: str = """  
                    You are a helpful data science assistant. Your tasks include analyzing CSV data and generating Python code to address user queries. Follow these guidelines:

                    1. The user will provide the name of a CSV file located in the directory `/home/sandboxuser`.
                    2. The user will also supply context, including:
                    - Column names and their descriptions.
                    - Sample data from the CSV (headers and a few rows) to help understand data types.
                    3. Analyze the provided data using Python machine learning libraries and generate appropriate code to fulfill the user's request.
                    4. Generate Python code to analyze the data and call the tool `execute_python_code` to run the code inside a Docker container.
                    5. Execute the code in the container and return the output.
                    
                    Note: All files referenced in the prompt are located in `/home/sandboxuser`.
                """,
            model_name: str = "o1",
            logger=myapp_logger,
            language_model_interface = language_model_api_interface
        ):
        super().__init__(
            developer_prompt=developer_prompt,
            model_name=model_name,
            logger=logger,
            language_model_interface=language_model_interface
        )
        self.setup_tools()

    def setup_tools(self) -> None:
        """
        Create a ToolManager, instantiate the PythonExecTool and register it with the ToolManager.
        """
        self.tool_manager = ToolManager(logger=self.logger, language_model_interface=self.language_model_interface)
        
        # Create the Python execution tool
        python_exec_tool = PythonExecTool()
        
        # Register the Python execution tool
        self.tool_manager.register_tool(python_exec_tool)
```

`/home/ygg/Workspace/Eliza/GAIA/openai-cookbook/examples/vector_databases/redis/nbutils.py`:

```py
import os
import wget
import zipfile
import numpy as np
import pandas as pd
from ast import literal_eval


def download_wikipedia_data(
    data_path: str = '../../data/',
    download_path: str = "./",
    file_name: str = "vector_database_wikipedia_articles_embedded") -> pd.DataFrame:

    data_url = 'https://cdn.openai.com/API/examples/data/vector_database_wikipedia_articles_embedded.zip'

    csv_file_path = os.path.join(data_path, file_name + ".csv")
    zip_file_path = os.path.join(download_path, file_name + ".zip")
    if os.path.isfile(csv_file_path):
        print("File Downloaded")
    else:
        if os.path.isfile(zip_file_path):
            print("Zip downloaded but not unzipped, unzipping now...")
        else:
            print("File not found, downloading now...")
            # Download the data
            wget.download(data_url, out=download_path)

        # Unzip the data
        with zipfile.ZipFile(zip_file_path, 'r') as zip_ref:
            zip_ref.extractall(data_path)

        # Remove the zip file
        os.remove('vector_database_wikipedia_articles_embedded.zip')
        print(f"File downloaded to {data_path}")


def read_wikipedia_data(data_path: str = '../../data/', file_name: str = "vector_database_wikipedia_articles_embedded") -> pd.DataFrame:

    csv_file_path = os.path.join(data_path, file_name + ".csv")
    data = pd.read_csv(csv_file_path)
    # Read vectors from strings back into a list
    data['title_vector'] = data.title_vector.apply(literal_eval)
    data['content_vector'] = data.content_vector.apply(literal_eval)
    # Set vector_id to be a string
    data['vector_id'] = data['vector_id'].apply(str)
    return data

```

`/home/ygg/Workspace/Eliza/GAIA/openai-cookbook/examples/fine-tuned_qa/answers_with_ft.py`:

```py
"""
TODO: This example is deprecated.
Note: To answer questions based on text documents, we recommend the procedure in 
[Question Answering using Embeddings](https://github.com/openai/openai-cookbook/blob/main/examples/Question_answering_using_embeddings.ipynb).
Some of the code below may rely on [deprecated API endpoints](https://github.com/openai/openai-cookbook/tree/main/transition_guides_for_deprecated_API_endpoints).
"""

import argparse

from openai import OpenAI
import os

client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY", "<your OpenAI API key if not set as env var>"))


def create_context(
    question, search_file_id, max_len=1800, search_model="ada", max_rerank=10
):
    """
    Create a context for a question by finding the most similar context from the search file.
    :param question: The question
    :param search_file_id: The file id of the search file
    :param max_len: The maximum length of the returned context (in tokens)
    :param search_model: The search model to use
    :param max_rerank: The maximum number of reranking
    :return: The context
    """
    # TODO: openai.Engine(search_model) is deprecated
    results = client.Engine(search_model).search(
        search_model=search_model,
        query=question,
        max_rerank=max_rerank,
        file=search_file_id,
        return_metadata=True,
    )
    returns = []
    cur_len = 0
    for result in results["data"]:
        cur_len += int(result["metadata"]) + 4
        if cur_len > max_len:
            break
        returns.append(result["text"])
    return "\n\n###\n\n".join(returns)


def answer_question(
    search_file_id="<SEARCH_FILE_ID>",
    fine_tuned_qa_model="<FT_QA_MODEL_ID>",
    question="Which country won the European Football championship in 2021?",
    max_len=1800,
    search_model="ada",
    max_rerank=10,
    debug=False,
    stop_sequence=["\n", "."],
    max_tokens=100,
):
    """
    Answer a question based on the most similar context from the search file, using your fine-tuned model.
    :param question: The question
    :param fine_tuned_qa_model: The fine tuned QA model
    :param search_file_id: The file id of the search file
    :param max_len: The maximum length of the returned context (in tokens)
    :param search_model: The search model to use
    :param max_rerank: The maximum number of reranking
    :param debug: Whether to output debug information
    :param stop_sequence: The stop sequence for Q&A model
    :param max_tokens: The maximum number of tokens to return
    :return: The answer
    """
    context = create_context(
        question,
        search_file_id,
        max_len=max_len,
        search_model=search_model,
        max_rerank=max_rerank,
    )
    if debug:
        print("Context:\n" + context)
        print("\n\n")
    try:
        # fine-tuned models requires model parameter, whereas other models require engine parameter
        model_param = (
            {"model": fine_tuned_qa_model}
            if ":" in fine_tuned_qa_model
            and fine_tuned_qa_model.split(":")[1].startswith("ft")
            else {"engine": fine_tuned_qa_model}
        )
        response = client.chat.completions.create(prompt=f"Answer the question based on the context below\n\nText: {context}\n\n---\n\nQuestion: {question}\nAnswer:",
        temperature=0,
        max_tokens=max_tokens,
        top_p=1,
        frequency_penalty=0,
        presence_penalty=0,
        stop=stop_sequence,
        **model_param)
        return response["choices"][0]["text"]
    except Exception as e:
        print(e)
        return ""


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Rudimentary functionality of the answers endpoint with a fine-tuned Q&A model.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--search_file_id", help="Search file id", required=True, type=str
    )
    parser.add_argument(
        "--fine_tuned_qa_model", help="Fine-tuned QA model id", required=True, type=str
    )
    parser.add_argument(
        "--question", help="Question to answer", required=True, type=str
    )
    parser.add_argument(
        "--max_len",
        help="Maximum length of the returned context (in tokens)",
        default=1800,
        type=int,
    )
    parser.add_argument(
        "--search_model", help="Search model to use", default="ada", type=str
    )
    parser.add_argument(
        "--max_rerank",
        help="Maximum number of reranking for the search",
        default=10,
        type=int,
    )
    parser.add_argument(
        "--debug", help="Print debug information (context used)", action="store_true"
    )
    parser.add_argument(
        "--stop_sequence",
        help="Stop sequences for the Q&A model",
        default=["\n", "."],
        nargs="+",
        type=str,
    )
    parser.add_argument(
        "--max_tokens",
        help="Maximum number of tokens to return",
        default=100,
        type=int,
    )
    args = parser.parse_args()
    response = answer_question(
        search_file_id=args.search_file_id,
        fine_tuned_qa_model=args.fine_tuned_qa_model,
        question=args.question,
        max_len=args.max_len,
        search_model=args.search_model,
        max_rerank=args.max_rerank,
        debug=args.debug,
        stop_sequence=args.stop_sequence,
        max_tokens=args.max_tokens,
    )
    print(f"Answer:{response}")

```