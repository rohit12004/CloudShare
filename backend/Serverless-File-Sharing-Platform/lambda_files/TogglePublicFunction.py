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
        body = json.loads(event.get('body', '{}'))
        file_name = body.get('fileName')
        user_id = body.get('userId')
        action = body.get('action') # 'share' or 'unshare'

        if not file_name or not user_id or not action:
            return {
                'statusCode': 400,
                'headers': CORS_HEADERS,
                'body': json.dumps('Missing required parameters: fileName, userId, and action')
            }

        # Source and destination keys
        if action == 'share':
            source_key = f"private/{user_id}/{file_name}"
            dest_key = f"public/{user_id}/{file_name}"
        else: # unshare
            source_key = f"public/{user_id}/{file_name}"
            dest_key = f"private/{user_id}/{file_name}"

        # Copy the object to the new location
        try:
            s3.copy_object(
                Bucket=BUCKET_NAME,
                CopySource={'Bucket': BUCKET_NAME, 'Key': source_key},
                Key=dest_key
            )
            # Delete the original object
            s3.delete_object(Bucket=BUCKET_NAME, Key=source_key)

            return {
                'statusCode': 200,
                'headers': CORS_HEADERS,
                'body': json.dumps({'message': f'File {action}d successfully!', 'newKey': dest_key})
            }
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': CORS_HEADERS,
                'body': json.dumps(f'Error toggling public status: {str(e)}')
            }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': CORS_HEADERS,
            'body': json.dumps(f'Server Error: {str(e)}')
        }
