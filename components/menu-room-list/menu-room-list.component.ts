import { 
  Component, 
  Input, 
  Output, 
  EventEmitter 
} from '@angular/core';
import { 
  WebsocketService,
} from 'src/modules/tools/services/websocket.service';

@Component({
  selector: 'chatroom__menu-room-list',
  templateUrl: './../../../../templates/chatroom/menu-room-list/menu-room-list.component.html',
  styleUrls: [
    './../../../../templates/chatroom/menu-room-list/menu-room-list.component.scss',
  ]
})
export class MenuRoomListComponent {
  /**
   * @description: 
   */
  @Input() 
  public interface__name: string = 'default';

  /**
   * @description: 
   */
  constructor(
    public websocketService: WebsocketService,
  ) { }

  /**
   * @description: 
   */
  public ngOnInit(): void {
        // alert ('menu-room-list')//===--
  }
}
