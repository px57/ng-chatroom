import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { WebSocketsConfig } from 'src/app/services/websocket.service';

/**
 * @description: 
 */
export interface ChatroomStream {
  event: string,
  data: any,
};

@Injectable({
  providedIn: 'root'
})
export class ChatroomService {
  /**
   * @description: 
   */
  public ws_connection: WebSocketsConfig | undefined;

  /**
   * @description: The stream of data from the websocket
   */
  public stream: Subject<ChatroomStream> = new Subject<ChatroomStream>();

  constructor(
    // private wsService: WebsocketService,
  ) { }

  /**
   * @description: 
   */
  public recept__messages(data: any): void {
    this.stream.next({
      event: 'messages',
      data: data,
    });
  }

  /**
   * @description: 
   */
  public recept__participants_counter(data: any): void {
    this.stream.next({
      event: 'participants_counter',
      data: data,
    });
  }

  /**
   * @description:
   */
  public recept__error(data: any): void {

  }

  /**
   * @description: 
   */
  public send_message(message: string): void {
    this.ws_connection?.wsService?.send(
      this.ws_connection,
      {
        'new_message': message,
    });
  }

  /**
   * @description:
   */
  public recept__new_message(data: any): void {
    this.stream.next({
      event: 'new_message',
      data: data,
    });
  }
}
