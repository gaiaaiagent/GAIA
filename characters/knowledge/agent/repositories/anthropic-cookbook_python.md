Project Path: anthropic-cookbook

Source Tree:

```
anthropic-cookbook
├── patterns
│   └── agents
│       └── util.py
└── skills
    ├── contextual-embeddings
    │   └── contextual-rag-lambda-function
    │       ├── lambda_function.py
    │       ├── inference_adapter.py
    │       └── s3_adapter.py
    ├── retrieval_augmented_generation
    │   └── evaluation
    │       ├── prompts.py
    │       ├── provider_retrieval.py
    │       ├── eval_retrieval.py
    │       ├── eval_end_to_end.py
    │       └── vectordb.py
    ├── classification
    │   └── evaluation
    │       ├── transform.py
    │       ├── prompts.py
    │       └── vectordb.py
    ├── text_to_sql
    │   └── evaluation
    │       ├── prompts.py
    │       ├── tests
    │       │   ├── test_average_salary.py
    │       │   ├── test_above_average_salary.py
    │       │   ├── test_hierarchical_query.py
    │       │   ├── test_budget_allocation.py
    │       │   ├── test_employee_details.py
    │       │   ├── utils.py
    │       │   ├── test_simple_query.py
    │       │   └── test_employee_count.py
    │       └── vectordb.py
    └── summarization
        ├── evaluation
        │   ├── custom_evals
        │   │   ├── bleu_eval.py
        │   │   ├── llm_eval.py
        │   │   └── rouge_eval.py
        │   └── prompts.py
        └── data
            └── multiple_subleases.py

```

`/home/ygg/Workspace/Eliza/GAIA/anthropic-cookbook/patterns/agents/util.py`:

```py
from anthropic import Anthropic
import os
import re

client = Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

def llm_call(prompt: str, system_prompt: str = "", model="claude-3-5-sonnet-20241022") -> str:
    """
    Calls the model with the given prompt and returns the response.

    Args:
        prompt (str): The user prompt to send to the model.
        system_prompt (str, optional): The system prompt to send to the model. Defaults to "".
        model (str, optional): The model to use for the call. Defaults to "claude-3-5-sonnet-20241022".

    Returns:
        str: The response from the language model.
    """
    client = Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    messages = [{"role": "user", "content": prompt}]
    response = client.messages.create(
        model=model,
        max_tokens=4096,
        system=system_prompt,
        messages=messages,
        temperature=0.1,
    )
    return response.content[0].text

def extract_xml(text: str, tag: str) -> str:
    """
    Extracts the content of the specified XML tag from the given text. Used for parsing structured responses 

    Args:
        text (str): The text containing the XML.
        tag (str): The XML tag to extract content from.

    Returns:
        str: The content of the specified XML tag, or an empty string if the tag is not found.
    """
    match = re.search(f'<{tag}>(.*?)</{tag}>', text, re.DOTALL)
    return match.group(1) if match else ""
```

`/home/ygg/Workspace/Eliza/GAIA/anthropic-cookbook/skills/contextual-embeddings/contextual-rag-lambda-function/lambda_function.py`:

```py
import json
import os
import logging
import traceback
from inference_adapter import InferenceAdapter
from s3_adapter import S3Adapter

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)

contextual_retrieval_prompt = """
    <document>
    {doc_content}
    </document>


    Here is the chunk we want to situate within the whole document
    <chunk>
    {chunk_content}
    </chunk>


    Please give a short succinct context to situate this chunk within the overall document for the purposes of improving search retrieval of the chunk.
    Answer only with the succinct context and nothing else.
    """

def lambda_handler(event, context):
    logger.debug('input={}'.format(json.dumps(event)))

    s3_adapter = S3Adapter()
    inference_adapter = InferenceAdapter()

    # Extract relevant information from the input event
    input_files = event.get('inputFiles')
    input_bucket = event.get('bucketName')

    if not all([input_files, input_bucket]):
        raise ValueError("Missing required input parameters")

    output_files = []
    for input_file in input_files:

        processed_batches = []
        for batch in input_file.get('contentBatches'):

            # Get chunks from S3
            input_key = batch.get('key')

            if not input_key:
                raise ValueError("Missing uri in content batch")

            # Read file from S3
            file_content = s3_adapter.read_from_s3(bucket_name=input_bucket, file_name=input_key)
            print(file_content.get('fileContents'))

            # Combine all chunks together to build content of original file
            # Alternatively we can also read original file and extract text from it
            original_document_content = ''.join(content.get('contentBody') for content in file_content.get('fileContents') if content)

            # Process one chunk at a time
            chunked_content = {
                'fileContents': []
            }
            for content in file_content.get('fileContents'):
                content_body = content.get('contentBody', '')
                content_type = content.get('contentType', '')
                content_metadata = content.get('contentMetadata', {})

                # Update chunk with additional context
                prompt = contextual_retrieval_prompt.format(doc_content=original_document_content, chunk_content=content_body)
                response_stream = inference_adapter.invoke_model_with_response_stream(prompt)
                chunk_context = ''.join(chunk for chunk in response_stream if chunk)

                # append chunk to output file content
                chunked_content['fileContents'].append({
                    "contentBody": chunk_context + "\n\n" + content_body,
                    "contentType": content_type,
                    "contentMetadata": content_metadata,
                })

            output_key = f"Output/{input_key}"

            # write updated chunk to output S3
            s3_adapter.write_output_to_s3(input_bucket, output_key, chunked_content)

            # Append the processed chunks file to list of files
            processed_batches.append({ "key": output_key })
        output_files.append({
            "originalFileLocation": input_file.get('originalFileLocation'),
            "fileMetadata": {},
            "contentBatches": processed_batches
        })

    return {
        "outputFiles": output_files
    }
```

`/home/ygg/Workspace/Eliza/GAIA/anthropic-cookbook/skills/contextual-embeddings/contextual-rag-lambda-function/inference_adapter.py`:

```py
import json
import boto3
import os
from botocore.exceptions import ClientError

class InferenceAdapter:

    def __init__(self):
        self.bedrock_runtime = boto3.client(
            service_name='bedrock-runtime',
            region_name='us-east-1' #change region as needed
        )
        self.model_id = 'anthropic.claude-3-haiku-20240307-v1:0'

    def invoke_model_with_response_stream(self, prompt, max_tokens=1000):

        request_body = json.dumps({
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": max_tokens,
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "temperature": 0.0,
            })

        # Invoke the model
        try:
            response = self.bedrock_runtime.invoke_model_with_response_stream(
                modelId=self.model_id,
                contentType='application/json',
                accept='application/json',
                body=request_body
            )

            for event in response.get('body'):
                chunk = json.loads(event['chunk']['bytes'].decode())
                if chunk['type'] == 'content_block_delta':
                    yield chunk['delta']['text']
                elif chunk['type'] == 'message_delta':
                    if 'stop_reason' in chunk['delta']:
                        break

        except ClientError as e:
            print(f"An error occurred: {e}")
            yield None
```

`/home/ygg/Workspace/Eliza/GAIA/anthropic-cookbook/skills/contextual-embeddings/contextual-rag-lambda-function/s3_adapter.py`:

```py
import json
import boto3
import os
from botocore.exceptions import ClientError

class S3Adapter:
    def __init__(self):
        # Create an S3 client
        self.s3_client = boto3.client('s3')

    def write_output_to_s3(self, bucket_name, file_name, json_data):
        """
        Write a JSON object to an S3 bucket

        :param bucket_name: Name of the S3 bucket
        :param file_name: Name of the file to be created in the bucket
        :param json_data: JSON object to be written
        :return: True if file was uploaded, else False
        """

        try:
            # Convert JSON object to string
            json_string = json.dumps(json_data)

            # Upload the file
            response = self.s3_client.put_object(
                Bucket=bucket_name,
                Key=file_name,
                Body=json_string,
                ContentType='application/json'
            )

            # Check if the upload was successful
            if response['ResponseMetadata']['HTTPStatusCode'] == 200:
                print(f"Successfully uploaded {file_name} to {bucket_name}")
                return True
            else:
                print(f"Failed to upload {file_name} to {bucket_name}")
                return False

        except ClientError as e:
            print(f"Error occurred: {e}")
            return False

    def read_from_s3(self, bucket_name, file_name):
        """
        Write a JSON object to an S3 bucket

        :param bucket_name: Name of the S3 bucket
        :param file_name: Name of the file to be created in the bucket
        :return: True if file was uploaded, else False
        """
        try:
            # Get the object from S3
            response = self.s3_client.get_object(Bucket=bucket_name, Key=file_name)

            # Read the content of the file
            return json.loads(response['Body'].read().decode('utf-8'))

        except ClientError as e:
            print(f"Error reading file from S3: {str(e)}")

    def parse_s3_path(self, s3_path):
        # Remove 's3://' prefix if present
        s3_path = s3_path.replace('s3://', '')

        # Split the path into bucket and key
        parts = s3_path.split('/', 1)

        if len(parts) != 2:
            raise ValueError("Invalid S3 path format")

        bucket_name = parts[0]
        file_key = parts[1]

        return bucket_name, file_key
```

`/home/ygg/Workspace/Eliza/GAIA/anthropic-cookbook/skills/retrieval_augmented_generation/evaluation/prompts.py`:

```py
import json
import os
from typing import Callable, List, Dict, Any, Tuple, Set
from vectordb import VectorDB, SummaryIndexedVectorDB
from anthropic import Anthropic

client = Anthropic(api_key=os.environ.get('ANTHROPIC_API_KEY'))

# Initialize the VectorDB
db = VectorDB("anthropic_docs")
# Load the Anthropic documentation
with open('../data/anthropic_docs.json', 'r') as f:
    anthropic_docs = json.load(f)
db.load_data(anthropic_docs)

def _retrieve_base(query, db):
    results = db.search(query, k=3)
    context = ""
    for result in results:
        chunk = result['metadata']
        context += f"\n{chunk['text']}\n"
    return results, context

def answer_query_base(context):
    input_query = context['vars']['query']
    documents, document_context = _retrieve_base(input_query, db)
    prompt = f"""
    You have been tasked with helping us to answer the following query: 
    <query>
    {input_query}
    </query>
    You have access to the following documents which are meant to provide context as you answer the query:
    <documents>
    {document_context}
    </documents>
    Please remain faithful to the underlying context, and only deviate from it if you are 100% sure that you know the answer already. 
    Answer the question now, and avoid providing preamble such as 'Here is the answer', etc
    """

    return prompt

# Initialize the VectorDB
db_summary = SummaryIndexedVectorDB("anthropic_docs_summaries")
# Load the Anthropic documentation
with open("../data/anthropic_summary_indexed_docs.json", 'r') as f:
    anthropic_docs_summaries = json.load(f)
db_summary.load_data(anthropic_docs_summaries)

def retrieve_level_two(query):
    results = db_summary.search(query, k=3)
    context = ""
    for result in results:
        chunk = result['metadata']
        context += f"\n <document> \n {chunk['chunk_heading']}\n\nText\n {chunk['text']} \n\nSummary: \n {chunk['summary']} \n </document> \n" #show model all 3 items
    return results, context

def answer_query_level_two(context):
    input_query = context['vars']['query']
    documents, document_context = retrieve_level_two(input_query)
    prompt = f"""
    You have been tasked with helping us to answer the following query: 
    <query>
    {input_query}
    </query>
    You have access to the following documents which are meant to provide context as you answer the query:
    <documents>
    {document_context}
    </documents>
    Please remain faithful to the underlying context, and only deviate from it if you are 100% sure that you know the answer already. 
    Answer the question now, and avoid providing preamble such as 'Here is the answer', etc
    """

    return prompt

# Initialize the VectorDB
db_rerank = SummaryIndexedVectorDB("anthropic_docs_rerank")
# Load the Anthropic documentation
with open("../data/anthropic_summary_indexed_docs.json", 'r') as f:
    anthropic_docs_summaries = json.load(f)
db_rerank.load_data(anthropic_docs_summaries)

def _rerank_results(query: str, results: List[Dict], k: int = 5) -> List[Dict]:
    # Prepare the summaries with their indices
    summaries = []
    print(len(results))
    for i, result in enumerate(results):
        summary = "[{}] Document: {}".format(
            i,
            result['metadata']['chunk_heading'],
            result['metadata']['summary']
        )
        summary += " \n {}".format(result['metadata']['text'])
        summaries.append(summary)
    
    # Join summaries with newlines
    joined_summaries = "\n".join(summaries)
    
    prompt = f"""
    Query: {query}
    You are about to be given a group of documents, each preceded by its index number in square brackets. Your task is to select the only {k} most relevant documents from the list to help us answer the query.
    
    {joined_summaries}
    
    Output only the indices of {k} most relevant documents in order of relevance, separated by commas, enclosed in XML tags here:
    <relevant_indices>put the numbers of your indices here, seeparted by commas</relevant_indices>
    """
    try:
        response = client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=50,
            messages=[{"role": "user", "content": prompt}, {"role": "assistant", "content": "<relevant_indices>"}],
            temperature=0,
            stop_sequences=["</relevant_indices>"]
        )
        
        # Extract the indices from the response
        response_text = response.content[0].text.strip()
        indices_str = response_text
        relevant_indices = []
        for idx in indices_str.split(','):
            try:
                relevant_indices.append(int(idx.strip()))
            except ValueError:
                continue  # Skip invalid indices
        print(indices_str)
        print(relevant_indices)
        # If we didn't get enough valid indices, fall back to the top k by original order
        if len(relevant_indices) == 0:
            relevant_indices = list(range(min(k, len(results))))
        
        # Ensure we don't have out-of-range indices
        relevant_indices = [idx for idx in relevant_indices if idx < len(results)]
        
        # Return the reranked results
        reranked_results = [results[idx] for idx in relevant_indices[:k]]
        # Assign descending relevance scores
        for i, result in enumerate(reranked_results):
            result['relevance_score'] = 100 - i  # Highest score is 100, decreasing by 1 for each rank
        
        return reranked_results
    
    except Exception as e:
        print(f"An error occurred during reranking: {str(e)}")
        # Fall back to returning the top k results without reranking
        return results[:k]

def _retrieve_advanced(query: str, k: int = 3, initial_k: int = 20) -> Tuple[List[Dict], str]:
    # Step 1: Get initial results
    initial_results = db_rerank.search(query, k=initial_k)

    # Step 2: Re-rank results
    reranked_results = _rerank_results(query, initial_results, k=k)
    
    # Step 3: Generate new context string from re-ranked results
    new_context = ""
    for result in reranked_results:
        chunk = result['metadata']
        new_context += f"\n <document> \n {chunk['chunk_heading']}\n\n{chunk['text']} \n </document> \n"
    
    return reranked_results, new_context

# The answer_query_advanced function remains unchanged
def answer_query_level_three(context):
    input_query = context['vars']['query']
    documents, document_context = _retrieve_advanced(input_query)
    prompt = f"""
    You have been tasked with helping us to answer the following query: 
    <query>
    {input_query}
    </query>
    You have access to the following documents which are meant to provide context as you answer the query:
    <documents>
    {document_context}
    </documents>
    Please remain faithful to the underlying context, and only deviate from it if you are 100% sure that you know the answer already. 
    Answer the question now, and avoid providing preamble such as 'Here is the answer', etc
    """
    return prompt
```

`/home/ygg/Workspace/Eliza/GAIA/anthropic-cookbook/skills/retrieval_augmented_generation/evaluation/provider_retrieval.py`:

