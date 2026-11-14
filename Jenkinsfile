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

        stage('Notify Renovate PR') {
            when {
                changeRequest target: 'staging'
            }

            steps {
                script {
                    if (
                        env.CHANGE_AUTHOR == 'renovate[bot]' &&
                        currentBuild.number == 1
                    ) {
                        notifyTelegram('renovate_pr', [
                            prNumber: env.CHANGE_ID,
                            prUrl: env.CHANGE_URL
                        ])
                    }
                }
            }
        }

        stage('Install') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Validate Biome config') {
            steps {
                sh 'npm run check'
            }
        }

        stage('Unit tests') {
            steps {
                sh 'npm test'
            }
        }

        stage('Validate packages') {
            steps {
                sh 'npm run pack:check'
            }
        }

        stage('Publish packages') {
            when {
                branch 'master'
            }

            steps {
                sh 'rm -f .published-packages'

                withCredentials([
                    string(
                        credentialsId: 'github-packages-publish',
                        variable: 'GITHUB_PACKAGES_TOKEN'
                    )
                ]) {
                    sh '''
                        set +x
                        set -eu

                        export NPM_CONFIG_USERCONFIG="$(mktemp)"
                        VERSIONS_FILE="$(mktemp)"

                        trap 'rm -f "$NPM_CONFIG_USERCONFIG" "$VERSIONS_FILE"' EXIT

                        printf '%s\\n' \
                          '@nlabrazi:registry=https://npm.pkg.github.com' \
                          "//npm.pkg.github.com/:_authToken=${GITHUB_PACKAGES_TOKEN}" \
                          > "$NPM_CONFIG_USERCONFIG"

                        for pkg_json in packages/*/package.json; do
                            PACKAGE="$(node -p "require('./${pkg_json}').name")"
                            VERSION="$(node -p "require('./${pkg_json}').version")"

                            echo "Checking ${PACKAGE}@${VERSION}"

                            if ! npm view "$PACKAGE" versions --json \
                              --registry=https://npm.pkg.github.com > "$VERSIONS_FILE" 2>/dev/null; then
                                printf '[]' > "$VERSIONS_FILE"
                            fi

                            if VERSIONS_FILE="$VERSIONS_FILE" VERSION="$VERSION" node -e '
                                const fs = require("node:fs");
                                let versions = [];
                                try {
                                    versions = JSON.parse(
                                        fs.readFileSync(process.env.VERSIONS_FILE, "utf8")
                                    );
                                } catch {
                                    versions = [];
                                }
                                process.exit([versions].flat().includes(process.env.VERSION) ? 0 : 1);
                            '; then
                                echo "${PACKAGE}@${VERSION} already published. Skipping."
                            else
                                npm publish --workspace "$PACKAGE"
                                printf "%s %s\\n" "$PACKAGE" "$VERSION" >> .published-packages
                            fi
                        done
                    '''
                }

                script {
                    if (fileExists('.published-packages')) {
                        def lines = readFile('.published-packages').trim().split('\n')
                        for (String line : lines) {
                            def trimmed = line.trim()
                            if (trimmed) {
                                def parts = trimmed.split(' ')
                                notifyTelegram('package_published', [
                                    packageName: parts[0],
                                    version: parts[1]
                                ])
                            }
                        }
                    }
                }
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
