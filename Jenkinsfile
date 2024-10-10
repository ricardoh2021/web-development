pipeline {
    agent any

    stages {
        stage('Clone Repository') {
            steps {
                // Clone the GitHub repository
                git branch: 'main', url: 'https://github.com/ricardoh2021/web-development.git'
            }
        }

        stage('Build') {
            steps {
                echo 'Building the project...'
                // Add your build steps here, e.g., build scripts, compile code, etc.
                // Example: sh './build.sh'
            }
        }

        stage('Test') {
            steps {
                echo 'Running tests...'
                // Add your testing steps here, e.g., unit tests, integration tests, etc.
                // Example: sh './run-tests.sh'
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying the application...'
                // Add your deployment steps here.
                // Example: sh './deploy.sh'
            }
        }
    }

    post {
        always {
            echo 'Cleaning up workspace...'
            cleanWs() // Clean up workspace after build
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed.'
        }
    }
}