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
                                PREV_AND_BUMP="$(VERSIONS_FILE="$VERSIONS_FILE" VERSION="$VERSION" node -e '
                                    const fs = require("node:fs");
                                    const parse = (v) => {
                                        const m = String(v || "").match(/^(\d+)\.(\d+)\.(\d+)$/);
                                        return m ? [+m[1], +m[2], +m[3]] : null;
                                    };
                                    const cmp = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
                                    let versions = [];
                                    try {
                                        versions = [JSON.parse(fs.readFileSync(process.env.VERSIONS_FILE, "utf8"))].flat();
                                    } catch {}
                                    const target = parse(process.env.VERSION);
                                    const older = versions
                                        .map((v) => ({ raw: String(v), parts: parse(v) }))
                                        .filter((x) => x.parts && (!target || cmp(x.parts, target) < 0))
                                        .sort((a, b) => cmp(a.parts, b.parts));
                                    const prev = older.length ? older[older.length - 1] : null;
                                    if (!prev || !target) {
                                        process.stdout.write(`${process.env.VERSION} (INITIAL)`);
                                        process.exit(0);
                                    }
                                    const bump = target[0] > prev.parts[0]
                                        ? "MAJOR"
                                        : target[1] > prev.parts[1]
                                            ? "MINOR"
                                            : "PATCH";
                                    process.stdout.write(`${prev.raw} -> ${process.env.VERSION} (${bump})`);
                                ')"
                                npm publish --workspace "$PACKAGE"
                                printf "%s|%s\\n" "$PACKAGE" "$PREV_AND_BUMP" >> .published-packages
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
                                def parts = trimmed.split('\\|', 2)
                                notifyTelegram('package_published', [
                                    packageName: parts[0],
                                    version: parts.length > 1 ? parts[1] : 'unknown'
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
