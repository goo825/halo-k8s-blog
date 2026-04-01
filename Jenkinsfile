pipeline {
    agent any

    stages {
        stage('Deploy Halo') {
            steps {
                sh '''
                kubectl apply -f k8s/halo/halo-node01.yaml
                kubectl -n blog-system rollout restart deployment/halo
                kubectl -n blog-system rollout status deployment/halo
                '''
            }
        }
    }
}
