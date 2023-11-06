import { Component, Input, Output, EventEmitter } from '@angular/core'
import { WebsocketService } from 'src/modules/tools/services/websocket.service'
import { ChatroomService } from '../../services/chatroom.service'

@Component({
  selector: 'chatroom__menu-room-list',
  templateUrl:
    './../../../../templates/chatroom/menu-room-list/menu-room-list.component.html',
  styleUrls: [
    './../../../../templates/chatroom/menu-room-list/menu-room-list.component.scss'
  ]
})
export class MenuRoomListComponent {
  /**
   * @description:
   */
  @Input()
  public interface__name: string = 'default'

  /**
   * @description:
   */
  public chatroom_list: any[] = []

  /**
   * @description:
   */
  public isSideBarCollapsed: boolean = false

  /**
   * @description:
   */
  constructor(
    public websocketService: WebsocketService,
    public chatroomService: ChatroomService
  ) {
    this.bindChatRoom()
  }

  /**
   * @description:
   */
  public ngOnInit(): void {}

  /**
   * @description:
   */
  private bindChatRoom(): void {
    this.chatroom_list = this.chatroomService.chatroom_list
    this.chatroomService.stream.subscribe((data: any) => {
      switch (data.event) {
        case 'init':
          this.chatroom_list = data.data.chatroom_list
          break
      }
    })
  }

  handleCollapseSideBar(item: boolean): void {
    this.isSideBarCollapsed = item
  }
}
