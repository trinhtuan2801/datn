import asyncio
import json
import websockets
import base64
import cv2
import numpy as np
import pose_detector
import test_db
import traceback

PoseDetector = pose_detector.PoseDetector()
API = test_db.API()
all_clients = []


async def send_message(client_socket, message):
    await client_socket.send(message)


async def new_client_connected(client_socket, path):
    print("New client connected!")
    all_clients.append(client_socket)
    try:
        while True:
            message = await client_socket.recv()
            data = json.loads(message)
            command = data['command']
            if (command == 'detect_pose'):
                update_start = data['update_start']
                bframe = data['frame']
                nparr = np.frombuffer(base64.b64decode(bframe), np.uint8)
                frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                keypoints, mguide = PoseDetector.predict(
                    frame, update_start=update_start)
                await send_message(client_socket, json.dumps({
                    'command': command,
                    'mguide': mguide.value,
                    'keypoints':  keypoints.tolist()
                }))
            elif (command == 'login'):
                await send_message(client_socket, json.dumps({
                    'command': command,
                    'response': API.apiLogin(data['username'], data['password'])
                }))
            elif (command == 'register'):
                await send_message(client_socket, json.dumps({
                    'command': command,
                    'response': API.apiRegister(data['username'], data['password'])
                }))
            elif (command == 'get_levels'):
                await send_message(client_socket, json.dumps({
                    'command': command,
                    'response': API.apiGetLevels()
                }))
            elif (command == 'update_result'):
                await send_message(client_socket, json.dumps({
                    'command': command,
                    'response': API.apiUpdateResult(data['user_id'], data['level_id'], data['score'], data['percent'])
                }))
            elif (command == 'get_all_results'):
                await send_message(client_socket, json.dumps({
                    'command': command,
                    'response': API.apiGetAllResults(data['user_id'])
                }))
                
    except Exception as ex:
        print('='*10, 'ERROR', ex)
        traceback.print_tb(ex.__traceback__)
        print('='*20)


async def start_server():
    print('Server started')
    await websockets.serve(new_client_connected, 'localhost', 12345)


if __name__ == '__main__':
    event_loop = asyncio.get_event_loop()
    event_loop.run_until_complete(start_server())
    event_loop.run_forever()
