import { Injectable } from '@angular/core'
import { Subject } from 'rxjs'
import {
  WebSocketsConfig,
  WebsocketService
} from 'src/modules/tools/services/websocket.service'
import { JoinRoomTypes } from '../types/chatroom.types'
import { Profile } from 'src/modules/profile/services/user.service'
import { LibsService } from 'src/modules/tools/services/libs.service'
import { DeleteDuplicate } from 'src/modules/tools/classes/algo'
import { FeelingService } from 'src/modules/feeling/services/feeling.service'

/**
 * @description:
 */
export interface ChatroomStream {
  event: 'messages' | 'participants_counter' | 'new_message' | 'new_message_ai' | 'new_message_user_ext' | 'new_message_ai_ext' | 'error' | 'init'
  data: any
}

/**
 * @description:
 * { "id": 43, "activated": true, "content": "aoeu", "relatedModel": null, "relatedModelId": null, "chatroom": 12, "profile": { "id": 3, "avatar": null, "group": "player", "is_anonymous": false, "birthdate": null, "language": "en", "isbotnet": false, "username": "7d4d9ede6fc941fe976b5cfa77eb74b9", "first_name": "", "last_name": "" }, "replyTo": null, "joinedFiles": [] }
 */
export interface ChatroomMessage {
  isLiked: boolean
  id: number
  activated: boolean
  content: string
  relatedModel: string | null
  relatedModelId: number | null
  chatroom: number
  profile: Profile
  replyTo: any
  joinedFiles: Array<any>
  replyToList: Array<any>
  messageType: 'new_message' | 'new_message_ai' | 'new_message_user_ext' | 'new_message_ai_ext'; // Add a type to distinguish between user and AI messages
}

/**
 * @description:
 */
export interface ChatRoomTP {
  id: number
  activated: boolean
  name: string
  description: string
  onwer: Profile
  industry: string
  geography: string
  companyType: string
}

@Injectable({
  providedIn: 'root'
})
export class ChatroomService {
  /**
   * @description:
   */
  public ws_connection: WebSocketsConfig | undefined

  /**
   * @description: The stream of data from the websocket
   */
  public stream: Subject<ChatroomStream> = new Subject<ChatroomStream>()

  /**
   * @description:
   */
  public chatroom_list: Array<ChatRoomTP> = []

  /**
   * @description:
   */
  public message_list: Array<any> = []

  /**
   * @description:
   */
  public selected: ChatRoomTP | undefined

  public room_is_loading: boolean = true

  /**
   * @description:
   */
  constructor(
    private wsService: WebsocketService,
    private l: LibsService,
    private feeelingService: FeelingService
  ) {
    this.bindChatRoomStream()
    this.setConfigWebsocket()
  }

  /**
   * @description:
   */
  private setConfigWebsocket(): void {
    this.wsService.setConfig({
      port: 9001,
      pathname: 'ws/chat_room_consumer/',
      service: this
    })
  }

  
  // ##########################################[ INIT ]#########################################################
  public checkAndCreateRoomIfNone(): void {
    if (this.chatroom_list.length === 0) {
      // No rooms available, create one
      this.createDefaultRoom();
    } else {
      // Rooms available, join the first one or selected
      this.joinFirstAvailableRoom();
    }
  }
  
  private createDefaultRoom(): void {
    const defaultRoomName = 'Chatroom 1'; // Replace with your desired default room name
    this.call__create_personnal_room(defaultRoomName);
  }
  
