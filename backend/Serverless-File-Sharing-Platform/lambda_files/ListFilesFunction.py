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
        user_id = params.get('userId')

        if not user_id:
            return {
                'statusCode': 400,
                'headers': CORS_HEADERS,
                'body': json.dumps('Missing required parameter: userId')
            }

        files = []

        # List both private and public files for this user
        for folder in ['private', 'public']:
            response = s3.list_objects_v2(
                Bucket=BUCKET_NAME,
                Prefix=f"{folder}/{user_id}/"
            )

            if 'Contents' in response:
                for item in response['Contents']:
                    # Key format: folder/userId/fileName
                    file_key = item['Key']
                    parts = file_key.split('/')
                    
                    if len(parts) >= 3:
                        file_name = parts[2]
                        
                        files.append({
                            'name': file_name,
                            'size': item['Size'],
                            'lastModified': item['LastModified'].isoformat(),
                            'key': file_key,
                            'isPublic': folder == 'public'
                        })

        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': json.dumps({'files': files})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': CORS_HEADERS,
            'body': json.dumps(f'Error listing user files: {str(e)}')
        }
