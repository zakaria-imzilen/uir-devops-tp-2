#!/bin/bash

# API Testing Script for FlowCraft Studio
# This script runs Newman tests with different configurations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="local"
BASE_URL=""
VM_IP=""
REPORTS_DIR="../../reports"
VERBOSE=false

# Function to print usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo "Options:"
    echo "  -e, --environment ENV    Environment to test (local|staging) [default: local]"
    echo "  -u, --url URL           Base URL for API testing"
    echo "  -i, --vm-ip IP          VM IP address for staging tests"
    echo "  -v, --verbose           Enable verbose output"
    echo "  -h, --help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 -e local                                    # Test against local development"
    echo "  $0 -e staging -i 192.168.1.100                # Test against staging VM"
    echo "  $0 -e staging -u http://staging.example.com   # Test against staging URL"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -u|--url)
            BASE_URL="$2"
            shift 2
            ;;
        -i|--vm-ip)
            VM_IP="$2"
            shift 2
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

# Validate environment
if [[ "$ENVIRONMENT" != "local" && "$ENVIRONMENT" != "staging" ]]; then
    echo -e "${RED}Error: Environment must be either 'local' or 'staging'${NC}"
    exit 1
fi

# Create reports directory
mkdir -p "$REPORTS_DIR"

echo -e "${BLUE}=== FlowCraft Studio API Testing ===${NC}"
echo -e "${YELLOW}Environment: $ENVIRONMENT${NC}"

# Set up environment-specific variables
if [[ "$ENVIRONMENT" == "staging" ]]; then
    if [[ -n "$BASE_URL" ]]; then
        echo -e "${YELLOW}Base URL: $BASE_URL${NC}"
        GLOBAL_VARS="--global-var BASE_URL=$BASE_URL"
    elif [[ -n "$VM_IP" ]]; then
        echo -e "${YELLOW}VM IP: $VM_IP${NC}"
        GLOBAL_VARS="--global-var VM_IP=$VM_IP"
    else
        echo -e "${RED}Error: For staging environment, either --url or --vm-ip must be provided${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}Base URL: http://localhost:3000${NC}"
    GLOBAL_VARS=""
fi

# Check if Newman is installed
if ! command -v newman &> /dev/null; then
    echo -e "${RED}Newman is not installed. Installing...${NC}"
    npm install -g newman newman-reporter-html
fi

# Set Newman command options
NEWMAN_CMD="newman run flowcraft-api.postman_collection.json"
NEWMAN_CMD="$NEWMAN_CMD -e environments/${ENVIRONMENT}.postman_environment.json"
NEWMAN_CMD="$NEWMAN_CMD --reporters cli,junit,html"
NEWMAN_CMD="$NEWMAN_CMD --reporter-junit-export $REPORTS_DIR/api-test-results.xml"
NEWMAN_CMD="$NEWMAN_CMD --reporter-html-export $REPORTS_DIR/api-test-report.html"
NEWMAN_CMD="$NEWMAN_CMD --timeout 120000"
NEWMAN_CMD="$NEWMAN_CMD --timeout-request 30000"

if [[ "$VERBOSE" == true ]]; then
    NEWMAN_CMD="$NEWMAN_CMD --verbose"
fi

if [[ -n "$GLOBAL_VARS" ]]; then
    NEWMAN_CMD="$NEWMAN_CMD $GLOBAL_VARS"
fi

echo -e "${BLUE}Running API tests...${NC}"
echo -e "${YELLOW}Command: $NEWMAN_CMD${NC}"

# Change to tests directory
cd "$(dirname "$0")"

# Run Newman tests
if eval $NEWMAN_CMD; then
    echo -e "${GREEN}✅ API tests completed successfully${NC}"
    echo -e "${BLUE}📊 Reports generated:${NC}"
    echo -e "  - JUnit XML: $REPORTS_DIR/api-test-results.xml"
    echo -e "  - HTML Report: $REPORTS_DIR/api-test-report.html"
    exit 0
else
    echo -e "${RED}❌ API tests failed${NC}"
    echo -e "${BLUE}📊 Reports available at:${NC}"
    echo -e "  - JUnit XML: $REPORTS_DIR/api-test-results.xml"
    echo -e "  - HTML Report: $REPORTS_DIR/api-test-report.html"
    exit 1
fi