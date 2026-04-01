pipeline {
    agent any

    stages {
        stage('Deploy Halo') {
            steps {
                sh '''
                kubectl -n blog-system rollout restart deployment/halo
                kubectl -n blog-system rollout status deployment/halo
                '''
            }
        }
    }
}
