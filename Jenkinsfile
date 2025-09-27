pipeline {
  agent none
  options { timestamps() }

  environment {
    DOCKER_IMAGE = 'zakariaimzilen/uir-devops'
    SONARQUBE_INSTALLATION = 'SonarQube'
  }

  stages {
    stage('Checkout') {
      agent any
      steps {
        checkout scm
        script { env.TAG = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim() }
      }
    }

    stage('Install & Test (Node 20)') {
      agent any
      steps {
        sh '''
          npm ci
          cd app && npm ci
          npm test
          npm run build
        '''
      }
      post { always { junit 'reports/junit.xml' } }
    }

    stage('API Tests (Local)') {
      agent any
      steps {
        sh '''
          npm install -g newman newman-reporter-html
          mkdir -p reports
          cd app && npm run dev &
          APP_PID=$!
          echo "Waiting for app to start..."
          sleep 30

          # Run API tests against local instance
          npm run test:api || TEST_RESULT=$?

          # Stop the development server
          kill $APP_PID || true

          # Exit with test result
          exit ${TEST_RESULT:-0}
        '''
      }
      post {
        always {
          junit 'reports/api-test-results.xml'
          publishHTML([
            allowMissing: false,
            alwaysLinkToLastBuild: true,
            keepAll: true,
            reportDir: 'reports',
            reportFiles: 'api-test-report.html',
            reportName: 'API Test Report (Local)'
          ])
        }
      }
    }

    stage('SonarQube Analysis') {
      agent any
      steps {
        script {
          def scannerHome = tool 'SonarScanner'
          withSonarQubeEnv("${SONARQUBE_INSTALLATION}") {
            sh "${scannerHome}/bin/sonar-scanner"
          }
        }
      }
    }

    stage('Quality Gate') {
      steps {
        timeout(time: 5, unit: 'MINUTES') {
          script {
            def qg = waitForQualityGate()
            if (qg.status != 'OK') error "Quality Gate: ${qg.status}"
          }
        }
      }
    }

    stage('Docker Build & Push') {
      agent any
      steps {
        withCredentials([usernamePassword(credentialsId:'docker-creds', usernameVariable:'U', passwordVariable:'P')]) {
          sh """
            set -e
            docker login -u "$U" -p "$P"
            export DOCKER_IMAGE='${DOCKER_IMAGE}' TAG='${TAG}'
            docker compose -f ops/app-compose.yml build
            docker compose -f ops/app-compose.yml push
          """
        }
      }
    }

    stage('Build Docker Image') {
    steps {
        script {
            sh 'docker build -t uir-devops-tp-2:latest .'
        }
    }
}

stage('Security Scan') {
    steps {
        script {
            sh 'docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v $WORKSPACE/trivy-reports:/app/reports ghcr.io/aquasecurity/trivy:latest image --severity HIGH,CRITICAL --exit-code 1 --format html --output /app/reports/trivy-report.html uir-devops-tp-2:latest'
        }
    }
    post {
        always {
            archiveArtifacts artifacts: 'trivy-reports/**', allowEmptyArchive: true
        }
    }
}


       
        


    stage('Deploy to VM') {
      when { branch 'main' }
      agent any
      steps {
        sshagent(credentials: ['vm-ssh']) {
          sh '''
            set -e
            VM_IP=$(cd terraform && terraform output -raw public_ip)
            ssh -o StrictHostKeyChecking=no ubuntu@$VM_IP 'mkdir -p ~/ops'
            scp -o StrictHostKeyChecking=no ops/app-compose.yml ubuntu@$VM_IP:~/ops/app-compose.yml
            ssh -o StrictHostKeyChecking=no ubuntu@$VM_IP "export DOCKER_IMAGE='${DOCKER_IMAGE}' TAG='${TAG}'; docker compose -f ~/ops/app-compose.yml pull && docker compose -f ~/ops/app-compose.yml up -d"
          '''
        }
      }
    }

    stage('Smoke Test') {
      when { branch 'main' }
      steps {
        script {
          def host = sh(script: "cd terraform && terraform output -raw public_ip", returnStdout: true).trim()
          sh "curl -fsS http://${host}:8080/api/health | grep -q 'ok'"
        }
      }
    }

    stage('API Tests (Staging)') {
      when { branch 'main' }
      agent any
      steps {
        script {
          def host = sh(script: "cd terraform && terraform output -raw public_ip", returnStdout: true).trim()
          sh """
            # Wait for deployment to be fully ready
            echo "Waiting for application to be fully ready..."
            sleep 60

            # Run comprehensive API tests against staging
            export VM_IP=${host}
            npm run test:api:ci || TEST_RESULT=\$?

            exit \${TEST_RESULT:-0}
          """
        }
      }
      post {
        always {
          junit 'reports/api-test-results.xml'
          publishHTML([
            allowMissing: false,
            alwaysLinkToLastBuild: true,
            keepAll: true,
            reportDir: 'reports',
            reportFiles: 'api-test-report.html',
            reportName: 'API Test Report (Staging)'
          ])
        }
        failure {
          emailext (
            subject: "API Tests Failed - ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
            body: """
              API tests failed for build ${env.BUILD_NUMBER} of ${env.JOB_NAME}.

              Check the test report at: ${env.BUILD_URL}API_20Test_20Report_20_28Staging_29/

              Jenkins Build: ${env.BUILD_URL}
            """,
            to: "${env.CHANGE_AUTHOR_EMAIL ?: 'devops@example.com'}"
          )
        }
      }
    }
  }
}
