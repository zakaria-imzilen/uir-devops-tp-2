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
          npm test
          npm run build
        '''
      }
      post { always { junit 'reports/junit.xml' } }
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
    // ✅ DEPLOY ONLY WHEN ops/ FOLDER CHANGES
    stage('Deploy ops Infrastructure') {
      when { 
        allOf {
          branch 'main'
          changeset "ops/**"
        }
      }
      agent any
      steps {
        sshagent(credentials: ['vm-ssh']) {
          withCredentials([string(credentialsId: 'prometheus-jenkins-token', variable: 'JENKINS_TOKEN')]) {
            dir('ansible') {
              sh """
                ansible-playbook -i inventory.ini site.yml --tags deploy \\
                  --extra-vars "jenkins_host='http://34.60.250.238:8081/' jenkins_user='meriem' jenkins_token='${JENKINS_TOKEN}'"
              """
            }
          }
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
