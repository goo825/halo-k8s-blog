pipeline {
    agent any

    stages {
        stage('Find Halo Pod') {
            steps {
                script {
                    env.HALO_POD = sh(
                        script: "kubectl -n blog-system get pod -l app=halo -o jsonpath='{.items[0].metadata.name}'",
                        returnStdout: true
                    ).trim()
                }
            }
        }

        stage('Sync Assets') {
            steps {
                sh '''
                if [ -d assets ]; then
                  kubectl exec -n blog-system ${HALO_POD} -- mkdir -p /root/.halo2/assets
                  kubectl exec -n blog-system ${HALO_POD} -- rm -rf /root/.halo2/assets/*
                  tar -cf - -C assets . | kubectl exec -i -n blog-system ${HALO_POD} -- tar -xf - -C /root/.halo2/assets
                else
                  echo "No assets directory found, skipping asset sync."
                fi
                '''
            }
        }

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
