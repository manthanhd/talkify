pipeline {
  agent any
  stages {
    stage('Install Packages') {
      steps {
        tool(name: 'node-9', type: 'nodejs')
        sh '''
node -v'''
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