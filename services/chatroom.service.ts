import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { WebSocketsConfig, WebsocketService } from 'src/modules/tools/services/websocket.service';
import { JoinRoomTypes } from '../types/chatroom.types';

/**
 * @description: 
 */
export interface ChatroomStream {
  event: 'messages' | 'participants_counter' | 'new_message' | 'error',
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

  /**
   * @description:  
   */
  constructor(
    private wsService: WebsocketService,
  ) { 
    this.setConfigWebsocket();
  }

  /**
   * @description: 
   */
  private setConfigWebsocket(): void {
    this.wsService.setConfig({
      port: 4242,
      pathname: 'ws/chatroom/?room=fr&fakeConnect=true',
      service: this,
    });
  }

  // ###############################################################################################################
  // ###############################################################################################################
  // ###############################################################################################################
  // ###############################################################################################################
  // ###############################################################################################################
  // ###############################################################################################################
  // ###############################################################################################################
  // ##########################################[  RECEPT  ]#########################################################

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
  public recept__new_message(data: any): void {
    this.stream.next({
      event: 'new_message',
      data: data,
    });
  }

  // ###############################################################################################################
  // ###############################################################################################################
  // ###############################################################################################################
  // ###############################################################################################################
  // ###############################################################################################################
  // ###############################################################################################################
  // ###############################################################################################################
  // ##########################################[  CALLS  ]##########################################################

  /**
   * @description: 
   */
  public call__create_personnal_room(room: string): void {

  }

  /**
   * @description: 
   */
  public call__join_room(room: JoinRoomTypes): void {
    this.ws_connection?.wsService?.send(
      this.ws_connection,
      {
        'join_room': room,
    });
  }

  /**
   * @description:
   */
  public call__leave_room(room: string): void {

  }

  /**
   * @description:
   */
  public call__delete_room(room: string): void {
      
  }

  /**
   * @description:
   */
  public call__edit_room(room: string): void {
      
  }

  /**
   * @description:
   */
  public call__fetch_all_rooms(): void {

  }


  /**
   * @description:
   */
  public call__get_messages(room: string): void {

  }

  /**
   * @description: 
   */
  public call__send_message(message: string): void {
    this.ws_connection?.wsService?.send(
      this.ws_connection,
      {
        'new_message': message,
    });
  }
}
