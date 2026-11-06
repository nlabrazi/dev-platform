
@Library('nabster-ci') _

pipeline {
    agent {
        docker {
            image 'node:26'
        }
    }

    stages {
        stage('Notify start') {
            steps {
                notifyTelegram('started')
            }
        }

        stage('Install') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Validate Biome config') {
            steps {
                sh 'npx biome check biome.json'
            }
        }

        stage('Validate package') {
            steps {
                sh 'npm pack --workspace @nlabrazi/config-biome --dry-run'
            }
        }
    }

    post {
        success {
            notifyTelegram('success')
        }

        failure {
            notifyTelegram('failed')
        }
    }
}
