
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
                sh 'npx biome check biome.json'
            }
        }

        stage('Validate package') {
            steps {
                sh 'npm pack --workspace @nlabrazi/config-biome --dry-run'
            }
        }

        stage('Publish package') {
            when {
                branch 'master'
            }

            steps {
                sh 'rm -f .published-package-version'

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

                        PACKAGE='@nlabrazi/config-biome'

                        VERSION="$(node -p "require('./packages/config-biome/package.json').version")"

                        echo "Checking ${PACKAGE}@${VERSION}"

                        npm view "$PACKAGE" versions --json \
                          --registry=https://npm.pkg.github.com > "$VERSIONS_FILE"

                        if VERSIONS_FILE="$VERSIONS_FILE" VERSION="$VERSION" node -e '
                            const fs = require("node:fs");
                            const versions = JSON.parse(
                                fs.readFileSync(process.env.VERSIONS_FILE, "utf8")
                            );
                            process.exit([versions].flat().includes(process.env.VERSION) ? 0 : 1);
                        '; then
                            echo "Version already published. Skipping."
                        else
                            npm publish --workspace "$PACKAGE"
                            printf "%s" "$VERSION" > .published-package-version
                        fi
                    '''
                }

                script {
                    if (fileExists('.published-package-version')) {
                        def publishedVersion = readFile(
                            '.published-package-version'
                        ).trim()

                        notifyTelegram('package_published', [
                            packageName: '@nlabrazi/config-biome',
                            version: publishedVersion
                        ])
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
