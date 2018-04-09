pipeline {
  agent any
  stages {
    stage('Install Packages') {
      steps {
        sh 'npm install'
      }
    }
    stage('Run tests') {
      steps {
        sh 'npm test'
      }
    }
  }
}