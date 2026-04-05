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
        # New: Accept either 'key' OR 'fileName' + 'userId'
        file_key = params.get('key')
        
        if not file_key:
            file_name = params.get('fileName')
            user_id = params.get('userId')
            if not file_name or not user_id:
                return {
                    'statusCode': 400,
                    'headers': CORS_HEADERS,
                    'body': json.dumps('Missing required parameters: key or (fileName and userId)')
                }
            # Fallback for old frontend logic
            file_key = f"private/{user_id}/{file_name}"

        # Delete from S3
        s3.delete_object(Bucket=BUCKET_NAME, Key=file_key)

        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': json.dumps({'message': 'File deleted successfully!'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': CORS_HEADERS,
            'body': json.dumps(f'Error deleting file: {str(e)}')
        }
