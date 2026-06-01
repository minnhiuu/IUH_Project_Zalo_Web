pipeline {
    agent any

    tools {
        // Gọi con Node mút cấu hình ở Bước 1 ra dùng
        nodejs 'node20'
    }

    environment {
        VITE_API_BASE_URL = 'http://abe3ea04c641d485cb88cb2c13caddf8-2019967811.ap-southeast-2.elb.amazonaws.com:8080/api'
        VITE_API_URL = 'http://abe3ea04c641d485cb88cb2c13caddf8-2019967811.ap-southeast-2.elb.amazonaws.com:8080/api'
        VITE_WS_URL = 'http://abe3ea04c641d485cb88cb2c13caddf8-2019967811.ap-southeast-2.elb.amazonaws.com:8080/ws'
        VITE_FIREBASE_API_KEY = 'AIzaSyBNr-OCpXI42eguU6x0aWgajpYIWF4Vzr4'
        VITE_FIREBASE_AUTH_DOMAIN = 'bondhub-9e8e1.firebaseapp.com'
        VITE_FIREBASE_PROJECT_ID = 'bondhub-9e8e1'
        VITE_FIREBASE_STORAGE_BUCKET = 'bondhub-9e8e1.firebasestorage.app'
        VITE_FIREBASE_MESSAGING_SENDER_ID = '1004895767731'
        VITE_FIREBASE_APP_ID = '1:1004895767731:web:3daead0ceab5d6c40af4c6'
        VITE_FIREBASE_MEASUREMENT_ID = 'G-W9TP9GZHTX'
        VITE_FIREBASE_VAPID_KEY = 'BIo4NPMLxtJ10ZnntdvZPyapyTcv8Z-ooevzMDDuFSvweJnDwUH68_gky_wJiLl_52nMNG7j_IH7ihMFaVnPLWc'
        VITE_AI_AVATAR_URL = 'https://s3-bondhub-bucket.s3.ap-southeast-2.amazonaws.com/bondhub-ai.png'
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
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: 'jenkins-fe-web',
                    accessKeyVariable: 'AWS_ACCESS_KEY_ID',
                    secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'
                ]]) {
                    sh """
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