pipeline {
  agent none
  stages {
    stage('build') {
      agent {
        docker { 
          image 'node:8-alpine' 
          reuseNode true
        }
      }
      steps {
        sh 'npm install && npm test' 
      }
    }
    stage('unit testing') {
      agent {
        docker { 
          image 'node:8-alpine' 
          reuseNode true
        }
      }
    }
  }
}
