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

        # Generate a presigned GET URL
        try:
            url = s3.generate_presigned_url(
                'get_object',
                Params={'Bucket': BUCKET_NAME, 'Key': file_key},
                ExpiresIn=3600
            )

            return {
                'statusCode': 200,
                'headers': CORS_HEADERS,
                'body': json.dumps({'url': url})
            }
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': CORS_HEADERS,
                'body': json.dumps(f'Error generating download URL: {str(e)}')
            }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': CORS_HEADERS,
            'body': json.dumps(f'Error retrieving file: {str(e)}')
        }
