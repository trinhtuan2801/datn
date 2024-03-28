
export enum NetworkStatus {
  OK,
  RECONNECTING,
  WEAK,
  ERROR,
  CLOSE
}

export enum MoveGuide {
  OK,
  MOVE_LEFT,
  MOVE_RIGHT,
  MOVE_CAMERA_DOWN,
  MOVE_AWAY
}

export interface UserAccount {
  _id: string,
  username: string,
  isAdmin: boolean,
}

export interface LevelResult {
  level_id: string,
  score: number,
  percent: number,
}

export interface LevelData {
  name: string
}

export interface DetectPoseResponse {
  mguide: MoveGuide;
  keypoints: object;
}

export interface RegisterResponse {
  success: number,
  message?: string,
}

export interface LoginResponse {
  success: number,
  message?: string,
  data?: UserAccount
}

export interface GetAllResultsResponse {
  success: number,
  data: Array<LevelResult>
}

export interface GetLevelsResponse {
  success: number,
  data: Array<LevelData>
}

export interface APIHandler {
  onDetectPose(response: DetectPoseResponse): void;
  onRegister(response: RegisterResponse): void;
  onLogin(response: LoginResponse): void;
  onGetAllResults(response: GetAllResultsResponse): void;
  onGetLevels(response: GetLevelsResponse): void
}

let debug: boolean = false;
export class APIHelper extends Object {

  private ws: WebSocket;
  private mqueue: Array<any>;
  private intervalId: any = null;

  constructor(
    private apiHandler: APIHandler
  ) {
    super();
    console.log('Init APIHelper');
    console.log('############create API instance')
    this.mqueue = [];
    // this.ws = new WebSocket('ws://172.28.45.231:21777/');
    // this.ws = new WebSocket('wss://monsters.vn/am/ws/');
    // this.ws = new WebSocket('ws://0.tcp.ap.ngrok.io:15448');
    this.ws = new WebSocket(`ws://192.168.1.7:12345`)
    this.ws.onopen = (ev: Event) => {
      this.wsOnOpen(ev);
    }
    //TODO check the function bind
    this.ws.onmessage = (ev: Event) => {
      this.wsOnMessage(ev);
    }

    this.ws.onclose = (ev: CloseEvent) => {
      this.wsOnClose(ev);
    }
    this.ws.onerror = (ev: Event) => {
      this.wsOnError;
    }

  }

  private shouldQueueMessage(message: any): boolean {
    if (this.ws.readyState != WebSocket.OPEN) {
      // console.log('a message has been queued up', message, 'queue length', this.mqueue.length, 'ws status', this.ws.readyState)
      this.mqueue.push(JSON.stringify(message));
      if (this.mqueue.length > 8) {
        // console.log('Change network status to WEAK')
        // this.apiHandler.onnetworkStatusChange(NetworkStatus.WEAK)
      }
      return true;
    }
    if (this.mqueue.length > 0) {
      while (this.mqueue.length > 0) {
        this.ws.send(this.mqueue.shift())
      }
      // this.apiHandler.onnetworkStatusChange(NetworkStatus.OK)
      // console.log('WS sent messages in queue successfully');
    }
    return false
  }

  wsOnOpen(ev: Event) {
    console.log('WS was oppended');
    console.log('############open connection')

    if (this.mqueue.length == 0) return;
    while (this.mqueue.length > 0) {
      this.ws.send(this.mqueue.shift())
    }
    console.log('WS sent messages in queue successfully');

  }
  wsOnError(ev: Event) {
    console.log('WS was error!!!!!!!!!');
    // this.apiHandler.onnetworkStatusChange(NetworkStatus.ERROR);
  }
  wsOnClose(ev: Event) {
    console.log('WS was on close!!!!!!!!!!!!');
    // this.apiHandler.onnetworkStatusChange(NetworkStatus.CLOSE);
  }

  wsOnMessage(event: any) {
    if (debug) { console.log("API, response text msg: " + event.data); }
    let data = JSON.parse(event.data);
    console.log(data)
    if (!data.command) return
    switch (data.command) {
      case 'detect_pose':
        this.apiHandler.onDetectPose(data as DetectPoseResponse)
        break
      case 'login':
        this.apiHandler.onLogin(data.response as LoginResponse)
        break
      case 'register':
        this.apiHandler.onRegister(data.response as RegisterResponse)
        break
      case 'get_all_results':
        this.apiHandler.onGetAllResults(data.response as GetAllResultsResponse)
        break
      case 'get_levels':
        this.apiHandler.onGetLevels(data.response as GetLevelsResponse)
        break
    }
  }


  public async predictPose(frame: Blob, update_start: boolean) {
    let bdata = await this.blobToData(frame)
    let message = {
      command: 'detect_pose',
      frame: bdata,
      update_start
    }
    if (this.shouldQueueMessage(message)) {
      return;
    }
    this.ws.send(JSON.stringify(message))
  }

  public close() {
    clearInterval(this.intervalId);
    this.ws.close(1000, 'Finished');
  }

  public async register(username: string, password: string) {
    const message = {
      command: 'register',
      username,
      password
    }
    this.ws.send(JSON.stringify(message))
  }

  public async login(username: string, password: string) {
    const message = {
      command: 'login',
      username,
      password
    }
    this.ws.send(JSON.stringify(message))
  }

  public async updateResult(user_id: string, level_id: string, score: number, percent: number) {
    const message = {
      command: 'update_result',
      user_id,
      level_id,
      score,
      percent
    }
    this.ws.send(JSON.stringify(message))
  }

  public async getAllResults(user_id: string) {
    const message = {
      command: 'get_all_results',
      user_id,
    }
    this.ws.send(JSON.stringify(message))
  }

  public async getLevels () {
    const message = {
      command: 'get_levels',
    }
    this.ws.send(JSON.stringify(message))
  }

  blobToData = (blob: Blob) => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = function () {
        let base64data = reader.result as string;
        resolve(base64data.split(',')[1]);
      }
      reader.readAsDataURL(blob)
    })
  }
}
