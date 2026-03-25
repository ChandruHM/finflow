pipeline {
    agent any

    tools {
        jdk 'jdk-21'
        maven 'maven-3.9'
    }

    environment {
        SPRING_PROFILES_ACTIVE = 'test'
        DOCKER_REGISTRY       = 'ghcr.io/chandruhm'
        IMAGE_NAME             = 'finflow-service-java'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build & Unit Test') {
            steps {
                dir('apps/service-java') {
                    sh './mvnw clean verify -DskipITs'
                }
            }
            post {
                always {
                    junit 'apps/service-java/target/surefire-reports/*.xml'
                }
            }
        }

        stage('Integration Tests') {
            steps {
                dir('apps/service-java') {
                    sh './mvnw verify -DskipUTs -Dspring.profiles.active=test'
                }
            }
            post {
                always {
                    junit 'apps/service-java/target/failsafe-reports/*.xml'
                }
            }
        }

        stage('SonarQube Analysis') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            steps {
                dir('apps/service-java') {
                    withSonarQubeEnv('sonarqube') {
                        sh './mvnw sonar:sonar'
                    }
                }
            }
        }

        stage('Build Docker Image') {
            when {
                branch 'main'
            }
            steps {
                dir('apps/service-java') {
                    sh "docker build -t ${DOCKER_REGISTRY}/${IMAGE_NAME}:${BUILD_NUMBER} ."
                    sh "docker tag ${DOCKER_REGISTRY}/${IMAGE_NAME}:${BUILD_NUMBER} ${DOCKER_REGISTRY}/${IMAGE_NAME}:latest"
                }
            }
        }

        stage('Push Docker Image') {
            when {
                branch 'main'
            }
            steps {
                withCredentials([string(credentialsId: 'ghcr-token', variable: 'GHCR_TOKEN')]) {
                    sh "echo ${GHCR_TOKEN} | docker login ghcr.io -u chandruhm --password-stdin"
                    sh "docker push ${DOCKER_REGISTRY}/${IMAGE_NAME}:${BUILD_NUMBER}"
                    sh "docker push ${DOCKER_REGISTRY}/${IMAGE_NAME}:latest"
                }
            }
        }

        stage('Deploy to Oracle Cloud') {
            when {
                branch 'main'
            }
            steps {
                input message: 'Deploy to production?', ok: 'Deploy'
                sh '''
                    ssh -o StrictHostKeyChecking=no opc@${ORACLE_CLOUD_IP} << 'EOF'
                    docker pull ${DOCKER_REGISTRY}/${IMAGE_NAME}:latest
                    docker stop finflow-java || true
                    docker rm finflow-java || true
                    docker run -d --name finflow-java \
                        -p 8080:8080 \
                        --env-file /home/opc/.env \
                        ${DOCKER_REGISTRY}/${IMAGE_NAME}:latest
                    EOF
                '''
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline completed successfully'
        }
        failure {
            echo '❌ Pipeline failed'
        }
        always {
            cleanWs()
        }
    }
}