  private joinFirstAvailableRoom(): void {
    const firstRoom = this.chatroom_list[0];
    this.joinRoom(firstRoom);
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
  private format_message(message_list: Array<any>, message: any): void {
    // -> Add the replyTo message to the message
    let replyToList = message_list.filter((m) => m.replyTo === message.id)
    message.replyToList = replyToList
  }

  /**
   * @description:
   */
  private format_message_list(
    message_list: Array<any>
  ): Array<ChatroomMessage> {
    let del_duplicate = new DeleteDuplicate()
    message_list = del_duplicate.foreach(message_list, 'id')

    for (let message of message_list) {
      this.format_message(message_list, message)
      this.feeelingService.setFeelingLoadList('chatroom.Message', message.id)
    }

    this.feeelingService.loadFeelingList(undefined)
    return message_list.filter((m) => m.replyTo === null)
  }

  /**
   * @description:
   */
  public recept__messages(message_list: Array<ChatroomMessage>): void {
    console.log('recept__messages', 'service', message_list)
    this.stream.next({
      event: 'messages',
      data: this.format_message_list(message_list)
    })
    if ( this.room_is_loading ){ this.room_is_loading = false }
  }

  /**
   * @description:
   */
  public recept__participants_counter(data: any): void {
    this.stream.next({
      event: 'participants_counter',
      data: data
    })
  }

  /**
   * @description:
   */
  public recept__error(data: any): void {}

  /**
   * @description:
   */
  public recept__new_message(message_list: any): void {
    console.log('recept__new_message', 'service', message_list)
    this.stream.next({
      event: 'new_message',
      data: this.format_message_list(message_list)
    })
  }

  public recept__new_message_ai(message_list: any): void {
    console.log('recept__new_message_ai', 'service', message_list)
    this.stream.next({
      event: 'new_message_ai',
      data: this.format_message_list(message_list)
    })
  }
  public recept__new_message_user_ext(message_list: any): void {
    console.log('recept__new_message_user_ext', 'service', message_list)
    this.stream.next({
      event: 'new_message_user_ext',
      data: this.format_message_list(message_list)
    })
  }

  public recept__new_message_ai_ext(message_list: any): void {
    console.log('recept__new_message_ai_ext', 'service', message_list)
    this.stream.next({
      event: 'new_message_ai_ext',
      data: this.format_message_list(message_list)
    })
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
      data: data
    })
  }

  /**
   * @description:
   */
  public recept__new_room(data: any): void {
    console.log('recept__new_room', 'service', data)
    this.chatroom_list.unshift(data)
    this.joinRoom(data); // Join the newly created room
  }

  /**
   * @description:
   */
  public call__create_personnal_room(room: string): void {
    this.ws_connection?.wsService?.send(this.ws_connection, {
      create_personnal_room: {
        name: room
      }
    })
    this.room_is_loading = true
  }

  /**
   * @description:
   */
  public call__join_room(room: ChatRoomTP): void {
    this.setSelectRoom(room)

    console.log('call__join_room', 'service', this.selected)
    this.ws_connection?.wsService?.send(this.ws_connection, {
      join_room: {
        chatroom__id: room.id,
        user__id: room.onwer.id
      }
    })
    this.room_is_loading = true
    console.log('this.room_is_loading', 'true')
  }

  // Jean 
  // public sendInitialSettings(settings: InitialSettingsType): void {
  //   this.ws_connection?.wsService?.send(this.ws_connection, {
  //     set_initial_settings: settings
  //   });
  // }

  public selectedChatroomId: number | null = null;

  public joinRoom(room: ChatRoomTP): void {
    this.selectedChatroomId = room.id;
    this.call__join_room(room);
  }
  public setSelectRoom(room: ChatRoomTP | undefined ) : void {
    this.selected = room
    if( this.selected === undefined ){
      return
    } else {
      this.selectedChatroomId = this.selected.id;
    }
  }

  //---

  /**
   * @description:
   */
  public call__leave_room(room: string): void {}

  /**
   * @description:
   */
  public call__delete_room(room: ChatRoomTP): void {
    for (let chatroom of this.chatroom_list) {
      if (chatroom.id === room.id) {
        this.chatroom_list.splice(this.chatroom_list.indexOf(chatroom), 1)
        break
      }
    }

    if (room.id === this.selected?.id) {
      this.setSelectRoom(undefined)
      this.join_first_room_in_chatroom_list()
    }

    this.ws_connection?.wsService?.send(this.ws_connection, {
      delete_room: room
    })
  }

  /**
   * @description:
   */
  public call__edit_room(room: string): void {}

  /**
   * @description:
   */
  public call__fetch_all_rooms(): void {}

  /**
   * @description:
   */
  public call__get_messages(room: string): void {
    // get messages
  }

  /**
   * @description:
   */
  public call__send_message(message: string, type: string): void {
    this.ws_connection?.wsService?.send(this.ws_connection, {
      new_message: {
        new_message: message,
        type :  type
      }
    })
  }

  public call__send_initial_settings(settings: any): void {
    this.ws_connection?.wsService?.send(this.ws_connection, {
      initial_settings: settings
    });
  }

  /**
   * @description:
   */
  private bindChatRoomStream(): void {
    this.stream.subscribe((data: ChatroomStream) => {
      switch (data.event) {
        case 'init':
          this.set_chatroom_list(data.data.chatroom_list)
          break
      }
    })
  }

  /**
   * @description:
   */
  private get_chatroom_list(): Array<ChatRoomTP> {
    return this.chatroom_list
  }

  /**
   * @description:
   */
  private has_chatroom_to_join(): boolean {
    return this.chatroom_list.length > 0
  }

  /**
   * @description:
   */
  public chatroom_is_selected(chatroom: ChatRoomTP): boolean {
    return this.selected === chatroom
  }

  /**
   * @description:
   */
  private not_has_chatroom_to_join(): boolean {
    return !this.has_chatroom_to_join()
  }

  /**
   * @description:
   */
  public getLastChatroom(): ChatRoomTP | undefined {
    if (this.chatroom_list.length > 0) {
      return this.chatroom_list[this.chatroom_list.length];
    }
    return undefined; // Return undefined if the array is empty
  }
  private set_chatroom_list(chatroom_list: Array<ChatRoomTP>): void {
    this.chatroom_list = chatroom_list
    this.setSelectRoom(this.getLastChatroom())
    this.checkAndCreateRoomIfNone();
  }


  /**
   * @description:
   */
  public join_first_room_in_chatroom_list(): void {
    if (this.not_has_chatroom_to_join()) {
      return
    }

    let chatroom = this.get_chatroom_list()[0]
    if (this.selected !== undefined) {
      chatroom = this.selected
    }
    this.call__join_room(chatroom)
  }
}