```py
import json
import os
from typing import Callable, List, Dict, Any, Tuple, Set
from vectordb import VectorDB, SummaryIndexedVectorDB
from anthropic import Anthropic

# Initialize the VectorDB
db = VectorDB("anthropic_docs")
# Load the Anthropic documentation
with open('../data/anthropic_docs.json', 'r') as f:
    anthropic_docs = json.load(f)
db.load_data(anthropic_docs)

def retrieve_base(query, options, context):
    input_query = context['vars']['query']
    results = db.search(input_query, k=3)
    outputs = []
    for result in results:
        outputs.append(result['metadata']['chunk_link'])
    print(outputs)
    result = {"output": outputs}
    return result

# Initialize the VectorDB
db_summary = SummaryIndexedVectorDB("anthropic_docs_summaries")
# Load the Anthropic documentation
with open("../data/anthropic_summary_indexed_docs.json", 'r') as f:
    anthropic_docs_summaries = json.load(f)
db_summary.load_data(anthropic_docs_summaries)

def retrieve_level_two(query, options, context):
    input_query = context['vars']['query']
    results = db_summary.search(input_query, k=3)
    outputs = []
    for result in results:
        outputs.append(result['metadata']['chunk_link'])
    print(outputs)
    result = {"output": outputs}
    return result

def _rerank_results(query: str, results: List[Dict], k: int = 3) -> List[Dict]:
    # Prepare the summaries with their indices
    summaries = []
    print(len(results))
    for i, result in enumerate(results):
        summary = "[{}] Document: {}".format(
            i,
            result['metadata']['chunk_heading'],
            result['metadata']['summary']
        )
        summary += " \n {}".format(result['metadata']['text'])
        summaries.append(summary)
    
    # Join summaries with newlines
    joined_summaries = "\n".join(summaries)
    
    prompt = f"""
    Query: {query}
    You are about to be given a group of documents, each preceded by its index number in square brackets. Your task is to select the only {k} most relevant documents from the list to help us answer the query.
    
    {joined_summaries}
    
    Output only the indices of {k} most relevant documents in order of relevance, separated by commas, enclosed in XML tags here:
    <relevant_indices>put the numbers of your indices here, seeparted by commas</relevant_indices>
    """
    
    client = Anthropic(api_key=os.environ.get('ANTHROPIC_API_KEY'))
    try:
        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=50,
            messages=[{"role": "user", "content": prompt}, {"role": "assistant", "content": "<relevant_indices>"}],
            temperature=0,
            stop_sequences=["</relevant_indices>"]
        )
        
        # Extract the indices from the response
        response_text = response.content[0].text.strip()
        indices_str = response_text
        relevant_indices = []
        for idx in indices_str.split(','):
            try:
                relevant_indices.append(int(idx.strip()))
            except ValueError:
                continue  # Skip invalid indices
        print(indices_str)
        print(relevant_indices)
        # If we didn't get enough valid indices, fall back to the top k by original order
        if len(relevant_indices) == 0:
            relevant_indices = list(range(min(k, len(results))))
        
        # Ensure we don't have out-of-range indices
        relevant_indices = [idx for idx in relevant_indices if idx < len(results)]
        
        # Return the reranked results
        reranked_results = [results[idx] for idx in relevant_indices[:k]]
        # Assign descending relevance scores
        for i, result in enumerate(reranked_results):
            result['relevance_score'] = 100 - i  # Highest score is 100, decreasing by 1 for each rank
        
        return reranked_results
    
    except Exception as e:
        print(f"An error occurred during reranking: {str(e)}")
        # Fall back to returning the top k results without reranking
        return results[:k]


# Initialize the VectorDB
db_rerank = SummaryIndexedVectorDB("anthropic_docs_summaries_rerank")
# Load the Anthropic documentation
with open("../data/anthropic_summary_indexed_docs.json", 'r') as f:
    anthropic_docs_summaries = json.load(f)
db_rerank.load_data(anthropic_docs_summaries)

def retrieve_level_three(query, options, context):
    # Step 1: Get initial results from the summary db
    initial_results = db_rerank.search(query, k=20)

    # Step 2: Re-rank results
    reranked_results = _rerank_results(query, initial_results, k=3)
    
    # Step 3: Generate new context string from re-ranked results
    new_context = ""
    for result in reranked_results:
        chunk = result['metadata']
        new_context += f"\n <document> \n {chunk['chunk_heading']}\n\n{chunk['text']} \n </document> \n"

    outputs = []
    for result in reranked_results:
        outputs.append(result['metadata']['chunk_link'])
    print(outputs)
    result = {"output": outputs}
    return result
```

`/home/ygg/Workspace/Eliza/GAIA/anthropic-cookbook/skills/retrieval_augmented_generation/evaluation/eval_retrieval.py`:

```py
from typing import Dict, Union, Any, List
import ast

def calculate_mrr(retrieved_links: List[str], correct_links) -> float:
    for i, link in enumerate(retrieved_links, 1):
        if link in correct_links:
            return 1 / i
    return 0

def evaluate_retrieval(retrieved_links, correct_links):
    correct_links = ast.literal_eval(correct_links)
    true_positives = len(set(retrieved_links) & set(correct_links))
    precision = true_positives / len(retrieved_links) if retrieved_links else 0
    recall = true_positives / len(correct_links) if correct_links else 0
    f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
    mrr= calculate_mrr(retrieved_links, correct_links)
    return precision, recall, mrr, f1

def get_assert(output: str, context) -> Union[bool, float, Dict[str, Any]]:
    correct_chunks = context['vars']['correct_chunks']

    try: 
        precision, recall, mrr, f1 = evaluate_retrieval(output, correct_chunks)
        metrics: Dict[str, float] = {}
        metrics['precision'] = precision
        metrics['recall'] = recall
        metrics['f1'] = f1
        metrics['mrr'] = mrr
        print("METRICS")
        print(metrics)
        overall_score = True
        if f1 < 0.3:
            overall_score = False
        return {
            "pass": overall_score, #if f1 > 0.3 we will pass, otherwise fail
            "score": f1,
            "reason": f"Precision: {precision} \n Recall: {recall} \n F1 Score: {f1} \n MRR: {mrr}",
            "componentResults": [
                {
                    "pass": True,
                    "score": mrr,
                    "reason": f"MRR is {mrr}",
                    "named_scores": {
                        "MRR": mrr
                    }
                },
                {
                    "pass": True,
                    "score": precision,
                    "reason": f"Precision is {precision}",
                    "named_scores": {
                        "Precision": precision
                    }
                },
                {
                    "pass": True,
                    "score": recall,
                    "reason": f"Recall is {recall}",
                    "named_scores": {
                        "Recall": recall
                    }
                }, 
                {
                    "pass": True,
                    "score": f1,
                    "reason": f"F1 is {f1}",
                    "named_scores": {
                        "F1": f1
                    }
                },
            ],
        }
    except Exception as e:
        return {
            "pass": False, #if f1 > 0.3 we will pass, otherwise fail
            "score": f1,
            "reason": f"Unexpected error: {str(e)}",
            "componentResults": [
                {
                    "pass": False,
                    "score": mrr,
                    "reason": f"Unexpected error: {str(e)}",
                    "named_scores": {
                        "MRR": mrr
                    }
                },
                {
                    "pass": False,
                    "score": precision,
                    "reason": f"Unexpected error: {str(e)}",
                    "named_scores": {
                        "Precision": precision
                    }
                },
                {
                    "pass": False,
                    "score": recall,
                    "reason": f"Unexpected error: {str(e)}",
                    "named_scores": {
                        "Recall": recall
                    }
                }, 
                {
                    "pass": False,
                    "score": f1,
                    "reason": f"Unexpected error: {str(e)}",
                    "named_scores": {
                        "F1": f1
                    }
                },
            ],
        }
```

`/home/ygg/Workspace/Eliza/GAIA/anthropic-cookbook/skills/retrieval_augmented_generation/evaluation/eval_end_to_end.py`:

```py
from typing import Dict, Union, Any, List
from anthropic import Anthropic
import re
import os
import xml.etree.ElementTree as ET

def evaluate_end_to_end(query, generated_answer, correct_answer):
    
    prompt = f"""
    You are an AI assistant tasked with evaluating the correctness of answers to questions about Anthropic's documentation.
    
    Question: {query}
    
    Correct Answer: {correct_answer}
    
    Generated Answer: {generated_answer}
    
    Is the Generated Answer correct based on the Correct Answer? You should pay attention to the substance of the answer, and ignore minute details that may differ. 
    
    Small differences or changes in wording don't matter. If the generated answer and correct answer are saying essentially the same thing then that generated answer should be marked correct. 
    
    However, if there is any critical piece of information which is missing from the generated answer in comparison to the correct answer, then we should mark this as incorrect. 
    
    Finally, if there are any direct contradictions between the correct answer and generated answer, we should deem the generated answer to be incorrect.
    
    Respond in the following XML format:
    <evaluation>
    <content>
    <explanation>Your explanation here</explanation>
    <is_correct>true/false</is_correct>
    </content>
    </evaluation>
    """
    
    client = Anthropic(api_key=os.environ.get('ANTHROPIC_API_KEY'))
    try:
        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1500,
            messages=[
                {"role": "user", "content": prompt},
                {"role": "assistant", "content": "<evaluation>"}
            ],
            temperature=0,
            stop_sequences=["</evaluation>"]
        )
        
        response_text = response.content[0].text

        # Use regex to extract explanation and is_correct
        explanation_match = re.search(r'<explanation>(.*?)</explanation>', response_text, re.DOTALL)
        is_correct_match = re.search(r'<is_correct>(.*?)</is_correct>', response_text, re.DOTALL)
        
        is_correct = True
        if explanation_match and is_correct_match:
            explanation = explanation_match.group(1).strip()
            is_correct = is_correct_match.group(1).strip().lower() == 'true'
        else:
            raise ValueError("Could not extract explanation or is_correct from response")
        
        result = {
            'question': query,
            'correct_answer': correct_answer,
            'generated_answer': generated_answer,
            'is_correct': is_correct,
            'explanation': explanation
        }

    except Exception as e:
        print(f"Unexpected error: {e}")
        result = {
            'question': query,
            'correct_answer': correct_answer,
            'generated_answer': generated_answer,
            'is_correct': False,
            'explanation': f"Unexpected error: {str(e)}"
        }
    
    return result

def get_assert(output: str, context) -> Union[bool, float, Dict[str, Any]]:
    correct_answer = context['vars']['correct_answer']
    query = context['vars']['query']
    result = evaluate_end_to_end(query, output, correct_answer)
    score = 1
    if result['is_correct'] == False:
        score = 0
    
    return {
        "pass": result['is_correct'],
        "score": score,
        "reason": result["explanation"]
    }
```

`/home/ygg/Workspace/Eliza/GAIA/anthropic-cookbook/skills/retrieval_augmented_generation/evaluation/vectordb.py`:

```py
import os
import pickle
import json
import numpy as np
import voyageai

class VectorDB:
    def __init__(self, name, api_key=None):
        if api_key is None:
            api_key = os.getenv("VOYAGE_API_KEY")
        self.client = voyageai.Client(api_key=api_key)
        self.name = name
        self.embeddings = []
        self.metadata = []
        self.query_cache = {}
        self.db_path = f"./data/{name}/vector_db.pkl"

    def load_data(self, data):
        if self.embeddings and self.metadata:
            print("Vector database is already loaded. Skipping data loading.")
            return
        if os.path.exists(self.db_path):
            print("Loading vector database from disk.")
            self.load_db()
            return
        
        texts = [f"Heading: {item['chunk_heading']}\n\n Chunk Text:{item['text']}" for item in data]
        self._embed_and_store(texts, data)
        self.save_db()
        print("Vector database loaded and saved.")

    def _embed_and_store(self, texts, data):
        batch_size = 128
        result = [
            self.client.embed(
                texts[i : i + batch_size],
                model="voyage-2"
            ).embeddings
            for i in range(0, len(texts), batch_size)
        ]
        self.embeddings = [embedding for batch in result for embedding in batch]
        self.metadata = data

    def search(self, query, k=3, similarity_threshold=0.75):
        if query in self.query_cache:
            query_embedding = self.query_cache[query]
        else:
            query_embedding = self.client.embed([query], model="voyage-2").embeddings[0]
            self.query_cache[query] = query_embedding

        if not self.embeddings:
            raise ValueError("No data loaded in the vector database.")

        similarities = np.dot(self.embeddings, query_embedding)
        top_indices = np.argsort(similarities)[::-1]
        top_examples = []
        
        for idx in top_indices:
            if similarities[idx] >= similarity_threshold:
                example = {
                    "metadata": self.metadata[idx],
                    "similarity": similarities[idx],
                }
                top_examples.append(example)
                
                if len(top_examples) >= k:
                    break
        self.save_db()
        return top_examples

    def save_db(self):
        data = {
            "embeddings": self.embeddings,
            "metadata": self.metadata,
            "query_cache": json.dumps(self.query_cache),
        }
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        with open(self.db_path, "wb") as file:
            pickle.dump(data, file)

    def load_db(self):
        if not os.path.exists(self.db_path):
            raise ValueError("Vector database file not found. Use load_data to create a new database.")
        with open(self.db_path, "rb") as file:
            data = pickle.load(file)
        self.embeddings = data["embeddings"]
        self.metadata = data["metadata"]
        self.query_cache = json.loads(data["query_cache"])


class SummaryIndexedVectorDB:
    def __init__(self, name, api_key=None):
        if api_key is None:
            api_key = os.getenv("VOYAGE_API_KEY")
        self.client = voyageai.Client(api_key=api_key)
        self.name = name
        self.embeddings = []
        self.metadata = []
        self.query_cache = {}
        self.db_path = f"./data/{name}/summary_indexed_vector_db.pkl"

    def load_data(self, data):
        if self.embeddings and self.metadata:
            print("Vector database is already loaded. Skipping data loading.")
            return
        if os.path.exists(self.db_path):
            print("Loading vector database from disk.")
            self.load_db()
            return
        
        texts = [f"{item['chunk_heading']}\n\n{item['text']}\n\n{item['summary']}" for item in data]  # Embed Chunk Heading + Text + Summary Together
        self._embed_and_store(texts, data)
        self.save_db()
        print("Vector database loaded and saved.")

    def _embed_and_store(self, texts, data):
        batch_size = 128
        result = [
            self.client.embed(
                texts[i : i + batch_size],
                model="voyage-2"
            ).embeddings
            for i in range(0, len(texts), batch_size)
        ]
        self.embeddings = [embedding for batch in result for embedding in batch]
        self.metadata = data

    def search(self, query, k=5, similarity_threshold=0.75):
        if query in self.query_cache:
            query_embedding = self.query_cache[query]
        else:
            query_embedding = self.client.embed([query], model="voyage-2").embeddings[0]
            self.query_cache[query] = query_embedding

        if not self.embeddings:
            raise ValueError("No data loaded in the vector database.")

        similarities = np.dot(self.embeddings, query_embedding)
        top_indices = np.argsort(similarities)[::-1]
        top_examples = []
        
        for idx in top_indices:
            if similarities[idx] >= similarity_threshold:
                example = {
                    "metadata": self.metadata[idx],
                    "similarity": similarities[idx],
                }
                top_examples.append(example)
                
                if len(top_examples) >= k:
                    break
        self.save_db()
        return top_examples

    def save_db(self):
        data = {
            "embeddings": self.embeddings,
            "metadata": self.metadata,
            "query_cache": json.dumps(self.query_cache),
        }
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        with open(self.db_path, "wb") as file:
            pickle.dump(data, file)

    def load_db(self):
        if not os.path.exists(self.db_path):
            raise ValueError("Vector database file not found. Use load_data to create a new database.")
        with open(self.db_path, "rb") as file:
            data = pickle.load(file)
        self.embeddings = data["embeddings"]
        self.metadata = data["metadata"]
        self.query_cache = json.loads(data["query_cache"])
```

`/home/ygg/Workspace/Eliza/GAIA/anthropic-cookbook/skills/classification/evaluation/transform.py`:

```py
def get_transform(output, context):
    try:
        return output.split("<category>")[1].split("</category>")[0].strip()
    except Exception as e:
        print(f"Error in get_transform: {e}")
        return output
```

`/home/ygg/Workspace/Eliza/GAIA/anthropic-cookbook/skills/classification/evaluation/prompts.py`:

```py
from vectordb import VectorDB
import textwrap
vectordb = VectorDB()
# Load the vector database
vectordb.load_db()

categories = """<category> 
    <label>Billing Inquiries</label>
    <content> Questions about invoices, charges, fees, and premiums Requests for clarification on billing statements Inquiries about payment methods and due dates 
    </content> 
</category> 
<category> 
    <label>Policy Administration</label>
    <content> Requests for policy changes, updates, or cancellations Questions about policy renewals and reinstatements Inquiries about adding or removing coverage options 
    </content> 
</category> 
<category> 
    <label>Claims Assistance</label> 
    <content> Questions about the claims process and filing procedures Requests for help with submitting claim documentation Inquiries about claim status and payout timelines 
    </content> 
</category> 
<category> 
    <label>Coverage Explanations</label> 
    <content> Questions about what is covered under specific policy types Requests for clarification on coverage limits and exclusions Inquiries about deductibles and out-of-pocket expenses 
    </content> 
</category> 
<category> 
    <label>Quotes and Proposals</label> 
    <content> Requests for new policy quotes and price comparisons Questions about available discounts and bundling options Inquiries about switching from another insurer 
    </content> 
</category> 
<category> 
    <label>Account Management</label> 
    <content> Requests for login credentials or password resets Questions about online account features and functionality Inquiries about updating contact or personal information 
    </content> 
</category> 
<category> 
    <label>Billing Disputes</label> 
    <content> Complaints about unexpected or incorrect charges Requests for refunds or premium adjustments Inquiries about late fees or collection notices 
    </content> 
</category> 
<category> 
    <label>Claims Disputes</label> 
    <content> Complaints about denied or underpaid claims Requests for reconsideration of claim decisions Inquiries about appealing a claim outcome 
    </content> 
</category> 
<category> 
    <label>Policy Comparisons</label> 
    <content> Questions about the differences between policy options Requests for help deciding between coverage levels Inquiries about how policies compare to competitors' offerings 
    </content> 
</category> 
<category> 
    <label>General Inquiries</label> 
    <content> Questions about company contact information or hours of operation Requests for general information about products or services Inquiries that don't fit neatly into other categories 
    </content> 
</category>"""


def simple_classify(context: dict):
    X = context['vars']['text']
    prompt = textwrap.dedent("""
    You will classify a customer support ticket into one of the following categories:
    <categories>
        {{categories}}
    </categories>

    Here is the customer support ticket:
    <ticket>
        {{ticket}}
    </ticket>

    Respond with just the label of the category between category tags.
    """).replace("{{categories}}", categories).replace("{{ticket}}", X)
    return prompt



def rag_classify(context: dict):
    X = context['vars']['text']
    rag = vectordb.search(X,5)
    rag_string = ""
    for example in rag:
        rag_string += textwrap.dedent(f"""
        <example>
            <query>
                "{example["metadata"]["text"]}"
            </query>
            <label>
                {example["metadata"]["label"]}
            </label>
        </example>
        """)
    prompt = textwrap.dedent("""
    You will classify a customer support ticket into one of the following categories:
    <categories>
        {{categories}}
    </categories>

    Here is the customer support ticket:
    <ticket>
        {{ticket}}
    </ticket>

    Use the following examples to help you classify the query:
    <examples>
        {{examples}}
    </examples>

    Respond with just the label of the category between category tags.
    """).replace("{{categories}}", categories).replace("{{ticket}}", X).replace("{{examples}}", rag_string)
    return prompt


def rag_chain_of_thought_classify(context: dict):
    X = context['vars']['text']
    rag = vectordb.search(X,5)
    rag_string = ""
    for example in rag:
        rag_string += textwrap.dedent(f"""
        <example>
            <query>
                "{example["metadata"]["text"]}"
            </query>
            <label>
                {example["metadata"]["label"]}
            </label>
        </example>
        """)
    prompt = textwrap.dedent("""
    You will classify a customer support ticket into one of the following categories:
    <categories>
        {{categories}}
    </categories>

    Here is the customer support ticket:
    <ticket>
        {{ticket}}
    </ticket>

    Use the following examples to help you classify the query:
    <examples>
        {{examples}}
    </examples>

    First you will think step-by-step about the problem in scratchpad tags.
    You should consider all the information provided and create a concrete argument for your classification.
    
    Respond using this format:
    <response>
        <scratchpad>Your thoughts and analysis go here</scratchpad>
        <category>The category label you chose goes here</category>
    </response>
    """).replace("{{categories}}", categories).replace("{{ticket}}", X).replace("{{examples}}", rag_string)
    return prompt
```

