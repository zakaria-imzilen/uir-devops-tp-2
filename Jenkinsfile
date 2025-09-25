pipeline {
  agent none
  options { timestamps(); ansiColor('xterm') }

  environment {
    DOCKER_IMAGE = 'zakariaimzilen/uir-devops'
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
      agent { docker { image 'node:20-alpine' } }
      steps {
        sh '''
          npm ci
          npm test
          npm run build
        '''
      }
      post { always { junit 'reports/junit.xml' } }
    }

    stage('SonarQube Analysis') {
        def scannerHome = tool 'SonarScanner';
        withSonarQubeEnv() {
        sh "${scannerHome}/bin/sonar-scanner"
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
      agent { docker { image 'docker:26-cli'; args '-v /var/run/docker.sock:/var/run/docker.sock' } }
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
      agent { docker { image 'alpine:3.20' } }
      steps {
        sshagent(credentials: ['vm-ssh']) {
          sh '''
            set -e
            apk add --no-cache openssh-client
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
