pipeline {
    agent any
    tools {
        nodejs 'node20'  
    }
    environment {
        DOCKER_IMAGE = 'tpa-front-end' // lowercase only
        DOCKER_REGISTRY = 'localhost:5000'
        VERSION = '2.4.16.0-uat-taku13'
        BRANCH_NAME = ''
        // QUALITY_GATE_STATUS = ''
        EMAILS = credentials('email-3') //List of eamil to get notification when build finsished
        SONAR_ISSUE = '0'
        SONAR_HOTSPOT = '0'
        TRIVY_SUMMARY = '0'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    BRANCH_NAME = env.GIT_BRANCH?.replaceFirst(/^origin\//, '') ?: env.BRANCH_NAME
                    echo "[INFO] Triggered by branch: ${BRANCH_NAME}"
                }
            }
        }

        /*
        stage('Sonar Scan - Code Quality') {
            options {
                timeout(time: 2, unit: 'MINUTES')
            }
            steps {
                script {
                    def issues = []
                    withSonarQubeEnv('SonarQube') {
                        sh """
                            sonar-scanner \
                                -Dsonar.projectKey=${DOCKER_IMAGE} \
                                -Dsonar.sources=. \
                                -Dsonar.projectVersion=${BRANCH_NAME}-${VERSION}
                        """
                    }

                    def qualityGate = waitForQualityGate()
                    currentBuild.description = "Quality Gate: ${qualityGate.status}"
                    currentBuild.result = (qualityGate.status == 'OK') ? 'SUCCESS' : 'FAILURE'
                    QUALITY_GATE_STATUS = qualityGate.status

                    withCredentials([string(credentialsId: 'sonarqude-api', variable: 'SONAR_TOKEN')]) {
                        def page = 1
                        def totalPages = 1
                        def pageSize = 500

                        while (page <= totalPages) {
                            def issueFile = "sonar_issue_page_${page}.json"
                            sh """
                                curl -s -u ${SONAR_TOKEN}: \
                                "http://sonarqube:9000/api/issues/search?projectKeys=${DOCKER_IMAGE}&ps=${pageSize}&p=${page}" \
                                -o ${issueFile}
                            """
                            def pageJson = readJSON file: issueFile
                            issues += pageJson.issues
                            totalPages = ((pageJson.paging.total as int) + pageSize - 1) / pageSize
                            page += 1
                        }

                        SONAR_ISSUE = issues.size()
                        writeJSON file: 'sonar_issue.json', json: [count: SONAR_ISSUE, issues: issues]

                        sh """
                            curl -s -u ${SONAR_TOKEN}: \
                            "http://sonarqube:9000/api/hotspots/search?projectKey=${DOCKER_IMAGE}&status=TO_REVIEW&ps=500" \
                            -o sonar_hotspot.json
                        """
                        def hotspotJson = readJSON file: 'sonar_hotspot.json'
                        SONAR_HOTSPOT = hotspotJson.paging.total
                    }
                }
            }
        }
        */

        stage('Build and Push Docker Image') {
            when {
                expression { return BRANCH_NAME in ['uat', 'uat-hotfix', 'taku','taku-hotfix','main','dr']}
            }
            steps {
                script {
                    def fullImageTag = "${DOCKER_REGISTRY}/${DOCKER_IMAGE}:${VERSION}"
                    def imageName = "${DOCKER_IMAGE}"
                    def imageTag = "${VERSION}"

                    withCredentials([usernamePassword(
                        credentialsId: 'private-registry-1',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )]) {
                        // Use curl to check if image exists in private registry
                        def imageExists = sh(
                            script: """
                                curl -s -f -u "$DOCKER_USER:$DOCKER_PASS" \\
                                -H 'Accept: application/vnd.docker.distribution.manifest.v2+json' \\
                                http://host.local:5000/v2/${imageName}/manifests/${imageTag} >/dev/null && echo yes || echo no
                            """,
                            returnStdout: true
                        ).trim()

                        if (imageExists == 'yes') 
                        {
                            echo "[INFO] Image ${fullImageTag} already exists in registry. Skipping build."
                        } 
                        else 
                        {
                        echo "[INFO] Image not found. Building and pushing..."
                        sh """
                            docker build -t ${DOCKER_IMAGE}:${VERSION} --platform linux/amd64 .
                            docker tag ${DOCKER_IMAGE}:${VERSION} ${fullImageTag}
                            docker push ${fullImageTag}
                        """
                        }
                    }
                }
            }
        }

        /*
        stage('Trivy Scan') {
            steps {
                sh """
                    trivy image --format json \
                        -o ${TRIVY_REPORT} \
                        ${DOCKER_REGISTRY}/${DOCKER_IMAGE}:${DOCKER_TAG}
                """
            }
        }
        */

        stage('Deploy Container') {
                when {
                    expression { return BRANCH_NAME in ['uat', 'uat-hotfix', 'taku','taku-hotfix','main','dr']}
                }
                    steps {
                        script {
                            def fullImageTag = "${DOCKER_REGISTRY}/${DOCKER_IMAGE}:${VERSION}"

                            if (BRANCH_NAME == 'sit') {
                                sh """
                                    docker rm -f ${DOCKER_IMAGE} || true
                                    docker run -d --name ${DOCKER_IMAGE} -p 5001:3000 ${envVars} ${fullImageTag}
                                """
                            } 
                            else if (BRANCH_NAME in ['uat','uat-hotfix', 'taku-hotfix', 'taku','main','dr'])  {
                                def envCredentialId = "tpa-front-end.${BRANCH_NAME}"
                                if (BRANCH_NAME in ['uat-hotfix', 'taku-hotfix', 'taku']) {
                                    envCredentialId = "tpa-front-end.uat"
                                }
                                withCredentials([file(credentialsId: envCredentialId, variable: 'DOTENV_FILE')]) {

                                    def envFlags = sh(
                                        script: '''
                                            cat "$DOTENV_FILE" | grep -v '^#' | grep '=' | tr -d '\\r' | xargs -n1 | awk '{print "-e", $0}' | tr '\\n' ' '
                                        ''',
                                        returnStdout: true
                                    ).trim()
                                    
                                    echo "[DEBUG] Parsed envFlags: ${envFlags}"
                                    sh """
                                        ssh autodeploy@host.local -p 2222 -i /var/jenkins_home/.ssh/id_rsa \\
                                        -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null bash -c '

                                            imageExists=\$(docker images --format '{{.Repository}}:{{.Tag}}' | grep '^${fullImageTag}\$' || true)
                                            if [ -z "\$imageExists" ]; then
                                                echo "Image not found locally. Pulling..."
                                                docker pull ${fullImageTag}
                                            else
                                                echo "Image exists. Skipping pulling."
                                            fi

                                            docker rm -f "${DOCKER_IMAGE}" 2>/dev/null || true

                                            docker run -d --name "${DOCKER_IMAGE}" -p 5001:3000 \\
                                                --restart unless-stopped \\
                                                --network=frontend-net \\
                                                ${envFlags} \\
                                                -v /etc/localtime:/etc/localtime:ro \\
                                                "${fullImageTag}"
                                        '
                                    """
                            }
                        }
                    }
                }
            }
    }
    
    post {
        success {
            script {
                def status = 'SUCCESS'
                def emoji = '✅'

                echo "Sending email via emailext ${EMAILS}"
                echo "Build result: ${status}"

                emailext(
                    subject: "TPA-Upgrad: [${status}] ${DOCKER_IMAGE}:${VERSION} ${BRANCH_NAME}#${env.BUILD_NUMBER}",
                    body: """
${emoji} Build ${status}!

• Project     : ${env.JOB_NAME}
• Build       : #${env.BUILD_NUMBER}
• Branch      : ${BRANCH_NAME}
• Version     : ${VERSION}
• Docker Image: ${DOCKER_IMAGE}:${VERSION}
• Sonar Issues       : ${SONAR_ISSUE}
• Sonar Hotspots     : ${SONAR_HOTSPOT}
• Trivy Vulnerabilities: ${TRIVY_SUMMARY}

View console: ${env.BUILD_URL}console

Attachments:
- sonar_issue.json
- sonar_hotspot.json
- trivy-report.json
                            """,
                    attachmentsPattern: 'sonar_issue.json,sonar_hotspot.json,trivy-report.json',
                    from: 'info.tpa@pims.co.th',
                    to: EMAILS,
                    mimeType: 'text/plain'
                )
            }
        }

        failure {
            script {
                def status = 'FAILURE'
                def emoji = '❌'

                echo "Sending email via emailext ${EMAILS}"
                echo "Build result: ${status}"

                emailext(
                    subject: "TPA-Upgrad: [${status}] ${DOCKER_IMAGE}:${VERSION} ${BRANCH_NAME}#${env.BUILD_NUMBER}",
                    body: """
${emoji} Build ${status}!

• Project     : ${env.JOB_NAME}
• Build       : #${env.BUILD_NUMBER}
• Branch      : ${BRANCH_NAME}
• Version     : ${VERSION}
• Docker Image: ${DOCKER_IMAGE}:${VERSION}
• Sonar Issues       : ${SONAR_ISSUE}
• Sonar Hotspots     : ${SONAR_HOTSPOT}
• Trivy Vulnerabilities: ${TRIVY_SUMMARY}

View console: ${env.BUILD_URL}console

Attachments:
- sonar_issue.json
- sonar_hotspot.json
- trivy-report.json
                            """,
                    attachmentsPattern: 'sonar_issue.json,sonar_hotspot.json,trivy-report.json',
                    from: 'info.tpa@pims.co.th',
                    to: EMAILS,
                    mimeType: 'text/plain'
                )
            }
        }

        aborted {
            script {
                def status = 'ABORTED'
                def emoji = '❌'

                echo "Sending email via emailext ${EMAILS}"
                echo "Build result: ${status}"

                emailext(
                    subject: "TPA-Upgrad: [${status}] ${DOCKER_IMAGE}:${VERSION} ${BRANCH_NAME}#${env.BUILD_NUMBER}",
                    body: """
${emoji} Build ${status}!

• Project     : ${env.JOB_NAME}
• Build       : #${env.BUILD_NUMBER}
• Branch      : ${BRANCH_NAME}
• Version     : ${VERSION}
• Docker Image: ${DOCKER_IMAGE}:${VERSION}
• Sonar Issues       : ${SONAR_ISSUE}
• Sonar Hotspots     : ${SONAR_HOTSPOT}
• Trivy Vulnerabilities: ${TRIVY_SUMMARY}

View console: ${env.BUILD_URL}console

Attachments:
- sonar_issue.json
- sonar_hotspot.json
- trivy-report.json
                            """,
                    attachmentsPattern: 'sonar_issue.json,sonar_hotspot.json,trivy-report.json',
                    from: 'info.tpa@pims.co.th',
                    to: EMAILS,
                    mimeType: 'text/plain'
                )
            }
        }
    }
}
