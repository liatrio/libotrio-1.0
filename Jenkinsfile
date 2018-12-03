pipeline {
  agent none
  stages {
    stage('test') {
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
