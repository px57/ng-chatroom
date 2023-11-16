import { Component, Input, Output, EventEmitter } from '@angular/core'
import { WebsocketService } from 'src/modules/tools/services/websocket.service'
import { ChatroomService } from '../../services/chatroom.service'
import { SidebarService } from '../../../../app/services/sidebar.service'

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
  public selectedChatroomId: number | null = null;

  /**
   * @description:
   */
  public isSideBarCollapsed: boolean = false

  /**
   * @description:
   */
  constructor(
    public websocketService: WebsocketService,
    public chatroomService: ChatroomService,
    public sidebarService: SidebarService
  ) {
    this.bindChatRoom()
  }

    // Implement the joinRoom method
  joinRoom(chatroom: any): void {
      this.selectedChatroomId = chatroom.id;
      // Assuming chatroomService is injected and call__join_room is a method in the service
      this.chatroomService.call__join_room(chatroom);
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

  /**
   * @description: collapse sidebar
   */
  handleCollapseSideBar(item: boolean): void {
    this.isSideBarCollapsed = item
  }

  /**
   * @description: close sidebar function
   */
  public handleCloseSidebar(): void {
    this.sidebarService.closeSidebar()
  }

  /**
   * @description: get sidebar opened value
   */
  public getOpenedSidebarValue(): boolean {
    return this.sidebarService.isSidebarOpened
  }
}
