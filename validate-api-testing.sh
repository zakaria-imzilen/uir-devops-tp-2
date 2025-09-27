#!/bin/bash

# Comprehensive API Testing Validation Script
# This script validates the entire API testing setup

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 FlowCraft Studio API Testing Validation${NC}"
echo "================================================="

# Counter for passed tests
PASSED=0
TOTAL=0

# Function to run a test
run_test() {
    local test_name="$1"
    local command="$2"
    TOTAL=$((TOTAL + 1))

    echo -n "Testing: $test_name... "

    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}❌ FAIL${NC}"
    fi
}

echo -e "\n${YELLOW}📦 Dependencies Validation${NC}"
run_test "Newman CLI availability" "npx newman --version"
run_test "Project package.json exists" "test -f package.json"
run_test "App package.json exists" "test -f app/package.json"

echo -e "\n${YELLOW}📋 Postman Collection Validation${NC}"
run_test "Main collection exists" "test -f tests/api/flowcraft-api.postman_collection.json"
run_test "Local environment exists" "test -f tests/api/environments/local.postman_environment.json"
run_test "Staging environment exists" "test -f tests/api/environments/staging.postman_environment.json"
run_test "Collection JSON is valid" "python -m json.tool tests/api/flowcraft-api.postman_collection.json"

echo -e "\n${YELLOW}🛠️ Test Data Management Validation${NC}"
run_test "Test data manager exists" "test -f tests/api/data-management/test-data-manager.js"
run_test "Test data generation works" "cd tests/api/data-management && node test-data-manager.js generate local"
run_test "Cleanup script exists" "test -f tests/api/data-management/cleanup-script.sh"
run_test "Cleanup script is executable" "test -x tests/api/data-management/cleanup-script.sh"

echo -e "\n${YELLOW}📊 Reporting System Validation${NC}"
run_test "Report generator exists" "test -f tests/api/reporting/report-generator.js"
run_test "Report generation works" "cd tests/api/reporting && node report-generator.js generate"
run_test "Reports directory exists" "test -d reports"

echo -e "\n${YELLOW}🔧 Scripts and Configuration Validation${NC}"
run_test "Run tests script exists" "test -f tests/api/run-tests.sh"
run_test "Run tests script is executable" "test -x tests/api/run-tests.sh"
run_test "Newman config exists" "test -f tests/api/newman.config.json"
run_test "NPM test scripts exist" "grep -q 'test:api' package.json"

echo -e "\n${YELLOW}🏗️ Jenkins Integration Validation${NC}"
run_test "Jenkinsfile exists" "test -f Jenkinsfile"
run_test "Jenkins has API test stages" "grep -q 'API Tests' Jenkinsfile"
run_test "Health endpoint exists" "test -f app/app/api/health/route.ts"

echo -e "\n${YELLOW}🧪 Functional Testing${NC}"
run_test "Newman can run collection" "cd tests/api && npx newman run flowcraft-api.postman_collection.json -e environments/local.postman_environment.json --reporters=cli,junit --reporter-junit-export=../../reports/validation-results.xml --timeout=10000 --timeout-request=5000"
run_test "JUnit report generated" "test -f reports/validation-results.xml"

echo -e "\n${YELLOW}📚 Documentation Validation${NC}"
run_test "API README exists" "test -f tests/api/README.md"
run_test "README has usage examples" "grep -q 'npm run test:api' tests/api/README.md"

# Cleanup test data
echo -e "\n${YELLOW}🧹 Cleanup Test Data${NC}"
run_test "Cleanup works" "cd tests/api/data-management && node test-data-manager.js cleanup"

# Final results
echo -e "\n${BLUE}📈 Validation Results${NC}"
echo "================================================="
echo -e "Tests Passed: ${GREEN}$PASSED${NC}/$TOTAL"

if [ $PASSED -eq $TOTAL ]; then
    echo -e "\n🎉 ${GREEN}ALL TESTS PASSED!${NC}"
    echo "✅ API testing setup is fully functional"
    echo "✅ Ready for CI/CD integration"
    echo "✅ Documentation is complete"
    exit 0
else
    FAILED=$((TOTAL - PASSED))
    echo -e "\n⚠️  ${YELLOW}$FAILED tests failed${NC}"
    echo "❌ Some components need attention"
    exit 1
fi