# FlowCraft Studio API Testing Suite

This directory contains comprehensive automated API testing setup using Postman collections and Newman for the FlowCraft Studio application.

## 🏗️ Structure

```
tests/api/
├── flowcraft-api.postman_collection.json    # Main Postman collection
├── environments/                             # Environment configurations
│   ├── local.postman_environment.json       # Local development environment
│   └── staging.postman_environment.json     # Staging environment
├── data-management/                          # Test data management
│   ├── test-data-manager.js                 # Dynamic test data generation
│   └── cleanup-script.sh                    # Test data cleanup utilities
├── reporting/                               # Test reporting and analytics
│   └── report-generator.js                  # Advanced report generation
├── test-data.json                           # Static test data and scenarios
├── newman.config.json                       # Newman configuration
├── run-tests.sh                            # Test execution script
└── README.md                               # This file
```

## 🚀 Quick Start

### Prerequisites

```bash
# Install Newman globally
npm install -g newman newman-reporter-html

# Or install project dependencies
npm install
```

### Running Tests Locally

```bash
# Run against local development server
npm run test:api

# Or use the script directly
./tests/api/run-tests.sh -e local
```

### Running Tests Against Staging

```bash
# Run against staging environment
export VM_IP=your.vm.ip.address
npm run test:api:staging

# Or with script
./tests/api/run-tests.sh -e staging -i your.vm.ip.address
```

## 📋 API Endpoints Tested

### Health & Monitoring
- `GET /api/health` - Health check endpoint
- `GET /api/metrics` - Prometheus metrics endpoint

### Apps Management
- `GET /api/apps` - List all user apps
- `POST /api/apps/create` - Create new app
- `GET /api/apps/{id}` - Get specific app
- `PUT /api/apps/{id}/update` - Update app
- `DELETE /api/apps/{id}/delete` - Delete app

### Authentication
- `GET /auth/confirm` - Authentication confirmation

### Error Handling
- Invalid data validation tests
- Nonexistent resource access tests
- Authentication requirement tests

## 🧪 Test Features

### Comprehensive Test Coverage
- ✅ **Functional Testing** - All CRUD operations
- ✅ **Error Handling** - Invalid inputs and edge cases
- ✅ **Performance Testing** - Response time validation
- ✅ **Security Testing** - Authentication and authorization
- ✅ **Health Monitoring** - Service availability checks

### Dynamic Test Data
- Unique test data generation for each test run
- Parallel test execution support
- Test data cleanup and management
- Environment-specific test configurations

### Advanced Reporting
- JUnit XML reports for CI/CD integration
- HTML dashboard reports with metrics
- Performance analytics and trends
- Test failure categorization and recommendations

## 🔧 Configuration

### Environment Variables

```bash
# For staging tests
export VM_IP=192.168.1.100          # VM IP address
export BASE_URL=http://staging.com   # Alternative to VM_IP

# For custom timeouts
export API_TIMEOUT=10000             # Request timeout in milliseconds
```

### Newman Configuration

The `newman.config.json` file contains default Newman settings:

```json
{
  "timeout": 120000,
  "timeoutRequest": 30000,
  "timeoutScript": 5000,
  "reporters": ["cli", "junit", "html"]
}
```

## 📊 Test Data Management

### Dynamic Test Data Generation

```bash
# Generate test data for environment
node tests/api/data-management/test-data-manager.js generate local

# Generate Newman global variables
node tests/api/data-management/test-data-manager.js globals staging

# Generate parallel test data
node tests/api/data-management/test-data-manager.js parallel 5
```

### Test Data Cleanup

```bash
# Clean up all test data and reports
./tests/api/data-management/cleanup-script.sh

# Dry run to see what would be cleaned
./tests/api/data-management/cleanup-script.sh --dry-run

# Clean only specific types
./tests/api/data-management/cleanup-script.sh --mode files
./tests/api/data-management/cleanup-script.sh --mode old
```