`/home/ygg/Workspace/Eliza/GAIA/anthropic-cookbook/skills/classification/evaluation/vectordb.py`:

```py
import os
import numpy as np
import voyageai
import pickle
import json

class VectorDB:
    def __init__(self, api_key=None):
        if api_key is None:
            api_key = os.getenv("VOYAGE_API_KEY")
        self.client = voyageai.Client(api_key=api_key)
        self.embeddings = []
        self.metadata = []
        self.query_cache = {}
        self.db_path = "../data/vector_db.pkl"

    def load_data(self, data):
        # Check if the vector database is already loaded
        if self.embeddings and self.metadata:
            print("Vector database is already loaded. Skipping data loading.")
            return
        # Check if vector_db.pkl exists
        if os.path.exists(self.db_path):
            print("Loading vector database from disk.")
            self.load_db()
            return

        texts = [item["text"] for item in data]

        # Embed more than 128 documents with a for loop
        batch_size = 128
        result = [
            self.client.embed(
                texts[i : i + batch_size],
                model="voyage-2"
            ).embeddings
            for i in range(0, len(texts), batch_size)
        ]

        # Flatten the embeddings
        self.embeddings = [embedding for batch in result for embedding in batch]
        self.metadata = [item for item in data]
        # Save the vector database to disk
        print("Vector database loaded and saved.")

    def search(self, query, k=5, similarity_threshold=0.85):
        query_embedding = None
        if query in self.query_cache:
            query_embedding = self.query_cache[query]
        else:
            query_embedding = self.client.embed([query], model="voyage-2").embeddings[0]
            self.query_cache[query] = query_embedding

        if not self.embeddings:
            raise ValueError("No data loaded in the vector database.")

        similarities = np.dot(self.embeddings, query_embedding)
        top_indices = np.argsort(similarities)[::-1]
        top_examples = []
        
        for idx in top_indices:
            if similarities[idx] >= similarity_threshold:
                example = {
                    "metadata": self.metadata[idx],
                    "similarity": similarities[idx],
                }
                top_examples.append(example)
                
                if len(top_examples) >= k:
                    break
        
        return top_examples

    def load_db(self):
        if not os.path.exists(self.db_path):
            raise ValueError("Vector database file not found. Use load_data to create a new database.")
        
        with open(self.db_path, "rb") as file:
            data = pickle.load(file)
        self.embeddings = data["embeddings"]
        self.metadata = data["metadata"]
        self.query_cache = json.loads(data["query_cache"])
```

`/home/ygg/Workspace/Eliza/GAIA/anthropic-cookbook/skills/text_to_sql/evaluation/prompts.py`:

```py
import sqlite3

DATABASE_PATH = '../data/data.db'

def get_schema_info():
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    schema_info = []
    
    # Get all tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    
    for (table_name,) in tables:
        # Get columns for this table
        cursor.execute(f"PRAGMA table_info({table_name})")
        columns = cursor.fetchall()
        
        table_info = f"Table: {table_name}\n"
        table_info += "\n".join(f"  - {col[1]} ({col[2]})" for col in columns)
        schema_info.append(table_info)
    
    conn.close()
    return "\n\n".join(schema_info)

def generate_prompt(context):
    user_query = context['vars']['user_query']
    schema = get_schema_info()
    return f"""
    You are an AI assistant that converts natural language queries into SQL. 
    Given the following SQL database schema:

    {schema}

    Convert the following natural language query into SQL:

    {user_query}

    Provide only the SQL query in your response, enclosed within <sql> tags.
    """

def generate_prompt_with_examples(context):
    user_query = context['vars']['user_query']
    examples = """
        Example 1:
        <query>List all employees in the HR department.</<query>
        <output>SELECT e.name FROM employees e JOIN departments d ON e.department_id = d.id WHERE d.name = 'HR';</output>

        Example 2:
        User: What is the average salary of employees in the Engineering department?
        SQL: SELECT AVG(e.salary) FROM employees e JOIN departments d ON e.department_id = d.id WHERE d.name = 'Engineering';

        Example 3:
        User: Who is the oldest employee?
        SQL: SELECT name, age FROM employees ORDER BY age DESC LIMIT 1;
    """

    schema = get_schema_info()

    return f"""
        You are an AI assistant that converts natural language queries into SQL.
        Given the following SQL database schema:

        <schema>
        {schema}
        </schema>

        Here are some examples of natural language queries and their corresponding SQL:

        <examples>
        {examples}
        </examples>

        Now, convert the following natural language query into SQL:
        <query>
        {user_query}
        </query>

        Provide only the SQL query in your response, enclosed within <sql> tags.
    """

def generate_prompt_with_cot(context):
    user_query = context['vars']['user_query']
    schema = get_schema_info()
    examples = """
    <example>
    <query>List all employees in the HR department.</query>
    <thought_process>
    1. We need to join the employees and departments tables.
    2. We'll match employees.department_id with departments.id.
    3. We'll filter for the HR department.
    4. We only need to return the employee names.
    </thought_process>
    <sql>SELECT e.name FROM employees e JOIN departments d ON e.department_id = d.id WHERE d.name = 'HR';</sql>
    </example>

    <example>
    <query>What is the average salary of employees hired in 2022?</query>
    <thought_process>
    1. We need to work with the employees table.
    2. We need to filter for employees hired in 2022.
    3. We'll use the YEAR function to extract the year from the hire_date.
    4. We'll calculate the average of the salary column for the filtered rows.
    </thought_process>
    <sql>SELECT AVG(salary) FROM employees WHERE YEAR(hire_date) = 2022;</sql>
    </example>
    """

    return f"""You are an AI assistant that converts natural language queries into SQL.
    Given the following SQL database schema:

    <schema>
    {schema}
    </schema>

    Here are some examples of natural language queries, thought processes, and their corresponding SQL:

    <examples>
    {examples}
    </examples>

    Now, convert the following natural language query into SQL:
    <query>
    {user_query}
    </query>

    Within <thought_process> tags, explain your thought process for creating the SQL query.
    Then, within <sql> tags, provide your output SQL query.
    """

def generate_prompt_with_rag(context):
    from vectordb import VectorDB

    # Load the vector database
    vectordb = VectorDB()
    vectordb.load_db()

    user_query = context['vars']['user_query']

    if not vectordb.embeddings:
        with sqlite3.connect(DATABASE_PATH) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
            schema_data = [
                {"text": f"Table: {table[0]}, Column: {col[1]}, Type: {col[2]}", 
                "metadata": {"table": table[0], "column": col[1], "type": col[2]}}
                for table in cursor.fetchall()
                for col in cursor.execute(f"PRAGMA table_info({table[0]})").fetchall()
            ]
        vectordb.load_data(schema_data)
    
    relevant_schema = vectordb.search(user_query, k=10, similarity_threshold=0.3)
    schema_info = "\n".join([f"Table: {item['metadata']['table']}, Column: {item['metadata']['column']}, Type: {item['metadata']['type']}"
                             for item in relevant_schema])

    examples = """
    <example>
    <query>List all employees in the HR department.</query>
    <thought_process>
    1. We need to join the employees and departments tables.
    2. We'll match employees.department_id with departments.id.
    3. We'll filter for the HR department.
    4. We only need to return the employee names.
    </thought_process>
    <sql>SELECT e.name FROM employees e JOIN departments d ON e.department_id = d.id WHERE d.name = 'HR';</sql>
    </example>

    <example>
    <query>What is the average salary of employees hired in 2022?</query>
    <thought_process>
    1. We need to work with the employees table.
    2. We need to filter for employees hired in 2022.
    3. We'll use the YEAR function to extract the year from the hire_date.
    4. We'll calculate the average of the salary column for the filtered rows.
    </thought_process>
    <sql>SELECT AVG(salary) FROM employees WHERE YEAR(hire_date) = 2022;</sql>
    </example>
    """

    return f"""You are an AI assistant that converts natural language queries into SQL.
    Given the following relevant columns from the SQL database schema:

    <schema>
    {schema_info}
    </schema>

    Here are some examples of natural language queries, thought processes, and their corresponding SQL:

    <examples>
    {examples}
    </examples>

    Now, convert the following natural language query into SQL:
    <query>
    {user_query}
    </query>

    First, provide your thought process within <thought_process> tags, explaining how you'll approach creating the SQL query. Consider the following steps:
    1. Identify the relevant tables and columns from the provided schema.
    2. Determine any necessary joins between tables.
    3. Identify any filtering conditions.
    4. Decide on the appropriate aggregations or calculations.
    5. Structure the query logically.

    Then, within <sql> tags, provide your output SQL query.

    Ensure your SQL query is compatible with SQLite syntax and uses only the tables and columns provided in the schema.
    If you're unsure about a particular table or column, use the information available in the provided schema.
    """
```

`/home/ygg/Workspace/Eliza/GAIA/anthropic-cookbook/skills/text_to_sql/evaluation/tests/test_average_salary.py`:

```py
from utils import extract_sql, execute_sql

def get_assert(output, context):
    sql = extract_sql(output)
    
    try:
        results = execute_sql(sql)
        execution_success = True
        result_valid = len(results) > 0 and 40000 < results[0][0] < 200000
    except Exception as e:
        execution_success = False
        result_valid = False
        print(f"SQL execution error: {e}")

    return {
        "pass": execution_success and result_valid,
        "score": 1 if (execution_success and result_valid) else 0,
        "reason": f"SQL {'executed successfully with valid results' if (execution_success and result_valid) else 'failed or produced invalid results'}."
    }
```

`/home/ygg/Workspace/Eliza/GAIA/anthropic-cookbook/skills/text_to_sql/evaluation/tests/test_above_average_salary.py`:

```py
from utils import extract_sql, execute_sql

def get_assert(output, context):
    sql = extract_sql(output)
    
    try:
        results = execute_sql(sql)
        execution_success = True
        result_valid = len(results) > 0 and all(row[2] > 0 for row in results)
    except Exception as e:
        execution_success = False
        result_valid = False
        print(f"SQL execution error: {e}")

    return {
        "pass": execution_success and result_valid,
        "score": 1 if (execution_success and result_valid) else 0,
        "reason": f"SQL {'executed successfully with valid results' if (execution_success and result_valid) else 'failed or produced invalid results'}."
    }
```

`/home/ygg/Workspace/Eliza/GAIA/anthropic-cookbook/skills/text_to_sql/evaluation/tests/test_hierarchical_query.py`:

```py
from utils import extract_sql, execute_sql

def get_assert(output, context):
    sql = extract_sql(output)
    
    try:
        results = execute_sql(sql)
        execution_success = True
        result_valid = len(results) > 0 and len(results[0]) == 4  # department, employee name, salary, percentage difference
        if result_valid:
            for row in results:
                if not (isinstance(row[2], (int, float)) and isinstance(row[3], (int, float))):
                    result_valid = False
                    break
    except Exception as e:
        execution_success = False
        result_valid = False
        print(f"SQL execution error: {e}")

    return {
        "pass": execution_success and result_valid,
        "score": 1 if (execution_success and result_valid) else 0,
        "reason": f"SQL {'executed successfully' if execution_success else 'failed to execute'}. {'Valid results obtained' if result_valid else 'Invalid or no results'}"
    }
```

`/home/ygg/Workspace/Eliza/GAIA/anthropic-cookbook/skills/text_to_sql/evaluation/tests/test_budget_allocation.py`:

```py
from utils import extract_sql, execute_sql

def get_assert(output, context):
    sql = extract_sql(output)
    
    try:
        results = execute_sql(sql)
        execution_success = True
        result_valid = len(results) > 0 and len(results[0]) >= 5  # department, budget %, top employees, their salary %, efficiency score
        if result_valid:
            for row in results:
                if not (isinstance(row[1], float) and 0 <= row[1] <= 100 and
                        isinstance(row[-1], float)):
                    result_valid = False
                    break
    except Exception as e:
        execution_success = False
        result_valid = False
        print(f"SQL execution error: {e}")

    return {
        "pass": execution_success and result_valid,
        "score": 1 if (execution_success and result_valid) else 0,
        "reason": f"SQL {'executed successfully' if execution_success else 'failed to execute'}. {'Valid budget analysis results obtained' if result_valid else 'Invalid or incomplete analysis results'}"
    }
```

`/home/ygg/Workspace/Eliza/GAIA/anthropic-cookbook/skills/text_to_sql/evaluation/tests/test_employee_details.py`:

```py
from utils import extract_sql, execute_sql

def get_assert(output, context):
    sql = extract_sql(output)
    
    try:
        results = execute_sql(sql)
        row = results[0] if results else None
        execution_success = True
    except Exception as e:
        execution_success = False
        row = None
        print(f"SQL execution error: {e}")

    expected_result = {
        "name": "Julia Clark",
        "age": 64,
        "salary": 103699.17
    }

    if row:
        actual_result = {
            "name": row[0],
            "age": row[1],
            "salary": row[2]
        }
        data_match = actual_result == expected_result
    else:
        data_match = False

    return {
        "pass": execution_success and data_match,
        "score": 1 if (execution_success and data_match) else 0,
        "reason": f"SQL {'executed successfully' if execution_success else 'execution failed'}. "
                  f"Data {'matches' if data_match else 'does not match'} expected result. "
                  f"Actual: {actual_result if row else 'No data'}, Expected: {expected_result}"
    }
```

`/home/ygg/Workspace/Eliza/GAIA/anthropic-cookbook/skills/text_to_sql/evaluation/tests/utils.py`:

```py
# sql_utils.py
import re
import sqlite3

def extract_sql(text):
    match = re.search(r'<sql>(.*?)</sql>', text, re.DOTALL)
    return match.group(1).strip() if match else ""

def execute_sql(sql):
    conn = sqlite3.connect('../data/data.db')
    cursor = conn.cursor()
    cursor.execute(sql)
    results = cursor.fetchall()
    conn.close()
    return results
```

`/home/ygg/Workspace/Eliza/GAIA/anthropic-cookbook/skills/text_to_sql/evaluation/tests/test_simple_query.py`:

```py
from utils import extract_sql

def get_assert(output, context):
    sql = extract_sql(output)
    required_elements = ['select', 'from employees', 'join departments', "name = 'engineering'"]
    result = all(element in sql.lower() for element in required_elements)
    
    return {
        "pass": result,
        "score": 1 if result else 0,
        "reason": f"SQL query {'is correct' if result else 'is incorrect or not found'}"
    }
```

`/home/ygg/Workspace/Eliza/GAIA/anthropic-cookbook/skills/text_to_sql/evaluation/tests/test_employee_count.py`:

```py
from utils import extract_sql, execute_sql

def get_assert(output, context):
    sql = extract_sql(output)
    
    try:
        results = execute_sql(sql)
        count = results[0][0] if results else 0
        execution_success = True
    except Exception as e:
        execution_success = False
        count = 0
        print(f"SQL execution error: {e}")

    expected_count = 20

    return {
        "pass": execution_success and count == expected_count,
        "score": 1 if (execution_success and count == expected_count) else 0,
        "reason": f"SQL {'executed successfully' if execution_success else 'execution failed'}. "
                  f"Returned count: {count}, Expected count: {expected_count}."
    }
```

`/home/ygg/Workspace/Eliza/GAIA/anthropic-cookbook/skills/text_to_sql/evaluation/vectordb.py`:

