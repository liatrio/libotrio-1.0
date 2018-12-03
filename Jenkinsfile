pipeline {
  agent none
  stages {
    stage('test') {
      environment { HOME="." }
      agent {
        docker { 
          image 'node:8' 
        }
      }
      steps {
        sh 'npm install && npm test' 
      }
    }
  }
}
