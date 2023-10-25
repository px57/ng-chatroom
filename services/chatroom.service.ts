import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { WebSocketsConfig, WebsocketService } from 'src/modules/tools/services/websocket.service';
import { JoinRoomTypes } from '../types/chatroom.types';
import { Profile } from 'src/modules/profile/services/user.service';

/**
 * @description: 
 */
export interface ChatroomStream {
  event: 'messages' | 'participants_counter' | 'new_message' | 'error' | 'init',
  data: any,
};

/**
 * @description: 
 */
export interface ChatRoomTP {
  id: number,
  activated: boolean,
  name: string,
  description: string,
  onwer: Profile,
}

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
  public chatroom_list: Array<ChatRoomTP> = [];

  /**
   * @description: 
   */
  public selected: ChatRoomTP | undefined;

  /**
   * @description:  
   */
  constructor(
    private wsService: WebsocketService,
  ) { 
    this.bindChatRoomStream();
    this.setConfigWebsocket();
  }

  /**
   * @description: 
   */
  private setConfigWebsocket(): void {
    this.wsService.setConfig({
      port: 9001,
      pathname: 'ws/chat_room_consumer/',
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
  public recept__init(data: any): void {
    this.stream.next({
      event: 'init',
      data: data,
    });
  }

  /**
   * @description: 
   */
  public recept__new_room(data: any): void {
    this.chatroom_list.unshift(data);
  }

  /**
   * @description: 
   */
  public call__create_personnal_room(room: string): void {
    this.ws_connection?.wsService?.send(
      this.ws_connection,
      {
        'create_personnal_room': {
          name: room,
        },
    });
  }

  /**
   * @description: 
   */
  public call__join_room(room: ChatRoomTP): void {
    this.selected = room;
    console.log(this.selected);
    this.ws_connection?.wsService?.send(
      this.ws_connection,
      {
        'join_room': {
          name: room.name,
          user__id: room.onwer.id,
        },
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
  public call__delete_room(room: ChatRoomTP): void {
      for (let chatroom of this.chatroom_list) {
        if (chatroom.id === room.id) {
          this.chatroom_list.splice(this.chatroom_list.indexOf(chatroom), 1);
          break;
        }
      }

      if (room.id === this.selected?.id) {
        this.selected = undefined;
        this.join_first_room_in_chatroom_list();
      }

      this.ws_connection?.wsService?.send(
        this.ws_connection,
        {
          'delete_room': room,
      });
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

  /**
   * @description: 
   */
  private bindChatRoomStream(): void {
    this.stream.subscribe((data: ChatroomStream) => {
      switch (data.event) {
        case 'init':
          this.set_chatroom_list(data.data.chatroom_list);
          break;
      }
    });
  }

  /**
   * @description:
   */
  private get_chatroom_list(): Array<ChatRoomTP> {
    return this.chatroom_list;
  }

  /**
   * @description: 
   */
  private has_chatroom_to_join(): boolean {
    return this.chatroom_list.length > 0;
  }

  /**
   * @description: 
   */ 
  public chatroom_is_selected(chatroom: ChatRoomTP): boolean {
    return this.selected === chatroom;
  }

  /**
   * @description:
   */
  private not_has_chatroom_to_join(): boolean {
    return !this.has_chatroom_to_join();
  }

  /**
   * @description:
   */
  private set_chatroom_list(chatroom_list: Array<ChatRoomTP>): void {
    this.chatroom_list = chatroom_list;
  }

  /**
   * @description: 
   */
  public join_first_room_in_chatroom_list(): void {
    if (this.not_has_chatroom_to_join()) {
      return; 
    }

    let chatroom = this.get_chatroom_list()[0];
    if (this.selected !== undefined) {
      chatroom = this.selected;
    }
    this.call__join_room(chatroom);
  }
}
