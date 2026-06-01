pipeline {
    agent any

    tools {
        // Gọi con Node mút cấu hình ở Bước 1 ra dùng
        nodejs 'node20'
    }

    stages {
        stage('🚀 1. Checkout Code') {
            steps {
                // Tự động kéo code mới nhất từ GitHub về
                checkout scm
            }
        }

        stage('📦 2. Install Dependencies') {
            steps {
                echo 'Đang cài đặt node_modules...'
                sh 'npm install'
            }
        }

        stage('🛠️ 3. Build Project') {
            steps {
                echo 'Đang biên dịch dự án ra file tĩnh...'
                sh 'npm run build'
            }
        }

        stage('🚚 4. Deploy to AWS S3') {
            steps {
                echo 'Đang đồng bộ lên S3 Bucket bhub.id.vn...'
                // Chạy lệnh đồng bộ bằng awscli có sẵn trong container thông qua việc nạp key bảo mật
                withCredentials([usernamePassword(credentialsId: 'jenkins-fe-web', usernameVariable: 'AWS_ACCESS_KEY_ID', passwordVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                    sh """
                        export AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
                        export AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
                        export AWS_DEFAULT_REGION=ap-southeast-2
                        aws s3 sync dist/ s3://bhub.id.vn --delete
                    """
                }
            }
        }
    }

    post {
        success {
            echo '🎉 Quá đỉnh Huy ơi! Hệ thống đã tự động build và deploy Front-End thành công!'
        }
    }
}