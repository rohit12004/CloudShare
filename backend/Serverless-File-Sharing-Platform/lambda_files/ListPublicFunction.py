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
        # No userId needed for public list!
        
        # List all objects with the "public/" prefix
        response = s3.list_objects_v2(
            Bucket=BUCKET_NAME,
            Prefix="public/"
        )

        files = []
        if 'Contents' in response:
            for item in response['Contents']:
                # The key is "public/userId/fileName"
                file_key = item['Key']
                parts = file_key.split('/')
                
                # Check if it has enough parts (public/userId/fileName)
                if len(parts) >= 3:
                    user_id = parts[1]
                    file_name = parts[2]
                    
                    files.append({
                        'name': file_name,
                        'uploader': user_id, # In a real app, we'd lookup the actual username
                        'size': item['Size'],
                        'lastModified': item['LastModified'].isoformat(),
                        'key': file_key
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
            'body': json.dumps(f'Error listing public files: {str(e)}')
        }
