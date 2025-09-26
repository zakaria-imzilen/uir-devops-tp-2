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
        dir('app') {
          sh '''
            npm ci
            npm test
            npm run build
          '''
        }
      }
    //   post { always { junit 'app/reports/junit.xml' } }
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
            docker login -u "$U" -p "$P"
            docker build -t ${DOCKER_IMAGE}:${TAG} -t ${DOCKER_IMAGE}:latest .
            docker push ${DOCKER_IMAGE}:${TAG}
            docker push ${DOCKER_IMAGE}:latest
          """
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
  }
}
