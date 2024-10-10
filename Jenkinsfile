pipeline {
  agent any
  stages {
    stage('Clone Repository') {
      steps {
        git(branch: 'main', url: 'https://github.com/ricardoh2021/web-development.git')
      }
    }

    stage('Build') {
      steps {
        echo 'Building the project...'
      }
    }

    stage('Test') {
      steps {
        echo 'Running tests...'
      }
    }

    stage('Deploy') {
      steps {
        echo 'Deploying the application...'
      }
    }

  }
  post {
    always {
      echo 'Cleaning up workspace...'
      cleanWs()
    }

    success {
      echo 'Pipeline completed successfully!'
    }

    failure {
      echo 'Pipeline failed.'
    }

  }
}