pipeline {
  agent none
  stages {
    stage('test') {
      environment { HOME="." }
      agent {
        docker { 
          image 'node:8.14.0-alpine' 
        }
      }
      steps {
        sh 'npm install && npm test' 
      }
    }
  }
}