## 📈 Reports and Analytics

### Report Generation

```bash
# Generate test summary and dashboard
node tests/api/reporting/report-generator.js generate

# Archive old reports
node tests/api/reporting/report-generator.js archive 30
```

### Report Types

1. **JUnit XML** - `reports/api-test-results.xml`
   - Standard format for CI/CD systems
   - Test execution results and failures

2. **HTML Dashboard** - `reports/api-test-report.html`
   - Visual test results with charts
   - Performance metrics and trends
   - Recommendations for improvements

3. **JSON Summary** - `reports/api-test-summary-{id}.json`
   - Detailed test execution metadata
   - Endpoint analysis and categorization
   - Performance and error analytics

## 🔄 CI/CD Integration

### Jenkins Pipeline Integration

The tests are automatically integrated into the Jenkins pipeline:

1. **Local Testing Stage** - Tests during build process
2. **Staging Testing Stage** - Tests after deployment
3. **Report Archiving** - Stores results and generates reports
4. **Email Notifications** - Alerts on test failures

### Pipeline Commands

```bash
# Commands used in Jenkins pipeline
npm install -g newman newman-reporter-html
npm run test:api:ci
```

### Pipeline Outputs

- JUnit XML reports archived in Jenkins
- HTML reports published as build artifacts
- Email notifications on failures
- Test trend analysis in Jenkins

## 🛠️ Troubleshooting

### Common Issues

#### Tests Failing with "Connection Refused"
```bash
# Check if application is running
curl -f http://localhost:3000/api/health

# Wait longer for application startup
sleep 60  # Increase wait time in scripts
```

#### Newman Not Found
```bash
# Install Newman globally
npm install -g newman newman-reporter-html

# Or use npx
npx newman run collection.json
```

#### Test Data Conflicts
```bash
# Clean up test data
./tests/api/data-management/cleanup-script.sh

# Generate fresh test data
node tests/api/data-management/test-data-manager.js generate
```

#### Environment Configuration Issues
```bash
# Verify environment variables
echo $VM_IP
echo $BASE_URL

# Check environment file
cat tests/api/environments/staging.postman_environment.json
```

### Debug Mode

Enable verbose output for debugging:

```bash
# Run with verbose logging
./tests/api/run-tests.sh -e local -v

# Newman debug mode
newman run collection.json --verbose --debug
```

## 📝 Adding New Tests

### 1. Add to Postman Collection

Edit `flowcraft-api.postman_collection.json` to add new test requests with:
- Proper test scripts
- Response validation
- Error handling tests

### 2. Update Test Data

Add new test scenarios to `test-data.json`:

```json
{
  "newEndpointTests": [
    {
      "description": "Test new endpoint",
      "data": {
        "field": "value"
      }
    }
  ]
}
```

### 3. Update Documentation

- Add endpoint to the "API Endpoints Tested" section
- Update any relevant configuration examples
- Add troubleshooting tips if needed

## 🔍 Best Practices

### Test Design
- Use descriptive test names
- Include both positive and negative test cases
- Validate response structure and data types
- Test error conditions and edge cases

### Test Data
- Use unique identifiers for test isolation
- Clean up test data after execution
- Use environment-specific test data
- Avoid hardcoded values in tests

### Performance
- Set appropriate timeouts for different environments
- Monitor response times and set thresholds
- Test under realistic load conditions
- Optimize test execution order

### Reporting
- Archive old reports regularly
- Include actionable recommendations
- Track test trends over time
- Integrate with monitoring systems

## 🤝 Contributing

1. Follow existing test patterns and naming conventions
2. Add comprehensive test coverage for new endpoints
3. Update documentation for any new features
4. Test changes in both local and staging environments
5. Ensure test data cleanup is properly implemented

## 📞 Support

For issues or questions:
- Check the troubleshooting section above
- Review Jenkins build logs for CI/CD issues
- Examine Newman output for detailed error information
- Contact the DevOps team for infrastructure-related problems