import { Component, ViewChild } from '@angular/core'
import {
  ChatroomService,
  ChatroomMessage
} from 'src/modules/chatroom/services/chatroom.service'
import { Profile } from 'src/modules/profile/services/user.service'
import { UserService } from 'src/modules/profile/services/user.service'
import { SwitchModalService } from '../../../modal/services/switch-modal.service'
import { __db__ } from 'src/app/app.db'
import { InitialSettingsService } from '../../../../app/services/initial-settings.service'

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
  __db__ = __db__

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
  public messages: Array<ChatroomMessage> = []

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
    public switchModalService: SwitchModalService,
    public initialSettingsService: InitialSettingsService
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
    console.log('sendMessage', this.new_message)

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
  public recept__messages(messages: Array<ChatroomMessage>): void {
    console.log('recept__messages', messages)
    this.messages = messages
    this.waitToScrollToBottom()
  }

  /**
   * @description:
   */
  public recept__new_message(message: Array<ChatroomMessage>): void {
    console.log('recept__new_message', message)
    this.messages.push.apply(this.messages, message)
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
    alert(`handleSelectAction ${option}`)
  }

  /**
   * @description: user choise function
   */
  public handleSelectChoose(option: string): void {
    alert(`handleSelectChoose ${option}`)
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

  /**
   * @description
   */
  public convertToJSON(value: string): any {
    console.log('convertToJSON input: ', value)
    const jsonData = JSON.parse(value)

    console.log('jsonData: ', jsonData)

    console.log('\n-------\n')

    var message = jsonData.message
    console.log('message: ', message)

    return message

    // return 'Esta é uma mensagem de teste'
  }

  /**
   * @description: sent initial settings
   */
  public handleSendInitialSettings(): void {
    const { company_size, geography, sectors } =
      this.initialSettingsService.initialSettings

    if (!company_size || !geography || !sectors) {
      alert($localize`Initial settings missing!`)
      this.initial_settings_accepted = false
      return
    }

    console.log(
      'handleSendInitialSettings',
      this.initialSettingsService.initialSettings
    )

    this.initial_settings_accepted = true
  }
}
