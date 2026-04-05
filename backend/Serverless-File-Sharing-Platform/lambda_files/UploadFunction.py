import json
import boto3

s3 = boto3.client('s3')
BUCKET_NAME = 'cloudshare-storage-rohit'

# Manual CORS Headers (Self-Contained)
CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS,DELETE"
}

def lambda_handler(event, context):
    method = event.get('httpMethod') or event.get('requestContext', {}).get('http', {}).get('method')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    try:
        params = event.get('queryStringParameters') or {}
        file_name = params.get('fileName')
        user_id = params.get('userId')

        if not file_name or not user_id:
            return {
                'statusCode': 400,
                'headers': CORS_HEADERS,
                'body': json.dumps('Missing required parameters: fileName and userId')
            }

        # Default path for new uploads is "private"
        s3_key = f"private/{user_id}/{file_name}"

        # Generate a presigned POST URL
        try:
            response = s3.generate_presigned_post(
                Bucket=BUCKET_NAME,
                Key=s3_key,
                Fields={"Content-Type": "application/octet-stream"},
                Conditions=[
                    {"Content-Type": "application/octet-stream"},
                    ["content-length-range", 0, 52428800] # 50MB limit
                ],
                ExpiresIn=3600
            )

            return {
                'statusCode': 200,
                'headers': CORS_HEADERS,
                'body': json.dumps(response)
            }
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': CORS_HEADERS,
                'body': json.dumps(f'Error generating presigned URL: {str(e)}')
            }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': CORS_HEADERS,
            'body': json.dumps(f'Error uploading file: {str(e)}')
        }
