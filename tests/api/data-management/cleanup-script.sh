#!/bin/bash

# Test Data Cleanup Script for FlowCraft Studio API Tests
# This script handles cleanup of test data and resources

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_DIR="$(dirname "$SCRIPT_DIR")"

# Configuration
CLEANUP_MODE="all"
DRY_RUN=false
VERBOSE=false

usage() {
    echo "Usage: $0 [OPTIONS]"
    echo "Options:"
    echo "  -m, --mode MODE     Cleanup mode (all|files|generated|old) [default: all]"
    echo "  -d, --dry-run       Show what would be cleaned up without doing it"
    echo "  -v, --verbose       Enable verbose output"
    echo "  -h, --help          Show this help message"
    echo ""
    echo "Cleanup modes:"
    echo "  all         - Clean up everything (files, generated data, old reports)"
    echo "  files       - Clean up generated test data files only"
    echo "  generated   - Clean up generated data using Node.js manager"
    echo "  old         - Clean up old test reports and artifacts"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -m|--mode)
            CLEANUP_MODE="$2"
            shift 2
            ;;
        -d|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            echo "Unknown option $1"
            usage
            exit 1
            ;;
    esac
done

log() {
    if [[ "$VERBOSE" == true ]]; then
        echo -e "${BLUE}[INFO]${NC} $1"
    fi
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Function to clean up generated test data files
cleanup_generated_files() {
    log "Looking for generated test data files..."

    local files_found=false

    for file in "$BASE_DIR"/generated-data-*.json; do
        if [[ -f "$file" ]]; then
            files_found=true
            if [[ "$DRY_RUN" == true ]]; then
                echo "Would delete: $file"
            else
                if rm "$file"; then
                    success "Deleted: $(basename "$file")"
                else
                    error "Failed to delete: $file"
                fi
            fi
        fi
    done

    if [[ "$files_found" == false ]]; then
        log "No generated test data files found"
    fi
}

# Function to clean up old test reports
cleanup_old_reports() {
    log "Looking for old test reports..."

    local reports_dir="$BASE_DIR/../../reports"

    if [[ -d "$reports_dir" ]]; then
        local old_files=()

        # Find files older than 7 days
        while IFS= read -r -d '' file; do
            old_files+=("$file")
        done < <(find "$reports_dir" -name "*.xml" -o -name "*.html" -o -name "*.json" -mtime +7 -print0 2>/dev/null)

        if [[ ${#old_files[@]} -gt 0 ]]; then
            for file in "${old_files[@]}"; do
                if [[ "$DRY_RUN" == true ]]; then
                    echo "Would delete old report: $file"
                else
                    if rm "$file"; then
                        success "Deleted old report: $(basename "$file")"
                    else
                        error "Failed to delete: $file"
                    fi
                fi
            done
        else
            log "No old reports found (older than 7 days)"
        fi
    else
        log "Reports directory not found: $reports_dir"
    fi
}

# Function to clean up temporary Newman files
cleanup_temp_files() {
    log "Looking for temporary Newman files..."

    local temp_patterns=(
        "/tmp/newman-*"
        "/tmp/postman-*"
        "$BASE_DIR/newman-*.tmp"
        "$BASE_DIR/.newman-*"
    )

    for pattern in "${temp_patterns[@]}"; do
        for file in $pattern; do
            if [[ -f "$file" ]] || [[ -d "$file" ]]; then
                if [[ "$DRY_RUN" == true ]]; then
                    echo "Would delete temp file/dir: $file"
                else
                    if rm -rf "$file"; then
                        success "Deleted temp file/dir: $(basename "$file")"
                    else
                        error "Failed to delete: $file"
                    fi
                fi
            fi
        done
    done
}

# Function to use Node.js test data manager for cleanup
cleanup_with_manager() {
    log "Using Node.js test data manager for cleanup..."

    if [[ -f "$SCRIPT_DIR/test-data-manager.js" ]]; then
        if [[ "$DRY_RUN" == true ]]; then
            echo "Would run: node test-data-manager.js cleanup"
        else
            if node "$SCRIPT_DIR/test-data-manager.js" cleanup; then
                success "Node.js cleanup completed"
            else
                error "Node.js cleanup failed"
            fi
        fi
    else
        error "Test data manager not found: $SCRIPT_DIR/test-data-manager.js"
    fi
}

# Main cleanup logic
echo -e "${BLUE}=== FlowCraft Studio API Test Cleanup ===${NC}"
echo -e "${YELLOW}Mode: $CLEANUP_MODE${NC}"
echo -e "${YELLOW}Dry run: $DRY_RUN${NC}"

case "$CLEANUP_MODE" in
    all)
        cleanup_generated_files
        cleanup_old_reports
        cleanup_temp_files
        cleanup_with_manager
        ;;
    files)
        cleanup_generated_files
        ;;
    generated)
        cleanup_with_manager
        ;;
    old)
        cleanup_old_reports
        ;;
    temp)
        cleanup_temp_files
        ;;
    *)
        error "Unknown cleanup mode: $CLEANUP_MODE"
        usage
        exit 1
        ;;
esac

if [[ "$DRY_RUN" == true ]]; then
    echo -e "${YELLOW}Dry run completed. No files were actually deleted.${NC}"
else
    success "Cleanup completed successfully!"
fi