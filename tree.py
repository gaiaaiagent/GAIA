import os
import sys
from pathlib import Path

def read_file_content(file_path):
    """Read and return the content of a file with proper file extension detection."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            ext = file_path.suffix[1:]  # Remove the dot from extension
            if ext in ['ts', 'js', 'json', 'py', 'md']:
                return f"```{ext}\n{content}\n```"
            return content
    except Exception as e:
        return f"Error reading file: {str(e)}"

def should_ignore(path):
    """Check if the path should be ignored."""
    ignore_patterns = {
        # Directories to ignore
        'node_modules',
        '.git',
        'dist',
        'build',
        'coverage',
        '__pycache__',
        '.pytest_cache',
        '.vscode',
        # File patterns to ignore
        '*.pyc',
        '*.pyo',
        '*.pyd',
        '*.so',
        '*.dylib',
        '*.dll',
        '*.log',
        '.DS_Store',
        '.env',
        '*.lock',
    }
    
    # Check if any parent directory should be ignored
    for parent in path.parents:
        if parent.name in ignore_patterns:
            return True
            
    # Check file patterns
    if path.is_file():
        if path.name in ignore_patterns:
            return True
        if any(path.match(pattern) for pattern in ignore_patterns if '*' in pattern):
            return True
    
    return False

def generate_documentation(directory_path):
    """Generate documentation for the given directory."""
    # Convert to Path object
    base_path = Path(directory_path)
    
    # Start the documentation
    doc = [f"Project Path: {base_path.name}\n"]
    
    # Add source tree
    doc.append("Source Tree:\n")
    doc.append("```")
    
    # Generate tree structure
    def generate_tree(path, prefix=""):
        files = sorted(path.glob('*'))
        # Filter out ignored files
        files = [f for f in files if not should_ignore(f)]
        for i, file in enumerate(files):
            is_last = i == len(files) - 1
            doc.append(f"{prefix}{'└── ' if is_last else '├── '}{file.name}")
            if file.is_dir():
                new_prefix = prefix + ('    ' if is_last else '│   ')
                generate_tree(file, new_prefix)
    
    generate_tree(base_path)
    doc.append("```\n")
    
    # Add file contents
    for file in base_path.rglob('*'):
        if file.is_file() and not should_ignore(file):
            relative_path = file.relative_to(base_path)
            doc.append(f"`{base_path}/{relative_path}`:\n")
            doc.append(read_file_content(file))
            doc.append("\n")
    
    return "\n".join(doc)

def main():
    if len(sys.argv) != 2:
        print("Usage: python script.py <directory_path>")
        sys.exit(1)
    
    directory_path = sys.argv[1]
    if not os.path.exists(directory_path):
        print(f"Error: Directory '{directory_path}' does not exist")
        sys.exit(1)
    
    documentation = generate_documentation(directory_path)
    
    # Write to output file
    output_file = "project_documentation.md"
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(documentation)
    
    print(f"Documentation generated successfully in {output_file}")

if __name__ == "__main__":
    main()
