#!/usr/bin/env python3
"""
Compile Typst (.typ) or LaTeX (.tex) slide files to PDF.
Outputs JSON result to stdout.
"""

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path


def find_project_root(start_path):
    """Find project root by looking for .git or .claude directory."""
    current = start_path.parent if start_path.is_file() else start_path

    while current != current.parent:
        if (current / '.git').exists() or (current / '.claude').exists():
            return current
        current = current.parent

    # Fallback to source file's parent directory
    return start_path.parent if start_path.is_file() else start_path


def detect_chinese(content):
    """Check if content contains Chinese characters."""
    return bool(re.search(r'[\u4e00-\u9fff]', content))


def check_command_available(command):
    """Check if a command is available in PATH."""
    try:
        subprocess.run([command, '--version'],
                      capture_output=True,
                      check=False,
                      timeout=5,
                      encoding='utf-8',
                      errors='replace')
        return True
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return False


def compile_typst(source_path, output_path):
    """Compile Typst file to PDF."""
    cmd = ['typst', 'compile', str(source_path), str(output_path)]
    result = subprocess.run(cmd, capture_output=True, text=True,
                          encoding='utf-8', errors='replace')

    errors = []
    warnings = []

    if result.returncode != 0:
        # Parse stderr for errors
        for line in result.stderr.split('\n'):
            line = line.strip()
            if line:
                if 'error' in line.lower():
                    errors.append(line)
                elif 'warning' in line.lower():
                    warnings.append(line)
                else:
                    errors.append(line)

    # Also check stdout for warnings
    for line in result.stdout.split('\n'):
        line = line.strip()
        if line and 'warning' in line.lower():
            warnings.append(line)

    return result.returncode == 0, errors, warnings


def compile_latex(source_path, output_dir, has_chinese):
    """Compile LaTeX file to PDF."""
    # Choose compiler based on Chinese detection
    if has_chinese:
        cmd = ['latexmk', '-xelatex',
               f'-output-directory={output_dir}',
               str(source_path)]
    else:
        cmd = ['latexmk', '-pdf',
               f'-output-directory={output_dir}',
               str(source_path)]

    result = subprocess.run(cmd, capture_output=True, text=True,
                          encoding='utf-8', errors='replace')

    errors = []
    warnings = []

    # Parse log file for errors and warnings
    log_file = output_dir / f"{source_path.stem}.log"
    if log_file.exists():
        try:
            log_content = log_file.read_text(encoding='utf-8', errors='ignore')
            for line in log_content.split('\n'):
                if '! ' in line or 'Error' in line:
                    errors.append(line.strip())
                elif 'Warning' in line:
                    warnings.append(line.strip())
        except Exception:
            pass

    # Also check stderr
    if result.stderr:
        for line in result.stderr.split('\n'):
            line = line.strip()
            if line:
                errors.append(line)

    return result.returncode == 0, errors, warnings


def clean_latex_auxiliary(output_dir, stem):
    """Remove LaTeX auxiliary files."""
    extensions = ['.aux', '.log', '.nav', '.out', '.snm', '.toc',
                  '.vrb', '.fdb_latexmk', '.fls', '.synctex.gz',
                  '.bbl', '.blg', '.bcf', '.run.xml']

    for ext in extensions:
        aux_file = output_dir / f"{stem}{ext}"
        if aux_file.exists():
            try:
                aux_file.unlink()
            except Exception:
                pass


def main():
    parser = argparse.ArgumentParser(description='Compile slides to PDF')
    parser.add_argument('source', type=str, help='Source file path (.typ or .tex)')
    parser.add_argument('--output-dir', type=str, default=None,
                       help='Output directory (default: output/ relative to project root)')
    parser.add_argument('--clean', action='store_true',
                       help='Remove LaTeX auxiliary files after compilation')

    args = parser.parse_args()

    # Convert to Path
    source_path = Path(args.source).resolve()

    # Validate source file exists
    if not source_path.exists():
        result = {
            "success": False,
            "source": str(source_path),
            "engine": None,
            "pdf_path": None,
            "file_size": None,
            "errors": [f"Source file not found: {source_path}"],
            "warnings": []
        }
        print(json.dumps(result, indent=2))
        sys.exit(1)

    # Detect engine from extension
    ext = source_path.suffix.lower()
    if ext == '.typ':
        engine = 'typst'
    elif ext == '.tex':
        engine = 'latex'
    else:
        result = {
            "success": False,
            "source": str(source_path),
            "engine": None,
            "pdf_path": None,
            "file_size": None,
            "errors": [f"Unsupported file extension: {ext}. Expected .typ or .tex"],
            "warnings": []
        }
        print(json.dumps(result, indent=2))
        sys.exit(1)

    # Check if command is available
    command = 'typst' if engine == 'typst' else 'latexmk'
    if not check_command_available(command):
        result = {
            "success": False,
            "source": str(source_path),
            "engine": engine,
            "pdf_path": None,
            "file_size": None,
            "errors": [f"Command not found: {command}. Please install it first."],
            "warnings": []
        }
        print(json.dumps(result, indent=2))
        sys.exit(1)

    # Determine output directory
    if args.output_dir:
        output_dir = Path(args.output_dir).resolve()
    else:
        # Default: "output" relative to project root
        project_root = find_project_root(source_path)
        output_dir = project_root / 'output'

    # Create output directory if it doesn't exist
    output_dir.mkdir(parents=True, exist_ok=True)

    # Output PDF path
    pdf_path = output_dir / f"{source_path.stem}.pdf"

    # Read source content for Chinese detection (LaTeX only)
    has_chinese = False
    if engine == 'latex':
        try:
            content = source_path.read_text(encoding='utf-8')
            has_chinese = detect_chinese(content) or '\\usepackage{ctex}' in content
        except Exception as e:
            result = {
                "success": False,
                "source": str(source_path),
                "engine": engine,
                "pdf_path": None,
                "file_size": None,
                "errors": [f"Failed to read source file: {str(e)}"],
                "warnings": []
            }
            print(json.dumps(result, indent=2))
            sys.exit(1)

    # Compile
    if engine == 'typst':
        success, errors, warnings = compile_typst(source_path, pdf_path)
    else:  # latex
        success, errors, warnings = compile_latex(source_path, output_dir, has_chinese)

    # Clean auxiliary files if requested
    if args.clean and engine == 'latex':
        clean_latex_auxiliary(output_dir, source_path.stem)

    # Check if PDF was created
    file_size = None
    if pdf_path.exists():
        file_size = pdf_path.stat().st_size
    else:
        success = False
        if not errors:
            errors.append("PDF file was not created")

    # Build result (limit errors/warnings to first 10 each)
    result = {
        "success": success,
        "source": str(source_path),
        "engine": engine,
        "pdf_path": str(pdf_path) if pdf_path.exists() else None,
        "file_size": file_size,
        "errors": errors[:10],
        "warnings": warnings[:10]
    }

    print(json.dumps(result, indent=2))
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