```py
import os
import numpy as np
import voyageai
import pickle
import json

class VectorDB:
    def __init__(self, db_path='../data/vector_db.pkl'):
        self.client = voyageai.Client(api_key=os.getenv("VOYAGE_API_KEY"))
        self.db_path = db_path
        self.load_db()

    def load_db(self):
        if os.path.exists(self.db_path):
            with open(self.db_path, "rb") as file:
                data = pickle.load(file)
            self.embeddings, self.metadata, self.query_cache = data['embeddings'], data['metadata'], json.loads(data['query_cache'])
        else:
            self.embeddings, self.metadata, self.query_cache = [], [], {}

    def load_data(self, data):
        if not self.embeddings:
                texts = [item["text"] for item in data]
                self.embeddings = [emb for batch in range(0, len(texts), 128) 
                                    for emb in self.client.embed(texts[batch:batch+128], model="voyage-2").embeddings]
                self.metadata = [item["metadata"] for item in data]  # Store only the inner metadata
                self.save_db()

    def search(self, query, k=5, similarity_threshold=0.3):
        if query not in self.query_cache:
            self.query_cache[query] = self.client.embed([query], model="voyage-2").embeddings[0]
            self.save_db()
        
        similarities = np.dot(self.embeddings, self.query_cache[query])
        top_indices = np.argsort(similarities)[::-1]
        
        return [{"metadata": self.metadata[i], "similarity": similarities[i]} 
                for i in top_indices if similarities[i] >= similarity_threshold][:k]

    def save_db(self):
        with open(self.db_path, "wb") as file:
            pickle.dump({"embeddings": self.embeddings, "metadata": self.metadata, 
                         "query_cache": json.dumps(self.query_cache)}, file)
```

`/home/ygg/Workspace/Eliza/GAIA/anthropic-cookbook/skills/summarization/evaluation/custom_evals/bleu_eval.py`:

```py
import numpy as np
from typing import Dict, TypedDict, Union, Any
import nltk
from nltk.translate.bleu_score import sentence_bleu
from nltk.tokenize import word_tokenize

# Download required NLTK data
nltk.download('punkt', quiet=True)

def nltk_bleu_eval(output, ground_truth) -> float:
    """
    Calculate BLEU score using NLTK and evaluate against a threshold.
    
    Args:
    output (str): The output to evaluate.
    ground_truth (str): The ground_truth output.
    threshold (float): The threshold for the BLEU score (default: 0.5).
    
    Returns:
    tuple: (float, bool) - The BLEU score and whether it passes the threshold.
    """
    # Tokenize the summaries
    output_tokens = word_tokenize(output.lower())
    ground_truth_tokens = word_tokenize(ground_truth.lower())
    
    try:
        # Calculate BLEU score
        # Note: sentence_bleu expects a list of references, so we wrap reference_tokens in a list
        bleu_score = sentence_bleu([ground_truth_tokens], output_tokens, weights=(0.25, 0.25, 0.25, 0.25))
        
        # Ensure bleu_score is a float
        if isinstance(bleu_score, (int, float)):
            bleu_score_float = float(bleu_score)
        elif isinstance(bleu_score, (list, np.ndarray)):
            # If it's a list or array, take the mean
            bleu_score_float = float(np.mean(bleu_score))
        else:
            # If it's neither a number nor a list, default to 0
            print(f"Warning: Unexpected BLEU score type: {type(bleu_score)}. Defaulting to 0.")
            bleu_score_float = 0.0
    except Exception as e:
        print(f"Error calculating BLEU score: {e}. Defaulting to 0.")
        bleu_score_float = 0.0
    
    # Return both the BLEU score and whether it passes the threshold
    return bleu_score_float


def get_assert(output: str, context, threshold=0.3) -> Union[bool, float, Dict[str, Any]]:
    ground_truth = context['vars']['ground_truth']
    score = nltk_bleu_eval(output, ground_truth)
    
    if score >= threshold:
        return {
            "pass": True,
            "score": score,
            "reason": "Average score is above threshold"
        }
    else:
        return {
        "pass": False,
        "score": score,
        "reason": "Average score is below threshold"
        }
```

`/home/ygg/Workspace/Eliza/GAIA/anthropic-cookbook/skills/summarization/evaluation/custom_evals/llm_eval.py`:

```py
import anthropic
import os
import json
from typing import Dict, TypedDict, Union, Any

def llm_eval(summary, input):
    """
    Evaluate summary using an LLM (Claude).
    
    Args:
    summary (str): The summary to evaluate.
    input (str): The original text that was summarized.
    
    Returns:
    bool: True if the average score is above the threshold, False otherwise.
    """
    client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    
    # You could include an example here too and likely improve performance further!
    prompt = f"""Evaluate the following summary based on these criteria:
    1. Conciseness (1-5)
    2. Accuracy (1-5)
    3. Completeness (1-5)
    4. Clarity (1-5)
    5. Explanation - a general description of the way the summary is evaluatied

    Here are some things to think about as you go about grading.

    1. Does the summary accurately capture the key provisions of the legal document?
    2. Does the summary omit any important details from the legal document?
    3. Does the summary contain any inaccuracies or misrepresentations of the legal document?
    4. Does the summary fairly represent the legal document as a whole, or does it unduly emphasize certain provisions over others?
    5. Does the summary accurately reflect the language and tone of the legal document?
    6. Does the summary capture the key concepts and principles embodied in the legal document?
    7. Does the summary omit any important ideas that should be captured to make decisions using the document?
    
    Provide a score for each criterion in JSON format. Here is the format you should follow always:

    <json>
    {{
    "conciseness": <number>,
    "accuracy": <number>,
    "completeness": <number>,
    "clarity": <number>,
    "explanation": <string>,
    }}
    </json>

    Original Text: {input}
    
    Summary to Evaluate: {summary}
    
    Evaluation (JSON format):"""
    
    response = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=1000,
        temperature=0,
        messages=[
            {
                "role": "user",
                "content": prompt
            },
            {
                "role": "assistant",
                "content": "<json>" 
            }
        ],
        stop_sequences=["</json>"]
    )
    
    evaluation = json.loads(response.content[0].text)
    # Filter out non-numeric values and calculate the average
    numeric_values = [value for key, value in evaluation.items() if isinstance(value, (int, float))]
    avg_score = sum(numeric_values) / len(numeric_values)
    return avg_score, evaluation['explanation']

def get_assert(output: str, context, threshold=0.5) -> Union[bool, float, Dict[str, Any]]:
    input = context['vars']['input']
    score, evaluation = llm_eval(output, input)

    # 4 different dimensions we measure performance on
    normalized_score = score / 4 
    
    if normalized_score >= threshold:
        return {
            "pass": True,
            "score": score,
            "reason": evaluation
        }
    else:
        return {
        "pass": False,
        "score": score,
        "reason": evaluation
        }
```

`/home/ygg/Workspace/Eliza/GAIA/anthropic-cookbook/skills/summarization/evaluation/custom_evals/rouge_eval.py`:

```py
import numpy as np
from typing import Dict, TypedDict, Union, Any
from rouge_score import rouge_scorer

def rouge_eval(summary, ground_truth, threshold=0.3) -> float:
    """
    Evaluate summary using ROUGE scores.
    
    Args:
    summary (str): The summary to evaluate.
    ground_truth (str): The ground_truth summary.
    threshold (float): The threshold for the ROUGE score (default: 0.3).
    
    Returns:
    bool: True if the average ROUGE score is above the threshold, False otherwise.
    """
    scorer = rouge_scorer.RougeScorer(['rouge1', 'rouge2', 'rougeL'], use_stemmer=True)
    scores = scorer.score(summary, ground_truth)
    
    # Calculate average ROUGE score
    avg_rouge = np.mean([scores['rouge1'].fmeasure, scores['rouge2'].fmeasure, scores['rougeL'].fmeasure])
    
    return float(avg_rouge)

def get_assert(output: str, context, threshold=0.3) -> Union[bool, float, Dict[str, Any]]:
    ground_truth = context['vars']['ground_truth']
    score = rouge_eval(output, ground_truth)
    
    if score >= threshold:
        return {
            "pass": True,
            "score": score,
            "reason": "Average score is above threshold"
        }
    else:
        return {
            "pass": False,
            "score": score,
            "reason": "Average score is below threshold"
        }
```

`/home/ygg/Workspace/Eliza/GAIA/anthropic-cookbook/skills/summarization/evaluation/prompts.py`:

```py
def basic_summarize(text):

    prompt = f"""
    You are a legal analyst known for highly accurate and detailed summaries of legal documents.
    Summarize the following text in bullet points. Focus on the main ideas and key details:
    
    {text}
    
    Here is the summary of the legal document: <summary>
    """

    return prompt

def guided_legal_summary(text):

    prompt = f"""
    You are a legal analyst known for highly accurate and detailed summaries of legal documents.
    
    Summarize the following legal document. Focus on these key aspects:

    1. Parties involved
    2. Main subject matter
    3. Key terms and conditions
    4. Important dates or deadlines
    5. Any unusual or notable clauses

    Provide the summary in bullet points under each category.

    Document text:
    {text}

    Here is the summary of the sublease agreement: <summary>
    
    """
  
    return prompt
  

def summarize_long_document(text):

    prompt = f"""
    You are a legal analyst specializing in real estate law, known for highly accurate and detailed summaries of sublease agreements.

    Summarize the following sublease agreement. Focus on these key aspects:

    1. Parties involved (sublessor, sublessee, original lessor)
    2. Property details (address, description, permitted use)
    3. Term and rent (start date, end date, monthly rent, security deposit)
    4. Responsibilities (utilities, maintenance, repairs)
    5. Consent and notices (landlord's consent, notice requirements)
    6. Special provisions (furniture, parking, subletting restrictions)

    Provide the summary in bullet points nested within the XML header for each section. For example:

    <parties involved>
    - Sublessor: [Name]
    // Add more details as needed
    </parties involved>
    
    If any information is not explicitly stated in the document, note it as "Not specified".

    Sublease agreement text:
    {text}
    
    Here is the summary of the sublease agreement: <summary>
    """
      
    return prompt
```

`/home/ygg/Workspace/Eliza/GAIA/anthropic-cookbook/skills/summarization/data/multiple_subleases.py`:

