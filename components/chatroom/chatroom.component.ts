import { 
  Component,
  ViewChild
} from '@angular/core';
import { ChatroomService } from 'src/modules/chatroom/services/chatroom.service';
import { Profile } from 'src/modules/profile/services/user.service';
import { UserService } from 'src/modules/profile/services/user.service';

/**
 * @description: 
 */
export interface Message {
  id: number,
  activated: boolean,
  content: string,
  chatroom: number,
  profile: Profile,
};


@Component({
  selector: 'app-chatroom',
  templateUrl: './chatroom.component.html',
  styleUrls: ['./chatroom.component.scss']
})
export class ChatroomComponent {
  /**
   * @description: 
   */
  @ViewChild('messages_container') messages_container: any;

  /**
   * @description:
   */
  public max_messages: number = 100;

  /**
   * @description:
   */
  public messages: Array<Message> = [];

  /**
   * @description: 
   */
  public new_message: string = '';

  /**
   * @description: 
   */
  public participants_counter: number = 0;

  /**
   * @description:
   */
  constructor(
    private chatroomService: ChatroomService,
    public userService: UserService,
  ) { }

  /**
   * @description:
   */
  public ngOnInit(): void {
    this.bindStreamChatroom();
  }

  /**
   * @description:
   */
  private bindStreamChatroom(): void {
    this.chatroomService.stream.subscribe((data) => {
      let event_key = 'recept__' + data.event;
      if ((this as any)[event_key] === undefined) {
        alert(event_key + ' is not defined in Chatroom.component.ts');
      }
      (this as any)[event_key](data.data);
    });
  }

  /**
   * @description:
   */
  public ngOnDestroy(): void {

  }

  /**
   * @description: 
   */
  public sendMessage(): void {
    if (!this.userService.is_authenticated()) {
      this.userService.open_login_modal();
      return; 
    };
    this.chatroomService.send_message(this.new_message);
    this.new_message = '';
  }

  // @@@@@@@@@@@@@@
  /**
   * @description:
   */
  public recept__participants_counter(participants_counter: number): void {
    this.participants_counter = participants_counter;
  }

  /**
   * @description:
   */
  public recept__messages(messages: Array<Message>): void {
    this.messages = messages;
    this.waitToScrollToBottom();
  }

  /**
   * @description:
   */
  public recept__new_message(message: Message): void {
    this.messages.push(message);
    this.waitToScrollToBottom();
    // TODO: Limit the number of messages in the chatroom, and delete the oldest ones. (100 max)
    // if (this.messages.length > this.max_messages) {
    //   this.messages.shift();
    // }
  }

  /**
   * @description:
   */
  private waitToScrollToBottom(): void {
    setTimeout(() => {
      this.forceScrollToBottom();
    }, 100);
  }

  /**
   * @description:
   */
  private forceScrollToBottom(): void {
    this.messages_container.nativeElement.scrollTop = 100000;
  }

}
