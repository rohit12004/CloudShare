# AWS Infrastructure Setup & Integration Guide

Follow these steps to deploy your serverless backend and connect it to your React frontend.

> [!IMPORTANT]
> **Bucket Name Reminder**: You have chosen **`cloudshare-storage-rohit`**. 
> Ensure this name is used consistently in Step 1.1 and all Lambda functions.

---

## Part 0: Create a Project Manager (IAM User)

It is a security best practice to use a dedicated IAM user with limited permissions rather than your AWS Root account.

1.  **Create User**:
    -   Go to the [IAM Console](https://console.aws.amazon.com/iam/).
    -   Click **Users** -> **Create user**.
    -   **User name**: `CloudshareManager`.
    -   Check **Provide user access to the AWS Management Console**.
    -   Select **I want to create an IAM user** (recommended).
    -   Set a custom password and click **Next**.
2.  **Set Permissions**:
    -   Select **Attach policies directly**.
    -   Click **Create policy**.
    -   Click the **JSON** tab and paste this "Project-Only" policy:
        ```json
        {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Action": [
                        "s3:*",
                        "lambda:*",
                        "apigateway:*",
                        "iam:GetRole",
                        "iam:PassRole",
                        "iam:CreateRole",
                        "iam:AttachRolePolicy",
                        "iam:PutRolePolicy",
                        "iam:ListRoles"
                    ],
                    "Resource": "*"
                }
            ]
        }
        ```
    -   Click **Next** -> **Review**.
    -   **Name**: `CloudshareProjectPolicy`.
    -   Click **Create policy**.
3.  **Finish User**:
    -   Go back to the **Create user** tab, refresh the policies list, search for `CloudshareProjectPolicy`, and check it.
    -   Click **Next** -> **Create user**.
4.  **Log In**: Use the console login URL provided to log in as your new `CloudshareManager` user.

---

## Part 1: S3 Bucket Setup (Storage)

1.  **Create Bucket**:
    -   Go to the [S3 Console](https://s3.console.aws.amazon.com/s3/).
    -   Click **Create bucket**.
    -   **Bucket name**: `cloudshare-storage-rohit` (Must match your Lambda code).
    -   Select your preferred **Region** (e.g., `us-east-1`).
2.  **Enable CORS**:
    -   Go to the **Permissions** tab of your bucket.
    -   Scroll down to **Cross-origin resource sharing (CORS)** and click **Edit**.
    -   Paste this JSON exactly (Update `AllowedOrigins` if your dev server port is different):
        ```json
        [
            {
                "AllowedHeaders": ["*"],
                "AllowedMethods": ["GET", "POST", "PUT", "DELETE"],
                "AllowedOrigins": ["*"],
                "ExposeHeaders": ["ETag"]
            }
        ]
        ```
    -   Click **Save changes**.

---

## Part 2: Lambda Functions (Backend Logic)

Create **four** separate Lambda functions in the [AWS Lambda Console](https://console.aws.amazon.com/lambda/):

| Local File | Lambda Name | Purpose |
| :--- | :--- | :--- |
| `UploadFunction.py` | `UploadFunction` | Generates Presigned POST (Upload) |
| `DownloadFunction.py` | `DownloadFunction` | Generates Presigned GET (Download) |
| `ListFilesFunction.py` | `ListFilesFunction` | Lists user files from S3 |
| `DeleteFunction.py` | `DeleteFunction` | Deletes a specific file from S3 |

### Setup for each function:
1.  **Runtime**: Select **Python 3.12** (or latest 3.x).
2.  **Upload Code**: Copy/paste the content from the corresponding local file. 
    - **CRITICAL**: Ensure `BUCKET_NAME` in the code matches your actual bucket.
3.  **Permissions (IAM)**:
    -   Navigate to **Configuration** -> **Permissions** -> Click the **Role Name** link.
    -   Click **Add permissions** -> **Attach policies**.
    -   Search for `AmazonS3FullAccess` and attach it. (Note: Use minimal policies in production).

> [!IMPORTANT]
> **CORS Handling**: To prevent "Multiple CORS Values" or conflicts, you should **CLEAR/DISABLE** any CORS settings in the API Gateway Console (sidebar -> CORS -> Clear). 
> Your new Lambda code now handles CORS manually, which is more reliable for this setup.

---

## Part 3: API Gateway (The Entry Point)

1.  **Create API**:
    -   Go to the [API Gateway Console](https://console.aws.amazon.com/apigateway/).
    -   Click **Create API** -> **HTTP API** -> **Build**.
    -   **API name**: `CloudshareAPI`.
2.  **Configure Routes**:
    Click **Routes** in the sidebar and create exactly these paths:

| Method | Resource Path | Integration (Lambda) |
| :--- | :--- | :--- |
| `GET` | `/files` | `ListFilesFunction` |
| `DELETE` | `/files` | `DeleteFunction` |
| `GET` | `/upload` | `UploadFunction` |
| `GET` | `/download` | `DownloadFunction` |

3.  **CORS Settings**:
    -   In the API Gateway left sidebar, click **CORS**.
    -   Set **Access-Control-Allow-Origin** to `*`.
    -   Set **Access-Control-Allow-Methods** to `GET`, `POST`, `DELETE`, `OPTIONS`.
    -   Set **Access-Control-Allow-Headers** to `*`.
    -   Click **Save**.

4.  **Deploy**: 
    - Ensure your API is deployed to a stage (usually `$default`).
    - Copy the **Invoke URL** (e.g., `https://abcdef123.execute-api.us-east-1.amazonaws.com`).

---

## Part 4: Frontend Integration

1.  **Update Environment**:
    -   In your `client` folder, open your [**.env**](file:///d:/Cloud%20Computing/client/.env) file.
    -   Set `VITE_API_URL` to your **Invoke URL** from Step 3.4.
    -   **DO NOT** add a trailing slash (e.g., `https://abc.execute-api.us-east-1.amazonaws.com`).

2.  **Restart & Test**:
    -   Restart your dev server: `npm run dev`.
    -   Your app will now send requests like `VITE_API_URL/files` and `VITE_API_URL/upload`.

---

## Part 5: Sharing Features (The Public Feed)

To turn your personal storage into a true sharing platform, follow these steps to enable the "Public Feed":

### 1. New Lambda Functions
Create **two more** Lambda functions in the [AWS Lambda Console](https://console.aws.amazon.com/lambda/):

| Local File | Lambda Name | Purpose |
| :--- | :--- | :--- |
| `TogglePublicFunction.py` | `TogglePublicFunction` | Moves file between private/public |
| `ListPublicFunction.py` | `ListPublicFunction` | Lists ALL public files globally |

1.  **Runtime**: Python 3.12.
2.  **Permissions**: Ensure `AmazonS3FullAccess` is attached to the role for BOTH functions.
3.  **Code**: Copy/paste from the corresponding local file.

### 2. New API Gateway Routes
In your **Routes** section of API Gateway, add these 4 routes:

| Method | Path | Integration |
| :--- | :--- | :--- |
| `POST` | `/share` | `TogglePublicFunction` |
| `GET` | `/public` | `ListPublicFunction` |
| `OPTIONS` | `/share` | `TogglePublicFunction` |
| `OPTIONS` | `/public` | `ListPublicFunction` |

> [!IMPORTANT]
> **Update Existing Functions**: You MUST also update your existing 4 functions (Upload, Download, List, Delete) with the new code I provided locally. This is because the folder structure changed from `userId/file` to `private/userId/file`.

### 3. Final Step: Deploy Everything
- Click **Deploy** in the Lambda console for all 6 functions.
- Refresh your React app. You should now see an "Explore" tab and "Share" icons next to your private files!

---

## Troubleshooting Checklist

- [ ] **S3 CORS**: Did you set `AllowedOrigins` to `*` or your local URL?
- [ ] **Lambda Environment**: Did you update the `BUCKET_NAME` in all 4 scripts?
- [ ] **API Gateway Paths**: Do the routes in Part 3 exactly match those in the guide?
- [ ] **Environment Variable**: Does `VITE_API_URL` in `.env` match the Invoke URL?
