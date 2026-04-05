# Mini Project Report: Cloudshare Serverless File Platform

## 1. INTRODUCTION

### 1.1 Abstract: (Need of topic)
In the modern digital era, the demand for fast, secure, and accessible file storage is at an all-time high. Traditional cloud storage often involves expensive monthly subscriptions or complex infrastructures that are difficult for individual developers or small communities to manage.

**Cloudshare** was developed as a solution to this problem, leveraging **Serverless Computing** to provide a high-performance file-sharing environment with near-zero idle costs. It eliminates the need for managing servers while ensuring that data remains private, namespaced, and easily shareable through a community feed.

### 1.2 Description
Cloudshare is a full-stack, serverless web application designed for both private storage and public file discovery. 
- **Frontend**: A premium React application built with Vite and Tailwind CSS.
- **Backend**: A completely serverless architecture using **AWS Lambda** and **Amazon API Gateway**.
- **Security**: Integrated with **Clerk** for robust, multi-tenant authentication.
- **Storage**: Highly scalable **Amazon S3** storage using the "Presigned URL" pattern for direct browser-to-cloud transfers.

---

## 2. LITERATURE SURVEY
Traditional file-sharing architectures rely on persistent servers (VPS or On-Premise) which are:
1.  **Expensive**: You pay for the server even when it's idle.
2.  **Complex to Scale**: Manual load balancing and storage provisioning are required.
3.  **Higher Security Risk**: Persistent servers have larger attack surfaces compared to ephemeral, event-driven functions.

**Serverless Architecture (Cloudshare Architecture)**:
- **Scalability**: AWS Lambda and S3 scale automatically.
- **Cost**: "Pay-per-use" ensures we only pay when files are being uploaded, downloaded, or shared.
- **Maintenance**: No patches, OS updates, or hardware management required.

---

## 2. PROBLEM STATEMENT AND IT'S OBJECTIVES

### Problem Statement:
Existing file-sharing tools are either too simple (lacking security) or too corporate (expensive and rigid). There is a significant need for a lightweight platform where a user can securely store personal data in a "Private Vault" while having the ability to "Share" specific items to a global community feed with a single click.

### Objectives:
1.  **Zero-Friction Sharing**: Enable instant sharing of files via a global public feed.
2.  **Privacy by Design**: Secure user data in namespaced folders using authenticated keys.
3.  **High-Performance Architecture**: Utilize S3 Presigned URLs to allow direct uploads/downloads, bypassing server bottlenecks.
4.  **Premium UX**: Provide a modern, glassmorphic interface for professional file management.

---

## 3. MINI PROJECT DESIGN (PRINCIPLE AND WORKING)

### 3.1 Block Diagram
The following diagram illustrates the interaction between the user, the authentication layer, the API bridge, the serverless logic, and the cloud storage.


### 3.2 Block Diagram Description (Modulewise)
- **Identity Provider (Clerk)**: Handles user registration, JWT management, and secure session state.
- **REST Connector (API Gateway)**: Acts as the secure entry point, routing browser requests to the appropriate cloud function.
- **Serverless Controllers (AWS Lambda)**: 
    - `Upload`: Implements security conditions for new file uploads.
    - `TogglePublic`: Orchestrates the movement of data between private and public prefixes.
    - `List`: Aggregates file metadata for the user's dashboard.
- **Storage Layer (Amazon S3)**: Provides 99.999999999% durability for all stored assets.

### 3.3 Working (Flowchart Diagrams)
The system operates on the "Security-First Presigned" principle:
1.  **Request**: User asks the Lambda via API Gateway for a secure link.
2.  **Generate**: Lambda verifies identity and generates a temporary, cryptographically signed URL from S3.
3.  **Execute**: The browser uploads/downloads data directly to S3 using that link.
4.  **Result**: The Lambda is used for only milliseconds, resulting in massive cost savings and high speed.

---

## 4. COMPONENTS/TOOL TO BE USED

### 4.1 Hardware used:
- **Client Side**: Any device with a modern web browser (Windows, macOS, Linux, Android/iOS).
- **Server Side**: AWS Managed Infrastructure (Shared Responsibility Model).

### 4.2 Software used:
- **IDEs**: Visual Studio Code.
- **Languages**: JavaScript (Frontend), Python 3.12 (Backend Logic).
- **Frameworks**: React 18, Tailwind CSS v4, Vite.
- **Libraries**: Boto3 (Python AWS SDK), Clerk React SDK, Lucide Icons.

### 4.3 Details about Cloud Computing Service model utilized:
- **IaaS (Infrastructure as a Service)**: Amazon S3 (Underlying block storage).
- **PaaS / FaaS (Function as a Service)**: AWS Lambda. We write the code while AWS manages the execution environment and scaling.
- **SaaS (Security as a Service)**: Clerk handles our entire identity and authentication flow.
- **Deployment**: We leverage the **Public Cloud** deployment model for global accessibility.

---

## 5. FEATURES AND LIMITATIONS

### 5.1 Key Features:
1.  **Instant Public Sharing**: Effortlessly toggle files between a private vault and a community-wide discovery feed.
2.  **Serverless Efficiency**: High-performance architecture that eliminates the need for persistent, expensive servers.
3.  **Direct-to-Cloud Transfers**: Uses S3 Presigned URLs to maximize upload/download speeds by bypassing server-side processing.
4.  **Multi-Tenant Isolation**: Secure, user-specific namespacing using Clerk unique identifiers and S3 prefixes.
5.  **Premium Glassmorphic UI**: High-end user experience with real-time feedback and responsive table layouts.

### 5.2 Limitations:
1.  **File Size Constraint**: Currently configured with a **50MB upload limit** to manage bandwidth and storage costs.
2.  **Flat File Structure**: Does not support nested folders; all user files exist in a single flat namespace per user.
3.  **No Real-time Collaboration**: Sharing is currently limited to "view/download" only; multiple users cannot edit the same file simultaneously.

---

## 6. CONCLUSION
The **Cloudshare** project successfully demonstrates the power of modern cloud computing and serverless patterns. By integrating **AWS Lambda**, **S3**, and **API Gateway** with a state-of-the-art React frontend, we have created a platform that is both highly secure and remarkably cost-efficient. 

The implementation of the **Presigned URL** pattern proves that serverless architectures can handle complex file management tasks with zero infrastructure overhead. Cloudshare stands as a robust proof-of-concept for how the future of personal and community storage will be built: **Fast, Scalable, and Entirely Serverless.**