```py
# All of these sublease agreements were created by Claude.

document1 = """
COMMERCIAL SUBLEASE AGREEMENT

THIS COMMERCIAL SUBLEASE AGREEMENT (hereinafter referred to as the "Sublease") is made and entered into on this 15th day of August, 2023 (the "Effective Date"), by and between:

SUBLESSOR: Apex Innovations, Inc., a Delaware corporation with its principal place of business at 1234 Tech Boulevard, Suite 5000, San Francisco, CA 94105 (hereinafter referred to as the "Sublessor")

AND

SUBLESSEE: Quantum Dynamics, LLC, a California limited liability company with its principal place of business at 5678 Startup Lane, Palo Alto, CA 94301 (hereinafter referred to as the "Sublessee")

WITNESSETH:

WHEREAS, Sublessor is the Tenant under that certain Master Lease Agreement dated January 1, 2020 (hereinafter referred to as the "Master Lease"), wherein Innovate Properties, LLP (hereinafter referred to as the "Master Lessor") leased to Sublessor those certain premises consisting of approximately 50,000 square feet of office space located at 9876 Innovation Park, Building C, Floors 10-12, San Francisco, CA 94107 (hereinafter referred to as the "Master Premises");

WHEREAS, Sublessor desires to sublease a portion of the Master Premises to Sublessee, and Sublessee desires to sublease the same from Sublessor;

NOW, THEREFORE, in consideration of the mutual covenants and agreements herein contained, and other good and valuable consideration, the receipt and sufficiency of which are hereby acknowledged, the parties hereto agree as follows:

1. SUBLEASED PREMISES

1.1 Description: Sublessor hereby subleases to Sublessee, and Sublessee hereby subleases from Sublessor, a portion of the Master Premises consisting of approximately 15,000 square feet of office space located on the 11th floor of the building at 9876 Innovation Park, Building C, San Francisco, CA 94107 (hereinafter referred to as the "Subleased Premises"). The Subleased Premises are more particularly described in Exhibit A attached hereto and incorporated herein by reference.

1.2 Common Areas: Sublessee shall have the non-exclusive right to use, in common with Sublessor and other tenants or occupants of the Master Premises, the common areas of the building, including but not limited to lobbies, elevators, stairways, parking facilities, and other common facilities, subject to the terms and conditions of the Master Lease and any rules and regulations promulgated by the Master Lessor or Sublessor.

2. TERM

2.1 Initial Term: The initial term of this Sublease shall commence on September 1, 2023 (the "Commencement Date") and shall expire on August 31, 2026 (the "Expiration Date"), unless sooner terminated in accordance with the provisions of this Sublease or the Master Lease (the "Initial Term").

2.2 Option to Extend: Provided that Sublessee is not in default under any of the terms and conditions of this Sublease, Sublessee shall have one (1) option to extend the term of this Sublease for an additional period of three (3) years (the "Extension Term") upon the same terms and conditions contained in this Sublease, except that the Base Rent during the Extension Term shall be as set forth in Section 3.2 below. Sublessee shall exercise this option by giving Sublessor written notice of its intent to do so no later than nine (9) months prior to the expiration of the Initial Term.

3. RENT

3.1 Base Rent for Initial Term: Commencing on the Commencement Date and continuing throughout the Initial Term, Sublessee shall pay to Sublessor as base rent for the Subleased Premises the sum of Seventy-Five Thousand Dollars ($75,000.00) per month ("Base Rent"). Base Rent shall be payable in advance on or before the first day of each calendar month during the Term, without notice, demand, deduction, or offset.

3.2 Base Rent for Extension Term: If Sublessee exercises its option to extend the Term as provided in Section 2.2, the Base Rent for the Extension Term shall be the greater of (i) the Base Rent in effect immediately prior to the commencement of the Extension Term, increased by three percent (3%) per annum, compounded annually, or (ii) the then-prevailing fair market rental rate for comparable space in the building and surrounding area, as mutually agreed upon by Sublessor and Sublessee. If Sublessor and Sublessee are unable to agree upon the fair market rental rate within thirty (30) days after Sublessee's exercise of the extension option, the fair market rental rate shall be determined by arbitration in accordance with the procedures set forth in Exhibit B attached hereto.

3.3 Additional Rent: In addition to the Base Rent, Sublessee shall pay to Sublessor as additional rent Sublessee's Proportionate Share (as defined below) of Operating Expenses (as defined in the Master Lease) for the Master Premises. Sublessee's Proportionate Share shall be thirty percent (30%), which is the percentage obtained by dividing the rentable square footage of the Subleased Premises (15,000 sq. ft.) by the rentable square footage of the Master Premises (50,000 sq. ft.). Sublessee's obligation to pay additional rent shall commence on the Commencement Date and shall be payable in monthly installments as provided in the Master Lease.

3.4 Late Charges: If any installment of Base Rent or additional rent is not received by Sublessor within five (5) days after the date when due, Sublessee shall pay to Sublessor a late charge equal to five percent (5%) of the overdue amount to cover the extra expense involved in handling delinquent payments. The parties agree that this late charge represents a fair and reasonable estimate of the costs that Sublessor will incur by reason of late payment by Sublessee.

4. SECURITY DEPOSIT

4.1 Amount: Upon execution of this Sublease, Sublessee shall deposit with Sublessor the sum of Two Hundred Twenty-Five Thousand Dollars ($225,000.00) as a security deposit (the "Security Deposit") to secure Sublessee's faithful performance of all terms, covenants, and conditions of this Sublease.

4.2 Use and Return: Sublessor may, but shall not be obligated to, use the Security Deposit or any portion thereof to cure any breach or default by Sublessee under this Sublease, or to compensate Sublessor for any damage it incurs as a result of Sublessee's failure to perform any of its obligations hereunder. If Sublessor uses any portion of the Security Deposit, Sublessee shall, within ten (10) days after written demand therefor, restore the Security Deposit to its original amount. Provided that Sublessee has fully and faithfully performed all of its obligations under this Sublease, Sublessor shall return the Security Deposit, or any balance thereof, to Sublessee within thirty (30) days after the expiration or earlier termination of this Sublease.

5. USE

5.1 Permitted Use: The Subleased Premises shall be used and occupied by Sublessee solely for general office purposes and other uses permitted under the Master Lease, and for no other purpose without the prior written consent of Sublessor and Master Lessor.

5.2 Compliance with Laws: Sublessee shall, at its sole cost and expense, comply with all laws, ordinances, orders, rules, and regulations of all governmental authorities having jurisdiction over the Subleased Premises or Sublessee's use thereof, including without limitation, the Americans with Disabilities Act and all environmental laws and regulations.

5.3 Prohibited Uses: Sublessee shall not use or permit the use of the Subleased Premises in any manner that will (i) create waste or a nuisance, (ii) disturb other tenants or occupants of the building, (iii) invalidate or increase the premiums for any insurance policies covering the building or its contents, or (iv) violate any provision of the Master Lease.

6. MAINTENANCE AND REPAIRS

6.1 Sublessee's Obligations: Sublessee shall, at its sole cost and expense, keep and maintain the Subleased Premises and every part thereof in good order, condition, and repair, ordinary wear and tear excepted. Sublessee's obligations shall include, without limitation, the maintenance, repair, and replacement of all interior walls, floors, ceilings, doors, windows, and fixtures within the Subleased Premises.

6.2 Sublessor's Obligations: Sublessor shall have no obligation to maintain, repair, or replace any portion of the Subleased Premises, except to the extent such obligation is imposed on Sublessor as the Tenant under the Master Lease. In such event, Sublessee shall promptly reimburse Sublessor for Sublessee's Proportionate Share of the costs incurred by Sublessor in performing such obligations.

7. ALTERATIONS AND IMPROVEMENTS

7.1 Sublessee's Alterations: Sublessee shall not make any alterations, additions, or improvements to the Subleased Premises (collectively, "Alterations") without the prior written consent of Sublessor and Master Lessor, which consent may be withheld in their sole and absolute discretion. Any approved Alterations shall be made at Sublessee's sole cost and expense, in accordance with all applicable laws and building codes, and in a good and workmanlike manner.

7.2 Removal of Alterations: Unless otherwise agreed in writing, all Alterations made by Sublessee shall become the property of Sublessor upon installation and shall remain upon and be surrendered with the Subleased Premises upon the expiration or earlier termination of this Sublease. Notwithstanding the foregoing, Sublessor may require Sublessee to remove any Alterations made by Sublessee and to restore the Subleased Premises to its original condition, all at Sublessee's sole cost and expense.

8. ASSIGNMENT AND SUBLETTING

8.1 Prohibition: Sublessee shall not assign this Sublease or any interest herein, nor sublet the Subleased Premises or any part thereof, nor permit the use or occupancy of the Subleased Premises by any person or entity other than Sublessee, without the prior written consent of Sublessor and Master Lessor, which consent may be withheld in their sole and absolute discretion.

8.2 Permitted Transfers: Notwithstanding Section 8.1, Sublessee may, without Sublessor's or Master Lessor's consent, assign this Sublease or sublet all or a portion of the Subleased Premises to (i) an entity controlling, controlled by, or under common control with Sublessee, (ii) an entity resulting from a merger or consolidation with Sublessee, or (iii) an entity acquiring all or substantially all of Sublessee's assets or stock, provided that such entity has a net worth at least equal to that of Sublessee as of the date of such assignment or subletting.

8.3 Excess Rent: If Sublessor and Master Lessor consent to an assignment or subletting, any rent or other consideration payable to Sublessee in excess of the rent payable by Sublessee hereunder shall be paid to Sublessor as additional rent.

9. INSURANCE

9.1 Sublessee's Insurance: Sublessee shall, at its sole cost and expense, procure and maintain throughout the Term the following insurance coverages:

(a) Commercial General Liability Insurance with limits of not less than $5,000,000 per occurrence and $10,000,000 in the aggregate, covering bodily injury, property damage, personal injury, and advertising injury arising out of or relating to Sublessee's use and occupancy of the Subleased Premises.

(b) Property Insurance covering Sublessee's personal property, trade fixtures, and equipment in the Subleased Premises, in an amount equal to the full replacement cost thereof.

(c) Workers' Compensation Insurance as required by applicable law, and Employer's Liability Insurance with limits of not less than $1,000,000 per accident, $1,000,000 per employee for disease, and $1,000,000 policy limit for disease.

(d) Business Interruption Insurance in an amount sufficient to cover Sublessee's ongoing expenses, including without limitation, rent payments under this Sublease, for a period of not less than twelve (12) months.

9.2 Policy Requirements: All insurance policies required to be maintained by Sublessee shall (i) be issued by insurance companies authorized to do business in the State of California with a financial rating of at least A-:VIII as rated in the most recent edition of Best's Insurance Reports, (ii) name Sublessor and Master Lessor as additional insureds (except for Workers' Compensation and Property Insurance), (iii) be primary and non-contributory with any insurance carried by Sublessor or Master Lessor, (iv) provide that the insurer shall endeavor to give Sublessor at least thirty (30) days' prior written notice of any cancellation or material change in coverage, and (v) waive any right of subrogation against Sublessor and Master Lessor.

9.3 Evidence of Insurance: Sublessee shall deliver to Sublessor certificates of insurance evidencing the coverages required hereunder prior to the Commencement Date, and thereafter upon renewal of such policies.

10. INDEMNIFICATION

10.1 Sublessee's Indemnity: Sublessee shall indemnify, defend, and hold harmless Sublessor and Master Lessor, and their respective officers, directors, employees, agents, and representatives, from and against any and all claims, demands, liabilities, damages, judgments, costs, and expenses (including reasonable attorneys' fees) arising out of or relating to (i) Sublessee's use or occupancy of the Subleased Premises, (ii) any act or omission of Sublessee or its employees, agents, contractors, or invitees, or (iii) any breach or default by Sublessee under this Sublease.

10.2 Sublessor's Indemnity: Sublessor shall indemnify, defend, and hold harmless Sublessee, and its officers, directors, employees, agents, and representatives, from and against any and all claims, demands, liabilities, damages, judgments, costs, and expenses (including reasonable attorneys' fees) arising out of or relating to any breach or default by Sublessor under this Sublease.

11. DAMAGE AND DESTRUCTION

11.1 Termination Rights: If the Subleased Premises or the building in which they are located are damaged or destroyed by fire or other casualty to such an extent that, in Sublessor's reasonable judgment, the damage cannot be repaired within one hundred eighty (180) days after the date of such damage or destruction, either party may terminate this Sublease by giving written notice to the other party within thirty (30) days after the date of such damage or destruction.

11.2 Repair Obligations: If this Sublease is not terminated pursuant to Section 11.1, Sublessor shall repair and restore the Subleased Premises to substantially the same condition as existed immediately prior to such damage or destruction, subject to the terms and conditions of the Master Lease. Sublessee shall promptly repair or replace its personal property, trade fixtures, and equipment.

11.3 Rent Abatement: If the Subleased Premises are rendered wholly or partially untenantable by fire or other casualty, the rent shall be abated in proportion to the area of the Subleased Premises that is untenantable during the period of such untenantability.

12. CONDEMNATION

12.1 Termination Rights: If all or substantially all of the Subleased Premises are taken by eminent domain or conveyed under threat thereof, this Sublease shall terminate as of the date of such taking or conveyance. If a portion of the Subleased Premises is taken or conveyed, and the remaining portion is not sufficient for Sublessee's reasonable use and occupancy, either party may terminate this Sublease by giving written notice to the other party within thirty (30) days after the date of such taking or conveyance.

12.2 Award: Sublessee hereby waives any right to receive any portion of the award paid for such taking or conveyance, provided that Sublessee may make a separate claim for compensation for its personal property, trade fixtures, and moving expenses, so long as such claim does not diminish the award payable to Sublessor or Master Lessor.

13. DEFAULT

13.1 Events of Default: The occurrence of any of the following shall constitute a material default and breach of this Sublease by Sublessee:

(a) Failure to pay any rent or other sum payable hereunder within five (5) days after the date when due;

(b) Failure to observe or perform any other term, covenant, or condition of this Sublease, if such failure continues for a period of thirty (30) days after written notice thereof from Sublessor to Sublessee;

(c) The making by Sublessee of any general assignment for the benefit of creditors; the filing by or against Sublessee of a petition to have Sublessee adjudged a bankrupt or a petition for reorganization or arrangement under any law relating to bankruptcy; the appointment of a trustee or receiver to take possession of substantially all of Sublessee's assets or of Sublessee's interest in this Sublease; or the attachment, execution, or other judicial seizure of substantially all of Sublessee's assets or of Sublessee's interest in this Sublease;

(d) Sublessee's abandonment of the Subleased Premises;

(e) Any default by Sublessee under the Master Lease.

13.2 Remedies: In the event of any such default by Sublessee, Sublessor may, at any time thereafter, with or without notice or demand and without limiting Sublessor in the exercise of any right or remedy which Sublessor may have by reason of such default:

(a) Terminate this Sublease by giving Sublessee written notice thereof, in which event Sublessee shall immediately surrender the Subleased Premises to Sublessor;

(b) Enter upon and take possession of the Subleased Premises and expel or remove Sublessee and any other person who may be occupying said premises or any part thereof, without being liable for prosecution or any claim for damages therefor;

(c) Recover from Sublessee all damages incurred by Sublessor by reason of Sublessee's default, including but not limited to (i) the cost of recovering possession of the Subleased Premises, (ii) expenses of reletting, including necessary renovation and alteration of the Subleased Premises, (iii) reasonable attorneys' fees, and (iv) the amount of rent and other charges which would have been payable by Sublessee for the remainder of the Term;

(d) Pursue any other remedy now or hereafter available to Sublessor under the laws or judicial decisions of the State of California.

14. SURRENDER OF PREMISES

Upon the expiration or earlier termination of this Sublease, Sublessee shall surrender the Subleased Premises to Sublessor in good condition and repair, ordinary wear and tear excepted, and shall remove all of Sublessee's personal property, trade fixtures, and equipment. Sublessee shall also remove any Alterations required to be removed pursuant to Section 7.2 and shall repair any damage caused by such removal. If Sublessee fails to remove any property or to restore the Subleased Premises as required hereunder, Sublessor may do so and charge the cost thereof to Sublessee.

15. HOLDOVER

If Sublessee remains in possession of the Subleased Premises after the expiration or earlier termination of this Sublease without Sublessor's written consent, such occupancy shall be a tenancy at sufferance, and Sublessee shall pay rent at a rate equal to one hundred fifty percent (150%) of the Base Rent in effect immediately prior to such holdover, computed on a monthly basis for each month or partial month of holdover. In addition, Sublessee shall indemnify, defend, and hold harmless Sublessor from and against all claims, liabilities, damages, costs, and expenses (including reasonable attorneys' fees) incurred by Sublessor as a result of such holdover.

16. NOTICES

All notices, demands, requests, consents, approvals, and other communications required or permitted to be given under this Sublease shall be in writing and shall be deemed to have been duly given if (a) delivered personally, (b) sent by registered or certified mail, return receipt requested, postage prepaid, or (c) sent by reputable overnight courier service, addressed to the party to be notified at the address set forth in the preamble of this Sublease or such other address as such party may specify by notice given in accordance with this Section.

17. MISCELLANEOUS

17.1 Governing Law: This Sublease shall be governed by and construed in accordance with the laws of the State of California, without giving effect to any choice of law or conflict of law provisions.

17.2 Entire Agreement: This Sublease, including all exhibits attached hereto, constitutes the entire agreement between the parties with respect to the subject matter hereof and supersedes all prior and contemporaneous agreements and understandings, whether written or oral.

17.3 Amendments: This Sublease may not be amended, modified, or supplemented except by a written instrument executed by both parties hereto.

17.4 Waiver: No waiver of any provision of this Sublease shall be effective unless in writing and signed by the party against whom such waiver is sought to be enforced. No waiver of any breach of this Sublease shall be construed as a waiver of any subsequent breach.

17.5 Severability: If any provision of this Sublease is held to be invalid, illegal, or unenforceable in any respect, such invalidity, illegality, or unenforceability shall not affect any other provision of this Sublease, and this Sublease shall be construed as if such invalid, illegal, or unenforceable provision had never been contained herein.

17.6 Binding Effect: This Sublease shall be binding upon and inure to the benefit of the parties hereto and their respective successors and permitted assigns.

17.7 Counterparts: This Sublease may be executed in any number of counterparts, each of which shall be deemed an original, but all of which together shall constitute one and the same instrument.

17.8 Time of Essence: Time is of the essence with respect to the performance of all obligations under this Sublease.

17.9 Attorneys' Fees: In the event of any litigation between the parties hereto to enforce any provision of this Sublease or any right of either party hereto, the unsuccessful party to such litigation shall pay to the successful party all costs and expenses, including reasonable attorneys' fees, incurred by the successful party in such litigation.

17.10 Subordination: This Sublease is and shall be subject and subordinate to the Master Lease and to all ground or underlying leases, mortgages, deeds of trust, and other hypothecations or encumbrances now or hereafter affecting the real property of which the Subleased Premises are a part.

17.11 Incorporation of Master Lease: The terms and conditions of the Master Lease are incorporated herein by reference, except to the extent that they are inconsistent with the terms and conditions of this Sublease. Sublessee assumes and agrees to perform all of Sublessor's obligations under the Master Lease with respect to the Subleased Premises, except as otherwise provided herein.

IN WITNESS WHEREOF, the parties hereto have executed this Commercial Sublease Agreement as of the date first above written.

SUBLESSOR:
Apex Innovations, Inc.

By: _________________________
Name: _______________________
Title: ________________________

SUBLESSEE:
Quantum Dynamics, LLC

By: _________________________
Name: _______________________
Title: ________________________

EXHIBIT A: Description of Subleased Premises
[Detailed floor plan and description of the 15,000 square feet on the 11th floor]

EXHIBIT B: Arbitration Procedures for Determining Fair Market Rental Rate
[Detailed procedures for selecting arbitrators and conducting the arbitration process]

"""


sample1 = """
Description: This is a commercial sublease agreement between Apex Innovations, Inc. (Sublessor) and Quantum Dynamics, LLC (Sublessee) for a portion of premises originally leased from Innovate Properties, LLP (Master Lessor).

<parties involved>
Sublessor: Apex Innovations, Inc.
Sublessee: Quantum Dynamics, LLC
Original lessor: Innovate Properties, LLP
</parties involved>

<property details>
Address: 9876 Innovation Park, Building C, 11th Floor, San Francisco, CA 94107
Description: 15,000 square feet of office space on the 11th floor
Permitted use: General office purposes and other uses permitted under the Master Lease
</property details>

<term and rent>
Start date: September 1, 2023
End date: August 31, 2026
Monthly rent: $75,000 per month
Security deposit: $225,000
Option to extend: One 3-year extension option
Additional rent: 30`%` of Operating Expenses for the Master Premises
</term and rent>

<responsibilities>
Utilities: Not explicitly specified, likely included in Operating Expenses
Maintenance: Sublessee responsible for interior maintenance and repairs
Repairs: Sublessee responsible for interior repairs; Sublessor responsible for repairs required under Master Lease
Insurance: Sublessee required to maintain Commercial General Liability, Property, Workers' Compensation, and Business Interruption insurance
</responsibilities>

<consent and notices>
Landlord's consent: Required for sublease to be effective
Notice requirements: Written notices to be delivered personally, by registered or certified mail, or by overnight courier to specified addresses
</consent and notices>

<special provisions>
Alterations: Require prior written consent of Sublessor and Master Lessor
Assignment and subletting: Prohibited without prior written consent, with exceptions for certain related entities
Damage and destruction: Termination rights if repairs cannot be completed within 180 days
Default: Detailed events of default and remedies specified
Holdover: 150`%` of Base Rent for any holdover period
Subordination: Sublease is subordinate to Master Lease and other encumbrances
</special provisions>
"""


document2 = """
COMMERCIAL SUBLEASE AGREEMENT

THIS COMMERCIAL SUBLEASE AGREEMENT (hereinafter referred to as the "Sublease") is made and entered into on this 1st day of September, 2023 (the "Effective Date"), by and between:

SUBLESSOR: TechHub Enterprises, LLC, a California limited liability company with its principal place of business at 5678 Market Street, Suite 3000, San Francisco, CA 94103 (hereinafter referred to as the "Sublessor")

AND

SUBLESSEE: NanoSphere Solutions, Inc., a Delaware corporation with its principal place of business at 2468 Research Drive, Palo Alto, CA 94304 (hereinafter referred to as the "Sublessee")

WITNESSETH:

WHEREAS, Sublessor is the Tenant under that certain Master Lease Agreement dated March 15, 2019 (hereinafter referred to as the "Master Lease"), wherein Skyline Properties, Inc. (hereinafter referred to as the "Master Lessor") leased to Sublessor those certain premises consisting of approximately 75,000 square feet of office and laboratory space located at 1357 Innovation Avenue, Floors 15-18, San Francisco, CA 94158 (hereinafter referred to as the "Master Premises");

WHEREAS, Sublessor desires to sublease a portion of the Master Premises to Sublessee, and Sublessee desires to sublease the same from Sublessor;

NOW, THEREFORE, in consideration of the mutual covenants and agreements herein contained, and other good and valuable consideration, the receipt and sufficiency of which are hereby acknowledged, the parties hereto agree as follows:

1. SUBLEASED PREMISES

1.1 Description: Sublessor hereby subleases to Sublessee, and Sublessee hereby subleases from Sublessor, a portion of the Master Premises consisting of approximately 25,000 square feet of office and laboratory space located on the 16th and 17th floors of the building at 1357 Innovation Avenue, San Francisco, CA 94158 (hereinafter referred to as the "Subleased Premises"). The Subleased Premises are more particularly described in Exhibit A attached hereto and incorporated herein by reference.

1.2 Common Areas: Sublessee shall have the non-exclusive right to use, in common with Sublessor and other tenants or occupants of the Master Premises, the common areas of the building, including but not limited to lobbies, elevators, stairways, parking facilities, and other common facilities, subject to the terms and conditions of the Master Lease and any rules and regulations promulgated by the Master Lessor or Sublessor.

2. TERM

2.1 Initial Term: The initial term of this Sublease shall commence on October 1, 2023 (the "Commencement Date") and shall expire on September 30, 2028 (the "Expiration Date"), unless sooner terminated in accordance with the provisions of this Sublease or the Master Lease (the "Initial Term").

2.2 Early Access: Sublessee shall have the right to access the Subleased Premises fifteen (15) days prior to the Commencement Date for the purpose of installing Sublessee's furniture, fixtures, and equipment, provided that such early access does not interfere with Sublessor's operations or any work being performed by Sublessor in the Subleased Premises. Such early access shall be subject to all terms and conditions of this Sublease, except for the obligation to pay rent.

2.3 Option to Extend: Provided that Sublessee is not in default under any of the terms and conditions of this Sublease, Sublessee shall have two (2) options to extend the term of this Sublease for additional periods of three (3) years each (each, an "Extension Term") upon the same terms and conditions contained in this Sublease, except that the Base Rent during each Extension Term shall be as set forth in Section 3.2 below. Sublessee shall exercise each option by giving Sublessor written notice of its intent to do so no later than twelve (12) months prior to the expiration of the then-current Term.

3. RENT

3.1 Base Rent for Initial Term: Commencing on the Commencement Date and continuing throughout the Initial Term, Sublessee shall pay to Sublessor as base rent for the Subleased Premises the following amounts ("Base Rent"):

Year 1: $150,000.00 per month
Year 2: $154,500.00 per month
Year 3: $159,135.00 per month
Year 4: $163,909.05 per month
Year 5: $168,826.32 per month

Base Rent shall be payable in advance on or before the first day of each calendar month during the Term, without notice, demand, deduction, or offset.

3.2 Base Rent for Extension Terms: If Sublessee exercises its option(s) to extend the Term as provided in Section 2.3, the Base Rent for each Extension Term shall be the greater of (i) the Base Rent in effect immediately prior to the commencement of the applicable Extension Term, increased by four percent (4%) per annum, compounded annually, or (ii) the then-prevailing fair market rental rate for comparable office and laboratory space in the building and surrounding area, as mutually agreed upon by Sublessor and Sublessee. If Sublessor and Sublessee are unable to agree upon the fair market rental rate within sixty (60) days after Sublessee's exercise of the extension option, the fair market rental rate shall be determined by arbitration in accordance with the procedures set forth in Exhibit B attached hereto.

3.3 Additional Rent: In addition to the Base Rent, Sublessee shall pay to Sublessor as additional rent Sublessee's Proportionate Share (as defined below) of Operating Expenses (as defined in the Master Lease) for the Master Premises. Sublessee's Proportionate Share shall be thirty-three and one-third percent (33.33%), which is the percentage obtained by dividing the rentable square footage of the Subleased Premises (25,000 sq. ft.) by the rentable square footage of the Master Premises (75,000 sq. ft.). Sublessee's obligation to pay additional rent shall commence on the Commencement Date and shall be payable in monthly installments as provided in the Master Lease.

3.4 Utilities and Services: Sublessee shall be responsible for all utilities and services provided to or consumed in the Subleased Premises, including without limitation, electricity, gas, water, sewer, telephone, internet, and janitorial services. To the extent such utilities and services are not separately metered or billed to the Subleased Premises, Sublessee shall pay to Sublessor, as additional rent, Sublessee's Proportionate Share of the cost of such utilities and services for the Master Premises.

3.5 Late Charges: If any installment of Base Rent or additional rent is not received by Sublessor within five (5) days after the date when due, Sublessee shall pay to Sublessor a late charge equal to six percent (6%) of the overdue amount to cover the extra expense involved in handling delinquent payments. The parties agree that this late charge represents a fair and reasonable estimate of the costs that Sublessor will incur by reason of late payment by Sublessee.

4. SECURITY DEPOSIT

4.1 Amount: Upon execution of this Sublease, Sublessee shall deposit with Sublessor the sum of Four Hundred Fifty Thousand Dollars ($450,000.00) as a security deposit (the "Security Deposit") to secure Sublessee's faithful performance of all terms, covenants, and conditions of this Sublease.

4.2 Use and Return: Sublessor may, but shall not be obligated to, use the Security Deposit or any portion thereof to cure any breach or default by Sublessee under this Sublease, or to compensate Sublessor for any damage it incurs as a result of Sublessee's failure to perform any of its obligations hereunder. If Sublessor uses any portion of the Security Deposit, Sublessee shall, within ten (10) days after written demand therefor, restore the Security Deposit to its original amount. Provided that Sublessee has fully and faithfully performed all of its obligations under this Sublease, Sublessor shall return the Security Deposit, or any balance thereof, to Sublessee within thirty (30) days after the expiration or earlier termination of this Sublease.

4.3 Transfer of Security Deposit: If Sublessor transfers its interest in the Master Premises or this Sublease, Sublessor shall transfer the Security Deposit to its successor in interest, whereupon Sublessor shall be released from all liability for the return of the Security Deposit.

5. USE

5.1 Permitted Use: The Subleased Premises shall be used and occupied by Sublessee solely for general office purposes, research and development, and laboratory uses consistent with a BSL-2 (Biosafety Level 2) facility, and other uses permitted under the Master Lease, and for no other purpose without the prior written consent of Sublessor and Master Lessor.

5.2 Compliance with Laws: Sublessee shall, at its sole cost and expense, comply with all laws, ordinances, orders, rules, and regulations of all governmental authorities having jurisdiction over the Subleased Premises or Sublessee's use thereof, including without limitation, the Americans with Disabilities Act, all environmental laws and regulations, and all biosafety regulations applicable to BSL-2 facilities.

5.3 Hazardous Materials: Sublessee shall not use, generate, manufacture, store, or dispose of any Hazardous Materials (as defined in the Master Lease) in, on, or about the Subleased Premises or the building, except for those Hazardous Materials that are (i) typically used in general office operations or (ii) necessary for Sublessee's permitted laboratory operations, provided that such Hazardous Materials are used, stored, and disposed of in strict compliance with all applicable laws and regulations. Sublessee shall provide Sublessor with a list of all Hazardous Materials used in the Subleased Premises on an annual basis and shall promptly notify Sublessor of any spills or releases of Hazardous Materials in the Subleased Premises.

5.4 Prohibited Uses: Sublessee shall not use or permit the use of the Subleased Premises in any manner that will (i) create waste or a nuisance, (ii) disturb other tenants or occupants of the building, (iii) invalidate or increase the premiums for any insurance policies covering the building or its contents, or (iv) violate any provision of the Master Lease.

6. MAINTENANCE AND REPAIRS

6.1 Sublessee's Obligations: Sublessee shall, at its sole cost and expense, keep and maintain the Subleased Premises and every part thereof in good order, condition, and repair, ordinary wear and tear and damage by casualty excepted. Sublessee's obligations shall include, without limitation, the maintenance, repair, and replacement of all interior walls, floors, ceilings, doors, windows, and fixtures within the Subleased Premises, as well as all laboratory-specific equipment and systems.

6.2 Sublessor's Obligations: Sublessor shall have no obligation to maintain, repair, or replace any portion of the Subleased Premises, except to the extent such obligation is imposed on Sublessor as the Tenant under the Master Lease and relates to the building structure, exterior walls, roof, and common building systems. In such event, Sublessee shall promptly reimburse Sublessor for Sublessee's Proportionate Share of the costs incurred by Sublessor in performing such obligations.

6.3 HVAC Systems: Notwithstanding anything to the contrary herein, Sublessee shall be responsible for the maintenance, repair, and replacement of any supplemental or dedicated HVAC systems serving the Subleased Premises, including those serving the laboratory areas.

7. ALTERATIONS AND IMPROVEMENTS

7.1 Sublessee's Alterations: Sublessee shall not make any alterations, additions, or improvements to the Subleased Premises (collectively, "Alterations") without the prior written consent of Sublessor and Master Lessor, which consent shall not be unreasonably withheld, conditioned, or delayed for non-structural Alterations that do not affect the building systems or structural elements. Any approved Alterations shall be made at Sublessee's sole cost and expense, in accordance with all applicable laws and building codes, and in a good and workmanlike manner.

7.2 Plans and Specifications: Prior to commencing any Alterations, Sublessee shall submit detailed plans and specifications to Sublessor and Master Lessor for approval. Sublessee shall reimburse Sublessor and Master Lessor for their reasonable out-of-pocket costs incurred in reviewing such plans and specifications.

7.3 Liens: Sublessee shall keep the Subleased Premises, the building, and the real property on which the building is located free from any liens arising out of any work performed, materials furnished, or obligations incurred by or on behalf of Sublessee.

7.4 Removal of Alterations: Unless otherwise agreed in writing, all Alterations made by Sublessee shall become the property of Sublessor upon installation and shall remain upon and be surrendered with the Subleased Premises upon the expiration or earlier termination of this Sublease. Notwithstanding the foregoing, Sublessor may require Sublessee to remove any Alterations made by Sublessee and to restore the Subleased Premises to its original condition, all at Sublessee's sole cost and expense. At the time Sublessee requests Sublessor's consent to any Alterations, Sublessee may also request that Sublessor specify whether such Alterations will need to be removed at the end of the Term.

8. ASSIGNMENT AND SUBLETTING

8.1 Prohibition: Sublessee shall not assign this Sublease or any interest herein, nor sublet the Subleased Premises or any part thereof, nor permit the use or occupancy of the Subleased Premises by any person or entity other than Sublessee, without the prior written consent of Sublessor and Master Lessor, which consent shall not be unreasonably withheld, conditioned, or delayed.

8.2 Permitted Transfers: Notwithstanding Section 8.1, Sublessee may, without Sublessor's or Master Lessor's consent, assign this Sublease or sublet all or a portion of the Subleased Premises to (i) an entity controlling, controlled by, or under common control with Sublessee, (ii) an entity resulting from a merger or consolidation with Sublessee, or (iii) an entity acquiring all or substantially all of Sublessee's assets or stock, provided that such entity has a net worth at least equal to that of Sublessee as of the date of such assignment or subletting and assumes all of Sublessee's obligations under this Sublease.

8.3 Sublessee Remains Liable: No assignment or subletting shall release Sublessee from any of its obligations under this Sublease unless Sublessor and Master Lessor expressly agree otherwise in writing. Sublessee shall remain liable for the performance of all terms, covenants, and conditions of this Sublease.

8.4 Excess Rent: If Sublessor and Master Lessor consent to an assignment or subletting, fifty percent (50%) of any rent or other consideration payable to Sublessee in excess of the rent payable by Sublessee hereunder shall be paid to Sublessor as additional rent, after deducting Sublessee's reasonable expenses incurred in connection with such assignment or subletting.

9. INSURANCE

9.1 Sublessee's Insurance: Sublessee shall, at its sole cost and expense, procure and maintain throughout the Term the following insurance coverages:

(a) Commercial General Liability Insurance with limits of not less than $5,000,000 per occurrence and $10,000,000 in the aggregate, covering bodily injury, property damage, personal injury, and advertising injury arising out of or relating to Sublessee's use and occupancy of the Subleased Premises.

(b) Property Insurance covering Sublessee's personal property, trade fixtures, equipment, and Alterations in the Subleased Premises, in an amount equal to the full replacement cost thereof.

(c) Workers' Compensation Insurance as required by applicable law, and Employer's Liability Insurance with limits of not less than $1,000,000 per accident, $1,000,000 per employee for disease, and $1,000,000 policy limit for disease.

(d) Business Interruption Insurance in an amount sufficient to cover Sublessee's ongoing expenses, including without limitation, rent payments under this Sublease, for a period of not less than twelve (12) months.

(e) Environmental Liability Insurance with limits of not less than $5,000,000 per occurrence and $10,000,000 in the aggregate, covering claims arising out of the presence, use, handling, storage, or disposal of Hazardous Materials in the Subleased Premises.

9.2 Policy Requirements: All insurance policies required to be maintained by Sublessee shall (i) be issued by insurance companies authorized to do business in the State of California with a financial rating of at least A-:VIII as rated in the most recent edition of Best's Insurance Reports, (ii) name Sublessor and Master Lessor as additional insureds (except for Workers' Compensation and Property Insurance), (iii) be primary and non-contributory with any insurance carried by Sublessor or Master Lessor, (iv) provide that the insurer shall endeavor to give Sublessor at least thirty (30) days' prior written notice of any cancellation or material change in coverage, and (v) waive any right of subrogation against Sublessor and Master Lessor.

9.3 Evidence of Insurance: Sublessee shall deliver to Sublessor certificates of insurance evidencing the coverages required hereunder prior to the Commencement Date, and thereafter upon renewal of such policies.

10. INDEMNIFICATION

10.1 Sublessee's Indemnity: Sublessee shall indemnify, defend, and hold harmless Sublessor and Master Lessor, and their respective officers, directors, employees, agents, and representatives, from and against any and all claims, demands, liabilities, damages, judgments, costs, and expenses (including reasonable attorneys' fees) arising out of or relating to (i) Sublessee's use or occupancy of the Subleased Premises, (ii) any act or omission of Sublessee or its employees, agents, contractors, or invitees, (iii) any breach or default by Sublessee under this Sublease, or (iv) the presence, use, handling, storage, or disposal of Hazardous Materials in the Subleased Premises by Sublessee or its employees, agents, contractors, or invitees.

10.2 Sublessor's Indemnity: Sublessor shall indemnify, defend, and hold harmless Sublessee, and its officers, directors, employees, agents, and representatives, from and against any and all claims, demands, liabilities, damages, judgments, costs, and expenses (including reasonable attorneys' fees) arising out of or relating to any breach or default by Sublessor under this Sublease.

11. DAMAGE AND DESTRUCTION

11.1 Termination Rights: If the Subleased Premises or the building in which they are located are damaged or destroyed by fire or other casualty to such an extent that, in Sublessor's reasonable judgment, the damage cannot be repaired within two hundred seventy (270) days after the date of such damage or destruction, either party may terminate this Sublease by giving written notice to the other party within thirty (30) days after the date of such damage or destruction.

11.2 Repair Obligations: If this Sublease is not terminated pursuant to Section 11.1, Sublessor shall repair and restore the Subleased Premises to substantially the same condition as existed immediately prior to such damage or destruction, subject to the terms and conditions of the Master Lease. Sublessee shall promptly repair or replace its personal property, trade fixtures, equipment, and Alterations.

11.3 Rent Abatement: If the Subleased Premises are rendered wholly or partially untenantable by fire or other casualty, the rent shall be abated in proportion to the area of the Subleased Premises that is untenantable during the period of such untenantability.

12. CONDEMNATION

12.1 Termination Rights: If all or substantially all of the Subleased Premises are taken by eminent domain or conveyed under threat thereof, this Sublease shall terminate as of the date of such taking or conveyance. If a portion of the Subleased Premises is taken or conveyed, and the remaining portion is not sufficient for Sublessee's reasonable use and occupancy, either party may terminate this Sublease by giving written notice to the other party within thirty (30) days after the date of such taking or conveyance.

12.2 Award: Sublessee hereby waives any right to receive any portion of the award paid for such taking or conveyance, provided that Sublessee may make a separate claim for compensation for its personal property, trade fixtures, and moving expenses, so long as such claim does not diminish the award payable to Sublessor or Master Lessor.

13. DEFAULT

13.1 Events of Default: The occurrence of any of the following shall constitute a material default and breach of this Sublease by Sublessee:

(a) Failure to pay any rent or other sum payable hereunder within five (5) days after the date when due;

(b) Failure to observe or perform any other term, covenant, or condition of this Sublease, if such failure continues for a period of thirty (30) days after written notice thereof from Sublessor to Sublessee; provided, however, that if the nature of such default is such that it cannot reasonably be cured within such thirty (30) day period, Sublessee shall not be deemed to be in default if Sublessee commences such cure within such thirty (30) day period and thereafter diligently prosecutes such cure to completion;

(c) The making by Sublessee of any general assignment for the benefit of creditors; the filing by or against Sublessee of a petition to have Sublessee adjudged a bankrupt or a petition for reorganization or arrangement under any law relating to bankruptcy; the appointment of a trustee or receiver to take possession of substantially all of Sublessee's assets or of Sublessee's interest in this Sublease; or the attachment, execution, or other judicial seizure of substantially all of Sublessee's assets or of Sublessee's interest in this Sublease;

(d) Sublessee's abandonment of the Subleased Premises;

(e) Any default by Sublessee under the Master Lease.

13.2 Remedies: In the event of any such default by Sublessee, Sublessor may, at any time thereafter, with or without notice or demand and without limiting Sublessor in the exercise of any right or remedy which Sublessor may have by reason of such default:

(a) Terminate this Sublease by giving Sublessee written notice thereof, in which event Sublessee shall immediately surrender the Subleased Premises to Sublessor;

(b) Enter upon and take possession of the Subleased Premises and expel or remove Sublessee and any other person who may be occupying said premises or any part thereof, without being liable for prosecution or any claim for damages therefor;

(c) Recover from Sublessee all damages incurred by Sublessor by reason of Sublessee's default, including but not limited to (i) the cost of recovering possession of the Subleased Premises, (ii) expenses of reletting, including necessary renovation and alteration of the Subleased Premises, (iii) reasonable attorneys' fees, and (iv) the amount of rent and other charges which would have been payable by Sublessee for the remainder of the Term;

(d) Pursue any other remedy now or hereafter available to Sublessor under the laws or judicial decisions of the State of California.

14. SURRENDER OF PREMISES

Upon the expiration or earlier termination of this Sublease, Sublessee shall surrender the Subleased Premises to Sublessor in good condition and repair, ordinary wear and tear excepted, and shall remove all of Sublessee's personal property, trade fixtures, and equipment. Sublessee shall also remove any Alterations required to be removed pursuant to Section 7.4 and shall repair any damage caused by such removal. If Sublessee fails to remove any property or to restore the Subleased Premises as required hereunder, Sublessor may do so and charge the cost thereof to Sublessee.

15. HOLDOVER

If Sublessee remains in possession of the Subleased Premises after the expiration or earlier termination of this Sublease without Sublessor's written consent, such occupancy shall be a tenancy at sufferance, and Sublessee shall pay rent at a rate equal to one hundred fifty percent (150%) of the Base Rent in effect immediately prior to such holdover, computed on a monthly basis for each month or partial month of holdover. In addition, Sublessee shall indemnify, defend, and hold harmless Sublessor from and against all claims, liabilities, damages, costs, and expenses (including reasonable attorneys' fees) incurred by Sublessor as a result of such holdover.

16. NOTICES

All notices, demands, requests, consents, approvals, and other communications required or permitted to be given under this Sublease shall be in writing and shall be deemed to have been duly given if (a) delivered personally, (b) sent by registered or certified mail, return receipt requested, postage prepaid, or (c) sent by reputable overnight courier service, addressed to the party to be notified at the address set forth in the preamble of this Sublease or such other address as such party may specify by notice given in accordance with this Section.

17. MISCELLANEOUS

17.1 Governing Law: This Sublease shall be governed by and construed in accordance with the laws of the State of California, without giving effect to any choice of law or conflict of law provisions.

17.2 Entire Agreement: This Sublease, including all exhibits attached hereto, constitutes the entire agreement between the parties with respect to the subject matter hereof and supersedes all prior and contemporaneous agreements and understandings, whether written or oral.

17.3 Amendments: This Sublease may not be amended, modified, or supplemented except by a written instrument executed by both parties hereto.

17.4 Waiver: No waiver of any provision of this Sublease shall be effective unless in writing and signed by the party against whom such waiver is sought to be enforced. No waiver of any breach of this Sublease shall be construed as a waiver of any subsequent breach.

17.5 Severability: If any provision of this Sublease is held to be invalid, illegal, or unenforceable in any respect, such invalidity, illegality, or unenforceability shall not affect any other provision of this Sublease, and this Sublease shall be construed as if such invalid, illegal, or unenforceable provision had never been contained herein.

17.6 Binding Effect: This Sublease shall be binding upon and inure to the benefit of the parties hereto and their respective successors and permitted assigns.

17.7 Counterparts: This Sublease may be executed in any number of counterparts, each of which shall be deemed an original, but all of which together shall constitute one and the same instrument. Electronic signatures shall be deemed to be original signatures for all purposes.

17.8 Time of Essence: Time is of the essence with respect to the performance of all obligations under this Sublease.

17.9 Attorneys' Fees: In the event of any litigation between the parties hereto to enforce any provision of this Sublease or any right of either party hereto, the unsuccessful party to such litigation shall pay to the successful party all costs and expenses, including reasonable attorneys' fees, incurred by the successful party in such litigation.

17.10 Subordination: This Sublease is and shall be subject and subordinate to the Master Lease and to all ground or underlying leases, mortgages, deeds of trust, and other hypothecations or encumbrances now or hereafter affecting the real property of which the Subleased Premises are a part. Sublessee agrees to execute and deliver to Sublessor, within ten (10) days after request therefor, any additional documents evidencing the subordination of this Sublease with respect to any such ground or underlying leases, mortgages, deeds of trust, or other hypothecations or encumbrances.

17.11 Incorporation of Master Lease: The terms and conditions of the Master Lease are incorporated herein by reference, except to the extent that they are inconsistent with the terms and conditions of this Sublease. Sublessee assumes and agrees to perform all of Sublessor's obligations under the Master Lease with respect to the Subleased Premises, except as otherwise provided herein. In the event of a conflict between the provisions of this Sublease and the Master Lease, the provisions of this Sublease shall control as between Sublessor and Sublessee.

17.12 Confidentiality: Sublessee acknowledges that the terms and conditions of this Sublease are to remain confidential for Sublessor's benefit, and may not be disclosed by Sublessee to anyone, by any manner or means, directly or indirectly, without Sublessor's prior written consent, except to Sublessee's attorneys, accountants, and other professional advisors, or as required by law.

17.13 Force Majeure: Neither party shall be responsible for delays in the performance of its obligations hereunder caused by acts of God, war, terrorist attack, pandemic, government regulation, riot, or other causes beyond the reasonable control of such party.

17.14 Quiet Enjoyment: Sublessor covenants that Sublessee, upon paying the rent and performing all of the terms, covenants, and conditions of this Sublease, shall peaceably and quietly have, hold, and enjoy the Subleased Premises during the Term, subject to the terms and conditions of this Sublease and the Master Lease.

17.15 Brokers: Each party represents and warrants to the other that it has not dealt with any broker or finder in connection with this Sublease, except for [Broker Name] representing Sublessor and [Broker Name] representing Sublessee. Each party shall indemnify, defend, and hold harmless the other party from and against any claims, liabilities, damages, costs, and expenses (including reasonable attorneys' fees) arising out of any breach of the foregoing representation and warranty.

17.16 Parking: Sublessee shall have the right to use, on a non-exclusive basis, Sublessee's Proportionate Share of the parking spaces allocated to Sublessor under the Master Lease, subject to the terms and conditions of the Master Lease and any rules and regulations promulgated by Master Lessor or Sublessor.

17.17 Signage: Subject to Master Lessor's approval and the terms of the Master Lease, Sublessee shall have the right to install, at Sublessee's sole cost and expense, Sublessee's name and logo on the entry door to the Subleased Premises and in the lobby directory for the building.

17.18 Access: Sublessee shall have access to the Subleased Premises twenty-four (24) hours per day, seven (7) days per week, subject to the terms and conditions of the Master Lease and any reasonable security measures implemented by Master Lessor or Sublessor.

17.19 Environmental: Sublessee shall comply with all environmental laws and regulations applicable to its use and occupancy of the Subleased Premises. Sublessee shall promptly notify Sublessor of any release or threatened release of Hazardous Materials in, on, or about the Subleased Premises. Upon the expiration or earlier termination of this Sublease, Sublessee shall, at its sole cost and expense, remove all Hazardous Materials brought onto the Subleased Premises by Sublessee and remediate any contamination caused thereby.

17.20 Waiver of Jury Trial: TO THE FULLEST EXTENT PERMITTED BY LAW, SUBLESSOR AND SUBLESSEE HEREBY WAIVE THEIR RESPECTIVE RIGHT TO TRIAL BY JURY IN ANY ACTION OR PROCEEDING BASED UPON, OR RELATED TO, THE SUBJECT MATTER OF THIS SUBLEASE.

IN WITNESS WHEREOF, the parties hereto have executed this Commercial Sublease Agreement as of the date first above written.

SUBLESSOR:
TechHub Enterprises, LLC

By: _________________________
Name: _______________________
Title: ________________________

SUBLESSEE:
NanoSphere Solutions, Inc.

By: _________________________
Name: _______________________
Title: ________________________

EXHIBIT A: Description of Subleased Premises
[Detailed floor plan and description of the 25,000 square feet on the 16th and 17th floors]

EXHIBIT B: Arbitration Procedures for Determining Fair Market Rental Rate
[Detailed procedures for selecting arbitrators and conducting the arbitration process]

EXHIBIT C: Form of Commencement Date Memorandum
[Template for documenting the actual Commencement Date and Expiration Date]

EXHIBIT D: Rules and Regulations
[List of building rules and regulations applicable to all tenants]

EXHIBIT E: Laboratory Safety Guidelines
[Specific guidelines for the safe operation of the BSL-2 laboratory facilities]
"""

sample2 = """
Description: This is a commercial sublease agreement between TechHub Enterprises, LLC (Sublessor) and NanoSphere Solutions, Inc. (Sublessee) for a portion of premises originally leased from Skyline Properties, Inc. (Master Lessor). The sublease is for office and laboratory space, including provisions for BSL-2 laboratory use, with a 5-year initial term and two 3-year extension options.

<parties involved>
Sublessor: TechHub Enterprises, LLC
Sublessee: NanoSphere Solutions, Inc.
Original lessor: Skyline Properties, Inc.
</parties involved>

<property details>
Address: 1357 Innovation Avenue, 16th and 17th Floors, San Francisco, CA 94158
Description: 25,000 square feet of office and laboratory space
Permitted use: General office, research and development, and laboratory uses consistent with a BSL-2 facility
</property details>

<term and rent>
Start date: October 1, 2023
End date: September 30, 2028
Monthly rent:
• Year 1: $150,000 per month
• Year 2: $154,500 per month
• Year 3: $159,135 per month
• Year 4: $163,909.05 per month
• Year 5: $168,826.32 per month
Security deposit: $450,000
Option to extend: Two 3-year extension options
Additional rent: 33.33`%` of Operating Expenses for the Master Premises
</term and rent>

<responsibilities>
Utilities: Sublessee responsible for all utilities and services
Maintenance: Sublessee responsible for interior maintenance and repairs, including laboratory-specific equipment and systems
Repairs: Sublessee responsible for interior repairs; Sublessor responsible for building structure, exterior walls, roof, and common building systems
Insurance: Sublessee required to maintain Commercial General Liability, Property, Workers' Compensation, Business Interruption, and Environmental Liability insurance
</responsibilities>

<consent and notices>
Landlord's consent: Required for sublease to be effective
Notice requirements: Written notices to be delivered personally, by registered or certified mail, or by overnight courier to specified addresses
</consent and notices>

<special provisions>
Alterations: Require prior written consent of Sublessor and Master Lessor
Assignment and subletting: Prohibited without prior written consent, with exceptions for certain related entities
Hazardous materials: Sublessee permitted to use Hazardous Materials necessary for office operations and laboratory use, subject to compliance with laws and regulations
Damage and destruction: Termination rights if repairs cannot be completed within 270 days
Early access: 15 days prior to Commencement Date for furniture and equipment installation
Parking: Non-exclusive use of Sublessee's Proportionate Share of parking spaces
Signage: Right to install name and logo on entry door and lobby directory, subject to approval
Access: 24/7 access to Subleased Premises
Environmental compliance: Sublessee responsible for compliance with environmental laws and remediation of any contamination caused by Sublessee
</special provisions>
"""

document3 = """
COMMERCIAL SUBLEASE AGREEMENT

THIS COMMERCIAL SUBLEASE AGREEMENT (hereinafter referred to as the "Sublease") is made and entered into on this 10th day of October, 2023 (the "Effective Date"), by and between:

SUBLESSOR: InnovateTech Holdings, Inc., a Delaware corporation with its principal place of business at 789 Venture Street, Floor 30, San Francisco, CA 94111 (hereinafter referred to as the "Sublessor")

AND

SUBLESSEE: BioGen Dynamics, Corp., a California corporation with its principal place of business at 321 Research Park Avenue, Mountain View, CA 94041 (hereinafter referred to as the "Sublessee")

WITNESSETH:

WHEREAS, Sublessor is the Tenant under that certain Master Lease Agreement dated June 1, 2018 (hereinafter referred to as the "Master Lease"), wherein SkyScrapers Development Co. (hereinafter referred to as the "Master Lessor") leased to Sublessor those certain premises consisting of approximately 100,000 square feet of office, laboratory, and research space located at 555 Innovation Tower, Floors 28-32, San Francisco, CA 94105 (hereinafter referred to as the "Master Premises");

WHEREAS, Sublessor desires to sublease a portion of the Master Premises to Sublessee, and Sublessee desires to sublease the same from Sublessor;

NOW, THEREFORE, in consideration of the mutual covenants and agreements herein contained, and other good and valuable consideration, the receipt and sufficiency of which are hereby acknowledged, the parties hereto agree as follows:

1. SUBLEASED PREMISES

1.1 Description: Sublessor hereby subleases to Sublessee, and Sublessee hereby subleases from Sublessor, a portion of the Master Premises consisting of approximately 35,000 square feet of office, laboratory, and research space located on the 29th and 30th floors of the building at 555 Innovation Tower, San Francisco, CA 94105 (hereinafter referred to as the "Subleased Premises"). The Subleased Premises are more particularly described in Exhibit A attached hereto and incorporated herein by reference.

1.2 Common Areas: Sublessee shall have the non-exclusive right to use, in common with Sublessor and other tenants or occupants of the Master Premises, the common areas of the building, including but not limited to lobbies, elevators, stairways, parking facilities, and other common facilities, subject to the terms and conditions of the Master Lease and any rules and regulations promulgated by the Master Lessor or Sublessor.

2. TERM

2.1 Initial Term: The initial term of this Sublease shall commence on December 1, 2023 (the "Commencement Date") and shall expire on November 30, 2029 (the "Expiration Date"), unless sooner terminated in accordance with the provisions of this Sublease or the Master Lease (the "Initial Term").

2.2 Early Access: Sublessee shall have the right to access the Subleased Premises thirty (30) days prior to the Commencement Date for the purpose of installing Sublessee's furniture, fixtures, equipment, and laboratory systems, provided that such early access does not interfere with Sublessor's operations or any work being performed by Sublessor in the Subleased Premises. Such early access shall be subject to all terms and conditions of this Sublease, except for the obligation to pay rent.

2.3 Option to Extend: Provided that Sublessee is not in default under any of the terms and conditions of this Sublease, Sublessee shall have one (1) option to extend the term of this Sublease for an additional period of five (5) years (the "Extension Term") upon the same terms and conditions contained in this Sublease, except that the Base Rent during the Extension Term shall be as set forth in Section 3.2 below. Sublessee shall exercise this option by giving Sublessor written notice of its intent to do so no later than twelve (12) months prior to the expiration of the Initial Term.

3. RENT

3.1 Base Rent for Initial Term: Commencing on the Commencement Date and continuing throughout the Initial Term, Sublessee shall pay to Sublessor as base rent for the Subleased Premises the following amounts ("Base Rent"):

Year 1: $262,500.00 per month
Year 2: $270,375.00 per month
Year 3: $278,486.25 per month
Year 4: $286,840.84 per month
Year 5: $295,446.06 per month
Year 6: $304,309.44 per month

Base Rent shall be payable in advance on or before the first day of each calendar month during the Term, without notice, demand, deduction, or offset.

3.2 Base Rent for Extension Term: If Sublessee exercises its option to extend the Term as provided in Section 2.3, the Base Rent for the Extension Term shall be the greater of (i) the Base Rent in effect immediately prior to the commencement of the Extension Term, increased by three and a half percent (3.5%) per annum, compounded annually, or (ii) the then-prevailing fair market rental rate for comparable office, laboratory, and research space in the building and surrounding area, as mutually agreed upon by Sublessor and Sublessee. If Sublessor and Sublessee are unable to agree upon the fair market rental rate within sixty (60) days after Sublessee's exercise of the extension option, the fair market rental rate shall be determined by arbitration in accordance with the procedures set forth in Exhibit B attached hereto.

3.3 Additional Rent: In addition to the Base Rent, Sublessee shall pay to Sublessor as additional rent Sublessee's Proportionate Share (as defined below) of Operating Expenses (as defined in the Master Lease) for the Master Premises. Sublessee's Proportionate Share shall be thirty-five percent (35%), which is the percentage obtained by dividing the rentable square footage of the Subleased Premises (35,000 sq. ft.) by the rentable square footage of the Master Premises (100,000 sq. ft.). Sublessee's obligation to pay additional rent shall commence on the Commencement Date and shall be payable in monthly installments as provided in the Master Lease.

3.4 Utilities and Services: Sublessee shall be responsible for all utilities and services provided to or consumed in the Subleased Premises, including without limitation, electricity, gas, water, sewer, telephone, internet, and janitorial services. To the extent such utilities and services are not separately metered or billed to the Subleased Premises, Sublessee shall pay to Sublessor, as additional rent, Sublessee's Proportionate Share of the cost of such utilities and services for the Master Premises.

3.5 Late Charges: If any installment of Base Rent or additional rent is not received by Sublessor within five (5) days after the date when due, Sublessee shall pay to Sublessor a late charge equal to five percent (5%) of the overdue amount to cover the extra expense involved in handling delinquent payments. The parties agree that this late charge represents a fair and reasonable estimate of the costs that Sublessor will incur by reason of late payment by Sublessee.

4. SECURITY DEPOSIT

4.1 Amount: Upon execution of this Sublease, Sublessee shall deposit with Sublessor the sum of Seven Hundred Eighty-Seven Thousand Five Hundred Dollars ($787,500.00) as a security deposit (the "Security Deposit") to secure Sublessee's faithful performance of all terms, covenants, and conditions of this Sublease.

4.2 Use and Return: Sublessor may, but shall not be obligated to, use the Security Deposit or any portion thereof to cure any breach or default by Sublessee under this Sublease, or to compensate Sublessor for any damage it incurs as a result of Sublessee's failure to perform any of its obligations hereunder. If Sublessor uses any portion of the Security Deposit, Sublessee shall, within ten (10) days after written demand therefor, restore the Security Deposit to its original amount. Provided that Sublessee has fully and faithfully performed all of its obligations under this Sublease, Sublessor shall return the Security Deposit, or any balance thereof, to Sublessee within thirty (30) days after the expiration or earlier termination of this Sublease.

5. USE

5.1 Permitted Use: The Subleased Premises shall be used and occupied by Sublessee solely for general office purposes, research and development, biotechnology laboratory uses consistent with a BSL-2 (Biosafety Level 2) facility, and other uses permitted under the Master Lease, and for no other purpose without the prior written consent of Sublessor and Master Lessor.

5.2 Compliance with Laws: Sublessee shall, at its sole cost and expense, comply with all laws, ordinances, orders, rules, and regulations of all governmental authorities having jurisdiction over the Subleased Premises or Sublessee's use thereof, including without limitation, the Americans with Disabilities Act, all environmental laws and regulations, and all biosafety regulations applicable to BSL-2 facilities.

5.3 Hazardous Materials: Sublessee shall not use, generate, manufacture, store, or dispose of any Hazardous Materials (as defined in the Master Lease) in, on, or about the Subleased Premises or the building, except for those Hazardous Materials that are (i) typically used in general office operations or (ii) necessary for Sublessee's permitted laboratory operations, provided that such Hazardous Materials are used, stored, and disposed of in strict compliance with all applicable laws and regulations. Sublessee shall provide Sublessor with a list of all Hazardous Materials used in the Subleased Premises on a quarterly basis and shall promptly notify Sublessor of any spills or releases of Hazardous Materials in the Subleased Premises.

6. MAINTENANCE AND REPAIRS

6.1 Sublessee's Obligations: Sublessee shall, at its sole cost and expense, keep and maintain the Subleased Premises and every part thereof in good order, condition, and repair, ordinary wear and tear and damage by casualty excepted. Sublessee's obligations shall include, without limitation, the maintenance, repair, and replacement of all interior walls, floors, ceilings, doors, windows, and fixtures within the Subleased Premises, as well as all laboratory-specific equipment and systems.

6.2 Sublessor's Obligations: Sublessor shall have no obligation to maintain, repair, or replace any portion of the Subleased Premises, except to the extent such obligation is imposed on Sublessor as the Tenant under the Master Lease and relates to the building structure, exterior walls, roof, and common building systems. In such event, Sublessee shall promptly reimburse Sublessor for Sublessee's Proportionate Share of the costs incurred by Sublessor in performing such obligations.

7. ALTERATIONS AND IMPROVEMENTS

7.1 Sublessee's Alterations: Sublessee shall not make any alterations, additions, or improvements to the Subleased Premises (collectively, "Alterations") without the prior written consent of Sublessor and Master Lessor, which consent shall not be unreasonably withheld, conditioned, or delayed for non-structural Alterations that do not affect the building systems or structural elements. Any approved Alterations shall be made at Sublessee's sole cost and expense, in accordance with all applicable laws and building codes, and in a good and workmanlike manner.

7.2 Removal of Alterations: Unless otherwise agreed in writing, all Alterations made by Sublessee shall become the property of Sublessor upon installation and shall remain upon and be surrendered with the Subleased Premises upon the expiration or earlier termination of this Sublease. Notwithstanding the foregoing, Sublessor may require Sublessee to remove any Alterations made by Sublessee and to restore the Subleased Premises to its original condition, all at Sublessee's sole cost and expense.

8. ASSIGNMENT AND SUBLETTING

8.1 Prohibition: Sublessee shall not assign this Sublease or any interest herein, nor sublet the Subleased Premises or any part thereof, nor permit the use or occupancy of the Subleased Premises by any person or entity other than Sublessee, without the prior written consent of Sublessor and Master Lessor, which consent shall not be unreasonably withheld, conditioned, or delayed.

8.2 Permitted Transfers: Notwithstanding Section 8.1, Sublessee may, without Sublessor's or Master Lessor's consent, assign this Sublease or sublet all or a portion of the Subleased Premises to (i) an entity controlling, controlled by, or under common control with Sublessee, (ii) an entity resulting from a merger or consolidation with Sublessee, or (iii) an entity acquiring all or substantially all of Sublessee's assets or stock, provided that such entity has a net worth at least equal to that of Sublessee as of the date of such assignment or subletting and assumes all of Sublessee's obligations under this Sublease.

9. INSURANCE

9.1 Sublessee's Insurance: Sublessee shall, at its sole cost and expense, procure and maintain throughout the Term the following insurance coverages:

(a) Commercial General Liability Insurance with limits of not less than $10,000,000 per occurrence and $20,000,000 in the aggregate, covering bodily injury, property damage, personal injury, and advertising injury arising out of or relating to Sublessee's use and occupancy of the Subleased Premises.

(b) Property Insurance covering Sublessee's personal property, trade fixtures, equipment, and Alterations in the Subleased Premises, in an amount equal to the full replacement cost thereof.

(c) Workers' Compensation Insurance as required by applicable law, and Employer's Liability Insurance with limits of not less than $1,000,000 per accident, $1,000,000 per employee for disease, and $1,000,000 policy limit for disease.

(d) Business Interruption Insurance in an amount sufficient to cover Sublessee's ongoing expenses, including without limitation, rent payments under this Sublease, for a period of not less than eighteen (18) months.

(e) Environmental Liability Insurance with limits of not less than $10,000,000 per occurrence and $20,000,000 in the aggregate, covering claims arising out of the presence, use, handling, storage, or disposal of Hazardous Materials in the Subleased Premises.

10. INDEMNIFICATION

10.1 Sublessee's Indemnity: Sublessee shall indemnify, defend, and hold harmless Sublessor and Master Lessor, and their respective officers, directors, employees, agents, and representatives, from and against any and all claims, demands, liabilities, damages, judgments, costs, and expenses (including reasonable attorneys' fees) arising out of or relating to (i) Sublessee's use or occupancy of the Subleased Premises, (ii) any act or omission of Sublessee or its employees, agents, contractors, or invitees, (iii) any breach or default by Sublessee under this Sublease, or (iv) the presence, use, handling, storage, or disposal of Hazardous Materials in the Subleased Premises by Sublessee or its employees, agents, contractors, or invitees.

11. DAMAGE AND DESTRUCTION

11.1 Termination Rights: If the Subleased Premises or the building in which they are located are damaged or destroyed by fire or other casualty to such an extent that, in Sublessor's reasonable judgment, the damage cannot be repaired within three hundred sixty-five (365) days after the date of such damage or destruction, either party may terminate this Sublease by giving written notice to the other party within thirty (30) days after the date of such damage or destruction.

12. DEFAULT

12.1 Events of Default: The occurrence of any of the following shall constitute a material default and breach of this Sublease by Sublessee:

(a) Failure to pay any rent or other sum payable hereunder within five (5) days after the date when due;

(b) Failure to observe or perform any other term, covenant, or condition of this Sublease, if such failure continues for a period of thirty (30) days after written notice thereof from Sublessor to Sublessee;

(c) The making by Sublessee of any general assignment for the benefit of creditors; the filing by or against Sublessee of a petition to have Sublessee adjudged a bankrupt or a petition for reorganization or arrangement under any law relating to bankruptcy;

(d) Sublessee's abandonment of the Subleased Premises;

(e) Any default by Sublessee under the Master Lease.

13. SURRENDER OF PREMISES

Upon the expiration or earlier termination of this Sublease, Sublessee shall surrender the Subleased Premises to Sublessor in good condition and repair, ordinary wear and tear excepted, and shall remove all of Sublessee's personal property, trade fixtures, and equipment. Sublessee shall also remove any Alterations required to be removed pursuant to Section 7.2 and shall repair any damage caused by such removal. If Sublessee fails to remove any property or to restore the Subleased Premises as required hereunder, Sublessor may do so and charge the cost thereof to Sublessee.

14. HOLDOVER

If Sublessee remains in possession of the Subleased Premises after the expiration or earlier termination of this Sublease without Sublessor's written consent, such occupancy shall be a tenancy at sufferance, and Sublessee shall pay rent at a rate equal to one hundred seventy-five percent (175%) of the Base Rent in effect immediately prior to such holdover, computed on a monthly basis for each month or partial month of holdover. In addition, Sublessee shall indemnify, defend, and hold harmless Sublessor from and against all claims, liabilities, damages, costs, and expenses (including reasonable attorneys' fees) incurred by Sublessor as a result of such holdover.

15. NOTICES

All notices, demands, requests, consents, approvals, and other communications required or permitted to be given under this Sublease shall be in writing and shall be deemed to have been duly given if (a) delivered personally, (b) sent by registered or certified mail, return receipt requested, postage prepaid, or (c) sent by reputable overnight courier service, addressed to the party to be notified at the address set forth in the preamble of this Sublease or such other address as such party may specify by notice given in accordance with this Section.

16. MISCELLANEOUS

16.1 Governing Law: This Sublease shall be governed by and construed in accordance with the laws of the State of California, without giving effect to any choice of law or conflict of law provisions.

16.2 Entire Agreement: This Sublease, including all exhibits attached hereto, constitutes the entire agreement between the parties with respect to the subject matter hereof and supersedes all prior and contemporaneous agreements and understandings, whether written or oral.

16.3 Amendments: This Sublease may not be amended, modified, or supplemented except by a written instrument executed by both parties hereto.

16.4 Waiver: No waiver of any provision of this Sublease shall be effective unless in writing and signed by the party against whom such waiver is sought to be enforced. No waiver of any breach of this Sublease shall be construed as a waiver of any subsequent breach.

16.5 Severability: If any provision of this Sublease is held to be invalid, illegal, or unenforceable in any respect, such invalidity, illegality, or unenforceability shall not affect any other provision of this Sublease, and this Sublease shall be construed as if such invalid, illegal, or unenforceable provision had never been contained herein.

16.6 Binding Effect: This Sublease shall be binding upon and inure to the benefit of the parties hereto and their respective successors and permitted assigns.

16.7 Counterparts: This Sublease may be executed in any number of counterparts, each of which shall be deemed an original, but all of which together shall constitute one and the same instrument. Electronic signatures shall be deemed to be original signatures for all purposes.

16.8 Time of Essence: Time is of the essence with respect to the performance of all obligations under this Sublease.

16.9 Attorneys' Fees: In the event of any litigation between the parties hereto to enforce any provision of this Sublease or any right of either party hereto, the unsuccessful party to such litigation shall pay to the successful party all costs and expenses, including reasonable attorneys' fees, incurred by the successful party in such litigation.

16.10 Subordination: This Sublease is and shall be subject and subordinate to the Master Lease and to all ground or underlying leases, mortgages, deeds of trust, and other hypothecations or encumbrances now or hereafter affecting the real property of which the Subleased Premises are a part.

16.11 Incorporation of Master Lease: The terms and conditions of the Master Lease are incorporated herein by reference, except to the extent that they are inconsistent with the terms and conditions of this Sublease. Sublessee assumes and agrees to perform all of Sublessor's obligations under the Master Lease with respect to the Subleased Premises, except as otherwise provided herein.

16.12 Confidentiality: Sublessee acknowledges that the terms and conditions of this Sublease are to remain confidential for Sublessor's benefit, and may not be disclosed by Sublessee to anyone, by any manner or means, directly or indirectly, without Sublessor's prior written consent, except to Sublessee's attorneys, accountants, and other professional advisors, or as required by law.

16.13 Force Majeure: Neither party shall be responsible for delays in the performance of its obligations hereunder caused by acts of God, war, terrorist attack, pandemic, government regulation, riot, or other causes beyond the reasonable control of such party.

16.14 Quiet Enjoyment: Sublessor covenants that Sublessee, upon paying the rent and performing all of the terms, covenants, and conditions of this Sublease, shall peaceably and quietly have, hold, and enjoy the Subleased Premises during the Term, subject to the terms and conditions of this Sublease and the Master Lease.

16.15 Brokers: Each party represents and warrants to the other that it has not dealt with any broker or finder in connection with this Sublease, except for [Broker Name] representing Sublessor and [Broker Name] representing Sublessee. Each party shall indemnify, defend, and hold harmless the other party from and against any claims, liabilities, damages, costs, and expenses (including reasonable attorneys' fees) arising out of any breach of the foregoing representation and warranty.

16.16 Parking: Sublessee shall have the right to use, on a non-exclusive basis, Sublessee's Proportionate Share of the parking spaces allocated to Sublessor under the Master Lease, subject to the terms and conditions of the Master Lease and any rules and regulations promulgated by Master Lessor or Sublessor.

16.17 Signage: Subject to Master Lessor's approval and the terms of the Master Lease, Sublessee shall have the right to install, at Sublessee's sole cost and expense, Sublessee's name and logo on the entry door to the Subleased Premises, in the lobby directory for the building, and on one panel of the building's monument sign.

16.18 Access: Sublessee shall have access to the Subleased Premises twenty-four (24) hours per day, seven (7) days per week, three hundred sixty-five (365) days per year, subject to the terms and conditions of the Master Lease and any reasonable security measures implemented by Master Lessor or Sublessor.

16.19 Environmental: Sublessee shall comply with all environmental laws and regulations applicable to its use and occupancy of the Subleased Premises. Sublessee shall promptly notify Sublessor of any release or threatened release of Hazardous Materials in, on, or about the Subleased Premises. Upon the expiration or earlier termination of this Sublease, Sublessee shall, at its sole cost and expense, remove all Hazardous Materials brought onto the Subleased Premises by Sublessee and remediate any contamination caused thereby.

16.20 Waiver of Jury Trial: TO THE FULLEST EXTENT PERMITTED BY LAW, SUBLESSOR AND SUBLESSEE HEREBY WAIVE THEIR RESPECTIVE RIGHT TO TRIAL BY JURY IN ANY ACTION OR PROCEEDING BASED UPON, OR RELATED TO, THE SUBJECT MATTER OF THIS SUBLEASE.

16.21 OFAC Compliance: Sublessee represents and warrants that neither Sublessee nor any of its affiliates, nor any of their respective partners, members, shareholders or other equity owners, and none of their respective employees, officers, directors, representatives or agents is, nor will they become, a person or entity with whom U.S. persons or entities are restricted from doing business under regulations of the Office of Foreign Asset Control ("OFAC") of the Department of the Treasury (including those named on OFAC's Specially Designated and Blocked Persons List) or under any statute, executive order (including the September 24, 2001, Executive Order Blocking Property and Prohibiting Transactions with Persons Who Commit, Threaten to Commit, or Support Terrorism), or other governmental action.

IN WITNESS WHEREOF, the parties hereto have executed this Commercial Sublease Agreement as of the date first above written.

SUBLESSOR:
InnovateTech Holdings, Inc.

By: _________________________
Name: _______________________
Title: ________________________

SUBLESSEE:
BioGen Dynamics, Corp.

By: _________________________
Name: _______________________
Title: ________________________

EXHIBIT A: Description of Subleased Premises
[Detailed floor plan and description of the 35,000 square feet on the 29th and 30th floors]

EXHIBIT B: Arbitration Procedures for Determining Fair Market Rental Rate
[Detailed procedures for selecting arbitrators and conducting the arbitration process]

EXHIBIT C: Form of Commencement Date Memorandum
[Template for documenting the actual Commencement Date and Expiration Date]

EXHIBIT D: Rules and Regulations
[List of building rules and regulations applicable to all tenants]

EXHIBIT E: Laboratory Safety Guidelines
[Specific guidelines for the safe operation of the BSL-2 laboratory facilities]

EXHIBIT F: Hazardous Materials Management Plan
[Detailed plan for the handling, storage, and disposal of Hazardous Materials used in the Subleased Premises]
"""

sample3 = """
Description: This is a commercial sublease agreement between InnovateTech Holdings, Inc. (Sublessor) and BioGen Dynamics, Corp. (Sublessee) for a portion of premises originally leased from SkyScrapers Development Co. (Master Lessor). The sublease is for office, laboratory, and research space, including provisions for BSL-2 laboratory use, with a 6-year initial term and one 5-year extension option.

<parties involved>
Sublessor: InnovateTech Holdings, Inc.
Sublessee: BioGen Dynamics, Corp.
Original lessor: SkyScrapers Development Co.
</parties involved>

<property details>
Address: 555 Innovation Tower, 29th and 30th Floors, San Francisco, CA 94105
Description: 35,000 square feet of office, laboratory, and research space
Permitted use: General office, research and development, biotechnology laboratory uses consistent with a BSL-2 facility
</property details>

<term and rent>
Start date: December 1, 2023
End date: November 30, 2029
Monthly rent:
• Year 1: $262,500 per month
• Year 2: $270,375 per month
• Year 3: $278,486.25 per month
• Year 4: $286,840.84 per month
• Year 5: $295,446.06 per month
• Year 6: $304,309.44 per month
Security deposit: $787,500
Option to extend: One 5-year extension option
Additional rent: 35`%` of Operating Expenses for the Master Premises
</term and rent>

<responsibilities>
Utilities: Sublessee responsible for all utilities and services
Maintenance: Sublessee responsible for interior maintenance and repairs, including laboratory-specific equipment and systems
Repairs: Sublessee responsible for interior repairs; Sublessor responsible for building structure, exterior walls, roof, and common building systems
Insurance: Sublessee required to maintain Commercial General Liability, Property, Workers' Compensation, Business Interruption, and Environmental Liability insurance
</responsibilities>

<consent and notices>
Landlord's consent: Required for sublease to be effective
Notice requirements: Written notices to be delivered personally, by registered or certified mail, or by overnight courier to specified addresses
</consent and notices>

<special provisions>
Alterations: Require prior written consent of Sublessor and Master Lessor
Assignment and subletting: Prohibited without prior written consent, with exceptions for certain related entities
Hazardous materials: Sublessee permitted to use Hazardous Materials necessary for office operations and laboratory use, subject to compliance with laws and regulations
Damage and destruction: Termination rights if repairs cannot be completed within 365 days
Early access: 30 days prior to Commencement Date for furniture, equipment, and laboratory systems installation
Parking: Non-exclusive use of Sublessee's Proportionate Share of parking spaces
Signage: Right to install name and logo on entry door, lobby directory, and building monument sign
Access: 24/7/365 access to Subleased Premises
Environmental compliance: Sublessee responsible for compliance with environmental laws and remediation of any contamination caused by Sublessee
</special provisions>
"""
```