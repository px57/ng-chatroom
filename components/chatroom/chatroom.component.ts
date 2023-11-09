import { Component, ViewChild } from '@angular/core'
import { ChatroomService } from 'src/modules/chatroom/services/chatroom.service'
import { Profile } from 'src/modules/profile/services/user.service'
import { UserService } from 'src/modules/profile/services/user.service'
import { SwitchModalService } from '../../../modal/services/switch-modal.service'

/**
 * @description:
 */
export interface Message {
  id: number
  activated: boolean
  content: string
  chatroom: number
  profile: Profile
}

/**
 * @description: initial settings option type
 */
type initialSettingsType = 'all_sectors' | 'all_business' | 'all_geographies'

/**
 * @description: user action option type
 */
type userActionType = 'like' | 'dislike' | 'copy'

@Component({
  selector: 'chatroom__chatroom',
  templateUrl:
    './../../../../templates/chatroom/chatroom/chatroom.component.html',
  styleUrls: [
    './../../../../templates/chatroom/chatroom/chatroom.component.scss'
  ]
})
export class ChatroomComponent {
  /**
   * @description:
   */
  @ViewChild('messages_container') messages_container: any

  /**
   * @description:
   */
  public max_messages: number = 100

  /**
   * @description:
   */
  public messages: Array<Message> = []

  /**
   * @description:
   */
  public new_message: string = ''

  /**
   * @description:
   */
  public participants_counter: number = 0

  /**
   * @description: initial settings accepted value
   */
  public initial_settings_accepted: boolean = false

  /**
   * @description:
   */
  constructor(
    private chatroomService: ChatroomService,
    public userService: UserService,
    public switchModalService: SwitchModalService
  ) {}

  /**
   * @description:
   */
  public ngOnInit(): void {
    this.bindStreamChatroom()
  }

  /**
   * @description:
   */
  private bindStreamChatroom(): void {
    this.chatroomService.stream.subscribe((data) => {
      let event_key = 'recept__' + data.event
      if ((this as any)[event_key] === undefined) {
        alert(event_key + ' is not defined in Chatroom.component.ts')
      }
      ;(this as any)[event_key](data.data)
    })
  }

  /**
   * @description:
   */
  public ngOnDestroy(): void {}

  /**
   * @description:
   */
  public sendMessage(): void {
    if (!this.userService.is_authenticated()) {
      this.userService.open_login_modal()
      return
    }
    this.chatroomService.call__send_message(this.new_message)
    this.new_message = ''
  }

  // @@@@@@@@@@@@@@
  /**
   * @description:
   */
  public recept__participants_counter(participants_counter: number): void {
    this.participants_counter = participants_counter
  }

  /**
   * @description:
   */
  public recept__messages(messages: Array<Message>): void {
    this.messages = messages
    this.waitToScrollToBottom()
  }

  /**
   * @description:
   */
  public recept__new_message(message: Message): void {
    this.messages.push(message)
    this.waitToScrollToBottom()
    // TODO: Limit the number of messages in the chatroom, and delete the oldest ones. (100 max)
    // if (this.messages.length > this.max_messages) {
    //   this.messages.shift();
    // }
  }

  /**
   * @description:
   */
  public recept__init(data: any): void {}

  /**
   * @description:
   */
  private waitToScrollToBottom(): void {
    setTimeout(() => {
      this.forceScrollToBottom()
    }, 100)
  }

  /**
   * @description:
   */
  private forceScrollToBottom(): void {
    this.messages_container.nativeElement.scrollTop = 100000
  }

  /**
   * @description: initial settings modal function
   */
  public handleOpenUserInitialSettingsModal(option: initialSettingsType): void {
    this.switchModalService.open_modal(option)
  }

  /**
   * @description: pdf viewer modal function
   */
  public handleOpenPDFViewerModal(): void {
    this.switchModalService.open_modal('pdf_viewer', {
      index: 1,
      pageNumber: 13
    })
  }

  /**
   * @description: user actions function
   */
  public handleSelectAction(option: userActionType): void {
    alert(option)
  }

  /**
   * @description: user choise function
   */
  public handleSelectChoose(option: string): void {
    alert(option)
  }

  /**
   * @description: user choise function
   */
  public handleOpenLexiqueModal(option: string): void {
    // this.switchModalService.open_modal('lexique', {
    //   lexique: option
    // })
  }

  /**
   * @description: user choise function
   */
  public handleCloseLexiqueModal(): void {
    // this.switchModalService.close()
  }

  /**
   * @description:
   */
  // public clipboard(): void {
  // this.link_copied = true;
  // navigator.clipboard.writeText(this.share_link);
  // this.countDown();
  // }

  /**
   * @description:
   */
  // public countDown() {
  //   if (this.time_left < 15) {
  //     setTimeout(() => {
  //       this.time_left = this.time_left + 1;
  //       this.countDown();
  //     }, 1000);
  //   }

  //   if (this.time_left === 15) {
  //     this.link_copied = false;
  //     this.time_left = 0;
  //   }
  // }
}
