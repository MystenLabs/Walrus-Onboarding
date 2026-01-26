# Module 6: Walrus CLI Developer Curriculum

A comprehensive curriculum for learning how to use the Walrus command-line interface (CLI) to interact with the Walrus decentralized storage system.

## Overview

This module provides step-by-step guidance for developers who want to learn how to:

- Install and configure the Walrus CLI
- Upload and download data on Walrus
- Inspect stored objects and system information
- Troubleshoot common errors
- Apply best practices for efficient CLI usage

## Module Structure

### Core Learning Materials

| File | Description |
|------|-------------|
| [index.md](./contents/index.md) | Curriculum overview and learning objectives |
| [01-install.md](./contents/01-install.md) | CLI installation instructions |
| [02-configuration.md](./contents/02-configuration.md) | Configuration setup and options |
| [03-upload-workflow.md](./contents/03-upload-workflow.md) | Uploading data to Walrus |
| [04-download-workflow.md](./contents/04-download-workflow.md) | Downloading data from Walrus |
| [05-inspect-commands.md](./contents/05-inspect-commands.md) | Inspecting objects and system info |
| [06-common-errors.md](./contents/06-common-errors.md) | Troubleshooting guide |
| [07-operational-habits.md](./contents/07-operational-habits.md) | Best practices and tips |
| [08-hands-on.md](./contents/08-hands-on.md) | Practical exercises |

### Supporting Materials

- **[instructor-guide.md](./contents/instructor-guide.md)** - Comprehensive guide for instructors teaching this curriculum
- **[docker/](./docker/)** - Docker environment for hands-on exercises
- **[assets/](./assets/)** - Source files for diagrams (Excalidraw format)
- **[images/](./images/)** - Rendered diagram images (SVG format)

## Docker Environment

For hands-on practice, a complete Docker environment is provided in the **[docker/](./docker/)** directory:

```sh
cd docker
make build
SUI_WALLET_PATH=~/.sui/sui_config make run
```

Available commands:
- `make build` - Build the Docker image
- `make run` - Start interactive shell
- `make upload-download` - Test upload and download workflow
- `make inspect` - Inspect objects and system info
- `make failure-recovery` - Test failure scenarios
- `make clean` - Remove containers and images

See [docker/README.md](./docker/README.md) for detailed instructions.

## File Descriptions

### Asset Files

- **assets/** - Source files for visual diagrams
  - `cli-blob-lifecycle.excalidraw.json` - Blob lifecycle state diagram
  - `cli-quilt-structure.excalidraw.json` - Quilt structure diagram
- **images/** - Rendered diagram images
  - `cli-blob-lifecycle.svg` - Blob lifecycle diagram
  - `cli-quilt-structure.svg` - Quilt structure diagram

## For Instructors

If you're teaching this curriculum, see the **[instructor-guide.md](./contents/instructor-guide.md)** for:

- Teaching strategies and approaches
- Section-by-section guidance with key points
- Assessment suggestions
