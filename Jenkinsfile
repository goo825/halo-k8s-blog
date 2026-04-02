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

        stage('Publish Theme Package') {
            steps {
                sh '''
                THEME_NAME=halo-k8s-theme
                THEME_DIR=theme/${THEME_NAME}
                TARGET_DIR=/root/.halo2/themes/${THEME_NAME}

                if [ -d "${THEME_DIR}" ]; then
                  kubectl exec -n blog-system ${HALO_POD} -- mkdir -p "${TARGET_DIR}"
                  kubectl exec -n blog-system ${HALO_POD} -- sh -c "rm -rf ${TARGET_DIR}/*"
                  tar -cf - -C "${THEME_DIR}" . | kubectl exec -i -n blog-system ${HALO_POD} -- tar -xf - -C "${TARGET_DIR}"
                else
                  echo "No theme package found at ${THEME_DIR}, skipping theme publish."
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
