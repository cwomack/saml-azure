# import json
# import boto3

# def handler(event, context):
#   print('received event:')
#   print(event)

#   client = boto3.client('s3')

#     # define the file name of the object
#     file_name = event['Records'][0]['s3']['object']['key']
    
#     # Data Validation Step 1: Check if the file is a .csv file
#     # if the file_name does not end in ".csv", throw an error with a message
#     if not file_name.endswith('.csv'):
#         raise Exception('Invalid file format. Only .csv files are allowed.')
        
#     # Data Validation Step 2: Check if column 1 in the file is "student_id"
#     # read the first line of the file
#     response = client.get_object(Bucket='XXXXXXXXXXXXXXXXXXXXXXXXXXX', Key=file_name)
#     first_line = response['Body'].read().decode('utf-8').split('\n')[0]
#     if first_line.split(',')[0] != 'student_id':
#         raise Exception('Column 1 is not "student_id". Please upload a valid file.')
    
#     # Data Validation Step 3: Check if column 2 in the file is "district_id"
#     # read the first line of the file
#     response = client.get_object(Bucket='XXXXXXXXXXXXXXXXXXXXXXXXXXX', Key=file_name)
#     first_line = response['Body'].read().decode('utf-8').split('\n')[0]
#     if first_line.split(', ')[1] != 'district_id':
#         raise Exception('Column 2 is not "district_id". Please upload a valid file.')
  
#   return {
#       'statusCode': 200,
#       'headers': {
#           'Access-Control-Allow-Headers': '*',
#           'Access-Control-Allow-Origin': '*',
#           'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
#       },
#       'body': json.dumps('Hello from your new Amplify Python lambda!')
#   }