pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('ee2e2ea7-2ab9-4672-8ecd-e3a149bdbccb')
        SSH_CREDENTIALS = credentials('ansible-ssh')
        REMOTE_HOST = '100.26.112.105'
        REMOTE_USER = 'ec2-user'
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'master', url: 'https://github.com/HiruniWijendrasinhe/DevOPs_Web'
            }
        }

        stage('Build Docker Images') {
            parallel {
                stage('Frontend Image') {
                    steps {
                        script {
                            docker.build(
                                "hiruniwijendrasinhe/alertfy_frontend:${env.BUILD_NUMBER}",
                                "frontend/my-app"
                            )
                        }
                    }
                }
                stage('Backend Image') {
                    steps {
                        script {
                            docker.build(
                                "hiruniwijendrasinhe/alertfy_backend:${env.BUILD_NUMBER}",
                                "backend"
                            )
                        }
                    }
                }
            }
        }

        stage('Push Docker Images') {
            parallel {
                stage('Push Frontend') {
                    steps {
                        script {
                            docker.withRegistry('', 'ee2e2ea7-2ab9-4672-8ecd-e3a149bdbccb') {
                                docker.image("hiruniwijendrasinhe/alertfy_frontend:${env.BUILD_NUMBER}").push()
                            }
                        }
                    }
                }
                stage('Push Backend') {
                    steps {
                        script {
                            docker.withRegistry('', 'ee2e2ea7-2ab9-4672-8ecd-e3a149bdbccb') {
                                docker.image("hiruniwijendrasinhe/alertfy_backend:${env.BUILD_NUMBER}").push()
                            }
                        }
                    }
                }
            }
        }

        stage('Deploy to AWS via Ansible') {
            steps {
                script {
                    // Save private key from Jenkins credentials
                    writeFile file: 'jenkins_key.pem', text: "${SSH_CREDENTIALS}"
                    sh 'chmod 600 jenkins_key.pem'

                    // Run Ansible playbook with build number
                    sh """
ansible-playbook -i ${REMOTE_HOST}, deploy.yml \
--private-key jenkins_key.pem \
-u ${REMOTE_USER} \
-e "build_number=${env.BUILD_NUMBER}" \
--ssh-extra-args='-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null'
"""
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}
